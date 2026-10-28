import React, { useState, useEffect, useMemo } from "react";
import { DynamicFieldRenderer } from "./DynamicFieldRenderer";
import { CategoryBadge } from "./CategoryBadge";
import type { VerticalDefinition, VerticalFieldSpec } from "../../types/verticalRegistry";
import { getCategoryFormConfig, formatCurrencyLabel } from "../../utils/categoryFormConfig";
import { 
  Check, 
  X, 
  TrendingUp, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Barcode as BarcodeIcon, 
  Sparkles,
  Zap
} from "lucide-react";

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

  // Core fast form states
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

  // Check if secondary data already exists to decide initial accordion state
  const hasSecondaryData = Boolean(
    initialData?.supplierName ||
    initialData?.barcode ||
    initialData?.minStock !== undefined ||
    (initialData?.customFields && Object.keys(initialData.customFields).length > 0) ||
    (trackingMode !== formConfig.defaultTrackingMode && trackingMode !== "NONE")
  );
  const [isMoreOpen, setIsMoreOpen] = useState(hasSecondaryData);

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
    return ["Piece", "Box", "Kg", "Gram", "Litre", "ml", "Packet", "Meter"];
  }, [vertical]);

  useEffect(() => {
    if (!category && availableCategories.length > 0) {
      setCategory(availableCategories[0]);
    }
    if (!unit && availableUnits.length > 0) {
      setUnit(availableUnits[0]);
    }
  }, [availableCategories, availableUnits, category, unit]);

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

  // Core fields that are managed separately and should not be duplicated in dynamic sections or customFields
  const CORE_FIELD_NAMES = useMemo(() => new Set([
    "name", "category", "unit", "costPrice", "price", "stock", "minStock", "supplierName", "barcode"
  ]), []);

  // Dynamic price tiers from vertical
  const priceTiers = useMemo(() => vertical?.priceTiers || [], [vertical]);

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

    return raw
      .map((sec: any) => ({
        ...sec,
        fields: (sec.fields || []).filter((f: VerticalFieldSpec) => !excludedSectionFieldNames.has(f.name)),
      }))
      .filter((sec: any) => sec.fields.length > 0);
  }, [vertical, excludedSectionFieldNames]);

  // Super-fast validation: Only name, price (>0), and stock (>=0) are strictly required
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Item name is required.";
    if (!price || Number(price) <= 0) newErrors.price = "Enter valid selling price.";
    if (stock === "" || Number(stock) < 0) newErrors.stock = "Enter stock quantity.";

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
    const parsedPrice = Number(price);
    const parsedCostPrice = costPrice !== "" ? Number(costPrice) : Number((parsedPrice * 0.8).toFixed(2));

    const payload: DynamicProductFormData = {
      name: name.trim(),
      category: category || availableCategories[0] || "General",
      unit: unit || availableUnits[0] || "Piece",
      costPrice: parsedCostPrice,
      price: parsedPrice,
      stock: Number(stock) || 0,
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

  const cp = parseFloat(costPrice) || 0;
  const sp = parseFloat(price) || 0;
  const profit = sp > 0 && cp > 0 ? sp - cp : 0;
  const marginPct = sp > 0 && cp > 0 ? ((profit / sp) * 100).toFixed(1) : null;

  // Category context helpers
  const isPharmacy = formConfig.defaultTrackingMode === "BATCH";
  const isMobileOrGadget = formConfig.defaultTrackingMode === "SERIAL";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-auto max-h-[92vh] w-full overflow-hidden text-slate-800 dark:text-slate-100 font-sans">
      {/* Compact Modern Header */}
      <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight truncate">
                {initialData ? `Edit Item` : `New ${formConfig.displayName} Item`}
              </h3>
              <CategoryBadge
                verticalId={vertical?.displayName || formConfig.displayName || vertical?.businessType || "Retail"}
                depthLevel={vertical?.depthLevel}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Fast product entry for instant counter billing
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Content: Streamlined, Single-Flow, Zero Clutter */}
      <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4 no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden">
        
        {/* ================= PRIMARY ESSENTIALS (Fast Entry in 5 seconds) ================= */}
        <div className="space-y-3.5">
          {/* 1. Item Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              {formConfig.nameLabel} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder={formConfig.namePlaceholder}
              className={`w-full px-3.5 py-2.5 border rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold transition-colors ${
                errors.name ? "border-red-400 dark:border-red-500 ring-1 ring-red-400" : "border-slate-300 dark:border-slate-700"
              }`}
            />
            {errors.name && <span className="text-xs text-red-500 mt-1 block font-semibold">{errors.name}</span>}
          </div>

          {/* 2. Pricing & Stock Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Selling Price */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Selling Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  step="any"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (errors.price) setErrors((prev) => ({ ...prev, price: "" }));
                  }}
                  placeholder={formConfig.pricePlaceholder || "e.g. 245"}
                  className={`w-full pl-7 pr-3 py-2 border rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-black transition-colors ${
                    errors.price ? "border-red-400 dark:border-red-500 ring-1 ring-red-400" : "border-slate-300 dark:border-slate-700"
                  }`}
                />
              </div>
              {errors.price && <span className="text-xs text-red-500 mt-1 block font-semibold">{errors.price}</span>}
            </div>

            {/* Purchase Price (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Purchase Cost (₹)
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Optional</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  step="any"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder={formConfig.costPricePlaceholder ? `e.g. ${formConfig.costPricePlaceholder}` : "e.g. 210"}
                  className="w-full pl-7 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-colors"
                />
              </div>
            </div>

            {/* Shelf Stock */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Opening Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={stock}
                onChange={(e) => {
                  setStock(e.target.value);
                  if (errors.stock) setErrors((prev) => ({ ...prev, stock: "" }));
                }}
                placeholder={formConfig.stockPlaceholder ? `e.g. ${formConfig.stockPlaceholder}` : "e.g. 50"}
                className={`w-full px-3 py-2 border rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-black transition-colors ${
                  errors.stock ? "border-red-400 dark:border-red-500 ring-1 ring-red-400" : "border-slate-300 dark:border-slate-700"
                }`}
              />
              {errors.stock && <span className="text-xs text-red-500 mt-1 block font-semibold">{errors.stock}</span>}
            </div>
          </div>

          {/* Live Profit Margin Badge */}
          {marginPct !== null && (
            <div className={`px-3 py-1.5 rounded-lg border flex items-center justify-between text-xs font-semibold ${
              profit >= 0
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300"
            }`}>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Profit: ₹{profit.toFixed(1)} / {unit}
              </span>
              <span className="font-bold">
                {marginPct}% Margin
              </span>
            </div>
          )}

          {/* 3. Category, Unit & Barcode Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer font-medium"
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
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer font-medium"
              >
                {availableUnits.map((u: string) => (
                  <option key={u} value={u} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Barcode / SKU
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Optional</span>
              </div>
              <div className="relative">
                <BarcodeIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Scan or type barcode"
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-mono"
                />
              </div>
            </div>
          </div>

          {/* Contextual Fast Fields for Pharmacy (Batch & Expiry) */}
          {isPharmacy && (
            <div className="p-3 bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider block">
                Pharma Batch & Expiry (Mandatory for Medical Stores)
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="e.g. BT-9081"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white cursor-pointer font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contextual Fast Fields for Mobile/Gadgets (IMEI / Serial) */}
          {isMobileOrGadget && (
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider block">
                Device Serial / IMEI Registry
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={serialInput}
                  onChange={(e) => setSerialInput(e.target.value)}
                  onKeyDown={handleAddSerial}
                  placeholder="Scan or enter 15-digit IMEI / Serial..."
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddSerial}
                  className="px-3.5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                >
                  + Add
                </button>
              </div>
              {serials.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto no-scrollbar pt-1">
                  {serials.map((s, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-[11px] px-2 py-0.5 rounded flex items-center gap-1.5 font-mono"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSerial(idx)}
                        className="text-blue-500 hover:text-blue-800 dark:hover:text-blue-100 text-xs font-bold cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================= OPTIONAL DETAILS COLLAPSIBLE TOGGLE ================= */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              {isMoreOpen ? "Hide Extra Details" : "+ More Options (Brand, Shelf / Rack, Min Stock, Wholesale Rate)"}
            </span>
            {isMoreOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Expanded Secondary Fields */}
          {isMoreOpen && (
            <div className="mt-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-850/40 space-y-3.5 animate-fadeIn">
              
              {/* Secondary Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Brand */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Brand / Manufacturer
                  </label>
                  <input
                    type="text"
                    value={customFields.brand || ""}
                    onChange={(e) => handleCustomFieldChange("brand", e.target.value)}
                    placeholder="e.g. ITC, Tata, Nestle, Fortune"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Net Weight / Volume */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Net Weight / Pack Size
                  </label>
                  <input
                    type="text"
                    value={customFields.weight || customFields.size || ""}
                    onChange={(e) => handleCustomFieldChange("weight", e.target.value)}
                    placeholder="e.g. 500g, 1L, 5kg"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Aisle / Shelf Location */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Aisle / Shelf / Rack Location
                  </label>
                  <input
                    type="text"
                    value={customFields.rack || customFields.shelfLocation || ""}
                    onChange={(e) => handleCustomFieldChange("rack", e.target.value)}
                    placeholder="e.g. Aisle 2, Rack B-3"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Min Stock Reorder Alert */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Reorder Alert Threshold
                  </label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    placeholder={formConfig.minStockPlaceholder || "5"}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Supplier Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    {formConfig.supplierLabel || "Preferred Supplier"}
                  </label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder={formConfig.supplierPlaceholder}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Configured Wholesale / Tier Rates */}
                {priceTiers.length > 0 ? (
                  priceTiers.map((tier: any) => (
                    <div key={tier.key}>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1 truncate">
                        {formatCurrencyLabel(tier.label)}
                      </label>
                      <input
                        type="number"
                        value={customFields[tier.key] ?? ""}
                        onChange={(e) => handleCustomFieldChange(tier.key, e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder="Rate (₹)"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  ))
                ) : (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Wholesale / Khata Rate (₹)
                    </label>
                    <input
                      type="number"
                      value={customFields.wholesalePrice ?? ""}
                      onChange={(e) => handleCustomFieldChange("wholesalePrice", e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="e.g. 230"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>

              {/* Dynamic Vertical Fields if defined */}
              {dynamicSections.map((sec: any, secIdx: number) => {
                // Filter out fields already rendered above
                const filteredFields = sec.fields.filter(
                  (f: VerticalFieldSpec) => !["brand", "weight", "size", "rack", "shelfLocation"].includes(f.name)
                );
                if (filteredFields.length === 0) return null;
                return (
                  <div key={secIdx} className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      {sec.name}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredFields.map((field: VerticalFieldSpec) => (
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
                );
              })}

              {/* Advanced Traceability Mode Switcher */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                    Tracking Mode
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                    {trackingMode}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/60 dark:bg-slate-900/80 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTrackingMode("NONE")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                      trackingMode === "NONE"
                        ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackingMode("SERIAL")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                      trackingMode === "SERIAL"
                        ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    IMEI / Serial
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrackingMode("BATCH")}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center transition-all cursor-pointer ${
                      trackingMode === "BATCH"
                        ? "bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Batch & Expiry
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="px-5 sm:px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm sticky bottom-0 z-20 flex items-center justify-between gap-3 shrink-0">
        <div className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-1.5 font-medium">
          <span>Press</span>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono text-[10px] text-slate-600 dark:text-slate-300 font-bold">Enter</kbd>
          <span>to save</span>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial px-6 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer active:scale-98"
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
