const crypto = require("crypto");
const { promisify } = require("util");
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();
const scrypt = promisify(crypto.scrypt);
const sessionDurationMs = 30 * 24 * 60 * 60 * 1000;
const cookieName = "a2z_session";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      maxlength: 254,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    passwordSalt: { type: String, required: true, select: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

const sessionSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  expiresAt: { type: Date, required: true, expires: 0 },
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Session =
  mongoose.models.Session || mongoose.model("Session", sessionSchema);

const getSessionToken = (req) => {
  const cookie = (req.headers.cookie || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`));

  return cookie ? cookie.slice(cookieName.length + 1) : "";
};

const setSessionCookie = (res, token) => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const expires = new Date(Date.now() + sessionDurationMs).toUTCString();
  res.setHeader(
    "Set-Cookie",
    `${cookieName}=${token}; Expires=${expires}; HttpOnly; SameSite=Lax; Path=/${secure}`,
  );
};

const clearSessionCookie = (res) => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${cookieName}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax; Path=/${secure}`,
  );
};

const createSession = async (userId, res) => {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await Session.create({
    tokenHash,
    userId,
    expiresAt: new Date(Date.now() + sessionDurationMs),
  });
  setSessionCookie(res, token);
};

const publicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

router.post("/signup", async (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Name, email, and password are required." });
  }
  if (name.length > 80) {
    return res
      .status(400)
      .json({ message: "Name must be 80 characters or fewer." });
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res
      .status(400)
      .json({ message: "Please enter a valid email address." });
  }
  if (password.length < 8 || password.length > 128) {
    return res
      .status(400)
      .json({ message: "Password must be between 8 and 128 characters." });
  }

  try {
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = await scrypt(password, salt, 64);
    const user = await User.create({
      name,
      email,
      passwordHash: passwordHash.toString("hex"),
      passwordSalt: salt,
    });
    await createSession(user._id, res);

    return res
      .status(201)
      .json({
        message: "Account created successfully.",
        user: publicUser(user),
      });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    console.error("Signup failed:", error.message);
    return res
      .status(500)
      .json({ message: "Account could not be created. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const password =
    typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }
  if (email.length > 254 || password.length > 128) {
    return res.status(400).json({ message: "Email or password is too long." });
  }

  try {
    const user = await User.findOne({ email }).select(
      "+passwordHash +passwordSalt",
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const submittedHash = await scrypt(password, user.passwordSalt, 64);
    const storedHash = Buffer.from(user.passwordHash, "hex");
    if (
      storedHash.length !== submittedHash.length ||
      !crypto.timingSafeEqual(storedHash, submittedHash)
    ) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    await createSession(user._id, res);
    return res.json({
      message: "Logged in successfully.",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login failed:", error.message);
    return res.status(500).json({ message: "Login failed. Please try again." });
  }
});

router.get("/me", async (req, res) => {
  const token = getSessionToken(req);
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return res.status(401).json({ message: "You are not logged in." });
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const session = await Session.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    }).populate("userId");

    if (!session?.userId) {
      clearSessionCookie(res);
      return res
        .status(401)
        .json({ message: "Your session has expired. Please log in again." });
    }

    return res.json({ user: publicUser(session.userId) });
  } catch (error) {
    console.error("Session lookup failed:", error.message);
    return res
      .status(500)
      .json({ message: "Your session could not be verified." });
  }
});

router.post("/logout", async (req, res) => {
  const token = getSessionToken(req);
  clearSessionCookie(res);

  if (!/^[a-f0-9]{64}$/.test(token)) {
    return res.json({ message: "Logged out successfully." });
  }

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    await Session.deleteOne({ tokenHash });
    return res.json({ message: "Logged out successfully." });
  } catch (error) {
    console.error("Logout failed:", error.message);
    return res
      .status(500)
      .json({ message: "Logout failed. Please try again." });
  }
});

module.exports = router;
