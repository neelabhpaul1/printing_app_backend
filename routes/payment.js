const express = require("express");
const { payment, verifyPayment } = require("../controllers/payment");
const router = express.Router();

router.post("/order", payment);
router.post("/verify", verifyPayment);

module.exports = router;
