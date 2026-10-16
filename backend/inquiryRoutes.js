const express = require("express");
const router = express.Router();
const db = require("./db");

router.get("/", (req, res) => {
  db.all(
    "SELECT * FROM inquiries ORDER BY created_at DESC",
    [],
    (err, rows) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Failed to fetch inquiries", error: err.message });
      }

      res.json(rows);
    },
  );
});

router.post("/", (req, res) => {
  const { name, phone, item, address } = req.body || {};
  const inquiry = [name, phone, item, address].map((value) =>
    typeof value === "string" ? value.trim() : "",
  );

  if (inquiry.some((value) => !value)) {
    return res.status(400).json({
      message: "All fields are required: name, phone, item, address",
    });
  }

  const [cleanName, cleanPhone, cleanItem, cleanAddress] = inquiry;
  const insertSQL = `
    INSERT INTO inquiries (name, phone, item, address)
    VALUES (?, ?, ?, ?)
  `;

  db.run(
    insertSQL,
    [cleanName, cleanPhone, cleanItem, cleanAddress],
    function (err) {
      if (err) {
        console.error("Inquiry insert failed:", err.message);
        return res.status(500).json({
          message: "Inquiry save failed",
          error: err.message,
        });
      }

      res.status(201).json({
        message: "Inquiry saved successfully",
        id: this.lastID,
      });
    },
  );
});

module.exports = router;
