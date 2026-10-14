import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth";

interface RateLimitRecord {
  timestamps: number[];
}

const store = new Map<string, RateLimitRecord>();

// Cleanup stale entries every 5 minutes to prevent memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    record.timestamps = record.timestamps.filter((t) => now - t < 60000);
    if (record.timestamps.length === 0) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export const createRateLimiter = (options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
  maxBodyLength?: number;
}) => {
  const { windowMs, maxRequests, message, maxBodyLength = 4000 } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    // 1. Guard payload length
    if (req.body && req.body.query && typeof req.body.query === "string") {
      if (req.body.query.length > maxBodyLength) {
        res.status(400).json({
          success: false,
          message: `Query exceeds maximum allowed limit of ${maxBodyLength} characters.`
        });
        return;
      }
    }

    // 2. Identify client by tenant ID (if authenticated) or remote IP
    const authReq = req as AuthenticatedRequest;
    const clientKey = authReq.user?.tenantId || authReq.user?.businessId || req.ip || "unknown-client";

    const now = Date.now();
    let record = store.get(clientKey);

    if (!record) {
      record = { timestamps: [] };
      store.set(clientKey, record);
    }

    // Keep only timestamps within the sliding window
    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);

    if (record.timestamps.length >= maxRequests) {
      const oldest = record.timestamps[0];
      const retryAfterSeconds = Math.ceil((windowMs - (now - oldest)) / 1000);

      res.set("Retry-After", String(retryAfterSeconds));
      res.status(429).json({
        success: false,
        message: message || "Too many AI requests. Please wait a moment before sending another message.",
        retryAfter: retryAfterSeconds
      });
      return;
    }

    record.timestamps.push(now);
    next();
  };
};

export const aiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
  message: "Too many AI requests for this store. Please wait a few seconds before trying again.",
  maxBodyLength: 3000
});
