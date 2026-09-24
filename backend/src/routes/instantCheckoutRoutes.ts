import { Router } from "express";
import { InstantCheckoutController } from "../controllers/instantCheckoutController";
import { requireAuth } from "../middlewares/auth";

const router = Router();
const controller = new InstantCheckoutController();

router.get("/preferences", requireAuth, controller.getPreferences.bind(controller));
router.get("/recent", requireAuth, controller.getRecent.bind(controller));
router.get("/queue", requireAuth, controller.getQueue.bind(controller));
router.post("/complete", requireAuth, controller.complete.bind(controller));
router.post("/repeat-order", requireAuth, controller.repeatOrder.bind(controller));
router.post("/queue", requireAuth, controller.updateQueue.bind(controller));

export default router;
