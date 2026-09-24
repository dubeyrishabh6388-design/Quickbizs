import { prisma } from "../config/prisma";
import { RecoveryTask, Customer, RecoveryReminder } from "../generated/client/client";

export class RecoveryService {
  async syncTasks(businessId: string) {
    const customers = await prisma.customer.findMany({
      where: { businessId, pendingAmount: { gt: 0 }, isDeleted: false },
    });

    const now = new Date();

    for (const cust of customers) {
      // Check for active task
      const existing = await prisma.recoveryTask.findFirst({
        where: {
          businessId,
          customerId: cust.id,
          status: { in: ["Pending", "InProgress"] },
        },
      });

      // Calculate priority based on last purchase date (fallback to createdAt)
      const referenceDate = cust.lastPurchaseAt || cust.createdAt;
      const diffMs = now.getTime() - referenceDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      let priority = "Medium";
      if (diffDays > 60) {
        priority = "Critical";
      } else if (diffDays > 30) {
        priority = "High";
      }

      if (existing) {
        // Update amount & priority
        await prisma.recoveryTask.update({
          where: { id: existing.id },
          data: {
            amount: cust.pendingAmount,
            priority,
          },
        });
      } else {
        // Create new recovery task
        await prisma.recoveryTask.create({
          data: {
            businessId,
            customerId: cust.id,
            amount: cust.pendingAmount,
            priority,
            status: "Pending",
          },
        });
      }
    }

    return { success: true, count: customers.length };
  }

  async getRecoveryDashboard(businessId: string) {
    // 1. Sync tasks first to have up-to-date items
    await this.syncTasks(businessId);

    // 2. Fetch all tasks with customer details
    const tasks = await prisma.recoveryTask.findMany({
      where: { businessId },
      include: {
        customer: true,
        reminders: {
          orderBy: { sentAt: "desc" },
        },
      },
      orderBy: [
        { priority: "asc" }, // Critical / High first (alphabetically C, H, M)
        { amount: "desc" },
      ],
    });

    const activeTasks = tasks.filter((t: any) => t.status === "Pending" || t.status === "InProgress");
    const recoveredTasks = tasks.filter((t: any) => t.status === "Recovered");

    // 3. Stats Calculations
    const totalPendingAmount = activeTasks.reduce((acc: number, t: any) => acc + t.amount, 0);
    const uniqueCustomersCount = activeTasks.length;

    // Find oldest pending task based on customer last purchase date or creation
    let oldestDate = new Date();
    let oldestAmount = 0;
    activeTasks.forEach((t: any) => {
      const ref = t.customer.lastPurchaseAt || t.customer.createdAt;
      if (ref < oldestDate) {
        oldestDate = ref;
        oldestAmount = t.amount;
      }
    });

    // Find highest pending customer
    let highestAmount = 0;
    let highestCustomerName = "N/A";
    activeTasks.forEach((t: any) => {
      if (t.amount > highestAmount) {
        highestAmount = t.amount;
        highestCustomerName = t.customer.name;
      }
    });

    // Calculate recovery percentage: (Recovered Amount) / (Total Dues Ever Managed)
    const recoveredAmount = recoveredTasks.reduce((acc: number, t: any) => acc + t.amount, 0);
    const totalManagedAmount = totalPendingAmount + recoveredAmount;
    const recoveryPercentage = totalManagedAmount > 0 ? (recoveredAmount / totalManagedAmount) * 100 : 0;

    // 4. Analytics Calculations
    // Recovery Success Rate: recoveredTasks.length / tasks.length
    const successRate = tasks.length > 0 ? (recoveredTasks.length / tasks.length) * 100 : 0;

    // Average Recovery Time: diff between recovered task updatedAt and createdAt in days
    let totalRecoveryDays = 0;
    recoveredTasks.forEach((t: any) => {
      const diffMs = t.updatedAt.getTime() - t.createdAt.getTime();
      totalRecoveryDays += Math.floor(diffMs / (1000 * 60 * 60 * 24));
    });
    const avgRecoveryTimeDays = recoveredTasks.length > 0 ? totalRecoveryDays / recoveredTasks.length : 0;

    // Monthly collection: sum of recovered amounts in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyCollection = recoveredTasks
      .filter((t: any) => t.updatedAt >= thirtyDaysAgo)
      .reduce((acc: number, t: any) => acc + t.amount, 0);

    return {
      stats: {
        totalPendingAmount,
        uniqueCustomersCount,
        oldestAmount,
        oldestDaysAgo: activeTasks.length > 0 ? Math.floor((new Date().getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)) : 0,
        highestCustomerName,
        highestAmount,
        recoveryPercentage,
      },
      analytics: {
        successRate,
        avgRecoveryTimeDays,
        monthlyCollection,
      },
      tasks,
    };
  }

  async performAction(
    taskId: string,
    businessId: string,
    actionType: "Call" | "WhatsApp" | "PaymentLink" | "FollowUp" | "AddNote",
    notes?: string
  ) {
    const task = await prisma.recoveryTask.findFirst({
      where: { id: taskId, businessId },
    });

    if (!task) {
      throw new Error("Recovery task not found.");
    }

    // Add Recovery Reminder Log
    await prisma.recoveryReminder.create({
      data: {
        businessId,
        taskId,
        reminderType: actionType,
        status: "Sent",
        notes: notes || `Logged ${actionType} action.`,
      },
    });

    // Update Task Status to InProgress if it was Pending
    const updatedStatus = task.status === "Pending" ? "InProgress" : task.status;

    const updatedTask = await prisma.recoveryTask.update({
      where: { id: taskId },
      data: {
        status: updatedStatus,
        notes: notes ? (task.notes ? `${task.notes}\n---\n${notes}` : notes) : task.notes,
      },
    });

    return updatedTask;
  }

  async resolveTask(taskId: string, businessId: string) {
    const task = await prisma.recoveryTask.findFirst({
      where: { id: taskId, businessId },
      include: { customer: true },
    });

    if (!task) {
      throw new Error("Recovery task not found.");
    }

    // 1. Mark RecoveryTask as Recovered
    const updatedTask = await prisma.recoveryTask.update({
      where: { id: taskId },
      data: {
        status: "Recovered",
      },
    });

    // 2. Reduce Customer pendingAmount in DB
    await prisma.customer.update({
      where: { id: task.customerId },
      data: {
        pendingAmount: {
          decrement: task.amount,
        },
      },
    });

    // 3. Log a Customer Transaction/Ledger record for receipt clearing
    await prisma.customerLedger.create({
      data: {
        businessId,
        customerId: task.customerId,
        amount: task.amount,
        transactionType: "Payment",
        referenceNumber: `RCV-${task.id.substring(0, 8)}`,
        runningBalance: Math.max(0, task.customer.pendingAmount - task.amount),
        description: "Cleared via Recovery Center task settlement.",
      },
    });

    return updatedTask;
  }
}
