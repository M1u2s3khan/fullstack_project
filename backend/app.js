const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const inquiryRoutes = require("./inquiryRoutes");
const contactRoutes = require("./contactRoutes");
const authRoutes = require("./authRoutes");
const orderRoutes = require("./orderRoutes");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", async (req, res) => {
  try {
    await Promise.all([
      new Promise((resolve, reject) => {
        db.get("SELECT 1 AS databaseReady", (err) => {
          if (err) reject(err);
          else resolve();
        });
      }),
      mongoose.connection.db.admin().ping(),
    ]);

    return res.json({
      status: "ok",
      message: "A To Z Furniture backend is running",
      database: "connected",
      authDatabase: mongoose.connection.db.databaseName,
    });
  } catch (error) {
    return res.status(503).json({
      status: "error",
      message: "A required database is unavailable.",
      error: error.message,
    });
  }
});

app.use("/api/inquiries", inquiryRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);

module.exports = app;
