import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { invalidateCache, reduceStock } from "../utills/features.js";
import { nodeCache } from "../app.js";
import ErrorHandler from "../utills/utility-class.js";
//jab koi bhi order krega to mongoose ka document create hoga.
export const newOrder = TryCatch(async (req, res, next) => {
    const { shippingInfo, orderItems, user, subtotal, tax, shippingCharges, discount, total, status, } = req.body;
    const order = await Order.create({
        shippingInfo,
        orderItems,
        user,
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
        status
    });
    await reduceStock(orderItems);
    invalidateCache({
        product: true,
        order: true,
        admin: true,
        userId: user,
        productId: order.orderItems.map((i) => String(i.productId)),
    });
    return res.status(201).json({
        success: true,
        message: "Order Placed successfully"
    });
});
//through this api or promise each user can access your own orders.
export const myOrder = TryCatch(async (req, res, next) => {
    const { id } = req.query;
    let orders;
    if (nodeCache.has(`my-orders-${id}`)) {
        orders = JSON.parse(nodeCache.get(`my-orders-${id}`));
    }
    else {
        orders = await Order.find({ user: id });
        nodeCache.set(`my-orders-${id}`, JSON.stringify(orders));
    }
    res.status(200).json({
        success: true,
        orders,
    });
});
//through this api admin can access all orders of products.
export const getAllOrders = TryCatch(async (req, res, next) => {
    let orders;
    if (nodeCache.has("all-orders")) {
        orders = JSON.parse(nodeCache.get("all-orders"));
    }
    else {
        orders = await Order.find().populate("user", { name: 1 });
        if (!orders)
            return next(new ErrorHandler("orders not fouond", 404));
        nodeCache.set("all-orders", JSON.stringify(orders));
    }
    res.status(200).json({
        success: true,
        orders,
    });
});
//througn this api user can access details of their each orders.
export const getSingleOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    let order;
    if (nodeCache.has(`order-${id}`)) {
        order = JSON.parse(nodeCache.get(`order-${id}`));
    }
    else {
        order = await Order.findById(id).populate("user", { name: 1 });
        if (!order)
            return next(new ErrorHandler("order not fouond", 404));
        nodeCache.set(`order-${id}`, JSON.stringify(order));
    }
    res.status(200).json({
        success: true,
        order,
    });
});
//thorugh this api admin can change the status of order of products.
export const processOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order)
        return next(new ErrorHandler("order not fouond", 404));
    switch (order.status) {
        case "Processing":
            order.status = "Shipped";
            break;
        case "Shipped":
            order.status = "Delivered";
            break;
        default:
            order.status = "Delivered";
    }
    await order.save();
    invalidateCache({
        product: false,
        order: true,
        admin: true,
        userId: order.user,
        orderId: String(order._id),
    });
    return res.status(200).json({
        success: true,
        message: "Order processed successfully"
    });
});
export const deleteOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order)
        return next(new ErrorHandler("order not fouond", 404));
    await order.deleteOne();
    invalidateCache({
        product: false,
        order: true,
        admin: true,
        userId: order.user,
        orderId: String(order._id),
    });
    return res.status(200).json({
        success: true,
        message: "Order deleted successfully"
    });
});
