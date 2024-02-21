import { User } from "../models/user.js";
import ErrorHandler from "../utills/utility-class.js";
import { TryCatch } from "../middlewares/error.js";
//below is for when new user visit out web site and he logged in . then we will send welcome message.
export const newUser = TryCatch(async (req, res, next) => {
    //throw new Error("invalid request") this is just for demo purposes
    //return next(new Error("invalid request"))
    const { name, email, photo, gender, _id, dob } = req.body;
    let user = await User.findById(_id);
    if (user) {
        return res.json({
            success: true,
            message: `welcome, ${user.name}`,
        });
    }
    if (!_id || !name || !email || !photo || !gender || !dob) {
        return next(new ErrorHandler("Please enter all fields", 400));
    }
    await User.create({ name, email, photo, gender, _id, dob: new Date(dob) });
    return res.status(201).json({
        success: true,
        message: "Welcome to Ecommerce",
    });
});
//below is because admin wants to access all the users
export const getAllUsers = TryCatch(async (req, res, next) => {
    const users = await User.find({});
    return res.status(200).json({
        success: true,
        users,
    });
});
//below is becuase admin wants details of each single user
export const getUser = TryCatch(async (req, res, next) => {
    const { id } = req.params; //(req.params as { id: string }) explicitly asserts that req.params should have a property named id of type string. This can help TypeScript understand the structure of req.params better.
    const user = await User.findById(id);
    if (!user)
        return next(new ErrorHandler("Invaild Id", 400));
    return res.status(200).json({
        success: true,
        user,
    });
});
//below is for delete user or for blocking user
export const deleteUser = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user)
        return next(new ErrorHandler("User not found", 400));
    return res.status(200).json({
        success: true,
        message: "User deleted successfully",
    });
});
