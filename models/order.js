const mongoose = require("mongoose");

const ordersSchema = new mongoose.Schema(
  {
    shopId: String,
    docUrl: String,
    phoneNo: String,
    noOfPages: Number,
    pageSizeFormat: String,
    grayOrColored: String,
    noOfCopies: Number,
    pageSides: String,
    order_id: String,
    payment_id: String,
    amount: String,
    currentDate: String,
    isTriggered: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Orders", ordersSchema);
