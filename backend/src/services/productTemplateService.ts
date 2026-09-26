import { prisma } from "../config/prisma";
import { PRODUCT_SCHEMAS, DynamicProductSchema } from "../config/productTemplates";

// Memory cache dictionary for fast lookup performance (<100ms)
const templateCache: Record<string, DynamicProductSchema> = {};

export class ProductTemplateService {
  async getTemplate(businessType: string): Promise<DynamicProductSchema> {
    if (templateCache[businessType]) {
      return templateCache[businessType];
    }
    const base = PRODUCT_SCHEMAS[businessType] || PRODUCT_SCHEMAS["Custom Business"] || {
      businessType: businessType || "Grocery Store",
      categories: ["Dairy", "Snacks", "Grocery", "Drinks", "Household", "Personal Care"],
      units: ["Kg", "Gram", "Litre", "ml", "Packet", "Piece"],
      fields: [],
    };
    const defaultSchema: DynamicProductSchema = {
      ...base,
      sections: base.sections || [
        { name: "Product Specifications", fields: base.fields || [] },
      ],
    };
    templateCache[businessType] = defaultSchema;
    return defaultSchema;
  }

  async saveTemplate(businessType: string, fields: any[]): Promise<DynamicProductSchema> {
    const parsed: DynamicProductSchema = {
      businessType,
      categories: PRODUCT_SCHEMAS[businessType]?.categories || ["General"],
      units: PRODUCT_SCHEMAS[businessType]?.units || [],
      fields,
    };
    templateCache[businessType] = parsed;
    return parsed;
  }
}
export const productTemplateService = new ProductTemplateService();
