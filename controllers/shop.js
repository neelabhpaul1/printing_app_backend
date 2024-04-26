const Shops = require("../models/shopModel");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let shop = await Shops.findOne({ email });

    if (!shop) {
      return res.json({ status: 404, message: "User doesn't exist" });
    }

    if (shop.password !== password) {
      return res.json({ status: 404, message: "Password doesn't match" });
    }

    const shopData = {
      shopName: shop.shopName,
      shopId: shop.shopId,
      email: shop.email,
    };

    return res.json({ shopData, status: 200, message: "login successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.checkShopId = async (req, res) => {
  try {
    const { shopId } = req.body;

    let shopkeeperId = await Shops.findOne({ shopId });

    if (!shopkeeperId) {
      return res.json({ status: "404", message: "ShopId doesn't exist" });
    }

    const { accountId } = shopkeeperId;

    return res.json({ status: "200", accountId, message: "ShopId Exists" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
