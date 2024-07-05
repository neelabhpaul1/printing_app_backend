const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpayInstance = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_SECRET_KEY,
});

exports.payment = async (req, res) => {
	const { noOfPages, pageSizeFormat, grayOrColored, noOfCopies } = req.body;
	let amount = 0;
	if (noOfPages < 21) {
		if (pageSizeFormat === "a3") {
			amount = grayOrColored === "0" ? 10 : 35;
		} else if (pageSizeFormat === "a4") {
			amount = grayOrColored === "0" ? 3 : 10;
		}
	} else if (noOfPages < 100) {
		if (pageSizeFormat === "a3") {
			amount = grayOrColored === "0" ? 7 : 28;
		} else if (pageSizeFormat === "a4") {
			amount = grayOrColored === "0" ? 2 : 8;
		}
	} else {
		if (pageSizeFormat === "a3") {
			amount = grayOrColored === "0" ? 5 : 20;
		} else if (pageSizeFormat === "a4") {
			amount = grayOrColored === "0" ? 1 : 7;
		}
	}

	amount =
		amount * noOfPages * noOfCopies + parseInt(`${process.env.FEES_AMOUNT}`);

	const options = {
		amount: amount * 100,
		currency: "INR",
	};

	razorpayInstance.orders.create(options, (err, order) => {
		if (!err) {
			return res.json({
				order: {
					...order,
					Key_Id: process.env.RAZORPAY_KEY_ID,
				},
				success: true,
			});
		} else {
			return res.send(err);
		}
	});
};

const initiateTransfer = async (paymentId, amount, accountId) => {
	try {
		const transfer = await razorpayInstance.payments.transfer(paymentId, {
			transfers: [
				{
					account: accountId,
					amount: amount - parseInt(`${process.env.FEES_AMOUNT}`) * 100,
					currency: "INR",
				},
				{
					account: `${process.env.RAZORPAY_FEES_ACCOUNT_ID}`,
					amount: parseInt(`${process.env.FEES_AMOUNT}`) * 100,
					currency: "INR",
				},
			],
		});
		return transfer;
	} catch (error) {
		if (
			error.statusCode === 400 &&
			error.error &&
			error.error.description ===
				"The sum of amount requested for transfer is greater than the captured amount"
		) {
			console.error("Transfer amount exceeds captured amount");
		} else {
			console.error("Error initiating transfer:", error);
		}
	}
};

const capturePayment = async (paymentId, amount, currency) => {
	try {
		const response = await razorpayInstance.payments.capture(
			paymentId,
			amount,
			currency
		);
		console.log("capture Response", response);
		return response;
	} catch (error) {
		console.log(error.message);
	}
};

exports.verifyPayment = async (req, res) => {
	try {
		const {
			razorpay_order_id,
			razorpay_payment_id,
			razorpay_signature,
			amount,
			accountId,
		} = req.body;

		const sign = razorpay_order_id + "|" + razorpay_payment_id;
		const resultSign = crypto
			.createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
			.update(sign.toString())
			.digest("hex");

		if (razorpay_signature == resultSign) {
			await capturePayment(razorpay_payment_id, amount, "INR");
			await initiateTransfer(razorpay_payment_id, amount, accountId);

			return res.status(200).json({
				success: true,
				order_id: razorpay_order_id,
				payment_id: razorpay_payment_id,
				amount: amount / 100,
				message: "Payment verified successfully",
			});
		}
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: "Internal Server Error!" });
	}
};
