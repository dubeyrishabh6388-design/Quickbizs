import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export interface CustomError extends Error {
  statusCode?: number;
  problem?: string;
  reason?: string;
  solution?: string;
  code?: string;
  meta?: any;
}

/**
 * Humanizes raw technical errors (Prisma, MySQL, SQL constraints, tokens, rate limits)
 * into friendly, clear, and actionable messages so non-technical users & shopkeepers
 * understand exactly what happened and how to resolve it.
 */
export function humanizeError(err: any): {
  statusCode: number;
  message: string;
  problem: string;
  reason: string;
  solution: string;
} {
  let statusCode = err?.statusCode || 500;
  const rawMessage = String(err?.message || "");
  const errCode = String(err?.code || "");
  const errName = String(err?.name || "");
  const meta = err?.meta || {};
  const target = meta?.target;
  const targetStr = Array.isArray(target) ? target.join(", ") : String(target || "");
  const combined = (rawMessage + " " + errCode + " " + errName + " " + targetStr).toLowerCase();

  // 1. Prisma P2002: Unique constraint failed
  if (errCode === "P2002" || combined.includes("unique constraint") || combined.includes("p2002")) {
    statusCode = 409; // HTTP Conflict

    if (
      combined.includes("phone") ||
      combined.includes("mobile") ||
      combined.includes("businesses_phone_key") ||
      combined.includes("pwa_customers_phone_key") ||
      combined.includes("users_phone_key")
    ) {
      return {
        statusCode,
        message: "This mobile number is already registered. Please sign in or use a different number.",
        problem: "Mobile number already registered.",
        reason: "An account or store is already registered with this mobile number.",
        solution: "Please sign in to your account, or register using an alternate mobile number.",
      };
    }

    if (
      combined.includes("email") ||
      combined.includes("users_email_key")
    ) {
      return {
        statusCode,
        message: "This email address is already registered. Please sign in or use a different email.",
        problem: "Email address already registered.",
        reason: "An account is already registered with this email address.",
        solution: "Please sign in to your account, or register using an alternate email address.",
      };
    }

    if (
      combined.includes("barcode") ||
      combined.includes("products_barcode_key")
    ) {
      return {
        statusCode,
        message: "A product with this barcode already exists in your inventory.",
        problem: "Duplicate barcode conflict.",
        reason: "Every product barcode must be unique in the catalog.",
        solution: "Scan a different barcode or edit the existing product in your inventory.",
      };
    }

    if (
      combined.includes("sku") ||
      combined.includes("products_sku_key")
    ) {
      return {
        statusCode,
        message: "A product with this SKU code already exists in your inventory.",
        problem: "Duplicate SKU conflict.",
        reason: "Every product SKU code must be unique in the catalog.",
        solution: "Assign a unique SKU code or edit the existing product.",
      };
    }

    if (
      combined.includes("gst") ||
      combined.includes("gst_number")
    ) {
      return {
        statusCode,
        message: "A business or supplier with this GST number is already registered.",
        problem: "Duplicate GST number.",
        reason: "GSTIN must be unique across all registered entities.",
        solution: "Verify the GST number or update the existing profile.",
      };
    }

    if (
      combined.includes("employeecode") ||
      combined.includes("employee_code")
    ) {
      return {
        statusCode,
        message: "An employee with this employee code already exists.",
        problem: "Duplicate employee code.",
        reason: "Each employee in your store must have a unique employee code.",
        solution: "Assign a different employee code.",
      };
    }

    if (
      combined.includes("invoicenumber") ||
      combined.includes("invoice_number")
    ) {
      return {
        statusCode,
        message: "An invoice with this invoice number already exists.",
        problem: "Duplicate invoice number.",
        reason: "Invoice numbers must be unique sequential records.",
        solution: "Please retry the transaction to obtain a fresh sequential invoice number.",
      };
    }

    if (
      combined.includes("serial") ||
      combined.includes("imei") ||
      combined.includes("identifiervalue")
    ) {
      return {
        statusCode,
        message: "This IMEI/Serial number is already registered in stock.",
        problem: "Duplicate IMEI or Serial number.",
        reason: "Each device IMEI or serial unit must be unique in inventory.",
        solution: "Check the physical device number or adjust the existing inventory item.",
      };
    }

    if (
      combined.includes("batchnumber") ||
      combined.includes("batch_number")
    ) {
      return {
        statusCode,
        message: "This batch number already exists for this product.",
        problem: "Duplicate batch number.",
        reason: "Batch numbers must be unique per product.",
        solution: "Use a different batch identifier or update the existing batch stock.",
      };
    }

    return {
      statusCode,
      message: "This record already exists. Duplicate entries are not allowed.",
      problem: "Duplicate unique record conflict.",
      reason: "The information entered matches an existing record in the database.",
      solution: "Please check your details and provide unique information.",
    };
  }

  // 2. Prisma P2025: Record not found
  if (
    errCode === "P2025" ||
    combined.includes("record to update not found") ||
    combined.includes("record to delete not found")
  ) {
    return {
      statusCode: 404,
      message: "The requested record was not found or has already been removed.",
      problem: "Record not found.",
      reason: "The item you are trying to access, update, or delete does not exist.",
      solution: "Please refresh your page and check if the item is still available.",
    };
  }

  // 3. Prisma P2003: Foreign key constraint failure
  if (
    errCode === "P2003" ||
    combined.includes("foreign key constraint") ||
    combined.includes("p2003")
  ) {
    return {
      statusCode: 400,
      message: "This action cannot be completed because related data is linked or missing.",
      problem: "Data dependency restriction.",
      reason: "The item is referenced by other active records (such as orders or invoices).",
      solution: "Remove or reassign related records before attempting this action.",
    };
  }

  // 4. Prisma P2000: Value too long
  if (
    errCode === "P2000" ||
    combined.includes("value too long for column")
  ) {
    return {
      statusCode: 400,
      message: "One of the entered fields exceeds the allowed character limit.",
      problem: "Input text too long.",
      reason: "The text entered in a field is longer than the system can store.",
      solution: "Please shorten the text and submit again.",
    };
  }

  // 5. Database Connection Issues
  if (
    errCode === "P1001" ||
    errCode === "P1002" ||
    combined.includes("econnrefused") ||
    combined.includes("cant reach database") ||
    combined.includes("can't reach database") ||
    combined.includes("prismaclientinitializationerror")
  ) {
    return {
      statusCode: 503,
      message: "Database connection temporarily unavailable. Please try again in a few moments.",
      problem: "Database unreachable.",
      reason: "The database server is temporarily busy or unreachable.",
      solution: "Please wait a moment and refresh or try again.",
    };
  }

  // 6. JWT / Authentication Tokens
  if (
    combined.includes("jwt expired") ||
    combined.includes("tokenexpirederror") ||
    combined.includes("token expired")
  ) {
    return {
      statusCode: 401,
      message: "Your login session has expired. Please sign in again.",
      problem: "Session expired.",
      reason: "The authentication token has reached its validity time limit.",
      solution: "Please sign in again to continue.",
    };
  }

  if (
    combined.includes("invalid token") ||
    combined.includes("jwt malformed") ||
    combined.includes("jsonwebtokenerror")
  ) {
    return {
      statusCode: 401,
      message: "Invalid session. Please sign in again.",
      problem: "Invalid authentication token.",
      reason: "The session credentials could not be verified.",
      solution: "Please sign in again.",
    };
  }

  // 7. Rate Limiter
  if (
    combined.includes("rate_limit") ||
    combined.includes("too many requests") ||
    statusCode === 429
  ) {
    return {
      statusCode: 429,
      message: "Too many requests. Please wait a moment before trying again.",
      problem: "Rate limit reached.",
      reason: "You have performed too many actions in a short period.",
      solution: "Please pause for a few seconds and try again.",
    };
  }

  // 7b. Malformed JSON Body
  if (
    err?.type === "entity.parse.failed" ||
    (errName === "SyntaxError" && combined.includes("json"))
  ) {
    return {
      statusCode: 400,
      message: "Invalid request data format. Please verify your input.",
      problem: "Malformed data payload.",
      reason: "The request body could not be parsed as valid JSON.",
      solution: "Please check the entered information and submit again.",
    };
  }

  // 8. Custom user errors created in controllers/services with clear English
  const isTechnical =
    rawMessage.includes("prisma.") ||
    rawMessage.includes("`") ||
    rawMessage.includes("invocation:") ||
    rawMessage.includes("\n    at ") ||
    rawMessage.includes("SQL") ||
    rawMessage.includes("select ") ||
    rawMessage.includes("insert into") ||
    rawMessage.includes("Error:") ||
    rawMessage.includes("TypeError") ||
    rawMessage.includes("ReferenceError") ||
    rawMessage.includes("SyntaxError");

  if (!isTechnical && rawMessage.trim().length > 0 && rawMessage.length < 200) {
    return {
      statusCode: statusCode >= 400 && statusCode < 600 ? statusCode : 400,
      message: rawMessage.trim(),
      problem: err?.problem || "Request validation failed.",
      reason: err?.reason || rawMessage.trim(),
      solution: err?.solution || "Please check your inputs and try again.",
    };
  }

  // 9. Generic safe fallback for technical/unexpected errors
  return {
    statusCode: statusCode >= 400 && statusCode < 600 ? statusCode : 500,
    message: "Something went wrong while processing your request. Please try again.",
    problem: err?.problem || "Internal processing error.",
    reason: err?.reason || "An unexpected system condition occurred.",
    solution: err?.solution || "Please try again in a few moments, or contact support if the issue persists.",
  };
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Always log the full original error for debugging/admin console
  logger.error(`[ErrorHandler] ${req.method} ${req.originalUrl}:`, err);

  const sanitized = humanizeError(err);

  res.status(sanitized.statusCode).json({
    success: false,
    message: sanitized.message,
    error: {
      problem: sanitized.problem,
      reason: sanitized.reason,
      solution: sanitized.solution,
    },
    timestamp: new Date().toISOString(),
  });
};
