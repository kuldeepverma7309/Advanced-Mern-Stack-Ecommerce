import { stripe } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/coupon.js";
import ErrorHandler from "../utills/utility-class.js";


export const createPayment = TryCatch(async(req,res,next)=>{
    const {amount} = req.body;
    
    if(!amount) return next(new ErrorHandler("Please enter amount",400));

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Number(amount) * 100,
      currency: "inr",
    });

    return res.status(201).json({
        success:true,
        clientSecret:paymentIntent.client_secret,
    })
})
 

export const newCoupon = TryCatch(async(req,res,next)=>{
    const {coupon,amount} = req.body;
    if(!coupon || !amount) return next(new ErrorHandler("Please provide all fields",401));
    await Coupon.create({code:coupon,amount});
    return res.status(201).json({
        success:true,
        message:"Coupon created successfully"
    })
})


export const applyDiscount = TryCatch(async(req,res,next)=>{
    const {coupon}= req.query;
    const discount = await Coupon.findOne({code:coupon});
    if(!discount)return next(new ErrorHandler("invalid coupon code",401));
    return res.status(200).json({
        success:true,
        discount:discount.amount,
    })
})

//through this api admin can access all the avialiable coupons
export const allCoupons = TryCatch(async(req,res,next)=>{
    const coupons = await Coupon.find({});
    return res.status(200).json({
        success:true,
        coupons,
    })
})


//through delete coupon.
export const deleteCoupon = TryCatch(async(req,res,next)=>{
    const {id} = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if(!coupon) return next(new ErrorHandler("Coupon not found",404));
    return res.status(200).json({
        success:true,
        message:"Coupon deleted successfully"
    })
})