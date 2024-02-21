import { Request, Response,NextFunction } from "express"
import ErrorHandler from "../utills/utility-class.js";
import { ControllerType } from "../types/types.js";

//here err:ErrorHandler means const err = new ErrorHandler(some parameters)

export const errorMiddleware = ((err: ErrorHandler, req: Request, res: Response,next:NextFunction) => {

    err.message ||= "Internal Server Error"; //err.message = err.message || "Internal Server Error
    err.statusCode = err.statusCode || 500;
    if(err.name === "CastError"){
      err.message = "invalid Id";
    }

  return res.status(err.statusCode).json({
    success:false,
    message:err.message
  });
});


export const TryCatch = (func:ControllerType)=>async (req:Request,res:Response,next:NextFunction)=>{
  try {
    return await Promise.resolve(func(req, res, next));
  } catch (err) {
    next(err);
  }
}