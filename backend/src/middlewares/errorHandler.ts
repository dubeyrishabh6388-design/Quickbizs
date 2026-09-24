import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export interface CustomError extends Error {
  statusCode?: number;
  problem?: string;
  reason?: string;
  solution?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  let problem = err.problem || "An unexpected server error occurred.";
  let reason = err.reason || "The backend encountered an unhandled execution exception.";
  let solution = err.solution || "Please contact the system administrator or check back shortly.";

  // Mask database SQL / Prisma errors (Step 13: Error Handling)
  if (err.name?.includes("Prisma") || err.message?.includes("SQL") || err.message?.includes("database")) {
    logger.error("Masked Database SQL Error Triggered:", err);
    problem = "Database transaction ledger sync failed.";
    reason = "The connection to the relational ledger is temporarily congested.";
    solution = "Verify database online status or retry the query transaction.";
  } else {
    logger.error(`Error [${statusCode}]: ${message}`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      problem,
      reason,
      solution,
    },
    timestamp: new Date().toISOString(),
  });
};
