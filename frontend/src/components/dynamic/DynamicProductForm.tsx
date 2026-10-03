import React, { useState, useEffect, useMemo } from "react";
import { DynamicFieldRenderer } from "./DynamicFieldRenderer";
import { CategoryBadge } from "./CategoryBadge";
import type { VerticalDefinition, VerticalFieldSpec } from "../../types/verticalRegistry";
import { Layers, DollarSign, Package, Check, Sparkles, Hash, Calendar } from "lucide-react";

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
  // Core form states
  const [name, setName] = useState(initialData?.name || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [unit, setUnit] = useState(initialData?.unit || "Piece");
  const [costPrice, setCostPrice] = useState<string>(initialData?.costPrice ? String(initialData.costPrice) : "");
  const [price, setPrice] = useState<string>(initialData?.price ? String(initialData.price) : "");
  const [stock, setStock] = useState<string>(initialData?.stock !== undefined ? String(initialData.stock) : "");
  const [minStock, setMinStock] = useState<string>(initialData?.minStock !== undefined ? String(initialData.minStock) : "5");
  const [supplierName, setSupplierName] = useState(initialData?.supplierName || "Standard Supplier");
  const [barcode, setBarcode] = useState(initialData?.barcode || "");

  // Serial / Batch states
  const [batchNumber, setBatchNumber] = useState(initialData?.batchNumber || "");
  const [expiryDate, setExpiryDate] = useState(initialData?.expiryDate || "");
  const [serialInput, setSerialInput] = useState("");
  const [serials, setSerials] = useState<string[]>(initialData?.serialNumbers || []);

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

  // Check if current vertical supports serial or batch
  const isSerialEnabled = useMemo(() => {
    const id = (vertical?.id || vertical?.verticalId || "").toUpperCase();
    return id.includes("MOBILE") || id.includes("ELECTRONIC");
  }, [vertical]);

  const isBatchEnabled = useMemo(() => {
    const id = (vertical?.id || vertical?.verticalId || "").toUpperCase();
    return id.includes("PHARMACY") || id.includes("DAIRY") || id.includes("BAKERY") || id.includes("SWEET");
  }, [vertical]);

  // Pack size conversion preview
  const packSize = customFields.packSize ? Number(customFields.packSize) : 0;

  // Sections configuration
  const dynamicSections = useMemo(() => {
    if (vertical?.sections && Array.isArray(vertical.sections) && vertical.sections.length > 0) {
      return vertical.sections;
    }
    if (vertical?.fields && Array.isArray(vertical.fields) && vertical.fields.length > 0) {
      // Group fields by section
      const map = new Map<string, VerticalFieldSpec[]>();
      for (const f of vertical.fields) {
        // Skip core fields already handled in main form
        if (["name", "category", "unit", "costPrice", "price", "stock", "minStock", "supplierName", "barcode"].includes(f.name)) {
          continue;
        }
        const sec = f.section || "Additional Specifications";
        if (!map.has(sec)) map.set(sec, []);
        map.get(sec)!.push(f);
      }
      return Array.from(map.entries()).map(([secName, secFields]) => ({
        name: secName,
        fields: secFields,
      }));
    }
    return [];
  }, [vertical]);

  // Dynamic price tiers from vertical
  const priceTiers = vertical?.priceTiers || [];

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Product name is required.";
    if (!price || Number(price) <= 0) newErrors.price = "Valid selling price is required.";
    if (stock === "" || Number(stock) < 0) newErrors.stock = "Initial stock cannot be negative.";
    if (costPrice && Number(costPrice) < 0) newErrors.costPrice = "Cost price cannot be negative.";

    // Validate vertical dynamic fields
    if (vertical?.fields) {
      for (const field of vertical.fields) {
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

    const payload: DynamicProductFormData = {
      name: name.trim(),
      category: category || "General",
      unit: unit || "Piece",
      costPrice: costPrice ? Number(costPrice) : Number(price) * 0.8,
      price: Number(price),
      stock: Number(stock),
      minStock: minStock ? Number(minStock) : 5,
      supplierName: supplierName.trim() || "Standard Supplier",
      barcode: barcode.trim() || undefined,
      customFields: {
        ...customFields,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header with Vertical Badge & Depth Level */}
      <div className="flex items-center justify-between border-b pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-800 text-base">
            {initialData ? "Edit Product Specifications" : "Create New Product"}
          </h3>
        </div>
        <CategoryBadge
          verticalId={vertical?.displayName || vertical?.businessType || "Generic Retail"}
          depthLevel={vertical?.depthLevel}
        />
      </div>

      {/* CORE SPECIFICATIONS SECTION */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
          <Package className="w-4 h-4 text-indigo-500" />
          Core Item Details
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder="e.g. Bosch Brake Pad, Samsung 43 TV, Amul Milk 1L..."
              className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.name ? "border-red-400" : "border-slate-300"
              }`}
            />
            {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {availableCategories.map((c: string) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Inventory Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {availableUnits.map((u: string) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Barcode / SKU</label>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan or enter barcode / SKU..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Preferred Supplier</label>
            <input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="e.g. Authorized Distributor / Manufacturer"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* DYNAMIC SECTIONS DEFINED IN VERTICAL REGISTRY */}
      {dynamicSections.map((sec: any, secIdx: number) => (
        <div key={secIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {sec.name}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* PRICING & TIER RATES */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            Pricing & Stock Economics
          </div>
          {packSize > 1 && (
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-medium">
              1 {unit} = {packSize} units conversion active
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Cost Price (₹)</label>
            <input
              type="number"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="e.g. 800"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">
              Retail Price / MRP (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                if (errors.price) setErrors((prev) => ({ ...prev, price: "" }));
              }}
              placeholder="e.g. 1000"
              className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.price ? "border-red-400" : "border-slate-300"
              }`}
            />
            {errors.price && <span className="text-xs text-red-500">{errors.price}</span>}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">
              Opening Stock <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={stock}
              onChange={(e) => {
                setStock(e.target.value);
                if (errors.stock) setErrors((prev) => ({ ...prev, stock: "" }));
              }}
              placeholder="e.g. 50"
              className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.stock ? "border-red-400" : "border-slate-300"
              }`}
            />
            {errors.stock && <span className="text-xs text-red-500">{errors.stock}</span>}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700">Reorder Threshold</label>
            <input
              type="number"
              value={minStock}
              onChange={(e) => setMinStock(e.target.value)}
              placeholder="e.g. 5"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Dynamic Vertical Price Tiers (B2B wholesale, mechanic, contractor) */}
        {priceTiers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <span className="text-xs font-semibold text-slate-700 block mb-2">
              Configured Vertical Price Tiers
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {priceTiers.map((tier: any) => (
                <div key={tier.key}>
                  <label className="text-xs text-slate-600 block mb-1">
                    {tier.label} (₹)
                  </label>
                  <input
                    type="number"
                    value={customFields[tier.key] ?? ""}
                    onChange={(e) => handleCustomFieldChange(tier.key, e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder={`e.g. Rate for ${tier.tierAliases?.[0] || "trade"}`}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* OPTIONAL SERIAL / IMEI TRACKING (FOR ELECTRONICS/MOBILE) */}
      {isSerialEnabled && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            <Hash className="w-4 h-4 text-blue-500" />
            Device Serial & IMEI Registry (Optional)
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={serialInput}
              onChange={(e) => setSerialInput(e.target.value)}
              onKeyDown={handleAddSerial}
              placeholder="Scan or type IMEI / Serial Number..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleAddSerial}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors"
            >
              Add Serial
            </button>
          </div>
          {serials.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {serials.map((s, idx) => (
                <span
                  key={idx}
                  className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => handleRemoveSerial(idx)}
                    className="text-blue-500 hover:text-blue-800 text-xs font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OPTIONAL BATCH & EXPIRY TRACKING (FOR PHARMACY/DAIRY/FOOD) */}
      {isBatchEnabled && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            <Calendar className="w-4 h-4 text-rose-500" />
            Batch & Expiry Controls
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Manufacturer Batch No.</label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="e.g. B-2026-X99"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Expiry Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
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
    </form>
  );
};
