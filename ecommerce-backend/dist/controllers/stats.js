import { nodeCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/order.js";
import { Product } from "../models/product.js";
import { User } from "../models/user.js";
import { calculatePercentage, getChartData } from "../utills/features.js";
export const getDashboardStats = TryCatch(async (req, res, next) => {
    let stats = {};
    const key = "admin-stats";
    if (nodeCache.has(key)) {
        stats = JSON.parse(nodeCache.get(key));
    }
    else {
        //to find details of this month and last month.
        const today = new Date();
        const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfThisMonth = today;
        // One thing is important that today is equat to endOfThisMonth.
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        //to access products that are created on this month.
        //we are calculating both belows to find the production rate.
        const thisMonthProducts = await Product.find({
            createdAt: {
                $gte: startOfThisMonth,
                $lte: endOfThisMonth,
            },
        });
        //to access prducts that are created on last month.
        const lastMonthProducts = await Product.find({
            createdAt: {
                $gte: startOfLastMonth,
                $lte: endOfLastMonth,
            },
        });
        const thisMonthUsers = await User.find({
            createdAt: {
                $gte: startOfThisMonth,
                $lte: endOfThisMonth,
            },
        });
        //to access prducts that are created on last month.
        const lastMonthUsers = await User.find({
            createdAt: {
                $gte: startOfLastMonth,
                $lte: endOfLastMonth,
            },
        });
        const thisMonthOrders = await Order.find({
            createdAt: {
                $gte: startOfThisMonth,
                $lte: endOfThisMonth,
            },
        });
        //to access prducts that are created on last month.
        const lastMonthOrders = await Order.find({
            createdAt: {
                $gte: startOfLastMonth,
                $lte: endOfLastMonth,
            },
        });
        const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum += (order.total || 0), 0);
        const lastMonthRevenue = lastMonthOrders.reduce((sum, order) => sum += (order.total || 0), 0);
        const productChangePercent = calculatePercentage(thisMonthProducts.length, lastMonthProducts.length);
        const userChangePercent = calculatePercentage(thisMonthUsers.length, lastMonthUsers.length);
        const orderChangePercent = calculatePercentage(thisMonthOrders.length, lastMonthOrders.length);
        const revenueChangePercent = calculatePercentage(thisMonthRevenue, lastMonthRevenue);
        const productsCount = await Product.countDocuments();
        const usersCount = await User.countDocuments();
        const allOrders = await Order.find({}).select("total");
        const revenue = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const count = {
            user: usersCount,
            product: productsCount,
            order: allOrders.length,
            revenue: revenue
        };
        // to find the details of six month ago
        const sixMonthAgo = new Date();
        sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);
        //the purpose of this is to find monthly wise revenue of last six months
        //for example january me kitna revenue hua hai. february me kitna revenue hua hai.
        const lastSixMonthOrders = await Order.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today,
            },
        });
        const orderMonthCounts = new Array(6).fill(0);
        const orderMonthRevenue = new Array(6).fill(0);
        lastSixMonthOrders.forEach((order) => {
            const creationDate = order.createdAt;
            const monthDiff = (today.getFullYear() - creationDate.getFullYear()) * 12 +
                today.getMonth() -
                creationDate.getMonth();
            if (monthDiff < 6) {
                orderMonthCounts[6 - monthDiff - 1] += 1;
                orderMonthRevenue[6 - monthDiff - 1] += order.total;
            }
        });
        //calculation to get categories percentage.
        const categories = await Product.distinct("category");
        const categoryCount = await Promise.all(categories.map(async (category) => ({
            [category]: Math.round(((await Product.countDocuments({ category: category })) /
                productsCount) *
                100),
        })));
        // to calculate the gender ratio counts.
        const femaleUsersCount = await User.countDocuments({ gender: "female" });
        const userRatio = {
            male: usersCount - femaleUsersCount,
            female: femaleUsersCount
        };
        const latestTransactions = await Order.find({}).select(["orderItems", "discount", "total", "status"]).limit(4);
        const modifiedLatestTransaction = latestTransactions.map((i) => ({
            _id: i._id,
            discount: i.discount,
            amount: i.total,
            quantity: i.orderItems.length,
            status: i.status,
        }));
        const changePercent = {
            product: productChangePercent,
            user: userChangePercent,
            order: orderChangePercent,
            revenue: revenueChangePercent,
        };
        stats = {
            categoryCount,
            changePercent,
            count,
            chart: {
                order: orderMonthCounts,
                revenue: orderMonthRevenue,
            },
            userRatio,
            latestTransactions: modifiedLatestTransaction,
        };
        nodeCache.set(key, JSON.stringify(stats));
    }
    return res.status(200).json({
        success: true,
        stats,
    });
});
export const getPieCharts = TryCatch(async (req, res, next) => {
    let charts;
    const key = "admin-pie-charts";
    if (nodeCache.has(key)) {
        charts = JSON.parse(nodeCache.get(key));
    }
    else {
        //for order fullfillment ratio.
        const [processingOrder, shippedOrder, deliveredOrder, categories, productsCount, outOfStock, allOrders, allUsers, adminUsers, customerUsers] = await Promise.all([
            Order.countDocuments({ status: "Processing" }),
            Order.countDocuments({ status: "Shipped" }),
            Order.countDocuments({ status: "Delivered" }),
            Product.distinct("category"),
            Product.countDocuments(),
            Product.countDocuments({ stock: 0 }),
            Order.find({}).select([
                "total",
                "discount",
                "subtotal",
                "tax",
                "shippingCharges",
            ]),
            User.find({}).select(["dob"]),
            User.countDocuments({ role: "admin" }),
            User.countDocuments({ role: "user" }),
        ]);
        const orderfullfillment = {
            processing: processingOrder,
            shipped: shippedOrder,
            delivered: deliveredOrder
        };
        //product category ratio.
        const categoryCount = await Promise.all(categories.map(async (category) => ({
            [category]: Math.round((await Product.countDocuments({ category: category })) /
                productsCount) * 100,
        })));
        //stock availability.
        const stockAvailability = {
            inStock: productsCount - outOfStock,
            outOfStock: outOfStock
        };
        //revenue distribution.
        const grossIncome = allOrders.reduce((prev, order) => prev + (order.total || 0), 0);
        const discount = allOrders.reduce((prev, order) => prev + (order.discount || 0), 0);
        const produtionCost = allOrders.reduce((prev, order) => prev + (order.shippingCharges || 0), 0);
        const burnt = allOrders.reduce((prev, order) => prev + (order.tax || 0), 0);
        const marketingCost = grossIncome * (30 / 100);
        const netMargin = grossIncome - (discount + produtionCost + burnt + marketingCost);
        const revenueDistribution = {
            netMargin,
            grossIncome,
            discount,
            produtionCost,
            burnt,
            marketingCost
        };
        //Users age group.
        const usersAgeGroup = {
            teen: allUsers.filter((i) => i.age < 20).length,
            adult: allUsers.filter((i) => i.age >= 20 && i.age < 40).length,
            senior: allUsers.filter((i) => i.age >= 40).length
        };
        //admin/customer
        const adminCustomer = {
            admin: adminUsers,
            customer: customerUsers
        };
        charts = {
            orderfullfillment,
            productCategories: categoryCount,
            stockAvailability,
            revenueDistribution,
            usersAgeGroup,
            adminCustomer,
        };
        nodeCache.set(key, JSON.stringify(charts));
    }
    return res.status(200).json({
        success: true,
        charts,
    });
});
export const getBarCharts = TryCatch(async (req, res, next) => {
    let charts = {};
    const key = "admin-bar-charts";
    if (nodeCache.has(key)) {
        charts = JSON.parse(nodeCache.get(key));
    }
    else {
        const today = new Date();
        const sixMonthAgo = new Date();
        sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);
        const twelveMonthAgo = new Date();
        twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12);
        const lastSixMonthProductPromise = Product.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today
            }
        }).select("createdAt");
        const lastSixMonthUsersPromise = User.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today,
            },
        }).select("createdAt");
        const lastTwelveMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: twelveMonthAgo,
                $lte: today,
            },
        }).select("createdAt");
        const [products, users, orders] = await Promise.all([
            lastSixMonthProductPromise,
            lastSixMonthUsersPromise,
            lastTwelveMonthOrdersPromise,
        ]);
        const productCouonts = getChartData({ length: 6, docArr: products, today });
        const usersCouonts = getChartData({ length: 6, docArr: users, today });
        const ordersCouonts = getChartData({ length: 12, docArr: orders, today });
        charts = {
            users: usersCouonts,
            products: productCouonts,
            orders: ordersCouonts
        };
        nodeCache.set(key, JSON.stringify(charts));
    }
    return res.status(200).json({
        success: true,
        charts,
    });
});
export const getLineCharts = TryCatch(async (req, res, next) => {
    let charts;
    const key = "admin-line-charts";
    if (nodeCache.has(key))
        charts = JSON.parse(nodeCache.get(key));
    else {
        const today = new Date();
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        const baseQuery = {
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today,
            },
        };
        const [products, users, orders] = await Promise.all([
            Product.find(baseQuery).select("createdAt"),
            User.find(baseQuery).select("createdAt"),
            Order.find(baseQuery).select(["createdAt", "discount", "total"]),
        ]);
        const productCounts = getChartData({ length: 12, today, docArr: products });
        const usersCounts = getChartData({ length: 12, today, docArr: users });
        const discount = getChartData({
            length: 12,
            today,
            docArr: orders,
            property: "discount",
        });
        const revenue = getChartData({
            length: 12,
            today,
            docArr: orders,
            property: "total",
        });
        charts = {
            users: usersCounts,
            products: productCounts,
            discount,
            revenue,
        };
        nodeCache.set(key, JSON.stringify(charts));
    }
    return res.status(200).json({
        success: true,
        charts,
    });
});
;
