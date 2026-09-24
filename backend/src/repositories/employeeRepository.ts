import { prisma } from "../config/prisma";

export class EmployeeRepository {
  async findEmployees(businessId: string) {
    return prisma.employee.findMany({
      where: { businessId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  async findEmployeeById(businessId: string, id: string) {
    return prisma.employee.findFirst({
      where: { id, businessId, deletedAt: null },
    });
  }

  async createEmployee(businessId: string, data: any) {
    return prisma.employee.create({
      data: {
        businessId,
        ...data,
      },
    });
  }

  async updateEmployee(businessId: string, id: string, data: any) {
    return prisma.employee.updateMany({
      where: { id, businessId, deletedAt: null },
      data,
    });
  }

  async deleteEmployee(businessId: string, id: string) {
    return prisma.employee.updateMany({
      where: { id, businessId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  async findTodayAttendance(businessId: string) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    return prisma.attendance.findMany({
      where: {
        businessId,
        date: { gte: todayStart, lte: todayEnd },
      },
    });
  }

  async findAttendanceByEmployeeAndDate(businessId: string, employeeId: string, date: Date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return prisma.attendance.findFirst({
      where: {
        businessId,
        employeeId,
        date: { gte: start, lte: end },
      },
    });
  }

  async createAttendance(businessId: string, employeeId: string, data: any) {
    return prisma.attendance.create({
      data: {
        businessId,
        employeeId,
        ...data,
      },
    });
  }

  async updateAttendance(id: string, data: any) {
    return prisma.attendance.update({
      where: { id },
      data,
    });
  }

  async findMonthlyAttendance(businessId: string, startDate: Date, endDate: Date) {
    return prisma.attendance.findMany({
      where: {
        businessId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "asc" },
    });
  }

  async upsertAttendanceByDate(businessId: string, employeeId: string, date: Date, status: "Present" | "Absent" | "Late") {
    const existing = await this.findAttendanceByEmployeeAndDate(businessId, employeeId, date);
    if (existing) {
      if (status === "Absent") {
        return prisma.attendance.delete({
          where: { id: existing.id },
        });
      }
      return prisma.attendance.update({
        where: { id: existing.id },
        data: {
          status,
          checkIn: status === "Present" || status === "Late" ? new Date(date) : null,
        },
      });
    } else {
      if (status !== "Absent") {
        return prisma.attendance.create({
          data: {
            businessId,
            employeeId,
            date,
            checkIn: new Date(date),
            status,
          },
        });
      }
      return null;
    }
  }
}
