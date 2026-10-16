const crypto = require("crypto");
const express = require("express");
const db = require("./db");

const router = express.Router();

const productPrices = new Map([
  [1, { name: "Flex Fabric 3 Seater Sofa in Magic Blue Color", price: 104999 }],
  [2, { name: "Nordic Oak Coffee Table", price: 12999 }],
  [3, { name: "Aspen King Bed Frame", price: 38999 }],
  [4, { name: "Kyoto Dining Table Set", price: 55999 }],
  [5, { name: "Ergo Pro Office Chair", price: 18999 }],
  [6, { name: "Milan Velvet Armchair", price: 24999 }],
  [7, { name: "Scandi 4-Door Wardrobe", price: 46999 }],
  [8, { name: "Loft Standing Desk", price: 29999 }],
]);

const validateCustomer = (body) => {
  const { fullName, phone, address, city, pincode } = body;
  const customerName = typeof fullName === "string" ? fullName.trim() : "";
  const cleanPhone = typeof phone === "string" ? phone.trim() : "";
  const cleanAddress = typeof address === "string" ? address.trim() : "";
  const cleanCity = typeof city === "string" ? city.trim() : "";
  const cleanPincode = typeof pincode === "string" ? pincode.trim() : "";

  if (
    !customerName ||
    customerName.length > 80 ||
    !/^\+?[\d\s()-]{10,18}$/.test(cleanPhone) ||
    cleanPhone.replace(/\D/g, "").length < 10 ||
    cleanPhone.replace(/\D/g, "").length > 13 ||
    !cleanAddress ||
    cleanAddress.length > 250 ||
    !cleanCity ||
    cleanCity.length > 100 ||
    !/^\d{6}$/.test(cleanPincode)
  ) {
    return {
      error:
        "Enter a valid name, phone number, address, city, and 6-digit pincode.",
    };
  }

  return { customerName, cleanPhone, cleanAddress, cleanCity, cleanPincode };
};

const validateItems = (items) => {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) {
    return { error: "Your cart is empty or invalid." };
  }

  const orderItems = [];
  const seenProductIds = new Set();

  for (const item of items) {
    const productId = Number(item?.id);
    const quantity = Number(item?.qty);
    const product = productPrices.get(productId);

    if (
      !Number.isInteger(productId) ||
      !product ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 20 ||
      seenProductIds.has(productId)
    ) {
      return { error: "Your cart contains an invalid item." };
    }

    seenProductIds.add(productId);
    orderItems.push({
      id: productId,
      name: product.name,
      quantity,
      unitPrice: product.price,
      lineTotal: product.price * quantity,
    });
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const deliveryCharge = subtotal > 25000 ? 0 : 499;
  const total = subtotal + deliveryCharge;
  return { orderItems, subtotal, deliveryCharge, total };
};

const readOrderRequest = (req, res) => {
  const customer = validateCustomer(req.body || {});
  if (customer.error) {
    res.status(400).json({ message: customer.error });
    return null;
  }

  const cart = validateItems(req.body?.items);
  if (cart.error) {
    res.status(400).json({ message: cart.error });
    return null;
  }

  return { ...customer, ...cart };
};

const getRazorpayCredentials = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (
    !/^rzp_test_[A-Za-z0-9]+$/.test(keyId || "") ||
    !keySecret ||
    keySecret === "your_razorpay_test_key_secret"
  ) {
    return null;
  }
  return { keyId, keySecret };
};

const razorpayRequest = async (path, credentials, options = {}) => {
  const response = await fetch(`https://api.razorpay.com/v1/${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${credentials.keyId}:${credentials.keySecret}`,
      ).toString("base64")}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.error?.description ||
        `Razorpay request failed with status ${response.status}.`,
    );
  }
  return data;
};

router.post("/", (req, res) => {
  const orderRequest = readOrderRequest(req, res);
  if (!orderRequest) return;
  if (req.body?.payment !== "cod") {
    return res.status(400).json({
      message: "Choose Cash on Delivery or Razorpay online payment.",
    });
  }

  const {
    customerName,
    cleanPhone,
    cleanAddress,
    cleanCity,
    cleanPincode,
    orderItems,
    subtotal,
    deliveryCharge,
    total,
  } = orderRequest;
  const orderNumber = `A2Z-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;

  db.run(
    `INSERT INTO orders (
      order_number, customer_name, phone, address, city, pincode,
      payment_method, payment_status, order_status, items_json,
      subtotal, delivery_charge, total
    ) VALUES (?, ?, ?, ?, ?, ?, 'cod', 'pending', 'pending', ?, ?, ?, ?)`,
    [
      orderNumber,
      customerName,
      cleanPhone,
      cleanAddress,
      cleanCity,
      cleanPincode,
      JSON.stringify(orderItems),
      subtotal,
      deliveryCharge,
      total,
    ],
    function (err) {
      if (err) {
        console.error("Order save failed:", err.message);
        return res.status(500).json({
          message: "Your order could not be saved. Please try again.",
        });
      }

      return res.status(201).json({
        message: "Order placed successfully.",
        order: {
          id: orderNumber,
          total,
          payment: "cod",
          paymentStatus: "pending",
          createdAt: new Date().toISOString(),
        },
      });
    },
  );
});

router.post("/razorpay/create-order", async (req, res) => {
  const credentials = getRazorpayCredentials();
  if (!credentials) {
    return res.status(503).json({
      message:
        "Online payment is not configured. Add Razorpay test keys to backend/.env.",
    });
  }

  const orderRequest = readOrderRequest(req, res);
  if (!orderRequest) return;

  const {
    customerName,
    cleanPhone,
    cleanAddress,
    cleanCity,
    cleanPincode,
    orderItems,
    subtotal,
    deliveryCharge,
    total,
  } = orderRequest;
  const orderNumber = `A2Z-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;

  try {
    const gatewayOrder = await razorpayRequest("orders", credentials, {
      method: "POST",
      body: JSON.stringify({
        amount: total * 100,
        currency: "INR",
        receipt: orderNumber,
        notes: { store_order_number: orderNumber },
      }),
    });

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO orders (
        order_number, customer_name, phone, address, city, pincode,
        payment_method, payment_status, order_status, items_json,
        subtotal, delivery_charge, total, gateway_order_id
      ) VALUES (?, ?, ?, ?, ?, ?, 'razorpay', 'created', 'pending', ?, ?, ?, ?, ?)`,
        [
          orderNumber,
          customerName,
          cleanPhone,
          cleanAddress,
          cleanCity,
          cleanPincode,
          JSON.stringify(orderItems),
          subtotal,
          deliveryCharge,
          total,
          gatewayOrder.id,
        ],
        (error) => (error ? reject(error) : resolve()),
      );
    });

    return res.status(201).json({
      keyId: credentials.keyId,
      orderId: orderNumber,
      razorpayOrderId: gatewayOrder.id,
      amount: gatewayOrder.amount,
      currency: gatewayOrder.currency,
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error.message);
    return res.status(502).json({
      message: "Online payment could not be started. Please try again.",
    });
  }
});

router.post("/razorpay/verify-payment", async (req, res) => {
  const credentials = getRazorpayCredentials();
  if (!credentials) {
    return res.status(503).json({
      message: "Online payment is not configured on the server.",
    });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body || {};
  if (
    typeof razorpay_order_id !== "string" ||
    !/^order_[A-Za-z0-9]+$/.test(razorpay_order_id) ||
    typeof razorpay_payment_id !== "string" ||
    !/^pay_[A-Za-z0-9]+$/.test(razorpay_payment_id) ||
    typeof razorpay_signature !== "string" ||
    !/^[a-f0-9]{64}$/i.test(razorpay_signature)
  ) {
    return res
      .status(400)
      .json({ message: "Invalid payment verification details." });
  }

  db.get(
    "SELECT * FROM orders WHERE gateway_order_id = ? AND payment_method = 'razorpay'",
    [razorpay_order_id],
    async (lookupError, order) => {
      if (lookupError) {
        console.error("Razorpay order lookup failed:", lookupError.message);
        return res
          .status(500)
          .json({ message: "Order could not be verified." });
      }
      if (!order) {
        return res
          .status(404)
          .json({ message: "The payment order was not found." });
      }
      if (order.payment_status === "paid") {
        if (order.gateway_payment_id === razorpay_payment_id) {
          return res.json({
            message: "Payment already verified.",
            order: {
              id: order.order_number,
              total: order.total,
              payment: "razorpay",
            },
          });
        }
        return res
          .status(409)
          .json({ message: "This order has already been paid." });
      }
      if (order.payment_status !== "created") {
        return res
          .status(409)
          .json({ message: "This payment order is no longer active." });
      }

      const expectedSignature = crypto
        .createHmac("sha256", credentials.keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest();
      const receivedSignature = Buffer.from(razorpay_signature, "hex");
      if (
        expectedSignature.length !== receivedSignature.length ||
        !crypto.timingSafeEqual(expectedSignature, receivedSignature)
      ) {
        return res
          .status(400)
          .json({ message: "Payment signature is invalid." });
      }

      try {
        let paymentDetails = await razorpayRequest(
          `payments/${encodeURIComponent(razorpay_payment_id)}`,
          credentials,
        );
        if (
          paymentDetails.order_id !== razorpay_order_id ||
          paymentDetails.amount !== order.total * 100 ||
          paymentDetails.currency !== "INR"
        ) {
          return res.status(402).json({
            message: "Payment details do not match this order.",
          });
        }

        if (paymentDetails.status === "authorized") {
          paymentDetails = await razorpayRequest(
            `payments/${encodeURIComponent(razorpay_payment_id)}/capture`,
            credentials,
            {
              method: "POST",
              body: JSON.stringify({
                amount: order.total * 100,
                currency: "INR",
              }),
            },
          );
        }
        if (paymentDetails.status !== "captured") {
          return res.status(402).json({
            message: "Payment has not been captured. Please try again.",
          });
        }

        db.run(
          `UPDATE orders
         SET payment_status = 'paid', order_status = 'confirmed', gateway_payment_id = ?
         WHERE id = ? AND payment_status = 'created'`,
          [razorpay_payment_id, order.id],
          function (updateError) {
            if (updateError) {
              console.error(
                "Payment status update failed:",
                updateError.message,
              );
              return res.status(500).json({
                message:
                  "Payment was received, but order confirmation failed. Contact support.",
              });
            }
            if (this.changes !== 1) {
              return res.status(409).json({
                message:
                  "Order payment status changed. Please contact support.",
              });
            }

            return res.json({
              message: "Payment verified successfully.",
              order: {
                id: order.order_number,
                total: order.total,
                payment: "razorpay",
                paymentStatus: "paid",
              },
            });
          },
        );
      } catch (error) {
        console.error("Razorpay payment verification failed:", error.message);
        return res.status(502).json({
          message:
            "Payment could not be verified right now. Please contact support.",
        });
      }
    },
  );
});

module.exports = router;
