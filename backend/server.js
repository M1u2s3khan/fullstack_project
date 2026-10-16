require("dotenv").config();

const app = require("./app");
const db = require("./db");
const mongoose = require("mongoose");
const PORT = Number(process.env.PORT) || 5000;
const mongoUri =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/a_to_z_furniture";

Promise.all([db.ready, mongoose.connect(mongoUri)])
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend listening at http://localhost:${PORT}`);
      console.log(`SQLite database: ${db.path}`);
      console.log(`MongoDB connected: ${mongoose.connection.name}`);
    });
  })
  .catch((error) => {
    console.error("Backend could not start:", error.message);
    db.close();
    mongoose.disconnect();
    process.exitCode = 1;
  });
