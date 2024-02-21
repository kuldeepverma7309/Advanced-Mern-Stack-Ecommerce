//here err:ErrorHandler means const err = new ErrorHandler(some parameters)
export const errorMiddleware = ((err, req, res, next) => {
    err.message || (err.message = "Internal Server Error"); //err.message = err.message || "Internal Server Error
    err.statusCode = err.statusCode || 500;
    if (err.name === "CastError") {
        err.message = "invalid Id";
    }
    return res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
});
export const TryCatch = (func) => async (req, res, next) => {
    try {
        return await Promise.resolve(func(req, res, next));
    }
    catch (err) {
        next(err);
    }
};
