import { prisma } from "../config/prisma";
import { notificationService } from "./notificationService";
import { customerLedgerRepository } from "../repositories/customerLedgerRepository";

export class CustomerCreditEngine {
  async calculateHealthScore(businessId: string, customerId: string) {
    // 1. Fetch customer details
    const customer = await prisma.customer.findFirst({
      where: { id: customerId, businessId },
      include: { orders: { include: { items: true } } },
    });

    if (!customer) return { score: 50, riskLevel: "Average" };

    const limit = customer.creditLimit || 10000;
    const outstanding = customer.pendingAmount || 0;

    let score = 75; // Baseline score
    
    // Penalty 1: Credit utilization ratio
    const utilization = outstanding / limit;
    if (utilization >= 0.9) {
      score -= 30;
      // Trigger limit notifications on-the-fly
      await notificationService.createNotification({
        businessId,
        title: "Credit Limit Alert",
        message: `Customer ${customer.name} has crossed 90% of their credit limit. Outstanding: ₹${outstanding.toLocaleString()}`,
        type: "Warning",
        priority: "High",
        module: "Customers",
        referenceType: "Customer",
        referenceId: customerId,
      });
    } else if (utilization >= 0.7) {
      score -= 15;
    } else if (utilization > 0) {
      score -= 5;
    }

    // Boost 1: Frequency & Volume
    const ordersCount = customer.orders.length;
    if (ordersCount > 15) score += 15;
    else if (ordersCount > 5) score += 8;

    // Penalty 2: Delay and Overdues
    if (outstanding > 15000) {
      score -= 10;
      await notificationService.createNotification({
        businessId,
        title: "Large Dues Warning",
        message: `Customer ${customer.name} has ₹${outstanding.toLocaleString()} outstanding dues.`,
        type: "Warning",
        priority: "Medium",
        module: "Customers",
        referenceType: "Customer",
        referenceId: customerId,
      });
    }

    // Bound limits
    score = Math.max(0, Math.min(100, score));

    // Map to Risk level label
    let riskLevel = "Average";
    if (score >= 85) riskLevel = "Excellent";
    else if (score >= 70) riskLevel = "Good";
    else if (score >= 50) riskLevel = "Average";
    else if (score >= 30) riskLevel = "Risky";
    else riskLevel = "Critical";

    // Persist calculation log history
    await customerLedgerRepository.writeCreditScore(businessId, customerId, {
      score,
      riskLevel,
      limit,
      reason: `Automated engine evaluation: outstanding amount ₹${outstanding.toLocaleString()}`,
    });

    return { score, riskLevel };
  }
}
export const customerCreditEngine = new CustomerCreditEngine();
