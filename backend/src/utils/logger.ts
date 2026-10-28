export enum LogLevel {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogInterpretation {
  category: "DATABASE" | "AUTH" | "VALIDATION" | "NETWORK" | "PAYMENT" | "SYSTEM" | "SUBSCRIPTION";
  simplifiedTitle: string;
  explanation: string;
  suggestedAction: string;
  isActionRequired?: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: any;
  category?: "DATABASE" | "AUTH" | "VALIDATION" | "NETWORK" | "PAYMENT" | "SYSTEM" | "SUBSCRIPTION";
  simplifiedTitle?: string;
  explanation?: string;
  suggestedAction?: string;
  isActionRequired?: boolean;
}

export function interpretLog(level: LogLevel, message: string, detailsStr?: string): LogInterpretation {
  const combined = `${message} ${detailsStr || ""}`.toLowerCase();

  // 1. Database Connection Pool Exhaustion / Timeout
  if (
    combined.includes("pool timeout") || 
    combined.includes("pool connections") || 
    combined.includes("failed to retrieve a connection from pool") ||
    combined.includes("connection pool")
  ) {
    return {
      category: "DATABASE",
      simplifiedTitle: "Database Connection Pool Exhausted (Timeout)",
      explanation: "All available PostgreSQL connection pool slots were active and busy. Incoming queries waited longer than the pool timeout (10,000ms) without getting an idle slot.",
      suggestedAction: "1. In 'backend/.env', append '?connection_limit=25&pool_timeout=20' to DATABASE_URL.\n2. Verify all Prisma queries in backend services are awaited and transactions are properly committed.\n3. Restart the backend daemon to reset connection pools.",
      isActionRequired: true
    };
  }

  // 2. Database & Unique Constraints (Duplicates & Already Registered)
  if (
    combined.includes("unique constraint") || 
    combined.includes("p2002") || 
    combined.includes("already exists") || 
    combined.includes("duplicate") || 
    combined.includes("already registered")
  ) {
    const isPhone = combined.includes("phone") || combined.includes("mobile");
    const isEmail = combined.includes("email");
    return {
      category: "DATABASE",
      simplifiedTitle: isPhone 
        ? "Duplicate Phone Number Conflict" 
        : isEmail 
          ? "Duplicate Email Conflict (Already Registered)" 
          : "Duplicate Unique Record Conflict",
      explanation: isPhone 
        ? "The mobile number provided is already registered to an existing merchant or user account. QuickBizs enforces unique phone numbers for security." 
        : isEmail 
          ? "The email address provided is already registered in the system database. Each user account requires a unique email address." 
          : "The record violates a unique constraint index in the database. Identical duplicate data cannot be re-inserted.",
      suggestedAction: "1. Use an alternate phone number or email address.\n2. In this Admin Console, check the 'Stores Directory' or 'Users' tab to review, reset password, or update the existing account.",
      isActionRequired: true
    };
  }

  // 2b. SaaS Subscription & Plan Quota Limits
  if (
    combined.includes("subscription limit") || 
    combined.includes("limit reached") || 
    combined.includes("maximum allowed limit") || 
    combined.includes("saas limit")
  ) {
    return {
      category: "SUBSCRIPTION",
      simplifiedTitle: "Store Catalog Quota Reached (Subscription Limit)",
      explanation: "This business has reached its plan quota for products (default 100 on Basic plan) or customers. Additional items cannot be added until the subscription plan is upgraded.",
      suggestedAction: "1. In this Admin Console, navigate to the 'Stores Directory' or 'Tenants' tab.\n2. Locate the merchant's store and click 'Edit Store' or 'Upgrade Plan'.\n3. Switch the plan from Basic to Pro (1,000 items) or Enterprise (50,000 items), or increase the max_products limit.",
      isActionRequired: true
    };
  }

  // 3. Database Connection Failure / Unreachable
  if (
    combined.includes("econnrefused") || 
    combined.includes("cant reach database") || 
    combined.includes("can't reach database") || 
    combined.includes("prismaclientinitializationerror") || 
    combined.includes("database server was not found")
  ) {
    return {
      category: "DATABASE",
      simplifiedTitle: "PostgreSQL Database Server Unreachable",
      explanation: "The Node.js backend cannot establish a TCP socket connection to PostgreSQL. The database service may be stopped, port 5432 blocked, or DATABASE_URL credentials incorrect.",
      suggestedAction: "1. Check if PostgreSQL service is running in Windows Services (services.msc) or run 'Get-Service postgresql*'.\n2. Verify host, port, username, and password in 'backend/.env' (DATABASE_URL).\n3. Run 'npx prisma db pull' in backend directory to verify connectivity.",
      isActionRequired: true
    };
  }

  // 4. Foreign Key Constraints (P2003)
  if (combined.includes("p2003") || combined.includes("foreign key constraint") || combined.includes("violates foreign key")) {
    return {
      category: "DATABASE",
      simplifiedTitle: "Foreign Key Integrity Constraint Violation",
      explanation: "An operation attempted to reference or delete a record that has active dependencies (e.g. creating an order for an invalid businessId/userId, or deleting a store with active orders).",
      suggestedAction: "1. Confirm the parent business or user record exists before creating dependent items.\n2. Deactivate the entity with soft delete (isActive: false) instead of cascade deletion.",
      isActionRequired: true
    };
  }

  // 5. Authentication & Password Mismatch
  if (combined.includes("invalid credentials") || combined.includes("bcrypt") || combined.includes("password mismatch") || combined.includes("incorrect password")) {
    return {
      category: "AUTH",
      simplifiedTitle: "Authentication Failed (Invalid Credentials)",
      explanation: "A login attempt failed because the submitted phone/email and password did not match the hashed record stored in the database.",
      suggestedAction: "1. Verify the user is using the correct 10-digit phone number and exact case-sensitive password.\n2. In this Admin Console, navigate to 'Merchants & Users' tab and click 'Reset Password' to assign fresh credentials.",
      isActionRequired: true
    };
  }

  // 6. Token & Session Expiry
  if (combined.includes("jwt expired") || combined.includes("jwt malformed") || combined.includes("unauthorized") || combined.includes("no token provided") || combined.includes("invalid token")) {
    return {
      category: "AUTH",
      simplifiedTitle: "Authentication Session Expired or Invalid Token",
      explanation: "The HTTP request carried an expired or invalid JSON Web Token (JWT) in the Authorization header.",
      suggestedAction: "1. The user must sign in again to receive a renewed authentication token.\n2. If this occurs immediately after login, verify 'JWT_SECRET' in 'backend/.env' is configured properly.",
      isActionRequired: true
    };
  }

  // 7. Validation & Missing Fields
  if (combined.includes("validation") || combined.includes("is required") || combined.includes("must be") || combined.includes("invalid input") || combined.includes("must be 10 digits")) {
    return {
      category: "VALIDATION",
      simplifiedTitle: "Input Validation Error (Missing / Malformed Fields)",
      explanation: "The API payload failed client or server schema validation. Required parameters were missing, empty, or incorrectly formatted.",
      suggestedAction: "1. Inspect the form submission inputs in frontend to ensure all required fields are filled.\n2. Review controller validation logic in 'backend/src/controllers/'.",
      isActionRequired: true
    };
  }

  // 8. Payments & Razorpay
  if (combined.includes("razorpay") || combined.includes("payment") || combined.includes("order_id")) {
    return {
      category: "PAYMENT",
      simplifiedTitle: "Payment Gateway Transaction Notice",
      explanation: "An issue or notice occurred during Razorpay order creation, payment capture, or webhook verification.",
      suggestedAction: "1. Verify 'RAZORPAY_KEY_ID' and 'RAZORPAY_KEY_SECRET' in 'backend/.env'.\n2. Check internet connectivity and inspect webhook event logs in the Razorpay Dashboard.",
      isActionRequired: true
    };
  }

  // 9. WebSocket / Real-time events
  if (combined.includes("socket client") || combined.includes("joined rooms") || combined.includes("socket.io")) {
    return {
      category: "SYSTEM",
      simplifiedTitle: "WebSocket Real-Time Event",
      explanation: message,
      suggestedAction: "Normal background event for real-time synchronization across connected terminals. No action required.",
      isActionRequired: false
    };
  }

  // 10. General Warning
  if (level === LogLevel.WARN) {
    return {
      category: "SYSTEM",
      simplifiedTitle: "System Warning Recorded",
      explanation: message || "The system logged a non-fatal warning condition.",
      suggestedAction: "Review the parameters and server state. Warnings typically do not prevent application availability.",
      isActionRequired: true
    };
  }

  // 11. General Error
  if (level === LogLevel.ERROR) {
    return {
      category: "SYSTEM",
      simplifiedTitle: "System Runtime Exception Occurred",
      explanation: message.replace(/^Error:\s*/i, "") || "An unexpected server runtime error occurred.",
      suggestedAction: "Click 'Tech Trace' below to inspect the call stack, check the affected route controller, and restart the backend server if persistent.",
      isActionRequired: true
    };
  }

  // 12. Info / Success
  return {
    category: "SYSTEM",
    simplifiedTitle: "System Activity Event",
    explanation: message,
    suggestedAction: "Normal system event. No action required.",
    isActionRequired: false
  };
}

class Logger {
  private logBuffer: LogEntry[] = [];
  private maxBufferSize: number = 1000;
  private errorCount: number = 0;
  private warnCount: number = 0;
  private infoCount: number = 0;

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] : ${message}`;
  }

  private pushToBuffer(level: LogLevel, message: string, details?: any) {
    const detailsStr = details 
      ? (typeof details === "object" ? (details.stack || details.message || JSON.stringify(details)) : String(details)) 
      : undefined;

    const interpretation = interpretLog(level, message, detailsStr);

    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      details: detailsStr,
      category: interpretation.category,
      simplifiedTitle: interpretation.simplifiedTitle,
      explanation: interpretation.explanation,
      suggestedAction: interpretation.suggestedAction,
      isActionRequired: interpretation.isActionRequired,
    };

    if (level === LogLevel.ERROR) this.errorCount++;
    else if (level === LogLevel.WARN) this.warnCount++;
    else this.infoCount++;

    this.logBuffer.unshift(entry); // newest first
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.pop();
    }
  }

  info(message: string, details?: any) {
    console.log(this.formatMessage(LogLevel.INFO, message));
    this.pushToBuffer(LogLevel.INFO, message, details);
  }

  warn(message: string, details?: any) {
    console.warn(this.formatMessage(LogLevel.WARN, message));
    this.pushToBuffer(LogLevel.WARN, message, details);
  }

  error(message: string, error?: any) {
    console.error(this.formatMessage(LogLevel.ERROR, message));
    if (error) {
      console.error(error);
    }
    this.pushToBuffer(LogLevel.ERROR, message, error);
  }

  getLogs(options?: { level?: string; search?: string; limit?: number }): LogEntry[] {
    let logs = [...this.logBuffer];

    if (options?.level && options.level !== "ALL") {
      const targetLevel = options.level.toUpperCase();
      logs = logs.filter((l) => l.level === targetLevel);
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.message.toLowerCase().includes(q) ||
          (l.simplifiedTitle && l.simplifiedTitle.toLowerCase().includes(q)) ||
          (l.explanation && l.explanation.toLowerCase().includes(q)) ||
          (l.details && String(l.details).toLowerCase().includes(q))
      );
    }

    const limit = options?.limit || 200;
    return logs.slice(0, limit);
  }

  clearLogs(): void {
    this.logBuffer = [];
    this.errorCount = 0;
    this.warnCount = 0;
    this.infoCount = 0;
    this.info("System logs buffer was cleared by Administrator.");
  }

  getStats() {
    return {
      total: this.logBuffer.length,
      errors: this.errorCount,
      warnings: this.warnCount,
      infos: this.infoCount,
      bufferCapacity: this.maxBufferSize,
      lastLogTime: this.logBuffer[0]?.timestamp || null,
    };
  }
}

export const logger = new Logger();
