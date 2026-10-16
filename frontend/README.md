# A To Z Furniture

## Run locally

1. Start MongoDB. The backend uses `mongodb://127.0.0.1:27017/a_to_z_furniture`
   by default. To use MongoDB Atlas or another server, set `MONGODB_URI` in
   `backend/.env` (see `backend/.env.example`).
2. In one terminal, start the backend:

   ```powershell
   cd ..\backend
   npm install
   npm start
   ```

3. In another terminal, start the frontend:

   ```powershell
   npm install
   npm start
   ```

   The frontend opens at <http://localhost:3000> and proxies API requests to
   the backend at <http://localhost:5000>.

User accounts and login sessions are stored in MongoDB. Contact messages and
inquiries are stored in `backend/database.db` (SQLite). Checkout currently
supports Cash on Delivery and Razorpay online payments. Both orders and their
item/price snapshots are saved in the SQLite `orders` table. Online payments
are marked paid only after the backend verifies the Razorpay signature and
confirms that the gateway captured the matching amount.

To enable Razorpay test payments, copy `backend/.env.example` to
`backend/.env` and fill in the test Key ID and Key Secret from the Razorpay
Dashboard. Keep the Key Secret private and restart the backend after setting
the keys. Without the keys, Cash on Delivery remains available and online
checkout reports that it is not configured.

## Verify the frontend

Run `npm run build` from this directory to create a production build.
