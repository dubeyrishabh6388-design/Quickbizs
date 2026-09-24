import { Router, Request, Response, NextFunction } from "express";
import { AuthController } from "../controllers/authController";
import { requireAuth } from "../middlewares/auth";

const router = Router();
const controller = new AuthController();

router.post("/register", (req: Request, res: Response, next: NextFunction) =>
  controller.register(req, res, next)
);
router.post("/register/customer", (req: Request, res: Response, next: NextFunction) =>
  controller.registerCustomer(req, res, next)
);
router.post("/register/merchant", (req: Request, res: Response, next: NextFunction) =>
  controller.registerMerchant(req, res, next)
);
router.post("/login", (req: Request, res: Response, next: NextFunction) =>
  controller.login(req, res, next)
);
router.post("/login/customer", (req: Request, res: Response, next: NextFunction) =>
  controller.loginCustomer(req, res, next)
);
router.post("/login/merchant", (req: Request, res: Response, next: NextFunction) =>
  controller.loginMerchant(req, res, next)
);
router.post("/refresh", (req: Request, res: Response, next: NextFunction) =>
  controller.refresh(req, res, next)
);
router.post("/logout", (req: Request, res: Response, next: NextFunction) =>
  controller.logout(req, res, next)
);
router.post("/otp/send", (req: Request, res: Response, next: NextFunction) =>
  controller.sendOtp(req, res, next)
);
router.post("/otp/verify", (req: Request, res: Response, next: NextFunction) =>
  controller.verifyOtp(req, res, next)
);
router.post("/password/change", requireAuth, (req: Request, res: Response, next: NextFunction) =>
  controller.changePassword(req, res, next)
);

export default router;
