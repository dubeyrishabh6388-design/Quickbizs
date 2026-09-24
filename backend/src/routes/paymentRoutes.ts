import { Router, Request, Response, NextFunction } from "express";
import { paymentController } from "../controllers/paymentController";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// POST /api/payments/create-order
router.post("/create-order", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  paymentController.createOrder(req, res, next)
);

// POST /api/payments/verify
router.post("/verify", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  paymentController.verifyPayment(req, res, next)
);

// POST /api/payments/webhook
router.post("/webhook", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  paymentController.webhook(req, res, next)
);

// POST /api/payments/refund
router.post("/refund", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  paymentController.refund(req, res, next)
);

// GET /api/payments/history
router.get("/history", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  paymentController.getHistory(req, res, next)
);

// GET /api/payments/analytics
router.get("/analytics", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  paymentController.getAnalytics(req, res, next)
);

// POST /api/payments/create-link
router.post("/create-link", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  paymentController.createLink(req, res, next)
);

// GET /api/payments/summary/:customerId
router.get("/summary/:customerId", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  paymentController.getCustomerSummary(req, res, next)
);

export default router;
