import { EmployeeRepository } from "../repositories/employeeRepository";
import { prisma } from "../config/prisma";

const employeeRepository = new EmployeeRepository();

export class EmployeeService {
  async getEmployees(businessId: string) {
    const [employees, attendances] = await Promise.all([
      employeeRepository.findEmployees(businessId),
      employeeRepository.findTodayAttendance(businessId),
    ]);

    // Map database profiles to match the frontend expectations
    return employees.map((emp) => {
      const att = attendances.find((a) => a.employeeId === emp.id);
      return {
        id: emp.id,
        employeeCode: emp.employeeCode,
        firstName: emp.firstName,
        lastName: emp.lastName,
        name: `${emp.firstName} ${emp.lastName}`.trim(),
        role: emp.designation,
        designation: emp.designation,
        mobile: emp.mobile,
        phone: emp.mobile,
        email: emp.email,
        salary: emp.salary,
        status: att ? (att.status as any) : "Absent", // Mapped to attendance status
        employmentStatus: emp.status,
        joiningDate: emp.joiningDate,
      };
    });
  }

  async getEmployeeById(businessId: string, id: string) {
    const emp = await employeeRepository.findEmployeeById(businessId, id);
    if (!emp) {
      const err: any = new Error("Employee profile not found.");
      err.statusCode = 404;
      throw err;
    }
    return emp;
  }

  async createEmployee(
    businessId: string,
    data: {
      employeeCode: string;
      firstName: string;
      lastName: string;
      mobile: string;
      email?: string;
      designation: string;
      salary?: number;
    }
  ) {
    // 1. Validation (Step 11)
    if (!data.employeeCode || !data.firstName || !data.lastName || !data.mobile || !data.designation) {
      const err: any = new Error("Employee code, full name, mobile, and designation designation are mandatory.");
      err.statusCode = 400;
      throw err;
    }

    // Check duplicate employee code
    const existingCode = await prisma.employee.findFirst({
      where: { businessId, employeeCode: data.employeeCode, deletedAt: null },
    });
    if (existingCode) {
      const err: any = new Error("Employee code is already registered to another active profile.");
      err.statusCode = 400;
      throw err;
    }

    // Check duplicate email if provided
    if (data.email) {
      const existingEmail = await prisma.employee.findFirst({
        where: { businessId, email: data.email, deletedAt: null },
      });
      if (existingEmail) {
        const err: any = new Error("Email address is already linked to another employee.");
        err.statusCode = 400;
        throw err;
      }
    }

    return employeeRepository.createEmployee(businessId, {
      employeeCode: data.employeeCode,
      firstName: data.firstName,
      lastName: data.lastName,
      mobile: data.mobile,
      email: data.email || null,
      designation: data.designation,
      salary: data.salary || 15000,
      status: "Active",
    });
  }

  async updateEmployee(businessId: string, id: string, data: any) {
    const emp = await employeeRepository.findEmployeeById(businessId, id);
    if (!emp) {
      const err: any = new Error("Employee profile not found.");
      err.statusCode = 404;
      throw err;
    }

    await employeeRepository.updateEmployee(businessId, id, data);
    return true;
  }

  async deleteEmployee(businessId: string, id: string) {
    const emp = await employeeRepository.findEmployeeById(businessId, id);
    if (!emp) {
      const err: any = new Error("Employee profile not found.");
      err.statusCode = 404;
      throw err;
    }

    await employeeRepository.deleteEmployee(businessId, id);
    return true;
  }

  async getAttendance(businessId: string) {
    return employeeRepository.findTodayAttendance(businessId);
  }

  async toggleAttendance(businessId: string, employeeId: string, status: "Present" | "Absent" | "Late") {
    const emp = await employeeRepository.findEmployeeById(businessId, employeeId);
    if (!emp) {
      const err: any = new Error("Employee profile not found.");
      err.statusCode = 404;
      throw err;
    }

    const today = new Date();
    const existing = await employeeRepository.findAttendanceByEmployeeAndDate(businessId, employeeId, today);

    if (existing) {
      if (status === "Absent") {
        // Delete attendance record to mark absent
        await prisma.attendance.delete({
          where: { id: existing.id },
        });
      } else {
        // Update check-in status
        await employeeRepository.updateAttendance(existing.id, {
          status,
          checkIn: status === "Present" || status === "Late" ? new Date() : null,
        });
      }
    } else {
      if (status !== "Absent") {
        await employeeRepository.createAttendance(businessId, employeeId, {
          date: today,
          checkIn: new Date(),
          status,
        });
      }
    }

    return true;
  }

  async getMonthlyAttendanceSummary(businessId: string, queryMonth?: number, queryYear?: number) {
    const now = new Date();
    const month = queryMonth ? Number(queryMonth) : now.getMonth() + 1; // 1-12
    const year = queryYear ? Number(queryYear) : now.getFullYear();

    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const daysInMonth = new Date(year, month, 0).getDate();
    const endDate = new Date(year, month - 1, daysInMonth, 23, 59, 59, 999);

    const isCurrentMonth = year === now.getFullYear() && month === (now.getMonth() + 1);
    const maxDay = isCurrentMonth ? Math.min(daysInMonth, now.getDate()) : daysInMonth;

    const employees = await employeeRepository.findEmployees(businessId);
    const attendances = await employeeRepository.findMonthlyAttendance(businessId, startDate, endDate);

    // Build day-by-day muster roll per employee
    const staffBreakdown = employees.map((emp) => {
      const empAttendances = attendances.filter((a) => a.employeeId === emp.id);

      let presentDays = 0;
      let absentDays = 0;
      let lateDays = 0;
      let workingDaysCount = 0;
      const dailyRecords: Array<{
        day: number;
        date: string;
        dayName: string;
        isSunday: boolean;
        isFuture: boolean;
        status: "Present" | "Absent" | "Late" | "Off";
      }> = [];

      const absentDates: string[] = [];
      const lateDates: string[] = [];

      for (let d = 1; d <= daysInMonth; d++) {
        const currentDate = new Date(year, month - 1, d);
        const dayOfWeek = currentDate.getDay();
        const isSunday = dayOfWeek === 0;
        const isFuture = isCurrentMonth && d > now.getDate();
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayName = dayNames[dayOfWeek];
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

        if (isSunday) {
          dailyRecords.push({
            day: d,
            date: dateStr,
            dayName,
            isSunday: true,
            isFuture,
            status: "Off",
          });
          continue;
        }

        if (isFuture) {
          dailyRecords.push({
            day: d,
            date: dateStr,
            dayName,
            isSunday: false,
            isFuture: true,
            status: "Off",
          });
          continue;
        }

        workingDaysCount++;

        // Find attendance entry for this day
        const match = empAttendances.find((a) => {
          const aDate = new Date(a.date);
          return aDate.getFullYear() === year && aDate.getMonth() === month - 1 && aDate.getDate() === d;
        });

        if (match && match.status === "Present") {
          presentDays++;
          dailyRecords.push({
            day: d,
            date: dateStr,
            dayName,
            isSunday: false,
            isFuture: false,
            status: "Present",
          });
        } else if (match && match.status === "Late") {
          lateDays++;
          lateDates.push(dateStr);
          dailyRecords.push({
            day: d,
            date: dateStr,
            dayName,
            isSunday: false,
            isFuture: false,
            status: "Late",
          });
        } else {
          absentDays++;
          absentDates.push(dateStr);
          dailyRecords.push({
            day: d,
            date: dateStr,
            dayName,
            isSunday: false,
            isFuture: false,
            status: "Absent",
          });
        }
      }

      const totalEffectiveAttended = presentDays + lateDays;
      const rate = workingDaysCount > 0 ? Math.round((totalEffectiveAttended / workingDaysCount) * 100) : 100;

      return {
        id: emp.id,
        employeeCode: emp.employeeCode,
        name: `${emp.firstName} ${emp.lastName}`.trim(),
        role: emp.designation,
        phone: emp.mobile,
        salary: emp.salary,
        presentDays,
        absentDays,
        lateDays,
        workingDaysCount,
        attendanceRate: rate,
        absentDates,
        lateDates,
        dailyRecords,
      };
    });

    // Month totals and leaderboards
    const totalPresent = staffBreakdown.reduce((sum, s) => sum + s.presentDays, 0);
    const totalAbsent = staffBreakdown.reduce((sum, s) => sum + s.absentDays, 0);
    const totalLate = staffBreakdown.reduce((sum, s) => sum + s.lateDays, 0);
    const avgRate = staffBreakdown.length > 0
      ? Math.round(staffBreakdown.reduce((sum, s) => sum + s.attendanceRate, 0) / staffBreakdown.length)
      : 0;

    // Identify who has been absent most
    const sortedByAbsence = [...staffBreakdown].sort((a, b) => b.absentDays - a.absentDays);
    const sortedByAttendance = [...staffBreakdown].sort((a, b) => b.attendanceRate - a.attendanceRate);

    return {
      month,
      year,
      monthName: new Date(year, month - 1, 1).toLocaleString("en-US", { month: "long" }),
      daysInMonth,
      workingDaysElapsed: maxDay,
      summary: {
        totalStaff: employees.length,
        totalPresentDays: totalPresent,
        totalAbsentDays: totalAbsent,
        totalLateDays: totalLate,
        avgAttendanceRate: avgRate,
        mostAbsentStaff: sortedByAbsence[0] || null,
        bestAttendanceStaff: sortedByAttendance[0] || null,
      },
      staff: staffBreakdown,
    };
  }

  async recordDateAttendance(businessId: string, employeeId: string, dateStr: string, status: "Present" | "Absent" | "Late") {
    const emp = await employeeRepository.findEmployeeById(businessId, employeeId);
    if (!emp) {
      const err: any = new Error("Employee profile not found.");
      err.statusCode = 404;
      throw err;
    }

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      const err: any = new Error("Invalid date provided.");
      err.statusCode = 400;
      throw err;
    }

    return employeeRepository.upsertAttendanceByDate(businessId, employeeId, date, status);
  }
}
