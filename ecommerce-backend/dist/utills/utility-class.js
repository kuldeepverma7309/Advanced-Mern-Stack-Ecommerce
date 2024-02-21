//ErrorHandler class ki jarurat isliye padi kyuki Error class ke pass status code ko manage krne ke liye fields nahi tha.
//Ab ErrorHandler class ko ham error.ts file me use krke status code ko manage kr sakte hai.
class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.statusCode = statusCode;
    }
}
export default ErrorHandler;
