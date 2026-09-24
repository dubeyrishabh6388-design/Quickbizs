import { Router, Request, Response, NextFunction } from "express";
import { ProductController } from "../controllers/productController";
import { requireAuth, requireRoles } from "../middlewares/auth";

const router = Router();
const controller = new ProductController();

// 1. Category Admin Routes (Precedence over /:id wildcard)
router.get("/categories", requireAuth, (req: any, res: any, next: any) =>
  controller.getCategories(req, res, next)
);
router.post(
  "/categories",
  requireAuth,
  requireRoles(["Owner", "Warehouse"]),
  (req: any, res: any, next: any) => controller.createCategory(req, res, next)
);
router.put(
  "/categories/:id",
  requireAuth,
  requireRoles(["Owner", "Warehouse"]),
  (req: any, res: any, next: any) => controller.updateCategory(req, res, next)
);
router.delete(
  "/categories/:id",
  requireAuth,
  requireRoles(["Owner", "Warehouse"]),
  (req: any, res: any, next: any) => controller.deleteCategory(req, res, next)
);

// 2. Bulk & Restore Actions
router.post(
  "/bulk-update",
  requireAuth,
  requireRoles(["Owner", "Warehouse"]),
  (req: any, res: any, next: any) => controller.bulkUpdate(req, res, next)
);
router.post(
  "/restore/:id",
  requireAuth,
  requireRoles(["Owner", "Warehouse"]),
  (req: any, res: any, next: any) => controller.restoreProduct(req, res, next)
);

// 3. Retrieve all products
router.get("/", requireAuth, (req: any, res: any, next: any) =>
  controller.getProducts(req, res, next)
);

// 4. Retrieve detailed product info
router.get("/:id", requireAuth, (req: any, res: any, next: any) =>
  controller.getProductById(req, res, next)
);

// 5. Write actions (restricted to Owner and Warehouse roles)
router.post(
  "/",
  requireAuth,
  requireRoles(["Owner", "Warehouse"]),
  (req: any, res: any, next: any) =>
    controller.createProduct(req, res, next)
);

router.put(
  "/:id",
  requireAuth,
  requireRoles(["Owner", "Warehouse"]),
  (req: any, res: any, next: any) =>
    controller.updateProduct(req, res, next)
);

router.delete(
  "/:id",
  requireAuth,
  requireRoles(["Owner", "Warehouse"]),
  (req: any, res: any, next: any) =>
    controller.deleteProduct(req, res, next)
);

export default router;
