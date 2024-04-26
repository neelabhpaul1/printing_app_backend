const Orders = require("../models/order");
const io = require("../util/socket");
exports.order = async (req, res) => {
  try {
    const {
      shopId,
      phoneNo,
      noOfPages,
      pageSizeFormat,
      grayOrColored,
      noOfCopies,
      pageSides,
      order_ID,
      payment_ID,
      amount,
    } = req.body;
    const docUrl = `https://${req.headers.host}/${req.file.path}`;
    const order = new Orders({
      shopId,
      docUrl,
      phoneNo,
      noOfPages,
      pageSizeFormat,
      grayOrColored,
      noOfCopies,
      pageSides,
      order_id: order_ID,
      payment_id: payment_ID,
      amount,
      currentDate: new Date().toISOString().slice(0, 10),
    });
    await order.save();

    const printableData = {
      shopId: order.shopId,
      id: order._id,
      docUrl: order.docUrl,
      phoneNo: order.phoneNo,
      noOfPages: order.noOfPages,
      pageSizeFormat: order.pageSizeFormat,
      grayOrColored: order.grayOrColored,
      noOfCopies: order.noOfCopies,
      pageSides: order.pageSides,
      createdDate: order.currentDate,
      order_id: order.order_id,
      payment_id: order.payment_id,
      amount: order.amount,
      isTriggered: order.isTriggered,
    };
    io.getIO().to(printableData.shopId).emit("addOrder", {
      printableData,
    });
    res.status(200).json({ printableData, message: "success" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const updatedOrder = await Orders.findByIdAndUpdate(
      { _id: req.body.id },
      {
        $set: {
          isTriggered: req.body.isTriggered,
        },
      },
      { new: true }
    );

    const latestOrders = await Orders.find({});

    return res
      .status(200)
      .json({ latestOrders, updatedOrder, message: "order updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
