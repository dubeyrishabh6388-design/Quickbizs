import { Response, NextFunction } from "express";
import { EmployeeService } from "../services/employeeService";
import { AuthenticatedRequest } from "../middlewares/auth";
import { notificationService } from "../services/notificationService";

const employeeService = new EmployeeService();

export class EmployeeController {
  async getEmployees(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await employeeService.getEmployees(businessId);

      res.json({
        success: true,
        message: "Staff roster compiled successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { id } = req.params;

      const result = await employeeService.getEmployeeById(businessId, id as string);

      res.json({
        success: true,
        message: "Employee profile retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async createEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { employeeCode, firstName, lastName, mobile, email, designation, salary } = req.body;

      const result = await employeeService.createEmployee(businessId, {
        employeeCode,
        firstName,
        lastName,
        mobile,
        email,
        designation,
        salary,
      });

      // Trigger "New Employee Registered" Notification
      await notificationService.createNotification({
        businessId,
        title: "New Employee Registered",
        message: `Employee ${firstName} ${lastName} (${designation}) has been registered.`,
        type: "Success",
        priority: "Low",
        module: "Employees",
        referenceType: "Employee",
        referenceId: result.id,
      });

      res.status(201).json({
        success: true,
        message: "Employee registered successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { id } = req.params;

      await employeeService.updateEmployee(businessId, id as string, req.body);

      res.json({
        success: true,
        message: "Employee profile updated successfully.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { id } = req.params;

      await employeeService.deleteEmployee(businessId, id as string);

      res.json({
        success: true,
        message: "Employee profile deactivated successfully.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const result = await employeeService.getAttendance(businessId);

      res.json({
        success: true,
        message: "Staff attendance list retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { employeeId, status } = req.body;

      if (!employeeId || !status) {
        const err: any = new Error("Employee ID and check-in status are required.");
        err.statusCode = 400;
        throw err;
      }

      await employeeService.toggleAttendance(businessId, employeeId as string, status);

      // Trigger "Employee Check-In" Notification
      if (status === "Present") {
        await notificationService.createNotification({
          businessId,
          title: "Employee Check-In",
          message: `Employee check-in logged for ID: ${employeeId}. Status: Present.`,
          type: "Information",
          priority: "Low",
          module: "Employees",
          referenceType: "Employee",
          referenceId: employeeId,
        });
      }

      res.json({
        success: true,
        message: "Staff attendance record toggled successfully.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { month, year } = req.query;

      const result = await employeeService.getMonthlyAttendanceSummary(
        businessId,
        month ? Number(month) : undefined,
        year ? Number(year) : undefined
      );

      res.json({
        success: true,
        message: "Monthly attendance register retrieved successfully.",
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async recordDateAttendance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const businessId = req.user!.tenantId;
      const { employeeId, date, status } = req.body;

      if (!employeeId || !date || !status) {
        const err: any = new Error("Employee ID, date string (YYYY-MM-DD), and status are required.");
        err.statusCode = 400;
        throw err;
      }

      await employeeService.recordDateAttendance(businessId, employeeId, date, status);

      res.json({
        success: true,
        message: "Attendance entry updated successfully for date.",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
