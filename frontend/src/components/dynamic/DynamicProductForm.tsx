import React, { useState, useEffect, useMemo } from "react";
import { DynamicFieldRenderer } from "./DynamicFieldRenderer";
import { CategoryBadge } from "./CategoryBadge";
import type { VerticalDefinition, VerticalFieldSpec } from "../../types/verticalRegistry";
import { getCategoryFormConfig, formatCurrencyLabel } from "../../utils/categoryFormConfig";
import { Layers, DollarSign, Package, Check, Sparkles, X, TrendingUp, ShieldCheck } from "lucide-react";

export interface DynamicProductFormData {
  name: string;
  category: string;
  unit: string;
  costPrice: number;
  price: number;
  stock: number;
  minStock: number;
  supplierName: string;
  barcode?: string;
  customFields: Record<string, any>;
  // Serial / Batch metadata
  trackingMode?: "NONE" | "SERIAL" | "BATCH";
  isExpiryMandatory?: boolean;
  serialNumbers?: string[];
  batchNumber?: string;
  expiryDate?: string;
}

interface DynamicProductFormProps {
  vertical?: VerticalDefinition | any | null;
  initialData?: Partial<DynamicProductFormData>;
  onSubmit: (data: DynamicProductFormData) => Promise<boolean | void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const DynamicProductForm: React.FC<DynamicProductFormProps> = ({
  vertical,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const formConfig = useMemo(() => getCategoryFormConfig(vertical), [vertical]);

  // Core form states
  const [name, setName] = useState(initialData?.name || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [unit, setUnit] = useState(initialData?.unit || "Piece");
  const [costPrice, setCostPrice] = useState<string>(initialData?.costPrice ? String(initialData.costPrice) : "");
  const [price, setPrice] = useState<string>(initialData?.price ? String(initialData.price) : "");
  const [stock, setStock] = useState<string>(initialData?.stock !== undefined ? String(initialData.stock) : "");
  const [minStock, setMinStock] = useState<string>(initialData?.minStock !== undefined ? String(initialData.minStock) : "");
  const [supplierName, setSupplierName] = useState(initialData?.supplierName || "");
  const [barcode, setBarcode] = useState(initialData?.barcode || "");

  // Serial / Batch states
  const [trackingMode, setTrackingMode] = useState<"NONE" | "SERIAL" | "BATCH">(
    initialData?.trackingMode || (initialData?.batchNumber ? "BATCH" : initialData?.serialNumbers?.length ? "SERIAL" : formConfig.defaultTrackingMode)
  );
  const [batchNumber, setBatchNumber] = useState(initialData?.batchNumber || "");
  const [expiryDate, setExpiryDate] = useState(initialData?.expiryDate || "");
  const [serialInput, setSerialInput] = useState("");
  const [serials, setSerials] = useState<string[]>(initialData?.serialNumbers || []);

  // Sync default tracking mode if vertical loads asynchronously and not editing existing product
  useEffect(() => {
    if (!initialData) {
      setTrackingMode(formConfig.defaultTrackingMode);
    }
  }, [formConfig.defaultTrackingMode, initialData]);

  // Custom dynamic fields
  const [customFields, setCustomFields] = useState<Record<string, any>>(
    initialData?.customFields || {}
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Categories and units from vertical definition or fallback defaults
  const availableCategories = useMemo(() => {
    if (vertical?.defaultCategories && vertical.defaultCategories.length > 0) {
      return vertical.defaultCategories;
    }
    if (vertical?.categories && vertical.categories.length > 0) {
      return vertical.categories;
    }
    return ["General", "Packaged Goods", "Fast Moving", "Custom Items"];
  }, [vertical]);

  const availableUnits = useMemo(() => {
    if (vertical?.units && vertical.units.length > 0) {
      return vertical.units;
    }
    return ["Piece", "Box", "Kg", "Gram", "Litre", "Meter", "Set", "Packet"];
  }, [vertical]);

  useEffect(() => {
    if (!category && availableCategories.length > 0) {
      setCategory(availableCategories[0]);
    }
    if (!unit && availableUnits.length > 0) {
      setUnit(availableUnits[0]);
    }
  }, [availableCategories, availableUnits]);

  // Handle custom fields change
  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setCustomFields((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
    if (errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  // Add serial number
  const handleAddSerial = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const trimmed = serialInput.trim();
    if (!trimmed) return;
    if (!serials.includes(trimmed)) {
      setSerials((prev) => [...prev, trimmed]);
      setSerialInput("");
    }
  };

  const handleRemoveSerial = (idx: number) => {
    setSerials((prev) => prev.filter((_, i) => i !== idx));
  };

  // Pack size conversion preview
  const packSize = customFields.packSize ? Number(customFields.packSize) : 0;

  // Core fields that are managed separately and should not be duplicated in dynamic sections or customFields
  const CORE_FIELD_NAMES = useMemo(() => new Set([
    "name", "category", "unit", "costPrice", "price", "stock", "minStock", "supplierName", "barcode"
  ]), []);

  // Dynamic price tiers from vertical
  const priceTiers = vertical?.priceTiers || [];

  // Excluded keys from dynamic spec sections: core fields + configured price tiers
  const excludedSectionFieldNames = useMemo(() => {
    const set = new Set(CORE_FIELD_NAMES);
    set.add("wholesalePrice");
    if (priceTiers && Array.isArray(priceTiers)) {
      priceTiers.forEach((tier: any) => {
        if (tier.key) set.add(tier.key);
      });
    }
    return set;
  }, [CORE_FIELD_NAMES, priceTiers]);

  // Sections configuration: filter out core fields and tier prices so sections like 'Pricing & Stock' don't duplicate
  const dynamicSections = useMemo(() => {
    let raw: { name: string; fields: VerticalFieldSpec[] }[] = [];
    if (vertical?.sections && Array.isArray(vertical.sections) && vertical.sections.length > 0) {
      raw = vertical.sections;
    } else if (vertical?.fields && Array.isArray(vertical.fields) && vertical.fields.length > 0) {
      const map = new Map<string, VerticalFieldSpec[]>();
      for (const f of vertical.fields) {
        if (excludedSectionFieldNames.has(f.name)) continue;
        const sec = f.section || "Additional Specifications";
        if (!map.has(sec)) map.set(sec, []);
        map.get(sec)!.push(f);
      }
      raw = Array.from(map.entries()).map(([secName, secFields]) => ({
        name: secName,
        fields: secFields,
      }));
    }

    // Filter out duplicate core fields and tier rates from every section
    return raw
      .map((sec: any) => ({
        ...sec,
        fields: (sec.fields || []).filter((f: VerticalFieldSpec) => !excludedSectionFieldNames.has(f.name)),
      }))
      .filter((sec: any) => sec.fields.length > 0);
  }, [vertical, excludedSectionFieldNames]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Product name is required.";
    if (!price || Number(price) <= 0) newErrors.price = "Valid selling price is required.";
    if (stock === "" || Number(stock) < 0) newErrors.stock = "Initial stock cannot be negative.";
    if (costPrice && Number(costPrice) < 0) newErrors.costPrice = "Cost price cannot be negative.";

    // Validate vertical dynamic fields
    if (vertical?.fields) {
      for (const field of vertical.fields) {
        if (CORE_FIELD_NAMES.has(field.name)) continue;
        if (field.required) {
          const val = customFields[field.name];
          if (val === undefined || val === null || val === "") {
            newErrors[field.name] = `${field.label} is required.`;
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Filter out core duplicate keys from customFields
    const cleanCustomFields: Record<string, any> = {};
    Object.entries(customFields).forEach(([k, v]) => {
      if (!CORE_FIELD_NAMES.has(k) && v !== undefined && v !== null && v !== "") {
        cleanCustomFields[k] = v;
      }
    });

    const fallbackSupplier = formConfig.supplierPlaceholder.replace(/^e\.g\.\s*/, "").split(",")[0].trim() || "Standard Supplier";

    const payload: DynamicProductFormData = {
      name: name.trim(),
      category: category || "General",
      unit: unit || "Piece",
      costPrice: costPrice ? Number(costPrice) : Number(price) * 0.8,
      price: Number(price),
      stock: Number(stock),
      minStock: minStock !== "" ? Number(minStock) : Number(formConfig.minStockPlaceholder) || 5,
      supplierName: supplierName.trim() || fallbackSupplier,
      barcode: barcode.trim() || undefined,
      trackingMode,
      isExpiryMandatory: trackingMode === "BATCH",
      customFields: {
        ...cleanCustomFields,
        trackingMode,
        ...(batchNumber ? { batchNumber } : {}),
        ...(expiryDate ? { expiryDate } : {}),
        ...(serials.length > 0 ? { serialNumbers: serials } : {}),
      },
      serialNumbers: serials.length > 0 ? serials : undefined,
      batchNumber: batchNumber || undefined,
      expiryDate: expiryDate || undefined,
    };

    await onSubmit(payload);
  };

  const formatEg = (val?: string) => {
    if (!val) return "";
    const cleaned = val.replace(/^e\.g\.\s*/i, "").trim();
    return `e.g. ${cleaned}`;
  };

  const cp = parseFloat(costPrice) || 0;
  const sp = parseFloat(price) || 0;
  const profit = sp > 0 && cp > 0 ? sp - cp : 0;
  const marginPct = sp > 0 && cp > 0 ? ((profit / sp) * 100).toFixed(1) : null;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-auto max-h-[92vh] w-full overflow-hidden text-slate-800 dark:text-slate-100 font-sans">
      {/* Sticky Modal Header */}
      <div className="flex items-center justify-between px-6 sm:px-8 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-slate-900 dark:text-white text-base sm:text-lg tracking-tight truncate">
                {initialData ? `Edit ${formConfig.displayName} Item` : `New ${formConfig.displayName} Product`}
              </h3>
              <CategoryBadge
                verticalId={vertical?.displayName || formConfig.displayName || vertical?.businessType || "Generic Retail"}
                depthLevel={vertical?.depthLevel}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Dual-pane rapid catalog editor with automatic economics calculation
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Content: 2-Column Split Layout on Desktop, Zero-Scrollbar Engineered */}
      <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-4 sm:py-5 no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* ==================== LEFT COLUMN: Core Item Specs & Dynamic Attributes ==================== */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-4">
            {/* Core Specs Card */}
            <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/50 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <Package className="w-4 h-4 text-indigo-500" />
                  {formConfig.displayName} Core Identity
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Specs & Details</span>
              </div>

              <div className="space-y-3">
                {/* Product Name */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {formConfig.nameLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    placeholder={formConfig.namePlaceholder}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-colors ${
                      errors.name ? "border-red-400 dark:border-red-500" : "border-slate-300 dark:border-slate-700"
                    }`}
                  />
                  {errors.name && <span className="text-xs text-red-500 mt-1 block font-semibold">{errors.name}</span>}
                </div>

                {/* Category & Unit */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {formConfig.categoryLabel}
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer font-medium"
                    >
                      {availableCategories.map((c: string) => (
                        <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Inventory Unit
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer font-medium"
                    >
                      {availableUnits.map((u: string) => (
                        <option key={u} value={u} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Barcode & Supplier */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Barcode / SKU
                    </label>
                    <input
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder={formConfig.barcodePlaceholder}
                      className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {formConfig.supplierLabel}
                    </label>
                    <input
                      type="text"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                      placeholder={formConfig.supplierPlaceholder}
                      className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Custom Fields for Vertical if defined */}
            {dynamicSections.map((sec: any, secIdx: number) => (
              <div key={secIdx} className="bg-slate-50/80 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-200/60 dark:border-slate-700/50 pb-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {sec.name}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {sec.fields.map((field: VerticalFieldSpec) => (
                    <DynamicFieldRenderer
                      key={field.name}
                      field={field}
                      value={customFields[field.name]}
                      onChange={handleCustomFieldChange}
                      error={errors[field.name]}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ==================== RIGHT COLUMN: Pricing & Traceability ==================== */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-4">
            {/* Pricing & Economics Card */}
            <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/50 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Economics & Pricing
                </div>
                {packSize > 1 && (
                  <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800 font-bold">
                    1 {unit} = {packSize} units
                  </span>
                )}
              </div>

              {/* Selling Price & Cost Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {formatCurrencyLabel(formConfig.priceLabel)} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      if (errors.price) setErrors((prev) => ({ ...prev, price: "" }));
                    }}
                    placeholder={formatEg(formConfig.pricePlaceholder)}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-black transition-colors ${
                      errors.price ? "border-red-400 dark:border-red-500" : "border-slate-300 dark:border-slate-700"
                    }`}
                  />
                  {errors.price && <span className="text-xs text-red-500 mt-1 block font-semibold">{errors.price}</span>}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {formatCurrencyLabel(formConfig.costPriceLabel)}
                  </label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    placeholder={formatEg(formConfig.costPricePlaceholder)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Live Profit Margin Pill */}
              {marginPct !== null && (
                <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                  profit >= 0
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300"
                    : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300"
                }`}>
                  <span className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Unit Profit: ₹{profit.toFixed(1)} / {unit}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-white/70 dark:bg-black/30 font-black">
                    {marginPct}% Gross Margin
                  </span>
                </div>
              )}

              {/* Stock & Reorder Alert */}
              <div className="grid grid-cols-2 gap-3 pt-0.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {formConfig.stockLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => {
                      setStock(e.target.value);
                      if (errors.stock) setErrors((prev) => ({ ...prev, stock: "" }));
                    }}
                    placeholder={formatEg(formConfig.stockPlaceholder)}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-black transition-colors ${
                      errors.stock ? "border-red-400 dark:border-red-500" : "border-slate-300 dark:border-slate-700"
                    }`}
                  />
                  {errors.stock && <span className="text-xs text-red-500 mt-1 block font-semibold">{errors.stock}</span>}
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {formConfig.minStockLabel}
                  </label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    placeholder={formatEg(formConfig.minStockPlaceholder)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Wholesale / Custom Price Tiers if defined */}
              {priceTiers.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/80">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Configured Wholesale / Tier Rates
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {priceTiers.map((tier: any) => (
                      <div key={tier.key}>
                        <label className="text-[10px] text-slate-600 dark:text-slate-400 font-bold block mb-0.5 truncate">
                          {formatCurrencyLabel(tier.label)}
                        </label>
                        <input
                          type="number"
                          value={customFields[tier.key] ?? ""}
                          onChange={(e) => handleCustomFieldChange(tier.key, e.target.value === "" ? "" : Number(e.target.value))}
                          placeholder={`Rate`}
                          className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Inventory Tracking & Traceability Card */}
            <div className="bg-slate-50/80 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/50 pb-2">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  Traceability Mode
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                  {trackingMode}
                </span>
              </div>

              {/* Segmented 3-Way Switch */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-900/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTrackingMode("NONE")}
                  className={`py-2 px-2 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                    trackingMode === "NONE"
                      ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setTrackingMode("SERIAL")}
                  className={`py-2 px-2 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                    trackingMode === "SERIAL"
                      ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  IMEI / Serial
                </button>
                <button
                  type="button"
                  onClick={() => setTrackingMode("BATCH")}
                  className={`py-2 px-2 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                    trackingMode === "BATCH"
                      ? "bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs ring-1 ring-slate-200 dark:ring-slate-700"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Batch & Expiry
                </button>
              </div>

              {/* Dynamic Controls based on selected mode */}
              {trackingMode === "BATCH" && (
                <div className="pt-1.5 space-y-2">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {formConfig.batchLabel}
                      </label>
                      <input
                        type="text"
                        value={batchNumber}
                        onChange={(e) => setBatchNumber(e.target.value)}
                        placeholder={formConfig.batchPlaceholder}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer font-bold"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">FEFO (First-Expiry-First-Out) automatic dispensing enabled.</p>
                </div>
              )}

              {trackingMode === "SERIAL" && (
                <div className="pt-1.5 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={serialInput}
                      onChange={(e) => setSerialInput(e.target.value)}
                      onKeyDown={handleAddSerial}
                      placeholder={formConfig.serialPlaceholder}
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddSerial}
                      className="px-3.5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                    >
                      + Add
                    </button>
                  </div>
                  {serials.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto no-scrollbar pt-1">
                      {serials.map((s, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-[11px] px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 font-mono"
                        >
                          {s}
                          <button
                            type="button"
                            onClick={() => handleRemoveSerial(idx)}
                            className="text-blue-500 hover:text-blue-800 dark:hover:text-blue-200 text-xs font-bold cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {trackingMode === "NONE" && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium pt-0.5">
                  Standard aggregate unit stock count with real-time low-stock reorder warnings.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="px-6 sm:px-8 py-3.5 sm:py-4 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm sticky bottom-0 z-20 flex items-center justify-between gap-3 shrink-0">
        <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5 font-medium">
          <span>Keyboard shortcut:</span>
          <kbd className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px] text-slate-600 dark:text-slate-300 font-bold">Esc</kbd>
          <span>to dismiss</span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial px-7 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 cursor-pointer active:scale-98"
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Product
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
