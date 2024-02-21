import express from "express";
import { connectDB } from "./utills/features.js";
import NodeCache from "node-cache";
import dotenv from "dotenv";
import morgan from "morgan";
import Stripe from "stripe";
import cors from "cors";
//importing routes
import userRoute from "./routes/user.js";
import productRoute from "./routes/products.js";
import orderRoute from "./routes/order.js";
import paymentRoute from "./routes/payment.js";
import dashboardRoute from "./routes/stats.js";
import { errorMiddleware } from "./middlewares/error.js";
import bodyParser from "body-parser";
const app = express();
app.use(morgan("dev")); //api ke through ham jo request krte hai uski information deta hai.
dotenv.config({
    path: "./.env"
});
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
const port = process.env.PORT || 4000;
app.get("/", (req, res) => {
    res.send("API is working with /api/v1 !");
});
connectDB();
const stripeKey = process.env.STRIPE_KEY || "";
export const stripe = new Stripe(stripeKey);
// node-cache is used to optimize the api calls.
export const nodeCache = new NodeCache();
//using routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/payment", paymentRoute);
app.use("/api/v1/dashboard", dashboardRoute);
app.use("/uploads", express.static("uploads"));
//error middleware must be at the end of all routes
app.use(errorMiddleware);
app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});
