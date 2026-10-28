import { Request, Response, NextFunction } from "express";
import { env } from "../config/environment";
import { encryptData, decryptData, isEncryptedEnvelope } from "../utils/cryptoPayload";
import { logger } from "../utils/logger";

/**
 * Middleware that:
 * 1. Automatically decrypts incoming AES-256 encrypted request bodies.
 * 2. Automatically encrypts outgoing JSON responses via res.json() when payload encryption is enabled.
 * 3. Gracefully preserves unencrypted traffic for backward compatibility, health checks, and uploads.
 */
export const payloadEncryptionMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Decrypt incoming body if it matches the encrypted envelope
  if (req.body && isEncryptedEnvelope(req.body)) {
    try {
      req.body = decryptData(req.body.payload);
    } catch (err: any) {
      logger.error(`[Crypto] Failed to decrypt incoming payload on ${req.method} ${req.originalUrl}:`, err);
      return res.status(400).json({
        success: false,
        message: "Encrypted payload is malformed or invalid key",
        error: {
          problem: "Failed to decrypt incoming request payload.",
          reason: err?.message || "Invalid cipher text.",
          solution: "Ensure matching AES encryption keys between client and server.",
        },
      });
    }
  }

  // 2. Intercept res.json to encrypt outgoing response payload
  const originalJson = res.json.bind(res);

  res.json = function (data: any): Response {
    if (!env.payloadEncryptionEnabled) {
      return originalJson(data);
    }

    // Exempt health checks and root endpoints for infrastructure monitoring (Render, Uptime, Docker)
    const cleanUrl = (req.originalUrl || req.url || "").split("?")[0];
    if (
      cleanUrl === "" ||
      cleanUrl === "/" ||
      cleanUrl === "/health" ||
      cleanUrl === "/api/health" ||
      cleanUrl === "/api/v1/health" ||
      cleanUrl.endsWith("/health") ||
      req.headers["x-skip-encryption"] === "true"
    ) {
      return originalJson(data);
    }

    // Do not double-encrypt or encrypt empty payloads
    if (data === null || data === undefined || isEncryptedEnvelope(data)) {
      return originalJson(data);
    }

    try {
      const encryptedString = encryptData(data);
      res.setHeader("X-Payload-Encrypted", "true");
      return originalJson({
        __encrypted: true,
        payload: encryptedString,
      });
    } catch (err) {
      logger.error(`[Crypto] Failed to encrypt response for ${req.method} ${req.originalUrl}:`, err);
      return originalJson(data); // Graceful fallback to avoid breaking client functionality
    }
  };

  next();
};
