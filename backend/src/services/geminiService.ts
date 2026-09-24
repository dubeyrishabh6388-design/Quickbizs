import { logger } from "../utils/logger";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

export interface StoreContextSnapshot {
  storeName?: string;
  businessType?: string;
  todaySales?: number;
  ordersCount?: number;
  paymentBreakdown?: { cash?: number; upi?: number; credit?: number };
  lowStockItems?: Array<{ name: string; stock: number; minStock: number; price?: number; supplierName?: string }>;
  topUdhaarCustomers?: Array<{ name: string; phone?: string; pendingDues: number }>;
  totalOutstandingUdhaar?: number;
  totalSuppliersDue?: number;
  staffAttendance?: { total: number; present: number; absent: string[] };
  recentExpenses?: Array<{ title: string; amount: number; category?: string }>;
  totalExpenses?: number;
}

export class GeminiService {
  /**
   * Main method to chat with Gemini AI with live store database snapshot
   */
  public static async askStoreAI(query: string, context?: StoreContextSnapshot): Promise<string> {
    try {
      const systemInstruction = `You are QuickBizs AI Business Partner & Store Copilot for Indian retail & wholesale merchants (Kirana, Supermarkets, Garments, Electronics, Pharmacy, etc.).
You have full real-time visibility into the merchant's store database.
Your mission is to:
1. Answer merchant questions accurately using their LIVE STORE DATA. Quote exact numbers, amounts in Indian Rupees (₹), quantities, customer names, and staff names.
2. Provide practical, high-value Indian retail business advice (e.g. collecting Udhaar politely via WhatsApp, avoiding stockouts on peak footfall days, optimizing staff shifts, and controlling expenses).
3. If the merchant asks in English, Hindi, or Hinglish, reply in an accessible, professional, yet warm tone (using respectful terms like Ji where appropriate).
4. Format your response cleanly using Markdown with clear bold key metrics, bullet points, and an actionable "💡 Business Action" section.`;

      const promptData = `
LIVE STORE DATABASE SNAPSHOT:
- Shop Name: ${context?.storeName || "QuickBizs Merchant Store"}
- Business Category: ${context?.businessType || "Retail & Wholesale Store"}
- Today's Sales Revenue: ₹${(context?.todaySales || 0).toLocaleString()} across ${context?.ordersCount || 0} bills/orders
- Payment Breakdown: Cash: ₹${(context?.paymentBreakdown?.cash || 0).toLocaleString()} | UPI: ₹${(context?.paymentBreakdown?.upi || 0).toLocaleString()} | Udhaar (Credit): ₹${(context?.paymentBreakdown?.credit || 0).toLocaleString()}
- Total Customer Udhaar (Khata Ledger): ₹${(context?.totalOutstandingUdhaar || 0).toLocaleString()}
- Top Pending Udhaar Customers: ${
        context?.topUdhaarCustomers && context.topUdhaarCustomers.length > 0
          ? context.topUdhaarCustomers.map(c => `${c.name} (₹${c.pendingDues.toLocaleString()}${c.phone ? `, Mob: ${c.phone}` : ""})`).join("; ")
          : "None (All Khata accounts cleared)"
      }
- Low Stock Alerts (${context?.lowStockItems?.length || 0} items below minimum): ${
        context?.lowStockItems && context.lowStockItems.length > 0
          ? context.lowStockItems.map(p => `${p.name} (Stock: ${p.stock}, Min Required: ${p.minStock}${p.supplierName ? `, Supplier: ${p.supplierName}` : ""})`).join("; ")
          : "All product shelves are healthy"
      }
- Total Payable Supplier Dues: ₹${(context?.totalSuppliersDue || 0).toLocaleString()}
- Staff Attendance Today: ${context?.staffAttendance?.present || 0}/${context?.staffAttendance?.total || 0} present. Absent staff: ${
        context?.staffAttendance?.absent && context.staffAttendance.absent.length > 0
          ? context.staffAttendance.absent.join(", ")
          : "None (Full team present)"
      }
- Store Expenses: ₹${(context?.totalExpenses || 0).toLocaleString()} logged

MERCHANT QUESTION:
${query}
`;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: `${systemInstruction}\n\n${promptData}` }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.warn(`Gemini API returned status ${response.status}: ${errorText}`);
        return this.getLocalFallbackResponse(query, context);
      }

      const data = (await response.json()) as any;
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (aiText && aiText.trim()) {
        return aiText.trim();
      }

      return this.getLocalFallbackResponse(query, context);
    } catch (err: any) {
      logger.error("Error communicating with Gemini AI API:", err);
      return this.getLocalFallbackResponse(query, context);
    }
  }

  /**
   * Generates next-day store forecast and recommendations
   */
  public static async getStoreForecast(context?: StoreContextSnapshot): Promise<{
    demandPrediction: string;
    rosterSuggestion: string;
    cashflowAdvice: string;
  }> {
    try {
      const prompt = `Based on this store data:
Sales: ₹${context?.todaySales || 0}, Orders: ${context?.ordersCount || 0}, Low stock items: ${context?.lowStockItems?.length || 0}, Outstanding Udhaar: ₹${context?.totalOutstandingUdhaar || 0}, Absent staff: ${context?.staffAttendance?.absent?.join(", ") || "None"}.
Provide a brief 3-part JSON forecast for tomorrow:
{
  "demandPrediction": "1-2 sentence demand prediction based on daily footfall and low stock items",
  "rosterSuggestion": "1-2 sentence staff scheduling recommendation considering today's attendance",
  "cashflowAdvice": "1-2 sentence advice on Udhaar recovery and supplier dues"
}`;

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (e: any) {
      logger.warn(`Could not generate forecast from Gemini, using heuristic forecast: ${e?.message || e}`);
    }

    // Heuristic forecast fallback
    const lowCount = context?.lowStockItems?.length || 0;
    const udhaarTotal = context?.totalOutstandingUdhaar || 0;
    const absentStaff = context?.staffAttendance?.absent || [];

    return {
      demandPrediction: lowCount > 0
        ? `Tomorrow's demand is expected to peak during morning hours. ${lowCount} critical item(s) are low on stock and need reordering.`
        : "Store inventory is in healthy standing for tomorrow's regular trade volume.",
      rosterSuggestion: absentStaff.length > 0
        ? `Staff member ${absentStaff.join(", ")} was marked absent today. Assign backup cashier/helper duties early tomorrow.`
        : "All staff members are on schedule. Cashier and counter stations will run at full capacity.",
      cashflowAdvice: udhaarTotal > 0
        ? `You have ₹${udhaarTotal.toLocaleString()} pending in Khata credit. Collecting 20-30% will strengthen supplier cash flow.`
        : "Khata accounts are well-managed with minimal pending customer credit."
    };
  }

  /**
   * Resilient fallback heuristic analysis if API key is exhausted or offline
   */
  private static getLocalFallbackResponse(query: string, context?: StoreContextSnapshot): string {
    const q = query.toLowerCase();
    const sales = context?.todaySales || 0;
    const orders = context?.ordersCount || 0;
    const udhaar = context?.totalOutstandingUdhaar || 0;
    const lowStock = context?.lowStockItems || [];
    const absent = context?.staffAttendance?.absent || [];

    if (q.includes("sale") || q.includes("revenue") || q.includes("earning") || q.includes("profit") || q.includes("aaj")) {
      return `### 📊 Today's Sales Analysis for ${context?.storeName || "Your Store"}
- **Total Revenue:** ₹${sales.toLocaleString()}
- **Completed Bills:** ${orders} transactions
- **Payment Split:** Cash: ₹${(context?.paymentBreakdown?.cash || 0).toLocaleString()} | UPI: ₹${(context?.paymentBreakdown?.upi || 0).toLocaleString()} | Udhaar: ₹${(context?.paymentBreakdown?.credit || 0).toLocaleString()}

💡 **Business Insight:** Your digital UPI vs Cash balance indicates healthy liquidity. If total sales exceed yesterday's benchmarks, replenish fast-moving categories before evening rush hours.`;
    }

    if (q.includes("stock") || q.includes("inventory") || q.includes("reorder") || q.includes("item") || q.includes("product")) {
      if (lowStock.length > 0) {
        return `### 📦 Inventory & Reorder Recommendations
You have **${lowStock.length} product(s)** running critically below minimum shelf levels:

${lowStock.map((p, idx) => `${idx + 1}. **${p.name}** — Stock: ${p.stock} units *(Min: ${p.minStock})*${p.supplierName ? ` | Supplier: ${p.supplierName}` : ""}`).join("\n")}

💡 **Business Action:** Create a consolidated Purchase Order for these items now to avoid customer walkouts during morning rush hours.`;
      }
      return `### 📦 Inventory Status
All your products are currently well-stocked above their minimum safety thresholds. No emergency Purchase Orders required today!`;
    }

    if (q.includes("udhaar") || q.includes("khata") || q.includes("customer") || q.includes("credit") || q.includes("dues")) {
      return `### 📒 Customer Udhaar (Khata) Overview
- **Total Outstanding Udhaar:** ₹${udhaar.toLocaleString()}
- **Top Pending Accounts:**
${
  context?.topUdhaarCustomers && context.topUdhaarCustomers.length > 0
    ? context.topUdhaarCustomers.map((c, i) => `${i + 1}. **${c.name}**: ₹${c.pendingDues.toLocaleString()}${c.phone ? ` *(Ph: ${c.phone})*` : ""}`).join("\n")
    : "No pending customer dues recorded."
}

💡 **Actionable Tip:** Send friendly WhatsApp payment reminders to accounts over ₹1,000 to maintain smooth distributor payment cycles.`;
    }

    if (q.includes("staff") || q.includes("attendance") || q.includes("employee") || q.includes("absent") || q.includes("shift")) {
      return `### 👥 Staff Attendance & Shift Status
- **Today's Attendance:** ${context?.staffAttendance?.present || 0} of ${context?.staffAttendance?.total || 0} staff members present
- **Absent Personnel:** ${absent.length > 0 ? absent.join(", ") : "None — 100% staff present"}

💡 **Scheduling Tip:** ${absent.length > 0 ? `Assign helper responsibilities to backup staff for ${absent.join(", ")}'s station.` : "All billing stations and floor helpers are active."}`;
    }

    return `### 🤖 QuickBizs Store Partner Summary
Here is your current store status:
- **Today's Revenue:** ₹${sales.toLocaleString()} (${orders} bills)
- **Pending Customer Udhaar:** ₹${udhaar.toLocaleString()}
- **Low Stock Alerts:** ${lowStock.length} items
- **Staff On Duty:** ${context?.staffAttendance?.present || 0}/${context?.staffAttendance?.total || 0}

Feel free to ask me anything specific: *"Which items should I reorder?"*, *"Who owes the most Udhaar?"*, or *"How can I increase profits?"*`;
  }
}
