import { Router, Request, Response, NextFunction } from "express";
import { SaasController } from "../controllers/saasController";
import { requireAuth } from "../middlewares/auth";

const router = Router();
const controller = new SaasController();

router.get("/tenants", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getTenants(req, res, next)
);

router.put("/tenants/:id", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.updateTenantStatus(req, res, next)
);

router.get("/subscriptions", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getSubscriptions(req, res, next)
);

router.put("/subscriptions/:id", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.updateSubscription(req, res, next)
);

// Cross-tenant user management routes (SuperAdmin)
router.get("/users", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getUsers(req, res, next)
);

router.put("/users/:id/status", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.updateUserStatus(req, res, next)
);

router.put("/users/:id/role", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.updateUserRole(req, res, next)
);

router.post("/users/:id/reset-password", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.resetUserPassword(req, res, next)
);

router.delete("/users/:id", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.deleteUser(req, res, next)
);


// Category management routes (SuperAdmin)
router.get("/categories", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getCategories(req, res, next)
);

router.post("/categories", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.createCategory(req, res, next)
);

router.put("/categories/:id", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.updateCategory(req, res, next)
);

router.delete("/categories/:id", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.deleteCategory(req, res, next)
);

// Admin change self password
router.post("/change-password", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.changeAdminPassword(req, res, next)
);

router.get("/business-categories", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.getBusinessCategories(req, res, next)
);

router.post("/business-categories", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.addBusinessCategory(req, res, next)
);

router.put("/business-categories/:id", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.updateBusinessCategory(req, res, next)
);

router.delete("/business-categories/:id", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.deleteBusinessCategory(req, res, next)
);

export default router;

