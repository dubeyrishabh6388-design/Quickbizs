import { Router, Request, Response, NextFunction } from "express";
import { DashboardController } from "../controllers/dashboardController";
import { requireAuth } from "../middlewares/auth";

const router = Router();
const controller = new DashboardController();

// Morning Briefing Endpoints (Graceful fallback)
router.get("/morning-briefing", requireAuth, (_req: Request, res: Response) =>
  res.json({ success: true, data: null })
);

router.post("/morning-briefing/viewed", requireAuth, (_req: Request, res: Response) =>
  res.json({ success: true })
);

router.post("/morning-briefing/regenerate", requireAuth, (_req: Request, res: Response) =>
  res.json({ success: true, data: null })
);

// Core dashboard overview
router.get("/", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getDashboardOverview(req, res, next)
);

// Specialized health, KPI cards, and charts aggregates
router.get("/business-health", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getBusinessHealth(req, res, next)
);

router.get("/cards", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getKPIs(req, res, next)
);

router.get("/charts", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getCharts(req, res, next)
);

router.get("/alerts", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getAlerts(req, res, next)
);

// Top lists compilations
router.get("/top-products", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getTopProducts(req, res, next)
);

router.get("/top-customers", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getTopCustomers(req, res, next)
);

router.get("/top-suppliers", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getTopSuppliers(req, res, next)
);

export default router;
