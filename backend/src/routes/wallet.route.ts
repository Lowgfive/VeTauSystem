import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getBalance, deposit, getTransactions } from "../controllers/wallet.controller";

const router = express.Router();

router.use(authMiddleware);

router.get("/balance", getBalance);
router.post("/deposit", deposit);
router.get("/transactions", getTransactions);

export default router;
