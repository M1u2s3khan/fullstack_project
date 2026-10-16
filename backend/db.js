const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "database.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ SQLite connection failed:", err.message);
  } else {
    console.log("✅ SQLite connected");
  }
});

db.path = dbPath;

db.ready = new Promise((resolve, reject) => {
  db.serialize(() => {
    db.run(
      `
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
      (err) => {
        if (err) {
          reject(
            new Error(`Contacts table initialization failed: ${err.message}`),
          );
          return;
        }

        db.run(
          `
        CREATE TABLE IF NOT EXISTS inquiries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          phone TEXT NOT NULL,
          item TEXT NOT NULL,
          address TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
          (inquiriesErr) => {
            if (inquiriesErr) {
              reject(
                new Error(
                  `Inquiries table initialization failed: ${inquiriesErr.message}`,
                ),
              );
              return;
            }

            db.run(
              `
              CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_number TEXT NOT NULL UNIQUE,
                customer_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                address TEXT NOT NULL,
                city TEXT NOT NULL,
                pincode TEXT NOT NULL,
                payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'razorpay')),
                payment_status TEXT NOT NULL DEFAULT 'pending',
                order_status TEXT NOT NULL DEFAULT 'pending',
                items_json TEXT NOT NULL,
                subtotal INTEGER NOT NULL,
                delivery_charge INTEGER NOT NULL,
                total INTEGER NOT NULL,
                gateway_order_id TEXT UNIQUE,
                gateway_payment_id TEXT UNIQUE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
              )
            `,
              (ordersErr) => {
                if (ordersErr) {
                  reject(
                    new Error(
                      `Orders table initialization failed: ${ordersErr.message}`,
                    ),
                  );
                  return;
                }

                db.get(
                  "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'orders'",
                  (schemaErr, row) => {
                    if (schemaErr) {
                      reject(
                        new Error(
                          `Orders schema check failed: ${schemaErr.message}`,
                        ),
                      );
                      return;
                    }

                    if (!row.sql.includes("payment_method = 'cod'")) {
                      console.log(`SQLite tables ready: ${dbPath}`);
                      resolve();
                      return;
                    }

                    db.serialize(() => {
                      db.run("BEGIN IMMEDIATE");
                      db.run(
                        `
                        CREATE TABLE orders_new (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          order_number TEXT NOT NULL UNIQUE,
                          customer_name TEXT NOT NULL,
                          phone TEXT NOT NULL,
                          address TEXT NOT NULL,
                          city TEXT NOT NULL,
                          pincode TEXT NOT NULL,
                          payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'razorpay')),
                          payment_status TEXT NOT NULL DEFAULT 'pending',
                          order_status TEXT NOT NULL DEFAULT 'pending',
                          items_json TEXT NOT NULL,
                          subtotal INTEGER NOT NULL,
                          delivery_charge INTEGER NOT NULL,
                          total INTEGER NOT NULL,
                          gateway_order_id TEXT UNIQUE,
                          gateway_payment_id TEXT UNIQUE,
                          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )
                      `,
                        (migrationErr) => {
                          if (migrationErr) {
                            db.run("ROLLBACK");
                            reject(
                              new Error(
                                `Orders table migration failed: ${migrationErr.message}`,
                              ),
                            );
                            return;
                          }

                          db.run(
                            `INSERT INTO orders_new (
                              id, order_number, customer_name, phone, address, city, pincode,
                              payment_method, payment_status, order_status, items_json,
                              subtotal, delivery_charge, total, created_at
                            )
                            SELECT
                              id, order_number, customer_name, phone, address, city, pincode,
                              payment_method, payment_status, order_status, items_json,
                              subtotal, delivery_charge, total, created_at
                            FROM orders`,
                            (copyErr) => {
                              if (copyErr) {
                                db.run("ROLLBACK");
                                reject(
                                  new Error(
                                    `Existing orders could not be migrated: ${copyErr.message}`,
                                  ),
                                );
                                return;
                              }

                              db.run("DROP TABLE orders", (dropErr) => {
                                if (dropErr) {
                                  db.run("ROLLBACK");
                                  reject(
                                    new Error(
                                      `Old orders table could not be replaced: ${dropErr.message}`,
                                    ),
                                  );
                                  return;
                                }

                                db.run(
                                  "ALTER TABLE orders_new RENAME TO orders",
                                  (renameErr) => {
                                    if (renameErr) {
                                      db.run("ROLLBACK");
                                      reject(
                                        new Error(
                                          `Migrated orders table could not be activated: ${renameErr.message}`,
                                        ),
                                      );
                                      return;
                                    }

                                    db.run("COMMIT", (commitErr) => {
                                      if (commitErr) {
                                        reject(
                                          new Error(
                                            `Orders migration could not be committed: ${commitErr.message}`,
                                          ),
                                        );
                                        return;
                                      }
                                      console.log(
                                        "SQLite orders table migrated for online payments",
                                      );
                                      console.log(
                                        `SQLite tables ready: ${dbPath}`,
                                      );
                                      resolve();
                                    });
                                  },
                                );
                              });
                            },
                          );
                        },
                      );
                    });
                  },
                );
              },
            );
          },
        );
      },
    );
  });
});

module.exports = db;
