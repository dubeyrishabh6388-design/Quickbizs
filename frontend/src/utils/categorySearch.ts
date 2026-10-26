/**
 * Category-Aware Search & Metadata Utilities
 * Provides declarative search placeholders and category-specific attribute badges
 * directly derived from the Vertical Registry configuration.
 */

import { getCategoryFormConfig } from "./categoryFormConfig";

export interface AttributeBadge {
  key: string;
  label: string;
  value: string;
  colorClass: string;
}

/**
 * Returns a human-friendly search placeholder based on the active vertical definition.
 * Falls back safely to standard retail search for legacy or unconfigured businesses.
 */
export function getCategorySearchPlaceholder(productSchema?: any): string {
  if (!productSchema) {
    return "Search product by name, brand or barcode...";
  }

  const formConfig = getCategoryFormConfig(productSchema);
  return formConfig.searchPlaceholder;
}

/**
 * Extracts category-relevant attribute badges from product customFields
 * matching the active vertical's declared specification fields.
 */
export function getCategoryAttributeBadges(
  customFieldsData: any,
  _productSchema?: any
): AttributeBadge[] {
  if (!customFieldsData) return [];

  let custom: Record<string, any> = {};
  try {
    custom = typeof customFieldsData === "string" ? JSON.parse(customFieldsData) : customFieldsData;
  } catch {
    return [];
  }

  if (!custom || typeof custom !== "object") return [];

  const badges: AttributeBadge[] = [];

  // 1. Auto Parts
  if (custom.partNumber) {
    badges.push({
      key: "partNumber",
      label: "PN",
      value: String(custom.partNumber),
      colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
    });
  }
  if (custom.oemNumber) {
    badges.push({
      key: "oemNumber",
      label: "OEM",
      value: String(custom.oemNumber),
      colorClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400"
    });
  }
  if (custom.vehicleModel) {
    badges.push({
      key: "vehicleModel",
      label: "Fit",
      value: String(custom.vehicleModel),
      colorClass: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
    });
  }

  // 2. Storage & Location
  if (custom.rack || custom.bin || custom.warehouseLocation || custom.yardLocation) {
    const locStr = [
      custom.rack ? `R:${custom.rack}` : "",
      custom.bin ? `B:${custom.bin}` : "",
      custom.warehouseLocation ? `Bay:${custom.warehouseLocation}` : "",
      custom.yardLocation ? `Yard:${custom.yardLocation}` : ""
    ].filter(Boolean).join(" ");
    if (locStr) {
      badges.push({
        key: "location",
        label: "Loc",
        value: locStr,
        colorClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
      });
    }
  }

  // 3. Electrical Attributes
  if (custom.wattage) {
    badges.push({
      key: "wattage",
      label: "Power",
      value: String(custom.wattage),
      colorClass: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
    });
  }
  if (custom.voltage) {
    badges.push({
      key: "voltage",
      label: "Volt",
      value: String(custom.voltage),
      colorClass: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
    });
  }
  if (custom.wireGauge) {
    badges.push({
      key: "wireGauge",
      label: "Gauge",
      value: String(custom.wireGauge),
      colorClass: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
    });
  }

  // 4. Hardware / Plumbing / Materials Attributes
  if (custom.material) {
    badges.push({
      key: "material",
      label: "Material",
      value: String(custom.material),
      colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400"
    });
  }
  if (custom.size) {
    badges.push({
      key: "size",
      label: "Size",
      value: String(custom.size),
      colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400"
    });
  }
  if (custom.diameter) {
    badges.push({
      key: "diameter",
      label: "Dia",
      value: String(custom.diameter),
      colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400"
    });
  }
  if (custom.specification) {
    badges.push({
      key: "specification",
      label: "Spec",
      value: String(custom.specification),
      colorClass: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
    });
  }

  // 5. Clothing & Apparel Attributes
  if (custom.color) {
    badges.push({
      key: "color",
      label: "Color",
      value: String(custom.color),
      colorClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400"
    });
  }
  if (custom.fabric) {
    badges.push({
      key: "fabric",
      label: "Fabric",
      value: String(custom.fabric),
      colorClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400"
    });
  }
  if (custom.fit) {
    badges.push({
      key: "fit",
      label: "Fit",
      value: String(custom.fit),
      colorClass: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
    });
  }

  // 6. Mobile & Electronics
  if (custom.modelNumber || custom.model) {
    badges.push({
      key: "model",
      label: "Model",
      value: String(custom.modelNumber || custom.model),
      colorClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
    });
  }
  if (custom.storage) {
    badges.push({
      key: "storage",
      label: "Storage",
      value: String(custom.storage),
      colorClass: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
    });
  }
  if (custom.warranty) {
    badges.push({
      key: "warranty",
      label: "Warranty",
      value: String(custom.warranty),
      colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    });
  }

  // 7. Wholesale & Distribution Attributes
  if (custom.moq) {
    badges.push({
      key: "moq",
      label: "MOQ",
      value: `${custom.moq} Units`,
      colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
    });
  }
  if (custom.packSize) {
    badges.push({
      key: "packSize",
      label: "Pack",
      value: `${custom.packSize} Pcs`,
      colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400"
    });
  }

  // 8. Pharmacy / Perishable Attributes
  if (custom.batchNumber) {
    badges.push({
      key: "batchNumber",
      label: "Batch",
      value: String(custom.batchNumber),
      colorClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400"
    });
  }
  if (custom.expiryDate) {
    badges.push({
      key: "expiryDate",
      label: "Exp",
      value: String(custom.expiryDate),
      colorClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400"
    });
  }

  // Brand (Generic fallback for any vertical)
  if (custom.brand && !badges.some(b => b.key === "brand")) {
    badges.unshift({
      key: "brand",
      label: "Brand",
      value: String(custom.brand),
      colorClass: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
    });
  }

  // Limit to at most 3 prominent badges per card to avoid visual clutter
  return badges.slice(0, 3);
}
