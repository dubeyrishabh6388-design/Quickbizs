/**
 * Frontend Typed Contracts for Declarative Vertical Registry
 * Mirrors backend registry specifications for full compile-time type safety.
 */

export interface VerticalFieldSpec {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "boolean";
  required: boolean;
  options?: string[];
  placeholder?: string;
  section?: string;
  sectionOrder?: number;
  order?: number;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface PriceTierSpec {
  key: string;
  label: string;
  tierAliases: string[];
  fallbackKey?: string;
  description?: string;
}

export interface CustomerTypeSpec {
  key: string;
  label: string;
  defaultPriceTier?: string;
  creditAllowed?: boolean;
}

export interface DashboardCardSpec {
  id: string;
  title: string;
  type: "metric" | "table" | "chart" | "breakdown" | "list";
  gridWidth?: "full" | "half" | "third";
  signals?: string[];
}

export interface DashboardConfigSpec {
  metrics: string[];
  cards: DashboardCardSpec[];
  customerDueKeys: string[];
  lowStockFieldMap: Record<string, string>;
  brandValuationEnabled: boolean;
}

export interface InventoryBehaviorSpec {
  trackLocations: boolean;
  locationFields?: string[];
  allowPackConversion?: boolean;
  defaultPackSizeField?: string;
}

export interface PurchaseBehaviorSpec {
  supportsPackConversion: boolean;
  requireBatchOrSerial?: boolean;
  defaultUnit?: string;
}

export interface SalesBehaviorSpec {
  defaultPriceTier?: string;
  allowedPaymentMethods?: string[];
  supportsVehicleTagging?: boolean;
}

export interface ReportDefinitionSpec {
  id: string;
  title: string;
  groupingKeys: string[];
  description: string;
}

export type CategoryDepthLevel =
  | "LEVEL 1 — CONFIGURATION READY"
  | "LEVEL 2 — OPERATION READY"
  | "LEVEL 3 — PRODUCTION READY"
  | "LEVEL 4 — DOMAIN SPECIALIZED";

export interface CreditRulesSpec {
  defaultCreditLimit?: number;
  creditAllowedByDefault?: boolean;
  maxOverdueDays?: number;
  hardStopOnExceed?: boolean;
}

export interface VerticalDefinition {
  id: string;
  businessType: string;
  displayName: string;
  depthLevel?: CategoryDepthLevel;
  aliases: string[];
  enabledModules: string[];
  defaultCategories: string[];
  units: string[];
  fields: VerticalFieldSpec[];
  searchableFields: string[];
  priceTiers: PriceTierSpec[];
  customerTypes: CustomerTypeSpec[];
  creditRules?: CreditRulesSpec;
  dashboard: DashboardConfigSpec;
  inventoryBehavior: InventoryBehaviorSpec;
  purchaseBehavior: PurchaseBehaviorSpec;
  salesBehavior: SalesBehaviorSpec;
  reportDefinitions: ReportDefinitionSpec[];
  labels: Record<string, string>;
  helpText: Record<string, string>;
}

