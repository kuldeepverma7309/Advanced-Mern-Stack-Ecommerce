import { User } from "../models/user.js";
import ErrorHandler from "../utills/utility-class.js";
import { TryCatch } from "./error.js";


//middleware to make sure only admin is allowed
export const adminOnly = TryCatch(async(req,res,next)=>{
    //console.log("check:",req.body)
    const {id} = req.query;//query is like: /api/v1/users?id=123
    if(!id) return next(new ErrorHandler("Please login",401));
    const user = await User.findById(id);
    if(!user) return next(new ErrorHandler("Authorization is restricted",401));
    if(user.role !== "admin") return next(new ErrorHandler("Not authorized",401));
    next();
    
});