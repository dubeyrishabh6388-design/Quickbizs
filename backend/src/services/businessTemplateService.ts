import { prisma } from "../config/prisma";

export class BusinessTemplateService {
  // Predefined templates list
  getStaticTemplates() {
    return [
      {
        businessType: "Dairy Shop",
        sellingStyle: "Counter Mode",
        layoutType: "tiles", // Large product tiles
        categories: ["Milk", "Paneer", "Curd", "Butter", "Ghee", "Chocolate", "Cold Drinks"],
        defaultUnit: "kg",
        widgets: ["Milk Sales", "Peak Hours", "Low Stock"],
        peakHours: [
          { start: 6, end: 10, desc: "Morning milk rush" },
          { start: 17, end: 21, desc: "Evening dairy purchase" },
        ],
        combos: [
          { name: "Milk + Bread combo", price: 90, ids: [] },
          { name: "Paneer + Curd combo", price: 150, ids: [] },
        ]
      },
      {
        businessType: "Kirana Store",
        sellingStyle: "Counter Mode",
        layoutType: "tiles",
        categories: ["Rice", "Flour", "Oil", "Snacks", "Biscuits", "Beverages", "Household"],
        defaultUnit: "pcs",
        widgets: ["Gross Sales", "Recent Orders", "Low Stock"],
        peakHours: [
          { start: 8, end: 12, desc: "Morning grocery pick" },
          { start: 16, end: 20, desc: "Evening rush" },
        ],
        combos: []
      },
      {
        businessType: "Clothing Store",
        sellingStyle: "Retail Mode",
        layoutType: "categories", // Category-first layout
        categories: ["Men", "Women", "Kids", "Accessories"],
        defaultUnit: "pcs",
        productAttributes: ["Size", "Color", "Fabric", "Brand"],
        widgets: ["Top Brands", "Size Analytics"],
        peakHours: [
          { start: 11, end: 21, desc: "Regular showroom hours" },
        ],
        combos: []
      },
      {
        businessType: "Medical Store",
        sellingStyle: "Retail Mode",
        layoutType: "search", // Medicine search first
        categories: ["Tablets", "Syrups", "Creams", "Injections"],
        defaultUnit: "pcs",
        productAttributes: ["Batch Number", "Expiry Date", "Manufacturer", "Prescription"],
        widgets: ["Expiry Alerts", "Fast Selling Medicines"],
        peakHours: [
          { start: 9, end: 13, desc: "Morning patients flow" },
          { start: 17, end: 21, desc: "Evening clinic flow" },
        ],
        combos: []
      },
      {
        businessType: "Restaurant",
        sellingStyle: "Retail Mode",
        layoutType: "tables", // Table-first layout
        categories: ["Starters", "Main Course", "Drinks", "Desserts"],
        defaultUnit: "pcs",
        widgets: ["Table Occupancy", "Kitchen Queue", "Orders"],
        peakHours: [
          { start: 12, end: 15, desc: "Lunch rush" },
          { start: 19, end: 23, desc: "Dinner rush" },
        ],
        combos: []
      }
    ];
  }

  async getTemplates() {
    return this.getStaticTemplates();
  }

  async getTemplate(businessType: string) {
    const list = this.getStaticTemplates();
    return list.find((t) => t.businessType.toLowerCase() === businessType.toLowerCase()) || list[0];
  }

  async applyTemplate(
    businessId: string,
    businessType: string,
    sellingStyle: string,
    shopSize: string
  ) {
    const template = await this.getTemplate(businessType);

    // 1. Update/Upsert Business Preference (Step 6)
    await prisma.businessPreference.upsert({
      where: { businessId },
      update: {
        businessType,
        businessSize: shopSize,
        visibleModules: JSON.stringify(template.categories),
        dashboardLayout: JSON.stringify(template.widgets),
        productAttributes: template.productAttributes ? JSON.stringify(template.productAttributes) : null,
      },
      create: {
        businessId,
        businessType,
        businessSize: shopSize,
        visibleModules: JSON.stringify(template.categories),
        dashboardLayout: JSON.stringify(template.widgets),
        productAttributes: template.productAttributes ? JSON.stringify(template.productAttributes) : null,
      },
    });

    // 2. Update Counter Preference
    await prisma.counterPreference.upsert({
      where: { businessId },
      update: {
        rushMode: false,
        sellingMode: sellingStyle,
      },
      create: {
        businessId,
        rushMode: false,
        sellingMode: sellingStyle,
      },
    });

    return {
      success: true,
      message: `Setup engine configured shop for "${businessType}" successfully.`,
      config: template,
    };
  }

  async customizeTemplate(businessId: string, data: { categories?: string[]; widgets?: string[] }) {
    if (data.categories || data.widgets) {
      const pref = await prisma.businessPreference.findUnique({
        where: { businessId },
      });

      if (pref) {
        await prisma.businessPreference.update({
          where: { businessId },
          data: {
            visibleModules: data.categories ? JSON.stringify(data.categories) : pref.visibleModules,
            dashboardLayout: data.widgets ? JSON.stringify(data.widgets) : pref.dashboardLayout,
          },
        });
      }
    }
    return { success: true, message: "Customization preferences saved successfully." };
  }
}
