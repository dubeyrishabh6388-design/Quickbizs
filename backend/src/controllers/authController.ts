import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name, password, businessName, role } = req.body;

      // Inline validation checks (Step 8: Validation)
      if (!email || !name || !password || !businessName) {
        const err: any = new Error("Registration fields missing.");
        err.statusCode = 400;
        err.problem = "Input validation failed.";
        err.reason = "Email, name, password, and businessName parameters are required.";
        err.solution = "Please complete all mandatory form fields and resubmit.";
        throw err;
      }

      const result = await authService.register({
        email,
        name,
        passwordHash: password,
        businessName,
        roleName: role || "Owner",
      });

      res.status(201).json({
        success: true,
        message: "Business tenant registered and authenticated successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        const err: any = new Error("Email and password inputs are required.");
        err.statusCode = 400;
        err.problem = "Input validation failed.";
        err.reason = "Credentials details cannot be empty.";
        err.solution = "Provide both login email and password values.";
        throw err;
      }

      const result = await authService.login({
        email,
        passwordHash: password,
      });

      res.json({
        success: true,
        message: "User authentication successful.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        const err: any = new Error("Refresh token input is required.");
        err.statusCode = 400;
        err.problem = "Session refresh blocked.";
        err.reason = "No refresh token parameter was provided.";
        err.solution = "Please include your active refresh token.";
        throw err;
      }

      const result = await authService.refresh(refreshToken);

      res.json({
        success: true,
        message: "Access token regenerated successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        const err: any = new Error("Refresh token input is required.");
        err.statusCode = 400;
        throw err;
      }

      const result = await authService.logout(refreshToken);

      res.json({
        success: true,
        message: "User session logged out successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, type } = req.body;

      if (!phone || !type) {
        const err: any = new Error("Phone number and user type are required.");
        err.statusCode = 400;
        throw err;
      }

      const result = await authService.sendOtp(phone, type);

      res.status(200).json({
        success: true,
        message: result.message,
        data: { expiresAt: result.expiresAt },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, otp, type } = req.body;

      if (!phone || !otp || !type) {
        const err: any = new Error("Phone number, OTP code, and user type are required.");
        err.statusCode = 400;
        throw err;
      }

      const result = await authService.verifyOtp(phone, otp, type);

      res.status(200).json({
        success: true,
        message: "Authentication successful.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async registerCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, phone, email, password, confirmPassword } = req.body;

      if (!name || !phone || !password || !confirmPassword) {
        const err: any = new Error("Name, phone, password, and confirmPassword parameters are required.");
        err.statusCode = 400;
        throw err;
      }

      if (password !== confirmPassword) {
        const err: any = new Error("Passwords do not match.");
        err.statusCode = 400;
        throw err;
      }

      const result = await authService.registerCustomer({
        name,
        phone,
        email,
        passwordHash: password
      });

      res.status(201).json({
        success: true,
        message: "Customer registered and authenticated successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async registerMerchant(req: Request, res: Response, next: NextFunction) {
    try {
      const { ownerName, businessName, phone, email, address, password, confirmPassword } = req.body;

      if (!ownerName || !businessName || !phone || !email || !password || !confirmPassword) {
        const err: any = new Error("Owner name, business name, phone, email, password, and confirmPassword parameters are required.");
        err.statusCode = 400;
        throw err;
      }

      if (password !== confirmPassword) {
        const err: any = new Error("Passwords do not match.");
        err.statusCode = 400;
        throw err;
      }

      const result = await authService.registerMerchant({
        ownerName,
        businessName,
        phone,
        email,
        address,
        passwordHash: password
      });

      res.status(201).json({
        success: true,
        message: "Merchant registered and authenticated successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async loginCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        const err: any = new Error("Mobile/Email and password inputs are required.");
        err.statusCode = 400;
        throw err;
      }

      const result = await authService.loginCustomer({
        identifier,
        passwordHash: password
      });

      res.json({
        success: true,
        message: "Customer authentication successful.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async loginMerchant(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, password } = req.body;

      if (!identifier || !password) {
        const err: any = new Error("Mobile/Email and password inputs are required.");
        err.statusCode = 400;
        throw err;
      }

      const result = await authService.loginMerchant({
        identifier,
        passwordHash: password
      });

      res.json({
        success: true,
        message: "Merchant authentication successful.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        const err: any = new Error("Current and new passwords are required.");
        err.statusCode = 400;
        throw err;
      }

      const result = await authService.changePassword(userId, currentPassword, newPassword);

      res.json({
        success: true,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
