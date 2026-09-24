import { Router } from "express";
import { QuantityController } from "../controllers/quantityController";
import { requireAuth } from "../middlewares/auth";

const router = Router();
const controller = new QuantityController();

router.get("/:id/presets", requireAuth, controller.getPresets.bind(controller));
router.get("/:id/unit-config", requireAuth, controller.getUnitConfig.bind(controller));
router.post("/:id/custom-quantity", requireAuth, controller.recordCustomQuantity.bind(controller));

export default router;
