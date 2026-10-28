import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../config/environment";
import { AuthenticatedRequest } from "./auth";

/**
 * 1. Global API Rate Limiter
 * Applied across all `/api` and `/api/v1` endpoints to mitigate scraping,
 * runaway client loops, and distributed DoS attacks.
 */
export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: env.nodeEnv === "production" ? 400 : 1500, // 400 requests per 15 min per IP in prod
  standardHeaders: "draft-8",
  legacyHeaders: false,
  skip: (req: Request) => {
    const path = req.path || "";
    // Never throttle monitoring pingers and health checks
    return path === "/" || path === "/health" || path.endsWith("/health");
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: "Too many requests from this IP address. Please wait a few minutes before trying again.",
      error: "GLOBAL_RATE_LIMIT_EXCEEDED"
    });
  }
});

/**
 * 2. Strict Authentication Rate Limiter
 * Applied to login and registration endpoints to prevent brute-force attacks,
 * credential stuffing, and bot registration storms.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: env.nodeEnv === "production" ? 15 : 60, // 15 attempts per 15 min per IP in prod
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: "Too many login or registration attempts. For security reasons, please wait 15 minutes before trying again.",
      error: "AUTH_RATE_LIMIT_EXCEEDED"
    });
  }
});

/**
 * 3. High-Security OTP Rate Limiter
 * Protects Brevo SMTP email quota and prevents SMS billing abuse & 6-digit PIN enumeration.
 */
export const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: env.nodeEnv === "production" ? 5 : 25, // 5 OTP dispatches/verifications per 10 min
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: "Too many OTP verification requests. Please wait a few minutes before requesting or verifying another code.",
      error: "OTP_RATE_LIMIT_EXCEEDED"
    });
  }
});

/**
 * 4. Checkout & Order Creation Rate Limiter
 * Prevents double-taps, race conditions, automated inventory locking, and order spam.
 */
export const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: env.nodeEnv === "production" ? 40 : 120, // 40 checkout requests per minute
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: "Checkout transaction frequency limit reached. Please wait a few seconds before trying again.",
      error: "CHECKOUT_RATE_LIMIT_EXCEEDED"
    });
  }
});

/**
 * 5. Search & Query Rate Limiter
 * Protects database indexing and resource-heavy full-text queries from spam.
 */
export const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: env.nodeEnv === "production" ? 60 : 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      message: "Search query frequency limit exceeded. Please wait a few seconds before searching again.",
      error: "SEARCH_RATE_LIMIT_EXCEEDED"
    });
  }
});

/**
 * 6. AI Rate Limiter & Body Guard
 * Preserves LLM token quotas on Gemini/Groq and guards payload length.
 */
export const createRateLimiter = (options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
  maxBodyLength?: number;
}) => {
  const { maxBodyLength = 4000 } = options;

  const limiter = rateLimit({
    windowMs: options.windowMs,
    limit: options.maxRequests,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    validate: { keyGeneratorIpFallback: false, xForwardedForHeader: false },
    keyGenerator: (req: Request) => {
      const authReq = req as AuthenticatedRequest;
      return authReq.user?.tenantId || authReq.user?.businessId || req.ip || "unknown-client";
    },
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        success: false,
        message: options.message || "Too many AI requests. Please wait a moment before sending another message.",
        error: "AI_RATE_LIMIT_EXCEEDED"
      });
    }
  });

  return (req: Request, res: Response, next: NextFunction): void => {
    // Guard input payload length
    if (req.body && req.body.query && typeof req.body.query === "string") {
      if (req.body.query.length > maxBodyLength) {
        res.status(400).json({
          success: false,
          message: `Query exceeds maximum allowed limit of ${maxBodyLength} characters.`
        });
        return;
      }
    }
    limiter(req, res, next);
  };
};

export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
  message: "Too many AI requests for this store. Please wait a few seconds before trying again.",
  maxBodyLength: 3000
});
