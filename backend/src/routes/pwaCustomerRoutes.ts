import { Router } from "express";
import { PwaCustomerController } from "../controllers/pwaCustomerController";
import { requireAuth } from "../middlewares/auth";

const router = Router();
const controller = new PwaCustomerController();

// Profile CRUD
router.get("/profile", requireAuth, (req: any, res: any, next: any) => controller.getProfile(req, res, next));
router.put("/profile", requireAuth, (req: any, res: any, next: any) => controller.updateProfile(req, res, next));
router.delete("/profile", requireAuth, (req: any, res: any, next: any) => controller.deleteProfile(req, res, next));

// Address Actions
router.get("/addresses", requireAuth, (req: any, res: any, next: any) => controller.getAddresses(req, res, next));
router.post("/addresses", requireAuth, (req: any, res: any, next: any) => controller.createAddress(req, res, next));
router.put("/addresses/:id", requireAuth, (req: any, res: any, next: any) => controller.updateAddress(req, res, next));
router.delete("/addresses/:id", requireAuth, (req: any, res: any, next: any) => controller.deleteAddress(req, res, next));
router.put("/addresses/:id/default", requireAuth, (req: any, res: any, next: any) => controller.setDefaultAddress(req, res, next));

// Favourite Shops Actions
router.get("/favourites", requireAuth, (req: any, res: any, next: any) => controller.getFavouriteShops(req, res, next));
router.post("/favourites", requireAuth, (req: any, res: any, next: any) => controller.addFavouriteShop(req, res, next));
router.delete("/favourites/:businessId", requireAuth, (req: any, res: any, next: any) => controller.removeFavouriteShop(req, res, next));

// Order History Actions
router.get("/orders", requireAuth, (req: any, res: any, next: any) => controller.getOrders(req, res, next));
router.get("/orders/:id", requireAuth, (req: any, res: any, next: any) => controller.getOrderDetails(req, res, next));
router.post("/orders/:id/repeat", requireAuth, (req: any, res: any, next: any) => controller.repeatOrder(req, res, next));
router.post("/orders/:id/cancel", requireAuth, (req: any, res: any, next: any) => controller.cancelOrder(req, res, next));

// Trust Score Action
router.get("/trust-score", requireAuth, (req: any, res: any, next: any) => controller.getTrustScore(req, res, next));

export default router;
