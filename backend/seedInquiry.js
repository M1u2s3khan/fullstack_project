const db = require("./db");

const sampleInquiry = {
  name: "Ayesha Khan",
  phone: "+91 98765 43210",
  item: "Harlow Queen Bed",
  address: "12 Maple Avenue, New Delhi, India",
};

db.run(
  `INSERT INTO inquiries (name, phone, item, address) VALUES (?, ?, ?, ?)`,
  [
    sampleInquiry.name,
    sampleInquiry.phone,
    sampleInquiry.item,
    sampleInquiry.address,
  ],
  function (err) {
    if (err) {
      console.error("Insert failed:", err.message);
      process.exit(1);
    }

    console.log("Sample inquiry inserted successfully with id:", this.lastID);
    db.close();
  },
);
