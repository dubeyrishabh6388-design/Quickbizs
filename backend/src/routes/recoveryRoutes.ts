import { Router } from "express";
import { RecoveryController } from "../controllers/recoveryController";
import { requireAuth } from "../middlewares/auth";

const router = Router();
const controller = new RecoveryController();

router.get("/", requireAuth, controller.getDashboard.bind(controller));
router.post("/tasks/:id/action", requireAuth, controller.performAction.bind(controller));
router.post("/tasks/:id/resolve", requireAuth, controller.resolveTask.bind(controller));

export default router;
