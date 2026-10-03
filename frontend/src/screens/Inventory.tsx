import React, { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Minus, 
  CheckCircle2,
  Package,
  AlertTriangle
} from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import type { Product } from "../context/BusinessContext";
import { api } from "../config/api";
import { DynamicProductForm } from "../components/dynamic";

export const Inventory: React.FC = () => {
  const { products, updateProductStock, addProduct, productSchema } = useBusiness();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [inventories, setInventories] = useState<any[]>([]);

  const fetchInventories = async () => {
    try {
      const response = await api.get("/inventory");
      if (response.data?.success && response.data?.data?.items) {
        setInventories(response.data.data.items);
      }
    } catch (err) {
      console.error("Failed to load inventories:", err);
    }
  };

  useEffect(() => {
    fetchInventories();
  }, [products]);

  const invMap = React.useMemo(() => {
    const map: { [productId: string]: any } = {};
    inventories.forEach(inv => {
      map[inv.productId] = inv;
    });
    return map;
  }, [inventories]);

  // Add Product Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const schemaCategories = productSchema?.categories || [];
  const categories = ["All", ...Array.from(new Set([...schemaCategories, ...products.map(p => p.category)]))];

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return selectedCategory === "All" || p.category === selectedCategory;
    }
    const matchesName = p.name.toLowerCase().includes(q);
    const matchesBarcode = p.barcode ? p.barcode.toLowerCase().includes(q) : false;
    const matchesCat = p.category ? p.category.toLowerCase().includes(q) : false;
    const matchesCustom = p.customFields ? p.customFields.toLowerCase().includes(q) : false;
    const matchesSearch = matchesName || matchesBarcode || matchesCat || matchesCustom;
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStockChange = (product: Product, delta: number) => {
    updateProductStock(product.id, delta, "Manual Stock Adjustment");
    showToast(`✓ Updated ${product.name} stock`);
  };

  return (
    <div className="p-2.5 sm:p-5 lg:p-8 w-full space-y-3 sm:space-y-5 pb-24 text-slate-900 dark:text-white">
      
      {/* Toast Banner */}
      {toastMsg && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl font-black text-xs z-50 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {toastMsg}
        </div>
      )}

      {/* Standard Adaptive Page Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
            <Package className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                Live Stock
              </h1>
              <span className="text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange border border-brand-orange/20 shrink-0">
                {products.length} Products
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">
              Manage product catalog, live batch stock, wholesale cost price, and instant restock quantities
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="bg-brand-orange hover:bg-brand-orange-hover text-white font-black px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Add Product</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search product by name or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 sm:py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-brand-orange/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards List (Responsive Multi-Col Grid: 2 cols on mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <Package className="h-8 w-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-bold">No matching products found.</p>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const inv = invMap[p.id];
            const reserved = inv?.reservedQuantity ?? 0;
            const isLowStock = p.stock <= p.minStock;

            let custom: Record<string, any> = {};
            if (p.customFields) {
              try {
                custom = typeof p.customFields === "string" ? JSON.parse(p.customFields) : p.customFields;
              } catch (e) {}
            }

            return (
              <div 
                key={p.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-xs flex flex-col justify-between gap-2 sm:gap-3 transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Product Info */}
                <div className="space-y-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 truncate max-w-[80px]">
                      {p.category}
                    </span>
                    {isLowStock && (
                      <span className="text-[8px] font-black px-1 py-0.5 rounded bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center gap-0.5 shrink-0 animate-pulse">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        Low
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-2 leading-tight">
                    {p.name}
                  </h3>

                  {/* Category-Aware Attribute Tags */}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {custom.partNumber && (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 truncate max-w-full">
                        PN: {custom.partNumber}
                      </span>
                    )}
                    {custom.oemNumber && (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 truncate max-w-full">
                        OEM: {custom.oemNumber}
                      </span>
                    )}
                    {custom.brand && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate max-w-full">
                        {custom.brand}
                      </span>
                    )}
                    {custom.vehicleModel && (
                      <span className="text-[8px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-full">
                        Fit: {custom.vehicleModel}
                      </span>
                    )}
                    {(custom.rack || custom.bin) && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 truncate">
                        Loc: {custom.rack ? `R:${custom.rack}` : ""}{custom.bin ? ` B:${custom.bin}` : ""}
                      </span>
                    )}
                    {custom.wattage && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                        {custom.wattage}
                      </span>
                    )}
                    {custom.voltage && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                        {custom.voltage}
                      </span>
                    )}
                    {custom.wireGauge && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                        Gauge: {custom.wireGauge}
                      </span>
                    )}
                    {custom.material && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        {custom.material}
                      </span>
                    )}
                    {custom.size && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                        Size: {custom.size}
                      </span>
                    )}
                    {custom.specification && (
                      <span className="text-[8px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate max-w-full">
                        Spec: {custom.specification}
                      </span>
                    )}
                    {custom.warranty && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        War: {custom.warranty}
                      </span>
                    )}
                    {custom.wholesalePrice && (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400">
                        Whl: ₹{custom.wholesalePrice}
                      </span>
                    )}
                    {custom.mechanicPrice && (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 dark:text-orange-400">
                        Mech: ₹{custom.mechanicPrice}
                      </span>
                    )}
                    {custom.contractorPrice && (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                        Contr: ₹{custom.contractorPrice}
                      </span>
                    )}
                    {custom.electricianPrice && (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        Elec: ₹{custom.electricianPrice}
                      </span>
                    )}
                    {custom.expiryDate && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        Exp: {custom.expiryDate}
                      </span>
                    )}
                    {custom.moq && (
                      <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                        MOQ: {custom.moq}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] font-black text-emerald-600 dark:text-emerald-400 pt-1">
                    <span>₹{p.price}</span>
                    {reserved > 0 && (
                      <span className="text-[9px] text-brand-orange font-bold">
                        (Res: {reserved})
                      </span>
                    )}
                  </div>
                </div>

                {/* Stock Controls (Compact 1-Tap Buttons) */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 gap-1">
                  <button
                    onClick={() => handleStockChange(p, -1)}
                    className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-black active:scale-90 transition-transform cursor-pointer"
                  >
                    <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                  
                  <div className="text-center">
                    <span className={`text-xs sm:text-sm font-black ${isLowStock ? "text-rose-600 animate-pulse" : "text-slate-900 dark:text-white"}`}>
                      {p.stock}
                    </span>
                    <span className="text-[8px] text-slate-400 block uppercase leading-none font-bold">Units</span>
                  </div>

                  <button
                    onClick={() => handleStockChange(p, 1)}
                    className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-black active:scale-90 transition-transform cursor-pointer shadow-xs"
                  >
                    <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button for Mobile screens */}
      <div className="fixed bottom-[72px] right-4 z-30 sm:hidden">
        <button
          onClick={() => setIsAddOpen(true)}
          className="h-12 w-12 rounded-2xl bg-brand-orange hover:bg-brand-orange-hover text-white shadow-xl flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
          title="Add New Product"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Add Product Modal with Dynamic UI Engine */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-3 sm:space-y-4">
            <DynamicProductForm
              vertical={productSchema}
              onSubmit={async (data) => {
                const res = await addProduct({
                  name: data.name,
                  price: data.price,
                  costPrice: data.costPrice,
                  stock: data.stock,
                  minStock: data.minStock,
                  category: data.category || "General",
                  supplierName: data.supplierName || "General Supplier",
                  barcode: data.barcode,
                  customFields: Object.keys(data.customFields).length > 0 ? JSON.stringify(data.customFields) : undefined,
                });

                if (res?.success) {
                  setIsAddOpen(false);
                  if (res.isMerged) {
                    showToast(res.message || `✓ Product "${data.name}" stock updated!`);
                  } else {
                    showToast("✓ Product Added Successfully");
                  }
                } else {
                  showToast(res?.message || "Failed to add product");
                }
              }}
              onCancel={() => setIsAddOpen(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
};
