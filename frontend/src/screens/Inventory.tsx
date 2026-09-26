import React, { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Minus, 
  CheckCircle2,
  Package,
  X,
  AlertTriangle
} from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import type { Product } from "../context/BusinessContext";
import { api } from "../config/api";

export const Inventory: React.FC = () => {
  const { products, updateProductStock, addProduct } = useBusiness();
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
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("General");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleStockChange = (product: Product, delta: number) => {
    updateProductStock(product.id, delta, "Manual Stock Adjustment");
    showToast(`✓ Updated ${product.name} stock`);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock) return;

    const res = await addProduct({
      name,
      price: parseFloat(price),
      costPrice: parseFloat(price) * 0.8,
      stock: parseInt(stock, 10),
      minStock: 5,
      category: category || "General",
      supplierName: "General Supplier"
    });

    if (res?.success) {
      setName("");
      setPrice("");
      setStock("");
      setIsAddOpen(false);
      showToast("✓ Product Added Successfully");
    } else {
      showToast(res?.message || "Failed to add product");
    }
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
                  <div className="flex items-center gap-1 text-[11px] font-black text-emerald-600 dark:text-emerald-400">
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

      {/* Simple Add Product Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl space-y-3 sm:space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5">
              <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">Add New Product</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-2.5 sm:space-y-3">
              <div>
                <label className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Milk 1L or Amul Butter"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 60"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                </div>

                <div>
                  <label className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Dairy, Snacks, Grocery"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>

              <div className="pt-2 flex gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Save Product
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
