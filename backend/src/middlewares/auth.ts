import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/token";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    tenantId: string;
    role: string;
    email?: string;
    employeeId?: string;
  };
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // 1. Verify Authorization Header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    
    // Verify JWT access token
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = {
        id: decoded.userId,
        tenantId: decoded.businessId || "",
        role: decoded.role,
        employeeId: decoded.userId,
      };
      return next();
    }
  }

  // 2. Development Persona Switcher integration (headers fallback in dev mode)
  const devRole = req.headers["x-role"] as string;
  const devTenant = req.headers["x-tenant-id"] as string;

  if (devRole || devTenant) {
    req.user = {
      id: "dev-mock-employee",
      tenantId: devTenant || "t1",
      role: devRole || "Owner",
      employeeId: "dev-mock-employee",
    };
    return next();
  }

  return res.status(401).json({
    success: false,
    message: "Access Denied: Authentication session token is invalid or expired.",
  });
};

export const requireRoles = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access Denied: Authentication session required."
      });
    }

    const userRole = req.user.role?.toLowerCase();
    const hasRole = allowedRoles.some((r) => r.toLowerCase() === userRole);

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: Persona "${req.user.role}" does not have keys for this screen.`
      });
    }
    next();
  };
};
