import { Router } from "express";
import { CounterController } from "../controllers/counterController";
import { requireAuth } from "../middlewares/auth";

const router = Router();
const controller = new CounterController();

router.get("/home", requireAuth, controller.getHome.bind(controller));
router.get("/popular", requireAuth, controller.getPopular.bind(controller));
router.get("/recent", requireAuth, controller.getRecent.bind(controller));
router.get("/combos", requireAuth, controller.getCombos.bind(controller));
router.post("/sale", requireAuth, controller.recordSale.bind(controller));
router.post("/rush-mode", requireAuth, controller.toggleRushMode.bind(controller));
router.post("/selling-mode", requireAuth, controller.saveSellingMode.bind(controller));

export default router;
