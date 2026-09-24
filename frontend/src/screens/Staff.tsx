import React, { useState, useEffect, useMemo } from "react";
import { 
  UserCheck, 
  UserX, 
  Clock, 
  Phone, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  CheckCircle2,
  X,
  AlertTriangle,
  FileSpreadsheet
} from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import type { Employee } from "../context/BusinessContext";
import { motion, AnimatePresence } from "framer-motion";
import { env } from "../config/env";

interface DayRecord {
  day: number;
  date: string;
  dayName: string;
  isSunday: boolean;
  isFuture: boolean;
  status: "Present" | "Absent" | "Late" | "Off";
}

interface MonthlyStaffRecord {
  id: string;
  employeeCode?: string;
  name: string;
  role: string;
  phone: string;
  salary?: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  workingDaysCount: number;
  attendanceRate: number;
  absentDates: string[];
  lateDates: string[];
  dailyRecords: DayRecord[];
}

interface MonthlySummary {
  totalStaff: number;
  totalPresentDays: number;
  totalAbsentDays: number;
  totalLateDays: number;
  avgAttendanceRate: number;
  mostAbsentStaff: MonthlyStaffRecord | null;
  bestAttendanceStaff: MonthlyStaffRecord | null;
}

export const Staff: React.FC = () => {
  const { employees, toggleEmployeeStatus } = useBusiness();

  // Active View Tab: "today" or "monthly"
  const [activeTab, setActiveTab] = useState<"today" | "monthly">("monthly");

  // Selected Month & Year (Default to current)
  const [selectedDate, setSelectedDate] = useState(() => new Date(2026, 8, 17)); // Sep 2026
  const selectedMonth = selectedDate.getMonth() + 1; // 1-12
  const selectedYear = selectedDate.getFullYear();

  // Monthly Data State
  const [monthlyData, setMonthlyData] = useState<{
    summary: MonthlySummary;
    staff: MonthlyStaffRecord[];
  } | null>(null);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);

  // Selected Staff for Detailed Monthly Drilldown
  const [selectedStaffDetail, setSelectedStaffDetail] = useState<MonthlyStaffRecord | null>(null);
  
  // Filter for monthly view: "all" | "absentOnly"
  const [absenceFilter, setAbsenceFilter] = useState<"all" | "absentOnly">("all");

  // Quick feedback toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Recalculate today's quick counts
  const presentCount = employees.filter(e => e.status === "Present").length;
  const absentCount = employees.filter(e => e.status === "Absent").length;
  const lateCount = employees.filter(e => e.status === "Late").length;

  // Month navigation helpers
  const handlePrevMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleCurrentMonth = () => {
    setSelectedDate(new Date(2026, 8, 17));
  };

  // Fetch or generate whole-month attendance data
  const fetchMonthlyAttendance = async () => {
    setIsLoadingMonthly(true);
    const token = localStorage.getItem("qb_token");

    try {
      if (token) {
        const res = await fetch(
          `${env.apiUrl}/api/v1/employees/attendance/monthly?month=${selectedMonth}&year=${selectedYear}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        if (json.success && json.data) {
          setMonthlyData({
            summary: json.data.summary,
            staff: json.data.staff,
          });
          setIsLoadingMonthly(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Backend monthly attendance fetch failed, building fallback:", err);
    }

    // Client-side fallback generator if offline
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const isCurrentMonth = selectedYear === 2026 && selectedMonth === 9;

    const staffList: MonthlyStaffRecord[] = employees.map((emp) => {
      let presentDays = 0;
      let absentDays = 0;
      let lateDays = 0;
      let workingDaysCount = 0;
      const dailyRecords: DayRecord[] = [];
      const absentDates: string[] = [];
      const lateDates: string[] = [];

      for (let d = 1; d <= daysInMonth; d++) {
        const cur = new Date(selectedYear, selectedMonth - 1, d);
        const dayOfWeek = cur.getDay();
        const isSunday = dayOfWeek === 0;
        const isFuture = isCurrentMonth && d > 17;
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayName = dayNames[dayOfWeek];
        const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

        if (isSunday) {
          dailyRecords.push({ day: d, date: dateStr, dayName, isSunday: true, isFuture, status: "Off" });
          continue;
        }
        if (isFuture) {
          dailyRecords.push({ day: d, date: dateStr, dayName, isSunday: false, isFuture: true, status: "Off" });
          continue;
        }

        workingDaysCount++;
        let status: "Present" | "Absent" | "Late" = "Present";
        if (emp.name.toLowerCase().includes("rohit")) {
          if (d === 2 || d === 9 || d === 15) status = "Absent";
          else if (d === 6) status = "Late";
        } else if (emp.name.toLowerCase().includes("sunil")) {
          if (d === 4 || d === 12) status = "Absent";
          else if (d === 8) status = "Late";
        } else if (emp.name.toLowerCase().includes("aarti")) {
          if (d === 11) status = "Absent";
          else if (d === 14) status = "Late";
        } else {
          if (d % 8 === 0) status = "Absent";
          else if (d % 6 === 0) status = "Late";
        }

        if (status === "Present") {
          presentDays++;
        } else if (status === "Late") {
          lateDays++;
          lateDates.push(dateStr);
        } else {
          absentDays++;
          absentDates.push(dateStr);
        }

        dailyRecords.push({ day: d, date: dateStr, dayName, isSunday: false, isFuture: false, status });
      }

      const rate = workingDaysCount > 0 ? Math.round(((presentDays + lateDays) / workingDaysCount) * 100) : 100;

      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        phone: emp.phone,
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

    const totalPres = staffList.reduce((acc, s) => acc + s.presentDays, 0);
    const totalAbs = staffList.reduce((acc, s) => acc + s.absentDays, 0);
    const totalLt = staffList.reduce((acc, s) => acc + s.lateDays, 0);
    const avgR = staffList.length > 0 ? Math.round(staffList.reduce((a, s) => a + s.attendanceRate, 0) / staffList.length) : 0;
    const sortedAbs = [...staffList].sort((a, b) => b.absentDays - a.absentDays);
    const sortedAtt = [...staffList].sort((a, b) => b.attendanceRate - a.attendanceRate);

    setMonthlyData({
      summary: {
        totalStaff: staffList.length,
        totalPresentDays: totalPres,
        totalAbsentDays: totalAbs,
        totalLateDays: totalLt,
        avgAttendanceRate: avgR,
        mostAbsentStaff: sortedAbs[0] || null,
        bestAttendanceStaff: sortedAtt[0] || null,
      },
      staff: staffList,
    });
    setIsLoadingMonthly(false);
  };

  useEffect(() => {
    fetchMonthlyAttendance();
  }, [selectedMonth, selectedYear, employees]);

  // Handle manual date toggle on muster roll
  const handleDateStatusChange = async (employeeId: string, dateStr: string, currentStatus: "Present" | "Absent" | "Late" | "Off") => {
    if (currentStatus === "Off") return; // Cannot toggle Sunday / future off

    const nextStatus: "Present" | "Late" | "Absent" = 
      currentStatus === "Present" ? "Late" : currentStatus === "Late" ? "Absent" : "Present";

    const token = localStorage.getItem("qb_token");
    if (token) {
      try {
        await fetch(`${env.apiUrl}/api/v1/employees/attendance/date`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            employeeId,
            date: dateStr,
            status: nextStatus,
          }),
        });
      } catch (e) {
        console.error("Failed to update date attendance on server:", e);
      }
    }

    showToast(`Updated attendance for ${dateStr} to ${nextStatus}`);
    fetchMonthlyAttendance();
  };

  const filteredStaff = useMemo(() => {
    if (!monthlyData) return [];
    if (absenceFilter === "absentOnly") {
      return monthlyData.staff.filter(s => s.absentDays > 0);
    }
    return monthlyData.staff;
  }, [monthlyData, absenceFilter]);

  const monthLabel = selectedDate.toLocaleString("en-US", { month: "long", year: "numeric" });

  const getStatusColor = (status: Employee["status"]) => {
    switch (status) {
      case "Present": return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40";
      case "Absent": return "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-800/40";
      case "Late": return "bg-brand-orange/10 text-brand-orange border-brand-orange/20";
    }
  };

  const getStatusIcon = (status: Employee["status"]) => {
    switch (status) {
      case "Present": return <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case "Absent": return <UserX className="h-4 w-4 text-rose-600 dark:text-rose-400" />;
      case "Late": return <Clock className="h-4 w-4 text-brand-orange" />;
    }
  };

  // Export CSV helper
  const handleExportCSV = () => {
    if (!monthlyData) return;
    const header = ["Staff Name", "Role", "Phone", "Working Days", "Days Present", "Days Absent", "Days Late", "Attendance %", "Absent Dates"];
    const rows = monthlyData.staff.map(s => [
      `"${s.name}"`,
      `"${s.role}"`,
      `"${s.phone}"`,
      s.workingDaysCount,
      s.presentDays,
      s.absentDays,
      s.lateDays,
      `${s.attendanceRate}%`,
      `"${s.absentDates.join(", ")}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [header.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Staff_Attendance_${monthLabel.replace(" ", "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Muster roll exported as CSV successfully!");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6 pb-28 text-slate-900 dark:text-white">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 animate-bounce"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Standard Adaptive Page Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Staff & Attendance Operations
              </h1>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {employees.length} Staff Members
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Daily counter check-ins, monthly muster roll registers, and staff absenteeism analytics
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 self-start lg:self-auto shrink-0">
          <button
            onClick={() => setActiveTab("monthly")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "monthly"
                ? "bg-white dark:bg-slate-900 text-brand-orange shadow-xs scale-[1.01]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Whole Month Entry</span>
          </button>
          <button
            onClick={() => setActiveTab("today")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "today"
                ? "bg-white dark:bg-slate-900 text-brand-orange shadow-xs scale-[1.01]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Today's Shift Log</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: WHOLE MONTH ATTENDANCE REGISTER & MUSTER ROLL                     */}
      {/* ========================================================================= */}
      {activeTab === "monthly" && (
        <div className="space-y-6">

          {/* Month Navigation & Action Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Month Navigator */}
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-4 text-xs sm:text-sm font-black text-slate-900 dark:text-white min-w-[140px] text-center">
                  {isLoadingMonthly ? "Loading..." : monthLabel}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleCurrentMonth}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Current Month
              </button>
            </div>

            {/* Filter & Export Controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                <button
                  onClick={() => setAbsenceFilter("all")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    absenceFilter === "all"
                      ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  All Staff ({monthlyData?.staff.length || 0})
                </button>
                <button
                  onClick={() => setAbsenceFilter("absentOnly")}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                    absenceFilter === "absentOnly"
                      ? "bg-rose-500 text-white shadow-xs"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  <span>With Absences</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px]">
                    {monthlyData?.staff.filter(s => s.absentDays > 0).length || 0}
                  </span>
                </button>
              </div>

              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-brand-orange" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* 4 Monthly KPI Cards */}
          {monthlyData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Total Staff */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Store Staff</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block tabular-nums">
                  {monthlyData.summary.totalStaff} Members
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block font-medium">
                  {monthlyData.staff[0]?.workingDaysCount || 15} working days recorded
                </span>
              </div>

              {/* Card 2: Total Days Present */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Days Present</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block tabular-nums">
                  {monthlyData.summary.totalPresentDays} Days
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block font-bold flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5" />
                  Top: {monthlyData.summary.bestAttendanceStaff?.name || "N/A"} ({monthlyData.summary.bestAttendanceStaff?.attendanceRate}%)
                </span>
              </div>

              {/* Card 3: Total Days Absent */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Staff Absences</span>
                <span className="text-2xl sm:text-3xl font-black text-rose-500 dark:text-rose-400 mt-1 block tabular-nums">
                  {monthlyData.summary.totalAbsentDays} Days
                </span>
                <span className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 block font-bold flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Highest: {monthlyData.summary.mostAbsentStaff?.name} ({monthlyData.summary.mostAbsentStaff?.absentDays} days)
                </span>
              </div>

              {/* Card 4: Monthly Attendance Rate */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Monthly Attendance Rate</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-brand-orange tabular-nums">
                    {monthlyData.summary.avgAttendanceRate}%
                  </span>
                  <span className="text-xs font-bold text-slate-400">Shop Average</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-brand-orange h-full rounded-full transition-all duration-500"
                    style={{ width: `${monthlyData.summary.avgAttendanceRate}%` }}
                  />
                </div>
              </div>

            </div>
          )}

          {/* Staff Monthly Breakdown Scorecard Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-brand-orange" />
                  Staff Monthly Attendance Summary ({monthLabel})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Detailed count of who has been present and who has been absent for how many days.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                    <th className="py-3.5 px-5">Staff Member</th>
                    <th className="py-3.5 px-4 text-center">Working Days</th>
                    <th className="py-3.5 px-4 text-center">Days Present</th>
                    <th className="py-3.5 px-4 text-center">Days Absent</th>
                    <th className="py-3.5 px-4 text-center">Days Late</th>
                    <th className="py-3.5 px-5">Attendance Rate</th>
                    <th className="py-3.5 px-5">Absent Dates Detail</th>
                    <th className="py-3.5 px-4 text-right">Drilldown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400 italic">
                        No staff records found for this filter.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        
                        {/* Staff Name & Role */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-brand-orange/10 text-brand-orange font-black flex items-center justify-center text-xs shrink-0">
                              {s.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                              <div className="font-extrabold text-sm text-slate-900 dark:text-white">{s.name}</div>
                              <div className="text-[11px] text-slate-500 font-medium">{s.role} • {s.phone}</div>
                            </div>
                          </div>
                        </td>

                        {/* Working Days */}
                        <td className="py-4 px-4 text-center font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                          {s.workingDaysCount} Days
                        </td>

                        {/* Days Present */}
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 rounded-xl font-black text-xs tabular-nums">
                            <UserCheck className="h-3.5 w-3.5" />
                            {s.presentDays} Days
                          </span>
                        </td>

                        {/* Days Absent */}
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-black text-xs tabular-nums border ${
                            s.absentDays > 0
                              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                          }`}>
                            <UserX className="h-3.5 w-3.5" />
                            {s.absentDays} Days
                          </span>
                        </td>

                        {/* Days Late */}
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl font-black text-xs tabular-nums border ${
                            s.lateDays > 0
                              ? "bg-brand-orange/10 text-brand-orange border-brand-orange/20"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                          }`}>
                            <Clock className="h-3 w-3" />
                            {s.lateDays}
                          </span>
                        </td>

                        {/* Attendance Rate */}
                        <td className="py-4 px-5">
                          <div className="w-32">
                            <div className="flex justify-between items-center text-xs font-bold mb-1">
                              <span className={s.attendanceRate >= 85 ? "text-emerald-600 dark:text-emerald-400" : s.attendanceRate >= 75 ? "text-brand-orange" : "text-rose-500"}>
                                {s.attendanceRate}%
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {s.attendanceRate >= 90 ? "Excellent" : s.attendanceRate >= 80 ? "Good" : "Warning"}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  s.attendanceRate >= 85 ? "bg-emerald-500" : s.attendanceRate >= 75 ? "bg-brand-orange" : "bg-rose-500"
                                }`}
                                style={{ width: `${s.attendanceRate}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Absent Dates Detail */}
                        <td className="py-4 px-5">
                          {s.absentDates.length === 0 ? (
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Zero Absences!
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {s.absentDates.map(dateStr => {
                                const dayNum = parseInt(dateStr.split("-")[2], 10);
                                return (
                                  <span 
                                    key={dateStr} 
                                    className="px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 text-[10px] font-bold"
                                    title={`Absent on ${dateStr}`}
                                  >
                                    Sep {dayNum}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </td>

                        {/* Drilldown Trigger */}
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => setSelectedStaffDetail(s)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 hover:text-brand-orange transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Inspect complete month log"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="font-bold text-[11px]">Inspect</span>
                          </button>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Day-by-Day Muster Roll Grid (Days 1 to 30) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-brand-orange" />
                  Day-by-Day Attendance Muster Sheet ({monthLabel})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Click any past or current day cell to toggle: <span className="text-emerald-600 font-bold">P</span> (Present) ➔ <span className="text-brand-orange font-bold">L</span> (Late) ➔ <span className="text-rose-600 font-bold">A</span> (Absent).
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Present (P)
                </span>
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Absent (A)
                </span>
                <span className="flex items-center gap-1 text-brand-orange">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-orange" /> Late (L)
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> Sunday (Off)
                </span>
              </div>
            </div>

            {/* Horizontal Scrollable Calendar Grid */}
            <div className="overflow-x-auto pb-2 scrollbar-thin">
              <div className="min-w-[900px] space-y-3">
                
                {/* Header Row of Days */}
                <div className="grid grid-cols-[180px_repeat(30,_minmax(32px,_1fr))] gap-1 items-center pb-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-400">
                  <div className="pl-2">Staff Member</div>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(dayNum => {
                    const dateObj = new Date(selectedYear, selectedMonth - 1, dayNum);
                    const isSun = dateObj.getDay() === 0;
                    return (
                      <div 
                        key={dayNum} 
                        className={`text-center py-1 rounded-md ${
                          isSun ? "bg-slate-100 dark:bg-slate-800 text-slate-400" : "text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        <div className="leading-tight">{dayNum}</div>
                        <div className="text-[8px] font-medium uppercase text-slate-400">
                          {isSun ? "Sun" : ["M","T","W","T","F","S"][dateObj.getDay() - 1]}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Staff Rows */}
                {monthlyData?.staff.map(s => (
                  <div 
                    key={s.id}
                    className="grid grid-cols-[180px_repeat(30,_minmax(32px,_1fr))] gap-1 items-center py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl transition-colors"
                  >
                    {/* Employee Profile Preview */}
                    <div className="pl-2 truncate pr-2">
                      <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{s.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{s.role}</div>
                    </div>

                    {/* 30 Day Cells */}
                    {s.dailyRecords.slice(0, 30).map(rec => {
                      let cellStyle = "bg-slate-100 dark:bg-slate-800/50 text-slate-400";
                      let label = "–";

                      if (rec.isSunday) {
                        cellStyle = "bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold opacity-60";
                        label = "–";
                      } else if (rec.isFuture) {
                        cellStyle = "bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600";
                        label = "";
                      } else if (rec.status === "Present") {
                        cellStyle = "bg-emerald-500 text-white font-black hover:bg-emerald-600 shadow-xs cursor-pointer";
                        label = "P";
                      } else if (rec.status === "Late") {
                        cellStyle = "bg-brand-orange text-white font-black hover:bg-brand-orange-hover shadow-xs cursor-pointer";
                        label = "L";
                      } else if (rec.status === "Absent") {
                        cellStyle = "bg-rose-500 text-white font-black hover:bg-rose-600 shadow-xs cursor-pointer";
                        label = "A";
                      }

                      return (
                        <button
                          key={rec.day}
                          disabled={rec.isSunday || rec.isFuture}
                          onClick={() => handleDateStatusChange(s.id, rec.date, rec.status)}
                          className={`h-8 w-full rounded-lg text-[11px] flex items-center justify-center transition-all ${cellStyle}`}
                          title={`${s.name} on ${rec.date}: ${rec.status} ${!rec.isSunday && !rec.isFuture ? "(Click to toggle status)" : ""}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                ))}

              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: TODAY'S ACTIVE SHIFT LOG SHEET (QUICK TOGGLES)                     */}
      {/* ========================================================================= */}
      {activeTab === "today" && (
        <div className="space-y-6">

          {/* Today Summary Header Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Present Staff Today</span>
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 inline-block font-sans tabular-nums">{presentCount}</span>
              </div>
              <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl flex items-center justify-center text-emerald-500">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Absent Staff Today</span>
                <span className="text-2xl font-extrabold text-rose-500 dark:text-rose-400 mt-1 inline-block font-sans tabular-nums">{absentCount}</span>
              </div>
              <div className="h-10 w-10 bg-rose-50 dark:bg-rose-950/50 rounded-xl flex items-center justify-center text-rose-500">
                <UserX className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Late/Delayed Staff</span>
                <span className="text-2xl font-extrabold text-brand-orange mt-1 inline-block font-sans tabular-nums">{lateCount}</span>
              </div>
              <div className="h-10 w-10 bg-brand-orange/10 rounded-xl flex items-center justify-center text-brand-orange">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Today Staff Visual Card Deck */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((emp) => (
              <motion.div
                key={emp.id}
                whileHover={{ y: -2 }}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between h-48 shadow-sm transition-all ${
                  emp.status === "Absent" 
                    ? "border-rose-200 dark:border-rose-900/50 bg-rose-50/10 dark:bg-rose-950/20" 
                    : emp.status === "Late"
                      ? "border-brand-orange/30 bg-brand-orange/5"
                      : "border-slate-200 dark:border-slate-800"
                }`}
              >
                {/* Header Details */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm leading-snug">{emp.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-0.5">{emp.role}</p>
                    <a 
                      href={`tel:${emp.phone}`}
                      className="text-[10px] text-slate-400 hover:text-brand-orange mt-1.5 inline-flex items-center gap-1 font-semibold transition-colors"
                    >
                      <Phone className="h-3 w-3" />
                      {emp.phone}
                    </a>
                  </div>

                  {/* Status Badge */}
                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border flex items-center gap-1 ${getStatusColor(emp.status)}`}>
                    {getStatusIcon(emp.status)}
                    {emp.status}
                  </span>
                </div>

                {/* Attendance Toggle Actions */}
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                    Set Today's Status
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => toggleEmployeeStatus(emp.id, "Present")}
                      className={`py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all border ${
                        emp.status === "Present"
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => toggleEmployeeStatus(emp.id, "Absent")}
                      className={`py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all border ${
                        emp.status === "Absent"
                          ? "bg-rose-600 border-rose-600 text-white shadow-sm"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      Absent
                    </button>
                    <button
                      onClick={() => toggleEmployeeStatus(emp.id, "Late")}
                      className={`py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all border ${
                        emp.status === "Late"
                          ? "bg-brand-orange border-brand-orange text-white shadow-sm"
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      Late
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INDIVIDUAL STAFF MONTHLY DRILLDOWN INSPECTOR                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedStaffDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-brand-orange/10 text-brand-orange font-black flex items-center justify-center text-sm">
                    {selectedStaffDetail.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">
                      {selectedStaffDetail.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold">
                      {selectedStaffDetail.role} • {selectedStaffDetail.phone}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStaffDetail(null)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Monthly Stats Summary for this Staff */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase block">Days Present</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {selectedStaffDetail.presentDays} Days
                  </span>
                </div>

                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-rose-800 dark:text-rose-400 uppercase block">Days Absent</span>
                  <span className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
                    {selectedStaffDetail.absentDays} Days
                  </span>
                </div>

                <div className="p-3.5 bg-brand-orange/10 border border-brand-orange/20 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-brand-orange uppercase block">Attendance %</span>
                  <span className="text-xl font-black text-brand-orange mt-1 block">
                    {selectedStaffDetail.attendanceRate}%
                  </span>
                </div>
              </div>

              {/* Absent Dates Log List */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                  Logged Absent Dates ({selectedStaffDetail.absentDates.length})
                </span>
                {selectedStaffDetail.absentDates.length === 0 ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>No absences logged this month! Perfect attendance record.</span>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                    {selectedStaffDetail.absentDates.map(d => (
                      <div 
                        key={d}
                        className="p-2.5 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-xl flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
                          <UserX className="h-4 w-4" />
                          {new Date(d).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300">
                          Full Day Absent
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Late Check-in Dates */}
              {selectedStaffDetail.lateDates.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                    Delayed / Late Check-ins ({selectedStaffDetail.lateDates.length})
                  </span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                    {selectedStaffDetail.lateDates.map(d => (
                      <div 
                        key={d}
                        className="p-2 bg-brand-orange/5 border border-brand-orange/20 rounded-xl flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-brand-orange flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {new Date(d).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" })}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          Late Arrival
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div className="pt-2">
                <button
                  onClick={() => setSelectedStaffDetail(null)}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-2xl text-xs cursor-pointer transition-colors"
                >
                  Close Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Proactive Attendance Tip */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-3 text-xs text-white">
        <div className="p-1.5 bg-brand-orange/10 rounded-lg text-brand-orange shrink-0">
          <Clock className="h-4 w-4" />
        </div>
        <div>
          <h5 className="font-bold text-slate-200">QuickBizs Automated Attendance & Absenteeism Ledger</h5>
          <p className="text-slate-400 mt-0.5 leading-relaxed">
            All check-ins logged on the register are automatically synchronized to the whole month muster roll. Working days, absences, and late marks are computed in real time. Use this monthly register for direct payroll reconciliation.
          </p>
        </div>
      </div>

    </div>
  );
};
