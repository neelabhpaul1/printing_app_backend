const express = require("express");
const { login, checkShopId } = require("../controllers/shop");
const router = express.Router();

router.post("/login", login);
router.post("/checkshopId", checkShopId);

module.exports = router;
