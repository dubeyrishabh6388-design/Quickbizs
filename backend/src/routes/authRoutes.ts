import { Router, Request, Response, NextFunction } from "express";
import { AuthController } from "../controllers/authController";
import { requireAuth } from "../middlewares/auth";
import { authLimiter, otpLimiter } from "../middlewares/rateLimiter";

const router = Router();
const controller = new AuthController();

// Registration routes protected by authLimiter
router.post("/register", authLimiter, (req: Request, res: Response, next: NextFunction) =>
  controller.register(req, res, next)
);
router.post("/register/customer", authLimiter, (req: Request, res: Response, next: NextFunction) =>
  controller.registerCustomer(req, res, next)
);
router.post("/register/merchant", authLimiter, (req: Request, res: Response, next: NextFunction) =>
  controller.registerMerchant(req, res, next)
);

// Login routes protected by authLimiter
router.post("/login", authLimiter, (req: Request, res: Response, next: NextFunction) =>
  controller.login(req, res, next)
);
router.post("/login/customer", authLimiter, (req: Request, res: Response, next: NextFunction) =>
  controller.loginCustomer(req, res, next)
);
router.post("/login/merchant", authLimiter, (req: Request, res: Response, next: NextFunction) =>
  controller.loginMerchant(req, res, next)
);
router.post("/refresh", (req: Request, res: Response, next: NextFunction) =>
  controller.refresh(req, res, next)
);
router.post("/logout", (req: Request, res: Response, next: NextFunction) =>
  controller.logout(req, res, next)
);

// High-security OTP endpoints protected by otpLimiter
router.post("/otp/send", otpLimiter, (req: Request, res: Response, next: NextFunction) =>
  controller.sendOtp(req, res, next)
);
router.post("/otp/verify", otpLimiter, (req: Request, res: Response, next: NextFunction) =>
  controller.verifyOtp(req, res, next)
);

// Password change protected by requireAuth + authLimiter
router.post("/password/change", requireAuth, authLimiter, (req: Request, res: Response, next: NextFunction) =>
  controller.changePassword(req, res, next)
);

router.get("/business-categories", (req: Request, res: Response, next: NextFunction) =>
  controller.getBusinessCategories(req, res, next)
);

export default router;
