const express = require("express");
const router = express.Router();
const db = require("./db");

// GET all contacts (admin ke liye)
router.get("/", (req, res) => {
  db.all(
    "SELECT id, name, email, phone, subject, message, created_at FROM contacts ORDER BY id DESC",
    [],
    (err, rows) => {
      if (err) {
        console.error("Contact fetch failed:", err.message);
        return res.status(500).json({
          message: "Contact messages could not be read from the database.",
          error: err.message,
        });
      }
      return res.json(rows);
    },
  );
});

// POST new contact
router.post("/", (req, res) => {
  const { name, email, phone, subject, message } = req.body || {};
  const contact = [name, email, phone, subject, message].map((value) =>
    typeof value === "string" ? value.trim() : "",
  );

  if (!contact[0] || !contact[1] || !contact[4]) {
    return res.status(400).json({
      message: "Name, email, and message are required.",
    });
  }

  const [cleanName, cleanEmail, cleanPhone, cleanSubject, cleanMessage] =
    contact;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(cleanEmail)) {
    return res
      .status(400)
      .json({ message: "Please provide a valid email address." });
  }

  db.run(
    `INSERT INTO contacts (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)`,
    [cleanName, cleanEmail, cleanPhone || "", cleanSubject || "", cleanMessage],
    function (err) {
      if (err) {
        console.error("Contact insert failed:", err.message);
        return res.status(500).json({
          message: "Your message could not be saved to the database.",
          error: err.message,
        });
      }

      console.log("Contact message saved with id:", this.lastID);
      return res.status(201).json({
        message: "Contact message saved successfully.",
        id: this.lastID,
      });
    },
  );
});

module.exports = router;
