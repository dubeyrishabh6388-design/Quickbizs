import { Router, Request, Response, NextFunction } from "express";
import { CustomerController } from "../controllers/customerController";
import { requireAuth, requireRoles } from "../middlewares/auth";

const router = Router();
const controller = new CustomerController();

// 1. Dues ledger queries (outstanding, top reward rankings)
router.get("/outstanding", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getOutstanding(req, res, next)
);

router.get("/top", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getTopCustomers(req, res, next)
);

// 2. Retrieve customer listings
router.get("/", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getCustomers(req, res, next)
);

router.get("/:id", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getCustomerById(req, res, next)
);

// 3. Write actions (restricted to Owner, Cashier, or Accountant roles)
router.post(
  "/",
  requireAuth,
  requireRoles(["Owner", "Cashier", "Accountant"]),
  (req: Request, res: Response, next: NextFunction) =>
    controller.createCustomer(req, res, next)
);

router.put(
  "/:id",
  requireAuth,
  requireRoles(["Owner", "Cashier", "Accountant"]),
  (req: Request, res: Response, next: NextFunction) =>
    controller.updateCustomer(req, res, next)
);

// 4. Archive soft delete (restricted to Owner and Accountant roles)
router.delete(
  "/:id",
  requireAuth,
  requireRoles(["Owner", "Accountant"]),
  (req: Request, res: Response, next: NextFunction) =>
    controller.deleteCustomer(req, res, next)
);

export default router;
