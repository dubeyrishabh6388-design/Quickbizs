import { Router } from "express";
import { BusinessTemplateController } from "../controllers/businessTemplateController";

const router = Router();
const controller = new BusinessTemplateController();

// GET /api/v1/verticals -> List all 29 declarative verticals
router.get("/", controller.getVerticals.bind(controller));

// GET /api/v1/verticals/:id -> Get specific canonical VerticalDefinition
router.get("/:id", controller.getVerticalById.bind(controller));

export default router;
