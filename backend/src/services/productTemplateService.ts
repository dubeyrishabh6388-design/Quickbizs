import { prisma } from "../config/prisma";
import { PRODUCT_SCHEMAS, DynamicProductSchema } from "../config/productTemplates";
import { verticalRegistry } from "../registry";

// Memory cache dictionary for fast lookup performance (<100ms)
const templateCache: Record<string, DynamicProductSchema> = {};

const ALIAS_MAP: Record<string, string> = {
  "auto parts": "Automobile Shop",
  "automobile": "Automobile Shop",
  "automobile shop": "Automobile Shop",
  "auto parts & trade": "Automobile Shop",
  "electrical": "Electrical Store",
  "electrical store": "Electrical Store",
  "hardware": "Hardware Store",
  "hardware store": "Hardware Store",
  "pharmacy": "Pharmacy",
  "pharmacy shop": "Pharmacy",
  "medical store": "Pharmacy",
  "clothing": "Clothing Store",
  "clothing store": "Clothing Store",
  "apparel": "Clothing Store",
  "grocery": "Grocery Store",
  "grocery store": "Grocery Store",
  "supermarket": "Grocery Store",
  "kirana": "Grocery Store",
  "wholesale": "Wholesale Business",
  "wholesale business": "Wholesale Business",
  "footwear": "Footwear Shop",
  "footwear shop": "Footwear Shop",
  "electronics": "Electronics Store",
  "electronics store": "Electronics Store",
  "custom business": "Custom Business",
  "retail store": "Custom Business"
};

export class ProductTemplateService {
  async getTemplate(businessType: string): Promise<DynamicProductSchema> {
    const rawKey = (businessType || "").trim();
    const vertical = verticalRegistry.resolve(rawKey);

    if (vertical && vertical.id !== "GENERIC_RETAIL") {
      // Group fields into ordered sections according to vertical specifications
      const sectionMap = new Map<string, typeof vertical.fields>();
      const sectionOrders = new Map<string, number>();

      for (const field of vertical.fields) {
        const secName = field.section || `${vertical.displayName} Details`;
        if (!sectionMap.has(secName)) {
          sectionMap.set(secName, []);
          sectionOrders.set(secName, field.sectionOrder || 1);
        }
        sectionMap.get(secName)!.push(field);
      }

      const sortedSections = Array.from(sectionMap.entries())
        .sort((a, b) => (sectionOrders.get(a[0]) || 0) - (sectionOrders.get(b[0]) || 0))
        .map(([secName, secFields]) => ({
          name: secName,
          fields: secFields.map(f => ({
            name: f.name,
            label: f.label,
            type: f.type,
            required: f.required,
            options: f.options,
            placeholder: f.placeholder,
          })),
        }));

      const verticalSchema: DynamicProductSchema = {
        businessType: vertical.businessType,
        verticalId: vertical.id,
        displayName: vertical.displayName,
        depthLevel: vertical.depthLevel,
        categories: vertical.defaultCategories,
        units: vertical.units,
        priceTiers: vertical.priceTiers,
        customerTypes: vertical.customerTypes,
        creditRules: vertical.creditRules,
        searchableFields: vertical.searchableFields,
        inventoryBehavior: vertical.inventoryBehavior,
        labels: vertical.labels,
        helpText: vertical.helpText,
        fields: vertical.fields.map(f => ({
          name: f.name,
          label: f.label,
          type: f.type,
          required: f.required,
          options: f.options,
          placeholder: f.placeholder,
        })),
        sections: sortedSections,
      };
      return verticalSchema;
    }

    const normalizedKey = ALIAS_MAP[rawKey.toLowerCase()] || rawKey;

    if (templateCache[normalizedKey]) {
      return templateCache[normalizedKey];
    }
    const base = PRODUCT_SCHEMAS[normalizedKey] || PRODUCT_SCHEMAS["Custom Business"] || {
      businessType: normalizedKey || "Custom Business",
      categories: ["General Items", "Fast Moving"],
      units: ["Piece", "Box", "Kg", "Packet"],
      fields: [],
    };
    const defaultSchema: DynamicProductSchema = {
      ...base,
      sections: base.sections || [
        { name: "Product Specifications", fields: base.fields || [] },
      ],
    };
    templateCache[normalizedKey] = defaultSchema;
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
