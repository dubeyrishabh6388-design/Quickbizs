import { Router, Request, Response, NextFunction } from "express";
import { customerLedgerController } from "../controllers/customerLedgerController";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// GET /api/customers/:id/profile
router.get("/:id/profile", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  customerLedgerController.getProfile(req, res, next)
);

// GET /api/customers/:id/ledger
router.get("/:id/ledger", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  customerLedgerController.getLedger(req, res, next)
);

// GET /api/customers/:id/timeline
router.get("/:id/timeline", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  customerLedgerController.getTimeline(req, res, next)
);

// GET /api/customers/:id/analytics
router.get("/:id/analytics", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  customerLedgerController.getAnalytics(req, res, next)
);

// GET /api/customers/:id/reminders
router.get("/:id/reminders", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  customerLedgerController.getReminders(req, res, next)
);

// POST /api/customers/:id/reminders
router.post("/:id/reminders", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  customerLedgerController.createReminder(req, res, next)
);

// POST /api/customers/:id/payment
router.post("/:id/payment", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  customerLedgerController.postPayment(req, res, next)
);

// PUT /api/customers/:id/credit-limit
router.put("/:id/credit-limit", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  customerLedgerController.updateCreditLimit(req, res, next)
);

// POST /api/customers/:id/note
router.post("/:id/note", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  customerLedgerController.createNote(req, res, next)
);

// POST /api/customers/:id/tag
router.post("/:id/tag", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  customerLedgerController.createTag(req, res, next)
);

export default router;
