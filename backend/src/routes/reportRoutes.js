import express from "express";
import {
  getInventoryReport,
  getTransactionReport,
  getLowStockReport,
  getValuationReport,
} from "../controllers/reportController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/inventory", requireAuth, getInventoryReport);
router.get("/stock-in", requireAuth, (req, res, next) => {
  req.query.type = "stock-in";
  getTransactionReport(req, res, next);
});
router.get("/stock-out", requireAuth, (req, res, next) => {
  req.query.type = "stock-out";
  getTransactionReport(req, res, next);
});
router.get("/transactions", requireAuth, getTransactionReport);
router.get("/low-stock", requireAuth, getLowStockReport);
router.get("/valuation", requireAuth, getValuationReport);

export default router;
