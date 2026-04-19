import { Router } from "express";
import { getUserDashboard, getLeaderboard } from "../controllers/user.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Dashboard data endpoint
router.get("/user/dashboard", requireAuth, getUserDashboard);
router.get("/leaderboard", requireAuth, getLeaderboard);

export default router;
