import { prisma } from "../config/prisma";
import { customerLedgerRepository } from "../repositories/customerLedgerRepository";
import { customerCreditEngine } from "./customerCreditEngine";

export class CustomerLedgerService {
  async getProfileDetails(businessId: string, customerId: string) {
    const customer = await customerLedgerRepository.getProfile(businessId, customerId);
    if (!customer) throw new Error("Customer profile not registered.");

    const scoreData = await customerCreditEngine.calculateHealthScore(businessId, customerId);

    // Calculate billing aggregates from orders relation
    const orders = await prisma.order.findMany({
      where: { customerId, businessId, deletedAt: null },
      include: { items: true },
    });

    const totalPurchase = orders.reduce((sum, o) => sum + o.grandTotal, 0);
    const avgBillVal = orders.length > 0 ? totalPurchase / orders.length : 0;
    
    // Profitability
    let totalProfit = 0;
    for (const order of orders) {
      let costSum = 0;
      for (const item of order.items) {
        const prod = await prisma.product.findFirst({ where: { id: item.productId } });
        costSum += (prod ? prod.costPrice : item.unitPrice * 0.8) * item.quantity;
      }
      totalProfit += (order.grandTotal - costSum);
    }

    const totalPaid = Math.max(0, totalPurchase - customer.pendingAmount);

    return {
      profile: {
        id: customer.id,
        customerCode: customer.customerCode,
        name: customer.name,
        mobile: customer.mobile,
        email: customer.email,
        address: customer.address || "N/A",
        city: customer.city || "N/A",
        state: customer.state || "N/A",
        pinCode: customer.pinCode || "N/A",
        creditLimit: customer.creditLimit,
        pendingAmount: customer.pendingAmount,
        rewardPoints: customer.rewardPoints,
        isActive: customer.isActive,
        createdAt: customer.createdAt,
        createdBy: customer.createdBy || "Owner",
        tags: [],
        notes: [],
        reminders: customer.reminders || [],
      },
      financialSummary: {
        totalPurchaseAmount: totalPurchase,
        totalPaidAmount: totalPaid,
        currentOutstandingAmount: customer.pendingAmount,
        creditLimit: customer.creditLimit,
        remainingCredit: Math.max(0, customer.creditLimit - customer.pendingAmount),
        averageBillValue: avgBillVal,
        averageMonthlyPurchase: orders.length > 0 ? totalPurchase / 3 : 0, // estimate last 3 months
        totalProfitGenerated: totalProfit,
        totalReturnAmount: 0, // default placeholder returns
      },
      paymentStatus: {
        pendingAmount: customer.pendingAmount,
        riskLevel: scoreData.riskLevel,
        score: scoreData.score,
        paymentCompletionRate: totalPurchase > 0 ? (totalPaid / totalPurchase) * 100 : 100,
      },
    };
  }

  async getTimelineEvents(businessId: string, customerId: string) {
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, businessId },
    });
    if (!customer) throw new Error("Customer not found.");

    const timeline: any[] = [];

    // 1. Customer Created event
    timeline.push({
      date: customer.createdAt.toISOString().split("T")[0],
      time: customer.createdAt.toLocaleTimeString(),
      user: customer.createdBy || "System",
      amount: 0,
      description: `Customer account registered in database. Initial Code: ${customer.customerCode}`,
      type: "Customer Created",
    });

    // 2. Billing Invoices events
    const orders = await prisma.order.findMany({
      where: { customerId, businessId },
    });
    orders.forEach(o => {
      timeline.push({
        date: o.createdAt.toISOString().split("T")[0],
        time: o.createdAt.toLocaleTimeString(),
        user: "System",
        amount: o.grandTotal,
        description: `POS Bill Invoice #${o.invoiceNumber} created. Payment Method: ${o.paymentMethod}`,
        type: "Invoice Created",
      });

      if (o.paymentMethod === "Credit") {
        timeline.push({
          date: o.createdAt.toISOString().split("T")[0],
          time: o.createdAt.toLocaleTimeString(),
          user: "System",
          amount: o.grandTotal,
          description: `Credit Sale registered for Invoice #${o.invoiceNumber}`,
          type: "Credit Sale",
        });
      }
    });

    // 3. Payments events
    const payments = await prisma.customerPayment.findMany({
      where: { customerId, businessId },
    });
    payments.forEach(p => {
      timeline.push({
        date: p.createdAt.toISOString().split("T")[0],
        time: p.createdAt.toLocaleTimeString(),
        user: p.receivedBy || "System",
        amount: p.amount,
        description: `Payment of ₹${p.amount.toLocaleString()} received via ${p.paymentMethod}. Reference: ${p.referenceNo || "N/A"}`,
        type: "Payment Received",
      });
    });

    // 4. Reminders events
    const reminders = await prisma.customerReminder.findMany({
      where: { customerId, businessId },
    });
    reminders.forEach(r => {
      timeline.push({
        date: r.createdAt.toISOString().split("T")[0],
        time: r.createdAt.toLocaleTimeString(),
        user: r.createdBy || "System",
        amount: 0,
        description: `Reminder created: [${r.type}] - "${r.message}" set for due date: ${r.dueAt.toDateString()}`,
        type: "Reminder Sent",
      });
    });

    // 5. Notes events (placeholder)

    // Sort timeline chronologically (latest first)
    return timeline.sort((a, b) => new Date(b.date + " " + b.time).getTime() - new Date(a.date + " " + a.time).getTime());
  }

  async getAnalytics(businessId: string) {
    const customers = await prisma.customer.findMany({
      where: { businessId, isDeleted: false },
      include: { orders: true },
    });

    const top = [...customers].sort((a, b) => {
      const aTotal = a.orders.reduce((sum, o) => sum + o.grandTotal, 0);
      const bTotal = b.orders.reduce((sum, o) => sum + o.grandTotal, 0);
      return bTotal - aTotal;
    });

    const highRisk = customers.filter(c => c.pendingAmount > c.creditLimit * 0.8);
    const outstanding = [...customers].sort((a, b) => b.pendingAmount - a.pendingAmount);

    return {
      topCustomers: top.slice(0, 10).map(c => ({ id: c.id, name: c.name, mobile: c.mobile, totalPurchase: c.orders.reduce((sum, o) => sum + o.grandTotal, 0) })),
      highRiskCustomers: highRisk.map(c => ({ id: c.id, name: c.name, pendingAmount: c.pendingAmount, limit: c.creditLimit })),
      highestOutstanding: outstanding.slice(0, 10).map(c => ({ id: c.id, name: c.name, pendingAmount: c.pendingAmount })),
    };
  }
}
export const customerLedgerService = new CustomerLedgerService();
