import { Router, Request, Response, NextFunction } from "express";
import { SupplierController } from "../controllers/supplierController";
import { requireAuth, requireRoles } from "../middlewares/auth";

const router = Router();
const controller = new SupplierController();

// 1. Dues ledger queries (outstanding, top volume rankings)
router.get("/outstanding", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getOutstanding(req, res, next)
);

router.get("/top", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getTopSuppliers(req, res, next)
);

// 2. Retrieve supplier listings
router.get("/", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getSuppliers(req, res, next)
);

router.get("/:id", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getSupplierById(req, res, next)
);

// 3. Write actions (restricted to Owner or Accountant roles)
router.post(
  "/",
  requireAuth,
  requireRoles(["Owner", "Accountant"]),
  (req: Request, res: Response, next: NextFunction) =>
    controller.createSupplier(req, res, next)
);

router.put(
  "/:id",
  requireAuth,
  requireRoles(["Owner", "Accountant"]),
  (req: Request, res: Response, next: NextFunction) =>
    controller.updateSupplier(req, res, next)
);

router.delete(
  "/:id",
  requireAuth,
  requireRoles(["Owner", "Accountant"]),
  (req: Request, res: Response, next: NextFunction) =>
    controller.deleteSupplier(req, res, next)
);

export default router;
