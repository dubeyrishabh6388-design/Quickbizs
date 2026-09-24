import { env } from "../config/env";
import React, { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  User, 
  UserPlus, 
  Receipt, 
  CheckCircle2, 
  X,
  CreditCard,
  QrCode,
  DollarSign,
  Wallet,
  Gift,
  Coins,
  MessageCircle,
  FileDown,
  Share2,
  AlertTriangle,
  Globe,
  Loader2
} from "lucide-react";
import { useBusiness } from "../context/BusinessContext";
import type { Product } from "../context/BusinessContext";
import { useProductSearch } from "../hooks/useProductSearch";
import { motion, AnimatePresence } from "framer-motion";

interface BillingProps {
  setActiveScreen?: (screen: any) => void;
}

export const Billing: React.FC<BillingProps> = ({ setActiveScreen }) => {
  const { products, customers, addOrder, addCustomer, addProduct, productSchema } = useBusiness();
  const [protectionCustomer, setProtectionCustomer] = useState<any | null>(null);

  const renderCustomBadges = (prod: Product) => {
    if (!prod.customFields) return null;
    try {
      const parsed = JSON.parse(prod.customFields);
      return (
        <div className="flex flex-wrap gap-1 mt-1">
          {Object.entries(parsed).map(([key, val]) => {
            if (key === "variants" || key === "customFields" || !val) return null;

            if (key === "expiryDate") {
              const expDate = new Date(String(val));
              const now = new Date();
              const diffMs = expDate.getTime() - now.getTime();
              const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              const isNearExpiry = diffDays < 90;

              return (
                <span 
                  key={key} 
                  className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${
                    isNearExpiry 
                      ? "bg-rose-100 text-rose-700 border border-rose-200 animate-pulse" 
                      : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  }`}
                >
                  Exp: {String(val)}
                </span>
              );
            }

            if (key === "prescriptionRequired") {
              return (
                <span 
                  key={key} 
                  className={`text-[8px] px-1.5 py-0.5 rounded font-extrabold ${
                    val === "true" 
                      ? "bg-blue-100 text-blue-800 border border-blue-200" 
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {val === "true" ? "Rx Required" : "OTC"}
                </span>
              );
            }

            if (key === "sizes" || key === "size") {
              return (
                <span key={key} className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded font-black uppercase">
                  Size: {String(val)}
                </span>
              );
            }

            if (key === "colors" || key === "color") {
              return (
                <span key={key} className="text-[8px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded font-bold">
                  Color: {String(val)}
                </span>
              );
            }

            return (
              <span key={key} className="text-[8px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                {key}: {String(val)}
              </span>
            );
          })}
        </div>
      );
    } catch (e) {
      return null;
    }
  };
  
  // Search & Filters using central hook
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredProducts
  } = useProductSearch(products);

  // Customer Selection
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("walkin");
  const [customerGroup, setCustomerGroup] = useState<"Retail" | "Member" | "Wholesale">("Retail");
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [duplicatePhoneWarning, setDuplicatePhoneWarning] = useState<string | null>(null);

  // Toast notification
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Razorpay Checkout Simulation States
  const [showRzpModal, setShowRzpModal] = useState(false);
  const [rzpLoading, setRzpLoading] = useState(false);
  const [rzpTxId, setRzpTxId] = useState("");
  const [rzpOrderId, setRzpOrderId] = useState("");
  const [rzpAmount, setRzpAmount] = useState(0);

  // Mobile view cart drawer toggler
  const [isCartOpenMobile, setIsCartOpenMobile] = useState(false);

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Find customer phone number details
  const getSelectedCustomerPhone = () => {
    const cust = customers.find(c => c.id === selectedCustomerId);
    return cust ? cust.phone : "6388248689"; // fallback mobile number
  };

  // Cart List state
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [splitCashAmount, setSplitCashAmount] = useState("");
  const [splitUpiAmount, setSplitUpiAmount] = useState("");

  const [invoiceReceipt, setInvoiceReceipt] = useState<{
    id: string;
    customerName: string;
    customerType: string;
    subtotal: number;
    discount: number;
    gst: number;
    roundOff: number;
    total: number;
    paymentMethod: string;
    splitDetails?: { cash: number; upi: number };
    items: { name: string; quantity: number; price: number }[];
    date: string;
  } | null>(null);

  // Categories
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const getSelectedCustomerName = () => {
    if (selectedCustomerId === "walkin") return "Walk-in Customer";
    return customers.find(c => c.id === selectedCustomerId)?.name || "Walk-in Customer";
  };

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + 1);
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: newQty } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const newQty = Math.max(1, Math.min(item.product.stock, item.quantity + delta));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Add Product Modal States
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [prodName, setProdName] = useState("");
  const [prodCategory, setProdCategory] = useState("Grocery");
  const [prodSupplier, setProdSupplier] = useState("Kirana Wholesale");
  const [prodPrice, setProdPrice] = useState("");
  const [prodCost, setProdCost] = useState("");
  const [prodStock, setProdStock] = useState("");
  const [prodMinStock, setProdMinStock] = useState("5");

  const [customAttributeValues, setCustomAttributeValues] = useState<Record<string, string>>({});

  const getFieldValue = (name: string): string => {
    if (name === "name") return prodName;
    if (name === "price") return prodPrice;
    if (name === "costPrice") return prodCost;
    if (name === "stock") return prodStock;
    if (name === "minStock") return prodMinStock;
    if (name === "category") return prodCategory;
    if (name === "supplierName") return prodSupplier;
    return customAttributeValues[name] || "";
  };

  const setFieldValue = (name: string, value: string) => {
    if (name === "name") setProdName(value);
    else if (name === "price") setProdPrice(value);
    else if (name === "costPrice") setProdCost(value);
    else if (name === "stock") setProdStock(value);
    else if (name === "minStock") setProdMinStock(value);
    else if (name === "category") setProdCategory(value);
    else if (name === "supplierName") setProdSupplier(value);
    else setCustomAttributeValues(prev => ({ ...prev, [name]: value }));
  };

  const renderDynamicFormBody = () => {
    const bizType = productSchema?.businessType || "Grocery Store";

    if (bizType === "Clothing Store") {
      return (
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
          {/* SECTION 1: Basic Product */}
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
              SECTION 1: Basic Product
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Classic Denim Jacket"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-brand-orange"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={customAttributeValues["brand"] || ""}
                    onChange={(e) => setCustomAttributeValues(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="e.g. Levi's"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Collection Name</label>
                  <input
                    type="text"
                    value={customAttributeValues["collectionName"] || ""}
                    onChange={(e) => setCustomAttributeValues(prev => ({ ...prev, collectionName: e.target.value }))}
                    placeholder="e.g. Summer 2026"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Category *</label>
                <div className="flex gap-2">
                  {["Men", "Women", "Kids", "Accessories"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setProdCategory(cat)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        prodCategory === cat 
                          ? "bg-brand-navy border-brand-navy text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Variants */}
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
              SECTION 2: Variants
            </h4>
            <div className="space-y-3.5">
              {/* Sizes Selector */}
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Select Sizes *</label>
                <div className="flex flex-wrap gap-1.5">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((sz) => {
                    const isSelected = customAttributeValues["sizes"] === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setCustomAttributeValues(prev => ({ ...prev, sizes: sz }))}
                        className={`h-9 w-9 rounded-xl border text-xs font-black flex items-center justify-center transition-all ${
                          isSelected 
                            ? "bg-brand-orange border-brand-orange text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Colors Selector */}
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Select Color *</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "Black", colorClass: "bg-black border-black" },
                    { name: "White", colorClass: "bg-white border-slate-400" },
                    { name: "Blue", colorClass: "bg-blue-650 border-blue-650" },
                    { name: "Red", colorClass: "bg-rose-650 border-rose-650" },
                    { name: "Green", colorClass: "bg-emerald-650 border-emerald-650" }
                  ].map((col) => {
                    const isSelected = customAttributeValues["colors"] === col.name;
                    return (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => setCustomAttributeValues(prev => ({ ...prev, colors: col.name }))}
                        className={`px-3 py-1.5 rounded-full border text-[10px] font-extrabold flex items-center gap-1.5 transition-all ${
                          isSelected 
                            ? "bg-slate-800 border-slate-800 text-white shadow-sm"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className={`h-2.5 w-2.5 rounded-full ${col.colorClass}`} />
                        {col.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fabric Selector */}
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Fabric Material *</label>
                <div className="grid grid-cols-4 gap-2">
                  {["Cotton", "Denim", "Silk", "Polyester"].map((fb) => {
                    const isSelected = customAttributeValues["fabric"] === fb;
                    return (
                      <button
                        key={fb}
                        type="button"
                        onClick={() => setCustomAttributeValues(prev => ({ ...prev, fabric: fb }))}
                        className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                          isSelected 
                            ? "bg-brand-orange text-white border-brand-orange font-extrabold"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {fb}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Pricing */}
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
              SECTION 3: Pricing & Taxes
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Cost Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={prodCost}
                  onChange={(e) => setProdCost(e.target.value)}
                  placeholder="e.g. 800"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Selling Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  placeholder="e.g. 1499"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={customAttributeValues["discount"] || ""}
                  onChange={(e) => setCustomAttributeValues(prev => ({ ...prev, discount: e.target.value }))}
                  placeholder="e.g. 10"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Tax rate (GST %)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={customAttributeValues["gst"] || ""}
                  onChange={(e) => setCustomAttributeValues(prev => ({ ...prev, gst: e.target.value }))}
                  placeholder="e.g. 12"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Inventory */}
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
              SECTION 4: Inventory
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Available Quantity *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={prodStock}
                  onChange={(e) => setProdStock(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">SKU code *</label>
                <input
                  type="text"
                  required
                  value={customAttributeValues["sku"] || ""}
                  onChange={(e) => setCustomAttributeValues(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="e.g. AP-TSH-01"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Barcode EAN</label>
                <input
                  type="text"
                  value={customAttributeValues["barcode"] || ""}
                  onChange={(e) => setCustomAttributeValues(prev => ({ ...prev, barcode: e.target.value }))}
                  placeholder="e.g. 890127..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Media */}
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
              SECTION 5: Media Assets
            </h4>
            <div className="space-y-3.5">
              <div className="h-32 border border-dashed border-slate-200 hover:border-slate-400 rounded-2xl flex flex-col items-center justify-center bg-white cursor-pointer group transition-colors">
                <div className="text-xs font-extrabold text-slate-600 group-hover:text-brand-orange transition-colors">Drag & Drop Product Images</div>
                <div className="text-[9px] text-slate-400 mt-1 font-semibold">Supports JPEG, PNG up to 5MB size</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Product Images Link</label>
                  <input
                    type="text"
                    value={customAttributeValues["images"] || ""}
                    onChange={(e) => setCustomAttributeValues(prev => ({ ...prev, images: e.target.value }))}
                    placeholder="https://..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Thumbnail Image Link</label>
                  <input
                    type="text"
                    value={customAttributeValues["thumbnail"] || ""}
                    onChange={(e) => setCustomAttributeValues(prev => ({ ...prev, thumbnail: e.target.value }))}
                    placeholder="https://..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: Seasonal */}
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5 mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-orange" />
              SECTION 6: Seasonal & Trends
            </h4>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Season Category</label>
              <div className="grid grid-cols-3 gap-2">
                {["Summer", "Winter", "Festival Collection"].map((ss) => {
                  const isSelected = customAttributeValues["season"] === ss;
                  return (
                    <button
                      key={ss}
                      type="button"
                      onClick={() => setCustomAttributeValues(prev => ({ ...prev, season: ss }))}
                      className={`py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                        isSelected 
                          ? "bg-brand-orange text-white border-brand-orange font-extrabold"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {ss}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (bizType === "Pharmacy") {
      return (
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
          {/* SECTION 1: Medicine Info */}
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] font-black text-emerald-750 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              SECTION 1: Medicine Info
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Medicine Name *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="e.g. Crocin Active"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-brand-orange"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Generic Name *</label>
                  <input
                    type="text"
                    required
                    value={customAttributeValues["genericName"] || ""}
                    onChange={(e) => setCustomAttributeValues(prev => ({ ...prev, genericName: e.target.value }))}
                    placeholder="e.g. Paracetamol 650mg"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={customAttributeValues["company"] || ""}
                    onChange={(e) => setCustomAttributeValues(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g. GSK Pharma"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Prescription Check *</label>
                  <div className="flex gap-2">
                    {["Required", "Not Required"].map((req) => {
                      const isSelected = (customAttributeValues["prescriptionRequired"] === "true" && req === "Required") ||
                                         (customAttributeValues["prescriptionRequired"] === "false" && req === "Not Required");
                      return (
                        <button
                          key={req}
                          type="button"
                          onClick={() => setCustomAttributeValues(prev => ({ ...prev, prescriptionRequired: String(req === "Required") }))}
                          className={`flex-1 py-1.5 rounded-lg border text-[10px] font-extrabold transition-all ${
                            isSelected 
                              ? "bg-rose-50 border-rose-450 text-rose-700"
                              : "bg-white border-slate-200 text-slate-500"
                          }`}
                        >
                          {req}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Category Form *</label>
                  <select
                    required
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    {["Tablet", "Syrup", "Injection", "Cream", "Capsule"].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Batch & Dates */}
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] font-black text-emerald-755 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              SECTION 2: Batch & Expiry Settings
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Batch Number *</label>
                <input
                  type="text"
                  required
                  value={customAttributeValues["batchNumber"] || ""}
                  onChange={(e) => setCustomAttributeValues(prev => ({ ...prev, batchNumber: e.target.value }))}
                  placeholder="e.g. B-CR90"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none font-mono font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Manufacturing Date</label>
                  <input
                    type="date"
                    value={customAttributeValues["mfgDate"] || ""}
                    onChange={(e) => setCustomAttributeValues(prev => ({ ...prev, mfgDate: e.target.value }))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    required
                    value={customAttributeValues["expiryDate"] || ""}
                    onChange={(e) => setCustomAttributeValues(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full bg-white border border-rose-350 ring-2 ring-rose-50 rounded-xl px-3 py-2 text-xs focus:outline-none text-rose-600 font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Dosage & Storage */}
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] font-black text-emerald-755 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              SECTION 3: Dosage & Storage Type
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Dosage instructions *</label>
                <input
                  type="text"
                  required
                  value={customAttributeValues["dosage"] || ""}
                  onChange={(e) => setCustomAttributeValues(prev => ({ ...prev, dosage: e.target.value }))}
                  placeholder="e.g. Once daily after meals"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Storage Condition *</label>
                <select
                  required
                  value={customAttributeValues["storageType"] || ""}
                  onChange={(e) => setCustomAttributeValues(prev => ({ ...prev, storageType: e.target.value }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none cursor-pointer"
                >
                  <option value="">Select storage temp</option>
                  {["Cold Storage (2-8 C)", "Room Temp (15-25 C)", "Dry Protected Area"].map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: Pricing */}
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] font-black text-emerald-755 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              SECTION 4: Pricing (MRP)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Purchase Cost (₹) *</label>
                <input
                  type="number"
                  required
                  value={prodCost}
                  onChange={(e) => setProdCost(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Selling MRP (₹) *</label>
                <input
                  type="number"
                  required
                  value={prodPrice}
                  onChange={(e) => setProdPrice(e.target.value)}
                  placeholder="e.g. 29.5"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Inventory */}
          <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] font-black text-emerald-755 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-1.5 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              SECTION 5: Stock Levels
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Available Stock (Qty) *</label>
                <input
                  type="number"
                  required
                  value={prodStock}
                  onChange={(e) => setProdStock(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Reorder Trigger Level *</label>
                <input
                  type="number"
                  required
                  value={prodMinStock}
                  onChange={(e) => setProdMinStock(e.target.value)}
                  placeholder="e.g. 20"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
        {(productSchema?.sections || []).map((section: any) => (
          <div key={section.name} className="space-y-3 border border-slate-100 bg-slate-50/50 p-4 rounded-2xl">
            <h4 className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1 mb-2">
              {section.name}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {section.fields.map((field: any) => {
                const val = getFieldValue(field.name);
                const onChange = (newVal: string) => setFieldValue(field.name, newVal);

                return (
                  <div key={field.name} className={field.type === "boolean" ? "col-span-2 flex items-center gap-2 py-1" : "col-span-2 sm:col-span-1"}>
                    {field.type === "boolean" ? (
                      <>
                        <input
                          type="checkbox"
                          id={`field-${field.name}`}
                          checked={val === "true"}
                          onChange={(e) => onChange(String(e.target.checked))}
                          className="h-4 w-4 text-brand-orange border-slate-400 rounded cursor-pointer"
                        />
                        <label htmlFor={`field-${field.name}`} className="text-xs font-bold text-slate-700 cursor-pointer">
                          {field.label} {field.required && "*"}
                        </label>
                      </>
                    ) : field.type === "select" ? (
                      <>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          {field.label} {field.required && "*"}
                        </label>
                        <select
                          required={field.required}
                          value={val}
                          onChange={(e) => onChange(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
                        >
                          <option value="">Select option</option>
                          {field.options?.map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          {field.label} {field.required && "*"}
                        </label>
                        <input
                          type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                          required={field.required}
                          value={val}
                          onChange={(e) => onChange(e.target.value)}
                          placeholder={field.placeholder || `Enter ${field.label}`}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none"
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (productSchema && productSchema.categories && productSchema.categories.length > 0) {
      setProdCategory(productSchema.categories[0]);
    }
  }, [productSchema]);

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    const price = parseFloat(prodPrice) || 0;
    const cost = parseFloat(prodCost) || 0;
    const stock = parseInt(prodStock) || 0;
    const minStock = parseInt(prodMinStock) || 0;

    if (price < 0 || cost < 0 || stock < 0 || minStock < 0) {
      alert("Error: Prices, stock levels, and minimum quantities cannot be negative.");
      return;
    }
    if (!prodCategory || !prodCategory.trim()) {
      alert("Error: Category name cannot be empty.");
      return;
    }

    addProduct({
      name: prodName,
      price,
      costPrice: cost,
      stock,
      minStock,
      category: prodCategory || "General",
      supplierName: prodSupplier || "General Supplier",
      barcode: `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      customFields: JSON.stringify(customAttributeValues)
    });

    showToast(`Added product "${prodName}" to store catalog!`);
    setIsAddingProduct(false);
    setProdName("");
    setProdPrice("");
    setProdCost("");
    setProdStock("");
    setProdMinStock("5");
    setCustomAttributeValues({});
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) return;

    const cleanPhone = newCustPhone.replace(/\D/g, "");
    const duplicate = customers.find(c => c.phone.replace(/\D/g, "") === cleanPhone);

    if (duplicate) {
      setDuplicatePhoneWarning(`Warning: This number is already assigned to ${duplicate.name}. Double profile registration is blocked.`);
      return;
    }

    addCustomer(newCustName, newCustPhone);
    setNewCustName("");
    setNewCustPhone("");
    setDuplicatePhoneWarning(null);
    setIsAddingCustomer(false);
  };

  // Pricing calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  
  let cartDiscount = 0;
  if (customerGroup === "Member") {
    cartDiscount = Math.round(cartSubtotal * 0.05);
  } else if (customerGroup === "Wholesale") {
    cartDiscount = Math.round(cartSubtotal * 0.10);
  }

  const taxableAmount = cartSubtotal - cartDiscount;
  const cartGst = Math.round(taxableAmount * 0.05 * 100) / 100;
  const rawTotal = taxableAmount + cartGst;
  const cartTotal = Math.round(rawTotal);
  const cartRoundOff = Math.round((cartTotal - rawTotal) * 100) / 100;

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (paymentMethod === "Credit" && selectedCustomerId === "walkin") {
      alert("Please select or add a customer to checkout on Credit.");
      return;
    }

    // Split Payment Validation
    let splitDetailsObj;
    if (paymentMethod === "Split") {
      const cashVal = parseFloat(splitCashAmount) || 0;
      const upiVal = parseFloat(splitUpiAmount) || 0;
      if (cashVal + upiVal !== cartTotal) {
        alert(`Split payments must equal Grand Total (₹${cartTotal}). Entered sum: ₹${cashVal + upiVal}`);
        return;
      }
      splitDetailsObj = { cash: cashVal, upi: upiVal };
    }

    // If Razorpay gateway option is selected (UPI, QR, Card, Wallet), trigger Order Creation
    const isOnlinePayment = ["UPI", "Card", "Wallet"].includes(paymentMethod);
    if (isOnlinePayment) {
      setRzpLoading(true);
      const token = localStorage.getItem("qb_token");
      if (!token) return;

      try {
        const orderRes = await fetch(`${env.apiUrl}/api/payments/create-order`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customerId: selectedCustomerId === "walkin" ? undefined : selectedCustomerId,
            amount: cartTotal,
            paymentMethod,
            remarks: `Invoice Checkout via ${paymentMethod}`,
          }),
        });

        const orderJson = await orderRes.json();
        if (orderJson.success) {
          setRzpTxId(orderJson.data.transactionId);
          setRzpOrderId(orderJson.data.gatewayOrderId);
          setRzpAmount(cartTotal);
          setShowRzpModal(true);
        } else {
          alert("Failed to initialize Razorpay checkout order.");
        }
      } catch (err) {
        console.error("Failed Razorpay checkout initialization:", err);
      } finally {
        setRzpLoading(false);
      }
      return;
    }

    // Process Cash/Credit checkouts immediately
    completeInvoiceCheckout(splitDetailsObj);
  };

  const completeInvoiceCheckout = (splitDetailsObj?: any) => {
    const orderItems = cart.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price
    }));

    const custName = getSelectedCustomerName();
    const custId = selectedCustomerId === "walkin" ? undefined : selectedCustomerId;

    addOrder(
      custId,
      custName,
      customerGroup,
      orderItems,
      cartSubtotal,
      cartDiscount,
      cartGst,
      cartRoundOff,
      cartTotal,
      paymentMethod as any,
      splitDetailsObj
    );

    setInvoiceReceipt({
      id: `INV-${Date.now().toString().slice(-4)}`,
      customerName: custName,
      customerType: customerGroup,
      subtotal: cartSubtotal,
      discount: cartDiscount,
      gst: cartGst,
      roundOff: cartRoundOff,
      total: cartTotal,
      paymentMethod,
      splitDetails: splitDetailsObj,
      items: cart.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })),
      date: new Date().toLocaleDateString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
      })
    });

    setCart([]);
    setSplitCashAmount("");
    setSplitUpiAmount("");
    setIsCartOpenMobile(false); // Close mobile drawer overlay
  };

  const handleRzpSuccess = async () => {
    setRzpLoading(true);
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const verifyRes = await fetch(`${env.apiUrl}/api/payments/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionId: rzpTxId,
          gatewayPaymentId: `pay_${Date.now()}`,
          gatewayOrderId: rzpOrderId,
          signature: "valid_signature_mock",
        }),
      });

      const verifyJson = await verifyRes.json();
      if (verifyJson.success) {
        showToast("Razorpay signature verified successfully!");
        setShowRzpModal(false);
        completeInvoiceCheckout();
      } else {
        alert("Payment signature validation failed.");
      }
    } catch (err) {
      console.error("Failed verification call:", err);
    } finally {
      setRzpLoading(false);
    }
  };

  // WhatsApp invoice message push
  const handleWhatsAppSend = () => {
    if (!invoiceReceipt) return;
    const rawPhone = getSelectedCustomerPhone().replace(/\D/g, "");
    const formattedPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    
    let itemsText = "";
    invoiceReceipt.items.forEach(item => {
      itemsText += `• ${item.name} x${item.quantity}  =  ₹${(item.price * item.quantity).toLocaleString()}\n`;
    });

    const discountText = invoiceReceipt.discount > 0 
      ? `*Discount:* -₹${invoiceReceipt.discount.toLocaleString()}\n` 
      : "";

    const roundOffText = invoiceReceipt.roundOff !== 0 
      ? `*Round Off:* ₹${invoiceReceipt.roundOff.toLocaleString()}\n` 
      : "";

    const msgText = `🧾 *QUICKBIZS STORE INVOICE*\n` +
      `---------------------------------------\n` +
      `*Invoice:* ${invoiceReceipt.id}\n` +
      `*Date:* ${invoiceReceipt.date}\n` +
      `*Customer:* ${invoiceReceipt.customerName} (${invoiceReceipt.customerType})\n` +
      `*Payment Mode:* ${invoiceReceipt.paymentMethod}\n` +
      `---------------------------------------\n` +
      `*ITEMS PURCHASED:*\n` +
      `${itemsText}` +
      `---------------------------------------\n` +
      `*Subtotal:* ₹${invoiceReceipt.subtotal.toLocaleString()}\n` +
      `${discountText}` +
      `*GST (5%):* ₹${invoiceReceipt.gst.toLocaleString()}\n` +
      `${roundOffText}` +
      `---------------------------------------\n` +
      `*GRAND TOTAL: ₹${invoiceReceipt.total.toLocaleString()}*\n` +
      `---------------------------------------\n` +
      `Thank you for shopping with us! 🙏`;

    const encoded = encodeURIComponent(msgText);
    window.open(`https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encoded}`, "_blank");
    showToast(`Redirecting to WhatsApp for number +${formattedPhone}...`);
  };

  const handleDownloadPDF = () => {
    if (!invoiceReceipt) return;
    const htmlContent = `
      <html>
      <head>
        <title>Invoice ${invoiceReceipt.id}</title>
        <style>
          body { font-family: 'Inter', system-ui, Arial, sans-serif; padding: 40px; color: #1e293b; background-color: #f8fafc; }
          .invoice-card { max-width: 500px; margin: auto; background: white; border: 1px solid #e2e8f0; padding: 40px; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
          .header { text-align: center; border-bottom: 2px dashed #cbd5e1; padding-bottom: 20px; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: 800; color: #f97316; }
          .meta { font-size: 12px; color: #64748b; margin-top: 4px; }
          .section-title { font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin: 20px 0 8px 0; }
          .details-grid { font-size: 13px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; margin-bottom: 20px; }
          .details-label { color: #64748b; }
          .details-value { font-weight: 600; text-align: right; }
          .item-row { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
          .summary-block { margin-top: 20px; text-align: right; font-size: 12px; color: #64748b; line-height: 1.6; }
          .total-row { display: flex; justify-content: space-between; font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 12px; border-top: 1px solid #cbd5e1; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <div class="header">
            <div class="logo">QuickBizs Store</div>
            <div class="meta">Tax Invoice Ledger - ${invoiceReceipt.id}</div>
          </div>
          <div class="details-grid">
            <span class="details-label">Customer:</span>
            <span class="details-value">${invoiceReceipt.customerName}</span>
            <span class="details-label">Customer Type:</span>
            <span class="details-value">${invoiceReceipt.customerType}</span>
            <span class="details-label">Date/Time:</span>
            <span class="details-value">${invoiceReceipt.date}</span>
            <span class="details-label">Payment Mode:</span>
            <span class="details-value">${invoiceReceipt.paymentMethod}</span>
          </div>
          
          <div class="section-title">Items Purchased</div>
          ${invoiceReceipt.items.map(item => `
            <div class="item-row">
              <span>${item.name} <span style="color:#94a3b8">x${item.quantity}</span></span>
              <span>₹${(item.price * item.quantity).toLocaleString()}</span>
            </div>
          `).join("")}

          <div class="summary-block">
            <div>Subtotal: ₹${invoiceReceipt.subtotal.toLocaleString()}</div>
            ${invoiceReceipt.discount > 0 ? `<div>Discount: -₹${invoiceReceipt.discount.toLocaleString()}</div>` : ""}
            <div>GST (5%): ₹${invoiceReceipt.gst.toLocaleString()}</div>
            ${invoiceReceipt.roundOff !== 0 ? `<div>Round Off: ₹${invoiceReceipt.roundOff.toLocaleString()}</div>` : ""}
            
            <div class="total-row">
              <span>Total Charges:</span>
              <span style="color:#f97316">₹${invoiceReceipt.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `invoice-${invoiceReceipt.id}.html`;
    link.click();
    showToast(`Compiled & Downloaded Printable Invoice PDF for ${invoiceReceipt.id}!`);
  };

  const handleSharePDF = async () => {
    if (!invoiceReceipt) return;
    const shareText = `QuickBizs Invoice ${invoiceReceipt.id} for ₹${invoiceReceipt.total}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${invoiceReceipt.id}`,
          text: shareText,
          url: window.location.href
        });
        showToast("Shared invoice successfully!");
      } catch (err) {
        showToast("Sharing cancelled.");
      }
    } else {
      window.open(`mailto:?subject=Invoice ${invoiceReceipt.id}&body=Hi, please find attached bill details for ₹${invoiceReceipt.total}.`, "_blank");
      showToast("Email sharing layout opened!");
    }
  };

  const renderCartContent = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Customer Select Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-4 w-4 text-slate-400" />
              Customer Group / Profile
            </label>
            <button
              onClick={() => setIsAddingCustomer(true)}
              className="text-[10px] text-brand-orange hover:text-brand-orange-hover font-bold flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              New Profile
            </button>
          </div>

          <select
            value={selectedCustomerId}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedCustomerId(val);
              if (val !== "walkin") {
                const cObj = customers.find(c => c.id === val);
                if (cObj && cObj.pendingDues > 0) {
                  setProtectionCustomer({
                    name: cObj.name,
                    outstanding: cObj.pendingDues,
                    limit: (cObj as any).creditLimit || 10000,
                    riskLevel: cObj.pendingDues > 8000 ? "Risky" : "Average",
                  });
                }
              }
              if (e.target.value === "walkin" && paymentMethod === "Credit") {
                setPaymentMethod("Cash");
              }
            }}
            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="walkin">Walk-in Customer (Retail)</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone})
              </option>
            ))}
          </select>

          {/* Customer Type Segment Toggles */}
          <div className="grid grid-cols-3 gap-1.5 border-t border-slate-200/50 pt-2.5">
            {["Retail", "Member", "Wholesale"].map((group) => (
              <button
                key={group}
                onClick={() => setCustomerGroup(group as any)}
                className={`py-1.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all border ${
                  customerGroup === group
                    ? "bg-brand-navy border-brand-navy text-white shadow-sm"
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {group} {group === "Member" ? "(5%)" : group === "Wholesale" ? "(10%)" : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Shopping Cart List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[150px]">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cart List</h3>
          
          {cart.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400">
              <Receipt className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-xs font-bold">Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div 
                  key={item.product.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50"
                >
                  <div className="flex-1 pr-3">
                    <h5 className="font-bold text-slate-800 text-xs truncate max-w-[150px]">{item.product.name}</h5>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">₹{item.product.price} / item</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                      <button
                        onClick={() => updateCartQty(item.product.id, -1)}
                        className="p-1 hover:bg-slate-50 text-slate-500 border-r border-slate-200"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-2 text-xs font-bold text-slate-700">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQty(item.product.id, 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-1 hover:bg-slate-50 text-slate-500 border-l border-slate-200"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Checkout Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-4 shrink-0">
          
          {/* Payment Method Selector */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Payment Method
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentMethod("Cash")}
                className={`py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
                  paymentMethod === "Cash" ? "bg-brand-navy text-white" : "bg-white border-slate-200 text-slate-605"
                }`}
              >
                <DollarSign className="h-3 w-3" />
                Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("UPI")}
                className={`py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
                  paymentMethod === "UPI" ? "bg-brand-navy text-white animate-pulse" : "bg-white border-slate-200 text-slate-605"
                }`}
              >
                <QrCode className="h-3 w-3" />
                UPI
              </button>
              <button
                type="button"
                disabled={selectedCustomerId === "walkin"}
                onClick={() => setPaymentMethod("Credit")}
                className={`py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
                  selectedCustomerId === "walkin"
                    ? "bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed"
                    : paymentMethod === "Credit" ? "bg-brand-navy text-white" : "bg-white border-slate-200 text-slate-605"
                }`}
              >
                <Coins className="h-3 w-3" />
                Credit
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("Split")}
                className={`py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
                  paymentMethod === "Split" ? "bg-brand-navy text-white" : "bg-white border-slate-200 text-slate-605"
                }`}
              >
                <Gift className="h-3 w-3" />
                Split
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("Card")}
                className={`py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
                  paymentMethod === "Card" ? "bg-brand-navy text-white animate-pulse" : "bg-white border-slate-200 text-slate-605"
                }`}
              >
                <CreditCard className="h-3 w-3" />
                Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("Wallet")}
                className={`py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
                  paymentMethod === "Wallet" ? "bg-brand-navy text-white animate-pulse" : "bg-white border-slate-200 text-slate-605"
                }`}
              >
                <Wallet className="h-3 w-3" />
                Wallet
              </button>
            </div>
          </div>

          {/* Split Payment inputs */}
          {paymentMethod === "Split" && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="bg-slate-100 p-3 rounded-xl gap-2 grid grid-cols-2 text-xs border border-slate-200"
            >
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Cash Share (₹)</label>
                <input
                  type="number"
                  value={splitCashAmount}
                  onChange={(e) => setSplitCashAmount(e.target.value)}
                  placeholder="e.g. 200"
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-0.5">UPI Share (₹)</label>
                <input
                  type="number"
                  value={splitUpiAmount}
                  onChange={(e) => setSplitUpiAmount(e.target.value)}
                  placeholder={`e.g. ${cartTotal - (parseFloat(splitCashAmount) || 0)}`}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none"
                />
              </div>
            </motion.div>
          )}

          {/* Pricing calculations details */}
          <div className="space-y-1.5 text-xs text-slate-500 font-medium">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{cartSubtotal.toLocaleString()}</span>
            </div>
            {cartDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Group Discount ({customerGroup}):</span>
                <span>-₹{cartDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>GST (5%):</span>
              <span>₹{cartGst.toLocaleString()}</span>
            </div>
            {cartRoundOff !== 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Round Off:</span>
                <span>₹{cartRoundOff.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-slate-800 border-t border-slate-200/60 pt-2 mt-1">
              <span>Grand Total:</span>
              <span className="text-brand-orange font-black">₹{cartTotal.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || rzpLoading}
            className={`w-full py-3.5 rounded-xl text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all active:scale-[0.99] ${
              cart.length === 0 || rzpLoading
                ? "bg-slate-300 dark:bg-slate-800 shadow-none cursor-not-allowed text-slate-400"
                : "bg-brand-orange hover:bg-brand-orange-hover shadow-brand-orange/20"
            }`}
          >
            {rzpLoading ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              <Receipt className="h-4.5 w-4.5" />
            )}
            Create & Print Invoice (Save Bill)
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-y-auto lg:overflow-hidden relative bg-slate-50 dark:bg-slate-950 pb-20 lg:pb-0 text-slate-900 dark:text-white">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-55 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-2xl"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span className="text-xs font-semibold">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT PANEL: Product Grid */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-visible lg:overflow-hidden">
        
        <div className="space-y-3.5 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Billing & Checkout Terminal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Select items to bill · Instant barcode lookup & customer category discount engine
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, brand, or barcode..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>
            <button
              onClick={() => setIsAddingProduct(true)}
              className="bg-brand-orange hover:bg-brand-orange-hover text-white font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98 cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
            
            <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                    selectedCategory === cat
                      ? "bg-brand-orange text-white shadow-xs"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 pb-16 lg:pb-0">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-slate-200 rounded-2xl bg-white">
              <Search className="h-10 w-10 text-slate-300 mb-3" />
              <p className="font-bold text-slate-700">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((prod) => {
                const isOutOfStock = prod.stock <= 0;
                const isLowStock = prod.stock <= prod.minStock;
                const inCartItem = cart.find(item => item.product.id === prod.id);
                const cartQty = inCartItem?.quantity || 0;
                const isLimit = cartQty >= prod.stock;

                return (
                  <motion.div
                    key={prod.id}
                    whileTap={!isOutOfStock && !isLimit ? { scale: 0.97 } : {}}
                    onClick={() => !isOutOfStock && !isLimit && addToCart(prod)}
                    className={`bg-white rounded-xl border p-4 flex flex-col justify-between h-40 cursor-pointer select-none transition-all relative ${
                      isOutOfStock
                        ? "opacity-50 border-slate-200 bg-slate-50 cursor-not-allowed"
                        : isLimit
                          ? "border-brand-orange/40 ring-2 ring-brand-orange/10 bg-brand-orange/5"
                          : cartQty > 0
                            ? "border-brand-orange ring-2 ring-brand-orange/10 shadow-sm"
                            : "border-slate-100 hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 flex-wrap">
                      <div className="flex flex-wrap gap-1 items-center max-w-[80%]">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                          {prod.category}
                        </span>
                        {renderCustomBadges(prod)}
                      </div>
                      {cartQty > 0 && (
                        <span className="h-5 w-5 rounded-full bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {cartQty}
                        </span>
                      )}
                    </div>

                    <div className="my-2">
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-2 leading-tight">
                        {prod.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[10px] font-bold ${isLowStock ? "text-brand-orange" : "text-slate-500"}`}>
                          {isOutOfStock ? "Out of Stock" : `${prod.stock} units left`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-55 pt-2 mt-1">
                      <span className="text-sm font-extrabold text-slate-900">₹{prod.price}</span>
                      <span className="text-[10px] font-bold text-brand-orange">
                        {isOutOfStock ? "Sold Out" : "Add +"}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom bar triggering mobile view cart panel */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-14 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-2xl flex items-center justify-between z-30">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase">Total Bill</span>
            <span className="text-xs font-black text-brand-orange">
              ₹{cartTotal.toLocaleString()} ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
            </span>
          </div>
          <button
            onClick={() => setIsCartOpenMobile(true)}
            className="bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-extrabold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          >
            <Receipt className="h-4 w-4" />
            Checkout Cart
          </button>
        </div>
      )}

      {/* RIGHT PANEL: Checkout Cart Panel (Desktop only) */}
      <div className="hidden lg:flex w-full lg:w-96 bg-white border-l border-slate-200 flex-col h-full shadow-2xl relative">
        {renderCartContent()}
      </div>

      {/* Cart Drawer Overlay for Mobile viewports */}
      <AnimatePresence>
        {isCartOpenMobile && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full sm:w-96 bg-white h-full flex flex-col shadow-2xl relative pb-20"
            >
              {/* Drawer header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="h-4.5 w-4.5 text-brand-orange" />
                  Your Checkout Cart
                </h3>
                <button 
                  onClick={() => setIsCartOpenMobile(false)}
                  className="p-1.5 border border-slate-200 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  <X className="h-5 w-5 text-slate-700" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {renderCartContent()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Add Customer Dialog */}
      <AnimatePresence>
        {isAddingCustomer && (
          <div className="fixed inset-0 z-55 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-sm p-5 border border-slate-100 shadow-2xl relative text-slate-700"
            >
              <button
                onClick={() => { setIsAddingCustomer(false); setDuplicatePhoneWarning(null); }}
                className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-1.5">
                <UserPlus className="h-5 w-5 text-brand-orange" />
                Add Customer Profile
              </h4>
              <form onSubmit={handleCreateCustomer} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustName}
                    onChange={(e) => setNewCustName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={newCustPhone}
                    onChange={(e) => setNewCustPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none"
                  />
                </div>

                {duplicatePhoneWarning && (
                  <div className="bg-rose-50 border border-rose-100 p-2.5 rounded-lg text-[10px] font-bold text-rose-600 leading-normal">
                    {duplicatePhoneWarning}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Save Profile
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Receipt Invoice Dialog */}
      <AnimatePresence>
        {invoiceReceipt && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-md p-6 border border-slate-100 shadow-2xl relative text-slate-755"
            >
              <div className="flex flex-col items-center text-center pb-4 border-b border-dashed border-slate-200">
                <div className="h-12 w-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-800">Bill Saved Successfully!</h3>
                <p className="text-xs text-brand-paragraph mt-1">Invoice {invoiceReceipt.id} printed & cached.</p>
              </div>

              {/* Receipt details */}
              <div className="py-4 space-y-3 font-sans text-xs">
                <div className="flex justify-between text-slate-500 font-semibold">
                  <span>Customer:</span>
                  <span className="text-slate-800 font-bold">{invoiceReceipt.customerName}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-semibold">
                  <span>Customer Group:</span>
                  <span className="text-slate-800 font-bold">{invoiceReceipt.customerType}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-semibold">
                  <span>Date/Time:</span>
                  <span className="text-slate-800 font-bold">{invoiceReceipt.date}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-semibold">
                  <span>Payment Mode:</span>
                  <span className="bg-emerald-55 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    {invoiceReceipt.paymentMethod}
                  </span>
                </div>

                {invoiceReceipt.splitDetails && (
                  <div className="bg-slate-50 p-2 rounded border border-slate-100 flex justify-between text-slate-500 font-semibold">
                    <span>Split Breakdown:</span>
                    <span>Cash: ₹{invoiceReceipt.splitDetails.cash} | UPI: ₹{invoiceReceipt.splitDetails.upi}</span>
                  </div>
                )}

                {/* Items Purchased table */}
                <div className="border-t border-b border-slate-100 py-3 my-2 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Items Purchased</span>
                  {invoiceReceipt.items.map((item, index) => (
                    <div key={index} className="flex justify-between font-semibold text-slate-755">
                      <span>
                        {item.name} <span className="text-slate-400">x{item.quantity}</span>
                      </span>
                      <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 text-right text-[11px] font-medium text-slate-400">
                  <div>Subtotal: ₹{invoiceReceipt.subtotal.toLocaleString()}</div>
                  {invoiceReceipt.discount > 0 && <div>Discount: -₹{invoiceReceipt.discount.toLocaleString()}</div>}
                  <div>GST (5%): ₹{invoiceReceipt.gst.toLocaleString()}</div>
                  {invoiceReceipt.roundOff !== 0 && <div>Round Off: ₹{invoiceReceipt.roundOff.toLocaleString()}</div>}
                </div>

                <div className="flex justify-between text-sm font-extrabold text-slate-800 pt-1.5 border-t border-slate-100">
                  <span>Total Charges:</span>
                  <span className="text-brand-orange text-base font-black">₹{invoiceReceipt.total.toLocaleString()}</span>
                </div>
              </div>

              {/* Connected Share & PDF Actions */}
              <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-slate-100/60">
                <button
                  onClick={handleWhatsAppSend}
                  className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 font-bold rounded-xl text-[10px] flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <FileDown className="h-4 w-4" />
                  Download PDF
                </button>
                <button
                  onClick={handleSharePDF}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Share Receipt
                </button>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setInvoiceReceipt(null)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                >
                  Close Bill
                </button>
                <button
                  onClick={() => {
                    alert("Printing Invoice to local thermal printer...");
                    setInvoiceReceipt(null);
                  }}
                  className="flex-1 py-2.5 bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Receipt className="h-4 w-4" />
                  Print Receipt
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Add Product to Catalog */}
      <AnimatePresence>
        {isAddingProduct && (
          <div className="fixed inset-0 z-55 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 text-slate-700">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`bg-white rounded-2xl w-full p-6 border border-slate-100 shadow-2xl relative text-slate-700 font-sans transition-all duration-300 ${
                productSchema?.businessType === "Clothing Store" ? "max-w-2xl" : "max-w-md"
              }`}
            >
              <button
                onClick={() => setIsAddingProduct(false)}
                className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5 border-b border-slate-100 pb-3 mb-4">
                <Plus className="h-5 w-5 text-brand-orange" />
                Add Product to Catalog ({productSchema?.businessType || "Grocery Store"})
              </h3>

              <form onSubmit={handleAddProductSubmit} className="space-y-4">
                {renderDynamicFormBody()}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingProduct(false)}
                    className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Save Product Card
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Billing Protection Popup */}
      {protectionCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black opacity-60" onClick={() => setProtectionCustomer(null)} />
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full relative z-10 space-y-4 shadow-2xl text-slate-500 font-semibold text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-md font-bold text-rose-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Billing Protection Alert
              </h3>
              <button onClick={() => setProtectionCustomer(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 font-semibold text-xs text-slate-605">
              <p>Selected customer risk level is high. Outstanding dues detail:</p>
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl space-y-1.5 text-slate-700">
                <div>Customer Name: <strong className="text-slate-900">{protectionCustomer.name}</strong></div>
                <div>Outstanding Amount: <strong className="text-rose-600">₹{protectionCustomer.outstanding.toLocaleString()}</strong></div>
                <div>Pending Days: <strong className="text-slate-900">12 Days Overdue</strong></div>
                <div>Trust Score: <strong className="text-slate-900">75/100</strong></div>
                <div>Risk Level: <span className="px-2 py-0.5 rounded bg-rose-250 text-rose-800 text-[10px] font-bold">{protectionCustomer.riskLevel}</span></div>
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => setProtectionCustomer(null)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-all"
              >
                Continue Billing
              </button>
              <button
                onClick={() => {
                  setProtectionCustomer(null);
                  if (setActiveScreen) setActiveScreen("customers");
                }}
                className="w-full py-2 bg-brand-orange hover:bg-orange-600 text-white rounded-xl font-bold cursor-pointer transition-all"
              >
                Collect Payment
              </button>
              <button
                onClick={() => {
                  setSelectedCustomerId("walkin");
                  setProtectionCustomer(null);
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-all"
              >
                Block Billing (Switch to Walk-in)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Razorpay Checkout Modal */}
      {showRzpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl w-full max-w-sm p-6 border border-slate-200 shadow-2xl relative text-slate-700 font-sans space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-md font-bold text-slate-800 flex items-center gap-1.5">
                <Globe className="h-5 w-5 text-brand-orange" />
                Razorpay Checkout Gateway
              </h4>
              <button onClick={() => setShowRzpModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 font-semibold text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Merchant Order ID:</span>
                <strong className="text-slate-900">{rzpOrderId}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span>Merchant Billing Method:</span>
                <strong className="text-brand-orange uppercase">{paymentMethod}</strong>
              </div>
              <div className="flex justify-between text-base font-extrabold pt-1">
                <span>Total Amount:</span>
                <span className="text-brand-orange text-lg">₹{rzpAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-[10px] text-slate-700 leading-relaxed font-bold">
              ⚠️ Sandbox Simulation Mode is enabled. The system will verify the checkout signature with Razorpay default keys.
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleRzpSuccess}
                disabled={rzpLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                {rzpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Simulate Razorpay Success
              </button>
              <button
                onClick={() => setShowRzpModal(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-all"
              >
                Simulate Cancel/Failure
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
export default Billing;
