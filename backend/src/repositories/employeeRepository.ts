import { prisma } from "../config/prisma";
import { encryptDbField, decryptDbField } from "../utils/dbEncryption";

export function decryptEmployee<T extends Record<string, any> | null | undefined>(emp: T): T {
  if (!emp) return emp;
  return {
    ...emp,
    firstName: emp.firstName ? (decryptDbField(emp.firstName) as string) : emp.firstName,
    lastName: emp.lastName ? (decryptDbField(emp.lastName) as string) : emp.lastName,
    mobile: emp.mobile ? (decryptDbField(emp.mobile) as string) : emp.mobile,
    email: emp.email ? (decryptDbField(emp.email) as string) : emp.email,
  };
}

export function decryptEmployees<T extends Record<string, any>>(list: T[]): T[] {
  return list.map(decryptEmployee);
}

export class EmployeeRepository {
  async findEmployees(businessId: string) {
    const list = await prisma.employee.findMany({
      where: { businessId, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return decryptEmployees(list);
  }

  async findEmployeeById(businessId: string, id: string) {
    const emp = await prisma.employee.findFirst({
      where: { id, businessId, deletedAt: null },
    });
    return decryptEmployee(emp);
  }

  async createEmployee(businessId: string, data: any) {
    const encData = {
      ...data,
      firstName: data.firstName ? encryptDbField(data.firstName) : data.firstName,
      lastName: data.lastName ? encryptDbField(data.lastName) : data.lastName,
      mobile: data.mobile ? encryptDbField(data.mobile) : data.mobile,
      email: data.email ? encryptDbField(data.email) : data.email,
    };
    const created = await prisma.employee.create({
      data: {
        businessId,
        ...encData,
      },
    });
    return decryptEmployee(created);
  }

  async updateEmployee(businessId: string, id: string, data: any) {
    const encData = { ...data };
    if (encData.firstName) encData.firstName = encryptDbField(encData.firstName);
    if (encData.lastName) encData.lastName = encryptDbField(encData.lastName);
    if (encData.mobile) encData.mobile = encryptDbField(encData.mobile);
    if (encData.email) encData.email = encryptDbField(encData.email);

    return prisma.employee.updateMany({
      where: { id, businessId, deletedAt: null },
      data: encData,
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
