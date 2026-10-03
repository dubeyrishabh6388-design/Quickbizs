/**
 * Central Declarative Vertical Registry
 * 
 * Centralizes all category-specific configuration, schemas, searchable fields,
 * price tiers, customer types, dashboard signals, and inventory/purchase behavior.
 * 
 * Architectural rule: NEW CATEGORY = CONFIGURATION ONLY.
 * Zero database schema modifications.
 */

import {
  VerticalDefinition,
  VerticalFieldSpec,
  PriceTierSpec,
  CustomerTypeSpec,
  DashboardCardSpec,
  DashboardConfigSpec,
  InventoryBehaviorSpec,
  PurchaseBehaviorSpec,
  SalesBehaviorSpec,
  ReportDefinitionSpec
} from "./types";

import {
  AUTO_PARTS_VERTICAL,
  ELECTRICAL_VERTICAL,
  HARDWARE_VERTICAL,
  GENERIC_RETAIL_VERTICAL
} from "./verticals/core";

import {
  GROCERY_VERTICAL,
  DAIRY_VERTICAL,
  BAKERY_VERTICAL,
  SWEET_SHOP_VERTICAL,
  STATIONERY_VERTICAL,
  BOOKSTORE_VERTICAL,
  COSMETICS_VERTICAL,
  PAAN_CONVENIENCE_VERTICAL
} from "./verticals/generalRetail";

import {
  CLOTHING_VERTICAL,
  FOOTWEAR_VERTICAL,
  MOBILE_VERTICAL,
  ELECTRONICS_VERTICAL,
  FURNITURE_VERTICAL,
  OPTICAL_VERTICAL,
  JEWELLERY_VERTICAL,
  PHARMACY_VERTICAL
} from "./verticals/variantRetail";

import {
  WHOLESALE_VERTICAL,
  DISTRIBUTOR_VERTICAL,
  FMCG_DISTRIBUTOR_VERTICAL,
  DEALER_VERTICAL,
  PLUMBING_VERTICAL,
  SANITARY_VERTICAL,
  TOOLS_VERTICAL,
  BUILDING_MATERIAL_VERTICAL,
  TIMBER_VERTICAL
} from "./verticals/trade";

// Re-export types
export * from "./types";

// Re-export core verticals
export * from "./verticals/core";

// Re-export general retail verticals (Phase 5A)
export * from "./verticals/generalRetail";

// Re-export variant retail verticals (Phase 5B)
export * from "./verticals/variantRetail";

// Re-export trade verticals (Phase 5C)
export * from "./verticals/trade";

const DEFAULT_DEPTH_LEVELS: Record<string, import("./types").CategoryDepthLevel> = {
  AUTO_PARTS: "LEVEL 4 — DOMAIN SPECIALIZED",
  WHOLESALE: "LEVEL 4 — DOMAIN SPECIALIZED",
  DISTRIBUTOR: "LEVEL 4 — DOMAIN SPECIALIZED",
  FMCG_DISTRIBUTOR: "LEVEL 4 — DOMAIN SPECIALIZED",

  ELECTRICAL: "LEVEL 3 — PRODUCTION READY",
  HARDWARE: "LEVEL 3 — PRODUCTION READY",
  GROCERY: "LEVEL 3 — PRODUCTION READY",
  CLOTHING: "LEVEL 3 — PRODUCTION READY",
  MOBILE: "LEVEL 3 — PRODUCTION READY",
  ELECTRONICS: "LEVEL 3 — PRODUCTION READY",
  PLUMBING: "LEVEL 3 — PRODUCTION READY",
  SANITARY: "LEVEL 3 — PRODUCTION READY",
  TOOLS: "LEVEL 3 — PRODUCTION READY",
  BUILDING_MATERIAL: "LEVEL 3 — PRODUCTION READY",
  TIMBER: "LEVEL 3 — PRODUCTION READY",
  FURNITURE: "LEVEL 3 — PRODUCTION READY",
  PHARMACY: "LEVEL 3 — PRODUCTION READY",

  DAIRY: "LEVEL 2 — OPERATION READY",
  BAKERY: "LEVEL 2 — OPERATION READY",
  SWEET_SHOP: "LEVEL 2 — OPERATION READY",
  STATIONERY: "LEVEL 2 — OPERATION READY",
  BOOKSTORE: "LEVEL 2 — OPERATION READY",
  COSMETICS: "LEVEL 2 — OPERATION READY",
  FOOTWEAR: "LEVEL 2 — OPERATION READY",
  OPTICAL: "LEVEL 2 — OPERATION READY",
  JEWELLERY: "LEVEL 2 — OPERATION READY",
  DEALER: "LEVEL 2 — OPERATION READY",

  PAAN_CONVENIENCE: "LEVEL 1 — CONFIGURATION READY",
  GENERIC_RETAIL: "LEVEL 1 — CONFIGURATION READY",
};

const DEFAULT_CREDIT_RULES: Record<string, import("./types").CreditRulesSpec> = {
  AUTO_PARTS: { defaultCreditLimit: 50000, creditAllowedByDefault: true, maxOverdueDays: 45, hardStopOnExceed: true },
  WHOLESALE: { defaultCreditLimit: 200000, creditAllowedByDefault: true, maxOverdueDays: 30, hardStopOnExceed: true },
  DISTRIBUTOR: { defaultCreditLimit: 150000, creditAllowedByDefault: true, maxOverdueDays: 30, hardStopOnExceed: true },
  FMCG_DISTRIBUTOR: { defaultCreditLimit: 250000, creditAllowedByDefault: true, maxOverdueDays: 21, hardStopOnExceed: true },
  BUILDING_MATERIAL: { defaultCreditLimit: 100000, creditAllowedByDefault: true, maxOverdueDays: 30, hardStopOnExceed: true },
  TIMBER: { defaultCreditLimit: 75000, creditAllowedByDefault: true, maxOverdueDays: 30, hardStopOnExceed: true },
  ELECTRICAL: { defaultCreditLimit: 30000, creditAllowedByDefault: true, maxOverdueDays: 30, hardStopOnExceed: true },
  HARDWARE: { defaultCreditLimit: 40000, creditAllowedByDefault: true, maxOverdueDays: 30, hardStopOnExceed: true },
  PLUMBING: { defaultCreditLimit: 35000, creditAllowedByDefault: true, maxOverdueDays: 30, hardStopOnExceed: true },
  SANITARY: { defaultCreditLimit: 50000, creditAllowedByDefault: true, maxOverdueDays: 30, hardStopOnExceed: true },
  TOOLS: { defaultCreditLimit: 30000, creditAllowedByDefault: true, maxOverdueDays: 30, hardStopOnExceed: true },
  GROCERY: { defaultCreditLimit: 10000, creditAllowedByDefault: false, maxOverdueDays: 30, hardStopOnExceed: false },
};

// ============================================================================
// CENTRAL VERTICAL REGISTRY CLASS
// ============================================================================

export class VerticalRegistry {
  private verticals: Map<string, VerticalDefinition> = new Map();
  private aliasMap: Map<string, string> = new Map();

  constructor() {
    // 1. Core Verticals
    this.register(AUTO_PARTS_VERTICAL);
    this.register(ELECTRICAL_VERTICAL);
    this.register(HARDWARE_VERTICAL);
    this.register(GENERIC_RETAIL_VERTICAL);

    // 2. Phase 5A: General Retail Verticals
    this.register(GROCERY_VERTICAL);
    this.register(DAIRY_VERTICAL);
    this.register(BAKERY_VERTICAL);
    this.register(SWEET_SHOP_VERTICAL);
    this.register(STATIONERY_VERTICAL);
    this.register(BOOKSTORE_VERTICAL);
    this.register(COSMETICS_VERTICAL);
    this.register(PAAN_CONVENIENCE_VERTICAL);

    // 3. Phase 5B: Product / Variant Retail Verticals
    this.register(CLOTHING_VERTICAL);
    this.register(FOOTWEAR_VERTICAL);
    this.register(MOBILE_VERTICAL);
    this.register(ELECTRONICS_VERTICAL);
    this.register(FURNITURE_VERTICAL);
    this.register(OPTICAL_VERTICAL);
    this.register(JEWELLERY_VERTICAL);
    this.register(PHARMACY_VERTICAL);

    // 4. Phase 5C: Trade & Distribution Verticals
    this.register(WHOLESALE_VERTICAL);
    this.register(DISTRIBUTOR_VERTICAL);
    this.register(FMCG_DISTRIBUTOR_VERTICAL);
    this.register(DEALER_VERTICAL);
    this.register(PLUMBING_VERTICAL);
    this.register(SANITARY_VERTICAL);
    this.register(TOOLS_VERTICAL);
    this.register(BUILDING_MATERIAL_VERTICAL);
    this.register(TIMBER_VERTICAL);
  }

  /**
   * Register a new vertical definition.
   */
  public register(vertical: VerticalDefinition): void {
    if (!vertical.depthLevel) {
      vertical.depthLevel = DEFAULT_DEPTH_LEVELS[vertical.id] || "LEVEL 2 — OPERATION READY";
    }
    if (!vertical.creditRules) {
      vertical.creditRules = DEFAULT_CREDIT_RULES[vertical.id] || {
        defaultCreditLimit: 10000,
        creditAllowedByDefault: false,
        maxOverdueDays: 30,
        hardStopOnExceed: false,
      };
    }

    this.verticals.set(vertical.id, vertical);
    this.verticals.set(vertical.businessType.toLowerCase(), vertical);
    this.verticals.set(vertical.displayName.toLowerCase(), vertical);

    for (const alias of vertical.aliases) {
      this.aliasMap.set(alias.toLowerCase(), vertical.id);
    }
  }

  /**
   * Unregister a vertical (useful for test isolation).
   */
  public unregister(id: string): void {
    const vertical = this.verticals.get(id);
    if (!vertical) return;

    this.verticals.delete(vertical.id);
    this.verticals.delete(vertical.businessType.toLowerCase());
    this.verticals.delete(vertical.displayName.toLowerCase());

    for (const alias of vertical.aliases) {
      this.aliasMap.delete(alias.toLowerCase());
    }
  }

  /**
   * Resolve any input rawType, businessType, or vertical ID to its canonical VerticalDefinition.
   */
  public resolve(rawType?: string | null): VerticalDefinition {
    if (!rawType) return GENERIC_RETAIL_VERTICAL;

    const trimmed = rawType.trim();
    const lower = trimmed.toLowerCase();

    // 1. Direct ID match (e.g. "AUTO_PARTS")
    if (this.verticals.has(trimmed)) {
      return this.verticals.get(trimmed)!;
    }

    // 2. Exact match in lower-cased vertical map
    if (this.verticals.has(lower)) {
      return this.verticals.get(lower)!;
    }

    // 3. Exact alias lookup
    if (this.aliasMap.has(lower)) {
      const id = this.aliasMap.get(lower)!;
      return this.verticals.get(id)!;
    }

    // 4. Substring / partial alias match
    for (const [alias, id] of this.aliasMap.entries()) {
      if (lower.includes(alias) || alias.includes(lower)) {
        return this.verticals.get(id)!;
      }
    }

    // 5. Fallback to Generic Retail
    return GENERIC_RETAIL_VERTICAL;
  }

  /**
   * Convert vertical definition to dynamic form config for product creation UI.
   */
  public toFormConfig(vertical: VerticalDefinition): { businessType: string; sections: any[] } {
    const sectionMap = new Map<string, { order: number; fields: any[] }>();

    for (const field of vertical.fields) {
      const secName = field.section || "Basic Details";
      const secOrder = field.sectionOrder || 1;
      if (!sectionMap.has(secName)) {
        sectionMap.set(secName, { order: secOrder, fields: [] });
      }
      sectionMap.get(secName)!.fields.push({
        name: field.name,
        label: field.label,
        type: field.type,
        required: field.required,
        options: field.options,
        placeholder: field.placeholder,
      });
    }

    const sections = Array.from(sectionMap.entries())
      .map(([name, data]) => ({ name, order: data.order, fields: data.fields }))
      .sort((a, b) => a.order - b.order);

    return {
      businessType: vertical.businessType,
      sections,
    };
  }

  /**
   * Dynamically resolve customer tier price using the vertical's declared price tiers.
   * Uses relevance scoring (direct price key match, alias specificity length, direct price > fallback).
   */
  public resolveTierPrice(requestedLevel: string, customFields: any): number {
    if (!requestedLevel || !customFields) return 0;
    const req = requestedLevel.toLowerCase().trim();
    const cleanReq = req.replace(/[-_ ]/g, "");

    // Standard retail customers pay base product.price unless an explicit retailPrice is specified
    if (cleanReq === "retail" || cleanReq === "retailcustomer" || cleanReq === "walkin") {
      return Number(customFields.retailPrice) || 0;
    }

    interface CandidateTier {
      price: number;
      score: number;
    }

    const candidates: CandidateTier[] = [];

    // Search across all registered verticals for matching tier specs
    for (const vertical of this.list()) {
      for (const tier of vertical.priceTiers) {
        const cleanKey = tier.key.toLowerCase().replace(/price/i, "");
        let longestMatchingAliasLength = 0;

        for (const alias of tier.tierAliases) {
          const cleanAlias = alias.toLowerCase().replace(/[-_ ]/g, "");
          if (cleanReq.includes(cleanAlias) || cleanAlias.includes(cleanReq)) {
            if (cleanAlias.length > longestMatchingAliasLength) {
              longestMatchingAliasLength = cleanAlias.length;
            }
          }
        }

        if (cleanReq.includes(cleanKey) && cleanKey.length > longestMatchingAliasLength) {
          longestMatchingAliasLength = cleanKey.length;
        }

        if (longestMatchingAliasLength > 0) {
          const directPrice = Number(customFields[tier.key]);
          const fallbackPrice = tier.fallbackKey ? Number(customFields[tier.fallbackKey]) : 0;

          if (directPrice > 0) {
            let score = longestMatchingAliasLength * 10 + 100;
            if (cleanReq.includes(cleanKey)) {
              score += 50;
            }
            candidates.push({ price: directPrice, score });
          } else if (fallbackPrice > 0) {
            let score = longestMatchingAliasLength * 10 + 20;
            candidates.push({ price: fallbackPrice, score });
          }
        }
      }
    }

    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      return candidates[0].price;
    }

    // General fallback for wholesale
    if (cleanReq.includes("wholesale") && customFields.wholesalePrice) {
      return Number(customFields.wholesalePrice) || 0;
    }

    return 0;
  }

  /**
   * List all registered canonical verticals.
   */
  public list(): VerticalDefinition[] {
    const unique = new Set<VerticalDefinition>();
    for (const v of this.verticals.values()) {
      unique.add(v);
    }
    return Array.from(unique);
  }

  /**
   * Check if a given businessType belongs to a specific vertical.
   */
  public isVertical(rawType: string, verticalId: string): boolean {
    const resolved = this.resolve(rawType);
    return resolved.id === verticalId;
  }
}

export const verticalRegistry = new VerticalRegistry();
