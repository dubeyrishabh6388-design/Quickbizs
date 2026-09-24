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

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock) return;

    addProduct({
      name,
      price: parseFloat(price),
      costPrice: parseFloat(price) * 0.8,
      stock: parseInt(stock, 10),
      minStock: 5,
      category: category || "General",
      supplierName: "General Supplier"
    });

    setName("");
    setPrice("");
    setStock("");
    setIsAddOpen(false);
    showToast("✓ Product Added Successfully");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6 pb-28 text-slate-900 dark:text-white">
      
      {/* Toast Banner */}
      {toastMsg && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-black text-xs z-50 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          {toastMsg}
        </div>
      )}

      {/* Standard Adaptive Page Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Live Inventory & Stock
              </h1>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange border border-brand-orange/20">
                {products.length} Products
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Manage product catalog, live batch stock, wholesale cost price, and instant restock quantities
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="bg-brand-orange hover:bg-brand-orange-hover text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add New Product
        </button>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search product by name or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-colors cursor-pointer ${
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

      {/* Product Cards List (Responsive Multi-Col Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <Package className="h-10 w-10 text-slate-400 mx-auto mb-2" />
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
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xs flex items-center justify-between gap-3 transition-all hover:border-slate-300 dark:hover:border-slate-700"
              >
                {/* Product Info */}
                <div className="space-y-1">
                  <h3 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">{p.name}</h3>
                  <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    <span className="text-emerald-600 dark:text-emerald-400 font-black text-xs">₹{p.price}</span>
                    <span>•</span>
                    <span>{p.category}</span>
                    {reserved > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-brand-orange font-black">Res: {reserved}</span>
                      </>
                    )}
                  </div>

                  {isLowStock && (
                    <div className="flex items-center gap-1 text-[9px] font-black text-rose-500 uppercase mt-0.5">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      <span>Low Stock Alert</span>
                    </div>
                  )}
                </div>

                {/* Stock Controls (Large 1-Tap Buttons) */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleStockChange(p, -1)}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-black active:scale-95 transition-transform cursor-pointer"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  
                  <div className="text-center min-w-[3.5rem]">
                    <span className={`text-base font-black ${isLowStock ? "text-rose-600 animate-pulse" : "text-slate-900 dark:text-white"}`}>
                      {p.stock}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 block uppercase leading-none mt-0.5">Stock</span>
                  </div>

                  <button
                    onClick={() => handleStockChange(p, 1)}
                    className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black active:scale-95 transition-transform cursor-pointer shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sticky Bottom Floating Action Button */}
      <div className="fixed bottom-20 lg:bottom-6 left-4 right-4 max-w-4xl mx-auto z-30">
        <button
          onClick={() => setIsAddOpen(true)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2 active:scale-98 transition-transform cursor-pointer"
        >
          <Plus className="h-5 w-5" />
          Add New Product
        </button>
      </div>

      {/* Simple Add Product Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white">Add New Product</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Milk 1L or Amul Butter"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 60"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Dairy, Snacks, Grocery"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-bold"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white font-black py-3 rounded-xl text-xs shadow-md"
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
