const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    shopName: String,
    shopId: {
      type: String,
      unique: true,
    },
    accountId: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Shops", shopSchema);
