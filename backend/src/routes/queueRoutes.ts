import { Router } from "express";
import { QueueController } from "../controllers/queueController";
import { requireAuth } from "../middlewares/auth";

const router = Router();
const controller = new QueueController();

router.get("/", requireAuth, controller.getQueues.bind(controller));
router.get("/:id", requireAuth, controller.getQueueById.bind(controller));
router.post("/create", requireAuth, controller.create.bind(controller));
router.post("/:id/complete", requireAuth, controller.complete.bind(controller));
router.post("/:id/cancel", requireAuth, controller.cancel.bind(controller));
router.post("/:id/merge", requireAuth, controller.merge.bind(controller));
router.post("/:id/duplicate", requireAuth, controller.duplicate.bind(controller));
router.post("/:id/pin", requireAuth, controller.pin.bind(controller));
router.post("/:id/update", requireAuth, controller.update.bind(controller));

export default router;
