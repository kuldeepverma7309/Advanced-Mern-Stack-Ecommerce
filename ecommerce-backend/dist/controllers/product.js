import { TryCatch } from "../middlewares/error.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utills/utility-class.js";
import fs from "fs";
import { nodeCache } from "../app.js";
import { invalidateCache } from "../utills/features.js";
export const newProduct = TryCatch(async (req, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    if (!photo)
        return next(new ErrorHandler("Please add Photo", 401));
    if ((!name || !price || !stock || !category)) {
        fs.unlink(photo.path, () => {
            console.log("file deleted");
        });
        return next(new ErrorHandler("Please Provide all details", 401));
    }
    await Product.create({
        name,
        price,
        stock,
        category: category.toLowerCase(),
        photo: photo?.path,
    });
    invalidateCache({ product: true, admin: true });
    return res.status(201).json({
        success: true,
        message: "Product added successfully"
    });
});
//Invalidate getLatestProduct on new, update,delete and new order of products.
export const getLatestProducts = TryCatch(async (req, res, next) => {
    let products;
    if (nodeCache.has("latest-products")) {
        products = JSON.parse(nodeCache.get("latest-products"));
    }
    else {
        products = await Product.find().sort({ createdAt: -1 }).limit(5);
        nodeCache.set("latest-products", JSON.stringify(products));
    }
    return res.status(200).json({
        success: true,
        products,
    });
});
export const getAllCategories = TryCatch(async (req, res, next) => {
    let categories;
    if (nodeCache.has("categories")) {
        categories = JSON.parse(nodeCache.get("categories"));
    }
    else {
        categories = await Product.distinct("category");
        nodeCache.set("categories", JSON.stringify(categories));
    }
    //const product = await Product.find();
    // const categories = product.map((item)=>{
    //     return item.category
    // })
    //const categories = await Product.distinct("category");
    return res.status(200).json({
        success: true,
        categories
    });
});
//this function will give all products to the admin
export const getAdminProducts = TryCatch(async (req, res, next) => {
    let products;
    if (nodeCache.has("all-products")) {
        products = JSON.parse(nodeCache.get("all-products"));
    }
    else {
        products = await Product.find();
        nodeCache.set("all-products", JSON.stringify(products));
    }
    return res.status(200).json({
        success: true,
        products
    });
});
export const getSingleProduct = TryCatch(async (req, res, next) => {
    let product;
    const id = req.params.id;
    if (nodeCache.has(`product-${id}`)) {
        product = JSON.parse(nodeCache.get(`product-${id}`));
    }
    else {
        product = await Product.findById(req.params.id);
        nodeCache.set(`product-${id}`, JSON.stringify(product));
    }
    return res.status(200).json({
        success: true,
        product
    });
});
export const updateProduct = TryCatch(async (req, res, next) => {
    const { name, price, stock, category } = req.body;
    console.log(name);
    const product = await Product.findById(req.params.id);
    if (!product)
        return next(new ErrorHandler("Product not found", 404));
    const photo = req.file;
    console.log(price);
    if (photo) {
        fs.unlink(product.photo, () => { console.log("Old photo deleted successfully"); });
        product.photo = photo.path;
    }
    if (name) {
        product.name = name;
    }
    if (price) {
        product.price = price;
    }
    if (stock) {
        product.stock = stock;
    }
    if (category) {
        product.category = category.toLowerCase();
    }
    await product.save();
    invalidateCache({
        product: true,
        productId: String(product._id),
        admin: true,
    });
    return res.status(200).json({
        success: true,
        message: "Product updated successfully"
    });
});
export const deleteProduct = TryCatch(async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    if (!product)
        return next(new ErrorHandler("Product not found", 404));
    fs.unlink(product.photo, () => { console.log("Old photo deleted successfully"); });
    await product.deleteOne();
    invalidateCache({
        product: true,
        productId: String(product._id),
        admin: true,
    });
    return res.status(200).json({
        success: true,
        message: "Product deleted successfully"
    });
});
//this promise or function will allow the user to search all the products by their 
//name by applying filters category etc.
export const searchAllProducts = TryCatch(async (req, res, next) => {
    const { search, price, category, sort } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE || 8);
    const skip = limit * (page - 1);
    const baseQuery = {};
    if (search)
        baseQuery.name = {
            $regex: search,
            $options: "i",
        };
    if (price)
        baseQuery.price = {
            $lte: Number(price),
        };
    if (category)
        baseQuery.category = category;
    // const products = await Product.find(baseQuery)
    //   .sort(sort ? { price: sort === "asc" ? 1 : -1 } : undefined)
    //   .limit(limit)
    //   .skip(skip);
    // const numberOfProducts = await Product.find(baseQuery);
    //this will parallely solve both the promises.
    const [products, numberOfProducts] = await Promise.all([
        Product.find(baseQuery)
            .sort(sort ? { price: sort === "asc" ? 1 : -1 } : undefined)
            .limit(limit)
            .skip(skip),
        Product.find(baseQuery),
    ]);
    const totalPages = Math.ceil(numberOfProducts.length / limit);
    return res.status(201).json({
        success: true,
        products,
        totalPages
    });
});
