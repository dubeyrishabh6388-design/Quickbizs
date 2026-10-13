import { prisma } from "../config/prisma";
import { BUSINESS_TEMPLATES } from "../config/templates";
import { verticalRegistry } from "../registry";

export class BusinessTemplateService {
  // Predefined templates list
  getStaticTemplates() {
    return Object.entries(BUSINESS_TEMPLATES).map(([key, spec]) => ({
      businessType: spec.name || key,
      sellingStyle: "Retail Mode",
      layoutType: "grid",
      categories: spec.defaultCategories || ["General Items"],
      defaultUnit: "pcs",
      productAttributes: spec.customAttributes?.map(a => a.name) || [],
      widgets: spec.dashboardWidgets || ["Today's Sales", "Low Stock", "Top Products"],
      peakHours: [],
      combos: []
    }));
  }

  async getTemplates() {
    return this.getStaticTemplates();
  }

  async getTemplate(businessType: string) {
    if (!businessType) {
      const fallbackSpec = BUSINESS_TEMPLATES["Custom Business"];
      return {
        businessType: "Custom Business",
        sellingStyle: "Retail Mode",
        layoutType: "grid",
        categories: fallbackSpec?.defaultCategories || ["General Items"],
        defaultUnit: "pcs",
        widgets: fallbackSpec?.dashboardWidgets || ["Today's Sales", "Low Stock", "Top Products"],
        peakHours: [],
        combos: []
      };
    }

    // 1. Direct template match
    const spec = BUSINESS_TEMPLATES[businessType];
    if (spec) {
      return {
        businessType: spec.name,
        sellingStyle: "Retail Mode",
        layoutType: "grid",
        categories: spec.defaultCategories || ["General Items"],
        defaultUnit: "pcs",
        productAttributes: spec.customAttributes?.map(a => a.name),
        widgets: spec.dashboardWidgets || ["Today's Sales", "Low Stock", "Top Products"],
        peakHours: [],
        combos: []
      };
    }

    // 2. Case-insensitive template match
    const matchedKey = Object.keys(BUSINESS_TEMPLATES).find(
      k => k.toLowerCase() === businessType.toLowerCase()
    );
    if (matchedKey) {
      const foundSpec = BUSINESS_TEMPLATES[matchedKey];
      return {
        businessType: foundSpec.name,
        sellingStyle: "Retail Mode",
        layoutType: "grid",
        categories: foundSpec.defaultCategories || ["General Items"],
        defaultUnit: "pcs",
        productAttributes: foundSpec.customAttributes?.map(a => a.name),
        widgets: foundSpec.dashboardWidgets || ["Today's Sales", "Low Stock", "Top Products"],
        peakHours: [],
        combos: []
      };
    }

    // 3. Declarative Vertical Registry resolution
    const vertDef = verticalRegistry.resolve(businessType);
    if (vertDef && vertDef.id !== "GENERIC_RETAIL") {
      const categories = vertDef.defaultCategories && vertDef.defaultCategories.length > 0
        ? vertDef.defaultCategories
        : [vertDef.displayName, "General Items"];

      return {
        businessType: vertDef.displayName,
        sellingStyle: "Retail Mode",
        layoutType: "grid",
        categories,
        defaultUnit: vertDef.units?.[0] || "pcs",
        productAttributes: vertDef.fields?.filter((f: any) => !["name", "category", "price", "stock"].includes(f.name)).map((f: any) => f.label || f.name),
        widgets: vertDef.dashboard?.metrics || ["Today's Sales", "Low Stock", "Top Products"],
        peakHours: [],
        combos: []
      };
    }

    // 4. Safe Generic Custom Retail fallback (NEVER dairy or mock data)
    const fallbackSpec = BUSINESS_TEMPLATES["Custom Business"];
    return {
      businessType: businessType || "Custom Business",
      sellingStyle: "Retail Mode",
      layoutType: "grid",
      categories: fallbackSpec?.defaultCategories || ["General Items"],
      defaultUnit: "pcs",
      widgets: fallbackSpec?.dashboardWidgets || ["Today's Sales", "Low Stock", "Top Products"],
      peakHours: [],
      combos: []
    };
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
