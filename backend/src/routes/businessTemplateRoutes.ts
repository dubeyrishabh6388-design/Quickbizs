import { Router } from "express";
import { BusinessTemplateController } from "../controllers/businessTemplateController";
import { requireAuth } from "../middlewares/auth";

const router = Router();
const controller = new BusinessTemplateController();

router.get("/", requireAuth, controller.getTemplates.bind(controller));
router.get("/:businessType", requireAuth, controller.getTemplate.bind(controller));
router.post("/apply", requireAuth, controller.applyTemplate.bind(controller));
router.put("/customize", requireAuth, controller.customizeTemplate.bind(controller));

export default router;
