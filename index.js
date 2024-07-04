const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 8000;
const connection = require("./db/config");
const order = require("./routes/order");
const shop = require("./routes/shop");
const payment = require("./routes/payment");
const Orders = require("./models/order");
const cors = require("cors");
connection();

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "*");

	next();
});

app.use(
	cors({
		origin: [
			`${process.env.USER_FRONTEND_URL}`,
			,
			`${process.env.ADMIN_FRONTEND_URL}`,
		],
		methods: ["GET", "POST"],

		credentials: true,
	})
);
app.use(express.json());
app.use("/files", express.static("files"));

app.use("/api/v1/order", order);
app.use("/api/v1/payment", payment);
app.use("/api/v1/shop", shop);

const server = require("http").createServer(app);

const io = require("./util/socket").init(server);

io.on("connection", (socket) => {
	console.log("Client connected");

	socket.on("join_room", async (room) => {
		socket.join(room.shopId);

		const orders = await Orders.find({
			shopId: room.shopId,
		})
			.sort({ _id: -1 })
			.lean();

		const prevOrders = orders.map((order, index) => ({
			...order,
			sno: orders.length - index,
		}));

		const limitOrders = prevOrders.slice(0, 2000)

		socket.emit("receiveOrders", { orders: limitOrders });

		socket.on("updateTrigger", async (data) => {
			const updatedOrder = await Orders.findByIdAndUpdate(
				{ _id: data.id },
				{ isTriggered: data.triggered },
				{ new: true }
			);

			const latestOrders = await Orders.find({ shopId: data.shopId })
				.sort({
					_id: -1,
				})
				.lean();

			const updatedOrders = latestOrders.map((order, index) => ({
				...order,
				sno: latestOrders.length - index,
			}));

			socket.emit("updatedOrders", { updatedOrders, updatedOrder });
		});
	});

	socket.on("disconnect", () => {
		console.log("client disconnected");
	});
});

server.listen(PORT, (err) => {
	if (err) {
		console.log(err.message);
	} else {
		console.log(`Server running at ${PORT}`);
	}
});
