import mongoose from "mongoose";
import { Product } from "../models/product.js";
import { nodeCache } from "../app.js";
import ErrorHandler from "../utills/utility-class.js";
export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            dbName: "Ecommerce",
        });
        console.log(`mongodb is connected with ${mongoose.connection.host}`);
    }
    catch (error) {
        console.log("Failed to connect mongodb", error);
    }
};
export const invalidateCache = ({ product, order, admin, userId, orderId, productId, }) => {
    if (product) {
        const productKeys = [
            "latest-products",
            "categories",
            "all-products",
        ];
        if (typeof productId === "string")
            productKeys.push(`product-${productId}`);
        if (typeof productId === "object")
            productId.forEach((i) => productKeys.push(`product-${i}`));
        nodeCache.del(productKeys);
    }
    if (order) {
        const ordersKeys = [
            "all-orders",
            `my-orders-${userId}`,
            `order-${orderId}`,
        ];
        nodeCache.del(ordersKeys);
    }
    if (admin) {
        nodeCache.del([
            "admin-stats",
            "admin-pie-charts",
            "admin-bar-charts",
            "admin-line-charts",
        ]);
    }
};
export const reduceStock = async (orderItems) => {
    for (let i = 0; i < orderItems.length; i++) {
        let order = orderItems[i];
        const product = await Product.findById(order.productId);
        if (!product) {
            throw new ErrorHandler("Product not found", 404);
        }
        product.stock -= order.quantity;
        await product.save();
    }
};
export const calculatePercentage = (thisMonth, lastMonth) => {
    if (lastMonth === 0)
        return thisMonth * 100;
    const percent = ((thisMonth) / lastMonth) * 100;
    return Number(percent.toFixed(0));
};
export const getChartData = ({ length, docArr, today, property, }) => {
    const data = new Array(length).fill(0);
    docArr.forEach((i) => {
        const creationDate = i.createdAt;
        const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
        if (monthDiff < length) {
            if (property) {
                data[length - monthDiff - 1] += i[property];
            }
            else {
                data[length - monthDiff - 1] += 1;
            }
        }
    });
    return data;
};
