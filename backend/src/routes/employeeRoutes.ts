import { Router, Request, Response, NextFunction } from "express";
import { EmployeeController } from "../controllers/employeeController";
import { requireAuth, requireRoles } from "../middlewares/auth";

const router = Router();
const controller = new EmployeeController();

// 1. Fetch Staff lists
router.get("/", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getEmployees(req, res, next)
);

router.get("/attendance", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getAttendance(req, res, next)
);

router.get("/attendance/monthly", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getMonthlyAttendance(req, res, next)
);

// 2. Toggle check-in logs (Owner/Accountant)
router.post(
  "/attendance/toggle",
  requireAuth,
  requireRoles(["Owner", "Accountant"]),
  (req: Request, res: Response, next: NextFunction) => controller.toggleAttendance(req, res, next)
);

router.post(
  "/attendance/date",
  requireAuth,
  requireRoles(["Owner", "Accountant"]),
  (req: Request, res: Response, next: NextFunction) => controller.recordDateAttendance(req, res, next)
);

// 3. Employee profile details
router.get("/:id", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getEmployeeById(req, res, next)
);

// 4. Staff roster CRUD mutations (Owner/Accountant)
router.post(
  "/",
  requireAuth,
  requireRoles(["Owner", "Accountant"]),
  (req: Request, res: Response, next: NextFunction) => controller.createEmployee(req, res, next)
);

router.put(
  "/:id",
  requireAuth,
  requireRoles(["Owner", "Accountant"]),
  (req: Request, res: Response, next: NextFunction) => controller.updateEmployee(req, res, next)
);

router.delete(
  "/:id",
  requireAuth,
  requireRoles(["Owner", "Accountant"]),
  (req: Request, res: Response, next: NextFunction) => controller.deleteEmployee(req, res, next)
);

export default router;
