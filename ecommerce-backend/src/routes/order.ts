import express, { Router } from "express";
import { deleteOrder, getAllOrders, getSingleOrder, myOrder, newOrder, processOrder } from "../controllers/order.js";
import { adminOnly } from "../middlewares/auth.js";

const router = express.Router();
router.post("/new",newOrder);
router.get("/my",myOrder);
router.get("/all",adminOnly,getAllOrders)
router.get("/:id",getSingleOrder)
router.put("/:id",adminOnly,processOrder);
router.delete("/:id",adminOnly,deleteOrder);


export default router;