
import express from "express";
import { getBarCharts, getDashboardStats, getLineCharts, getPieCharts } from "../controllers/stats.js";

const router = express.Router();

router.get("/stats",getDashboardStats);
router.get("/bar",getBarCharts);
router.get("/pie",getPieCharts);
router.get("/line",getLineCharts)

export default router;
