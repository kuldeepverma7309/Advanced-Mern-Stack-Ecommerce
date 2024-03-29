import express from "express";
import { allCoupons, applyDiscount, createPayment, deleteCoupon, newCoupon } from "../controllers/payment.js";
import { adminOnly } from "../middlewares/auth.js";
const router = express.Router();
router.post("/create", createPayment);
router.get("/coupon/all", adminOnly, allCoupons);
router.post("/discount", applyDiscount);
router.post("/coupon/new", adminOnly, newCoupon);
router.delete("/coupon/:id", adminOnly, deleteCoupon);
export default router;
