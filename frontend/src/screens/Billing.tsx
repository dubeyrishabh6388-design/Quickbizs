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
import { DynamicProductForm } from "../components/dynamic";

interface BillingProps {
  setActiveScreen?: (screen: any) => void;
}

export const Billing: React.FC<BillingProps> = ({ setActiveScreen }) => {
  const { products, customers, addOrder, addCustomer, addProduct, productSchema, businessPreferences } = useBusiness();
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

  // Customer Selection & Category-Aware Pricing Tiers
  const bType = businessPreferences?.businessType || productSchema?.businessType || "";
  const isAuto = bType.toLowerCase().includes("auto");
  const isElect = bType.toLowerCase().includes("electr");
  const isHardware = bType.toLowerCase().includes("hardw");

  const availableGroups = React.useMemo(() => {
    const custTypes = (productSchema as any)?.customerTypes;
    if (custTypes && Array.isArray(custTypes) && custTypes.length > 0) {
      return custTypes.map((ct: any) => ct.key || ct.label);
    }
    if (isAuto) return ["Retail", "Wholesale", "Mechanic"];
    if (isElect) return ["Retail", "Wholesale", "Contractor", "Electrician"];
    if (isHardware) return ["Retail", "Wholesale", "Contractor"];
    return ["Retail", "Member", "Wholesale"];
  }, [productSchema, isAuto, isElect, isHardware]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("walkin");
  const [customerGroup, setCustomerGroup] = useState<string>("Retail");
  const [vehicleDetails, setVehicleDetails] = useState("");
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [duplicatePhoneWarning, setDuplicatePhoneWarning] = useState<string | null>(null);

  const getItemPrice = (prod: Product, group: string) => {
    if (prod.customFields) {
      try {
        const c = typeof prod.customFields === "string" ? JSON.parse(prod.customFields) : prod.customFields;
        // Check priceTiers from registry schema
        const tiers = (productSchema as any)?.priceTiers;
        if (tiers && Array.isArray(tiers)) {
          const grpLower = (group || "").toLowerCase();
          for (const tier of tiers) {
            const matchesTier =
              tier.key.toLowerCase().includes(grpLower) ||
              tier.label.toLowerCase().includes(grpLower) ||
              (tier.tierAliases && tier.tierAliases.some((a: string) => grpLower.includes(a.toLowerCase())));
            if (matchesTier && c[tier.key] !== undefined && c[tier.key] !== "") {
              return Number(c[tier.key]);
            }
          }
        }
        if (group === "Mechanic" && c.mechanicPrice) return Number(c.mechanicPrice);
        if (group === "Contractor" && c.contractorPrice) return Number(c.contractorPrice);
        if (group === "Electrician" && c.electricianPrice) return Number(c.electricianPrice);
        if (group === "Wholesale" && c.wholesalePrice) return Number(c.wholesalePrice);
        if (group === "Dealer" && c.dealerPrice) return Number(c.dealerPrice);
      } catch (e) {}
    }
    return prod.price;
  };

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

  // Desktop POS Keyboard Shortcuts & Continuous Barcode Scanning
  const searchInputRef = React.useRef<HTMLInputElement | null>(null);
  const customerSelectRef = React.useRef<HTMLSelectElement | null>(null);
  const barcodeBuffer = React.useRef<string>("");
  const lastKeyTime = React.useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F2 -> Focus Product Search
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        showToast("🔍 Product Search Active (F2)");
        return;
      }

      // F4 -> Focus Customer Selector
      if (e.key === "F4") {
        e.preventDefault();
        customerSelectRef.current?.focus();
        showToast("👤 Customer Selector Active (F4)");
        return;
      }

      // F8 -> Focus Payment & Checkout
      if (e.key === "F8") {
        e.preventDefault();
        if (cart.length === 0) {
          showToast("Cart is empty! Add products first.");
        } else {
          showToast("💳 Payment Ready (F8)");
          const checkoutBtn = document.getElementById("pos-checkout-btn");
          checkoutBtn?.focus();
          checkoutBtn?.click();
        }
        return;
      }

      // Continuous Barcode Reader Detection & Enter Key Match
      const now = performance.now();
      const interval = now - lastKeyTime.current;
      lastKeyTime.current = now;

      if (e.key === "Enter") {
        const potentialBarcode = barcodeBuffer.current.trim();
        barcodeBuffer.current = "";

        const queryToMatch = (potentialBarcode || searchQuery || "").trim().toLowerCase();
        if (queryToMatch) {
          const matchedProd = products.find(
            (p) =>
              (p.barcode && p.barcode.toLowerCase() === queryToMatch) ||
              p.name.toLowerCase() === queryToMatch
          );

          if (matchedProd) {
            e.preventDefault();
            addToCart(matchedProd);
            setSearchQuery("");
            showToast(`⚡ Added "${matchedProd.name}" via Barcode/Enter`);
            return;
          } else if (filteredProducts.length === 1 && document.activeElement === searchInputRef.current) {
            e.preventDefault();
            addToCart(filteredProducts[0]);
            setSearchQuery("");
            showToast(`✓ Added "${filteredProducts[0].name}"`);
            return;
          }
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // Keystroke stream from barcode scanner
        if (interval < 50) {
          barcodeBuffer.current += e.key;
        } else {
          barcodeBuffer.current = e.key;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart, products, searchQuery, filteredProducts]);

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

  // Pricing calculations (incorporating category price tiers: wholesale/mechanic/contractor/electrician)
  const cartSubtotal = cart.reduce((acc, item) => acc + getItemPrice(item.product, customerGroup) * item.quantity, 0);
  
  let cartDiscount = 0;
  if (customerGroup === "Member") {
    cartDiscount = Math.round(cartSubtotal * 0.05);
  } else if (customerGroup === "Wholesale") {
    const hasCustomWholesale = cart.some(item => {
      if (!item.product.customFields) return false;
      try {
        const c = JSON.parse(item.product.customFields);
        return !!c.wholesalePrice;
      } catch { return false; }
    });
    if (!hasCustomWholesale) {
      cartDiscount = Math.round(cartSubtotal * 0.10);
    }
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
      price: getItemPrice(item.product, customerGroup)
    }));

    const custName = getSelectedCustomerName();
    const custId = selectedCustomerId === "walkin" ? undefined : selectedCustomerId;

    addOrder(
      custId,
      custName,
      customerGroup as any,
      orderItems,
      cartSubtotal,
      cartDiscount,
      cartGst,
      cartRoundOff,
      cartTotal,
      paymentMethod as any,
      splitDetailsObj,
      {
        priceLevel: customerGroup,
        vehicleDetails: isAuto ? vehicleDetails : undefined,
      }
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
        price: getItemPrice(item.product, customerGroup)
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
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
        {/* Customer Select Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/80 space-y-2.5 sm:space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <label className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
              Customer Profile
            </label>
            <button
              onClick={() => setIsAddingCustomer(true)}
              className="text-[10px] sm:text-xs text-brand-orange hover:text-brand-orange-hover font-bold flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              New Profile
            </button>
          </div>

          <select
            ref={customerSelectRef}
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
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 sm:py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-orange"
          >
            <option value="walkin">Walk-in Customer (Retail)</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone})
              </option>
            ))}
          </select>

          {/* Category-Aware Price Level Toggles */}
          <div className="flex flex-wrap gap-1.5 border-t border-slate-200/50 dark:border-slate-800 pt-2">
            {availableGroups.map((group: string) => (
              <button
                key={group}
                onClick={() => setCustomerGroup(group)}
                className={`flex-1 min-w-[70px] py-1.5 px-1 rounded-lg text-[10px] font-extrabold cursor-pointer transition-all border text-center ${
                  customerGroup === group
                    ? "bg-brand-navy dark:bg-brand-orange border-brand-navy dark:border-brand-orange text-white shadow-xs"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                {group} {group === "Member" ? "(5%)" : group === "Wholesale" ? "(Whl)" : ""}
              </button>
            ))}
          </div>

          {/* Vehicle Details Input (Auto Parts) */}
          {isAuto && (
            <div className="pt-2 border-t border-slate-200/50 dark:border-slate-800">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Vehicle / Model Details
              </label>
              <input
                type="text"
                placeholder="e.g. Swift 2018 (DL-01-AB-1234) / Diesel"
                value={vehicleDetails}
                onChange={(e) => setVehicleDetails(e.target.value)}
                className="w-full text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-orange"
              />
            </div>
          )}
        </div>

        {/* Shopping Cart List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 min-h-[140px]">
          <h3 className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Cart Items ({cart.length})</h3>
          
          {cart.length === 0 ? (
            <div className="h-40 flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-600">
              <Receipt className="h-7 w-7 mb-2 opacity-50" />
              <p className="text-xs font-bold">Cart is empty</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Tap products on the left to add items</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => {
                const itemPrice = getItemPrice(item.product, customerGroup);
                return (
                  <div 
                    key={item.product.id}
                    className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="flex-1 pr-2 min-w-0">
                      <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">{item.product.name}</h5>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold">₹{itemPrice} / item</p>
                        {itemPrice !== item.product.price && (
                          <span className="text-[8px] font-bold text-brand-orange px-1 py-0.2 bg-brand-orange/10 rounded">
                            {customerGroup}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 overflow-hidden shadow-2xs">
                        <button
                          onClick={() => updateCartQty(item.product.id, -1)}
                          className="p-1 sm:p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-1.5 sm:px-2 text-xs font-bold text-slate-700 dark:text-slate-200">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.product.id, 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="p-1 sm:p-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 border-l border-slate-200 dark:border-slate-700 disabled:opacity-30 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <span className="text-xs font-black text-slate-900 dark:text-white min-w-[50px] text-right">
                        ₹{itemPrice * item.quantity}
                      </span>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>

        {/* Cart Checkout Actions */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 space-y-2.5 sm:space-y-3.5 shrink-0">
          
          {/* Payment Method Selector */}
          <div>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
              Payment Method
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setPaymentMethod("Cash")}
                className={`py-1.5 sm:py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
                  paymentMethod === "Cash" ? "bg-brand-navy dark:bg-brand-orange text-white border-transparent shadow-xs" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                <DollarSign className="h-3 w-3" />
                Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("UPI")}
                className={`py-1.5 sm:py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
                  paymentMethod === "UPI" ? "bg-brand-navy dark:bg-brand-orange text-white border-transparent shadow-xs" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                <QrCode className="h-3 w-3" />
                UPI
              </button>
              <button
                type="button"
                disabled={selectedCustomerId === "walkin"}
                onClick={() => setPaymentMethod("Credit")}
                className={`py-1.5 sm:py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
                  selectedCustomerId === "walkin"
                    ? "bg-slate-100 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                    : paymentMethod === "Credit" ? "bg-brand-navy dark:bg-brand-orange text-white border-transparent shadow-xs" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                <Coins className="h-3 w-3" />
                Credit
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("Split")}
                className={`py-1.5 sm:py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
                  paymentMethod === "Split" ? "bg-brand-navy dark:bg-brand-orange text-white border-transparent shadow-xs" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                <Gift className="h-3 w-3" />
                Split
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("Card")}
                className={`py-1.5 sm:py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
                  paymentMethod === "Card" ? "bg-brand-navy dark:bg-brand-orange text-white border-transparent shadow-xs" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                }`}
              >
                <CreditCard className="h-3 w-3" />
                Card
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("Wallet")}
                className={`py-1.5 sm:py-2 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all border ${
                  paymentMethod === "Wallet" ? "bg-brand-navy dark:bg-brand-orange text-white border-transparent shadow-xs" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
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
              className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl gap-2 grid grid-cols-2 text-xs border border-slate-200 dark:border-slate-700"
            >
              <div>
                <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">Cash Share (₹)</label>
                <input
                  type="number"
                  value={splitCashAmount}
                  onChange={(e) => setSplitCashAmount(e.target.value)}
                  placeholder="e.g. 200"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5">UPI Share (₹)</label>
                <input
                  type="number"
                  value={splitUpiAmount}
                  onChange={(e) => setSplitUpiAmount(e.target.value)}
                  placeholder={`e.g. ${cartTotal - (parseFloat(splitCashAmount) || 0)}`}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </motion.div>
          )}

          {/* Pricing calculations details */}
          <div className="space-y-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">₹{cartSubtotal.toLocaleString()}</span>
            </div>
            {cartDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                <span>Group Discount ({customerGroup}):</span>
                <span>-₹{cartDiscount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>GST (5%):</span>
              <span className="text-slate-700 dark:text-slate-200">₹{cartGst.toLocaleString()}</span>
            </div>
            {cartRoundOff !== 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Round Off:</span>
                <span>₹{cartRoundOff.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm sm:text-base font-extrabold text-slate-800 dark:text-white border-t border-slate-200/60 dark:border-slate-800 pt-1.5 mt-0.5">
              <span>Grand Total:</span>
              <span className="text-brand-orange font-black">₹{cartTotal.toLocaleString()}</span>
            </div>
          </div>

          <button
            id="pos-checkout-btn"
            onClick={handleCheckout}
            disabled={cart.length === 0 || rzpLoading}
            className={`w-full py-2.5 sm:py-3.5 rounded-xl text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all active:scale-[0.99] ${
              cart.length === 0 || rzpLoading
                ? "bg-slate-300 dark:bg-slate-800 shadow-none cursor-not-allowed text-slate-400"
                : "bg-brand-orange hover:bg-brand-orange-hover shadow-brand-orange/20"
            }`}
          >
            {rzpLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Receipt className="h-4 w-4" />
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
      <div className="flex-1 flex flex-col p-2.5 sm:p-4 lg:p-6 overflow-visible lg:overflow-hidden">
        
        <div className="space-y-2.5 sm:space-y-3.5 mb-3 sm:mb-4">
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Billing & Checkout Terminal
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 line-clamp-1 sm:line-clamp-none">
              Select items to bill · Instant barcode lookup & customer category discount engine
            </p>
          </div>

          {/* Desktop POS Shortcut Ribbon */}
          <div className="hidden lg:flex items-center gap-2 text-[10px] font-bold text-slate-500 mb-1">
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              <kbd className="font-mono text-indigo-600 dark:text-indigo-400">F2</kbd> Search
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              <kbd className="font-mono text-indigo-600 dark:text-indigo-400">F4</kbd> Customer
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              <kbd className="font-mono text-indigo-600 dark:text-indigo-400">F8</kbd> Payment
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              <kbd className="font-mono text-indigo-600 dark:text-indigo-400">Enter</kbd> Add Matched
            </span>
            <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Barcode Scanner Active
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, brand, or barcode..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 sm:py-2.5 text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>
            <button
              onClick={() => setIsAddingProduct(true)}
              className="bg-brand-orange hover:bg-brand-orange-hover text-white font-black px-3.5 py-2 sm:py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Add Product
            </button>
            
            <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
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

        <div className="flex-1 overflow-y-auto pr-0.5 pb-20 lg:pb-0">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
              <Search className="h-8 w-8 sm:h-10 sm:w-10 text-slate-300 dark:text-slate-600 mb-2 sm:mb-3" />
              <p className="font-bold text-slate-700 dark:text-slate-300 text-xs sm:text-sm">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
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
                    className={`rounded-xl sm:rounded-2xl border p-2 sm:p-3 flex flex-col justify-between min-h-[125px] sm:min-h-[145px] cursor-pointer select-none transition-all relative ${
                      isOutOfStock
                        ? "opacity-50 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 cursor-not-allowed"
                        : isLimit
                          ? "border-brand-orange/40 ring-2 ring-brand-orange/20 bg-brand-orange/5 dark:bg-brand-orange/10"
                          : cartQty > 0
                            ? "border-brand-orange ring-2 ring-brand-orange/20 bg-white dark:bg-slate-900 shadow-sm"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1 flex-wrap">
                      <div className="flex flex-wrap gap-1 items-center max-w-[80%]">
                        <span className="text-[9px] sm:text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded-md font-bold truncate">
                          {prod.category}
                        </span>
                        {renderCustomBadges(prod)}
                      </div>
                      {cartQty > 0 && (
                        <span className="h-4.5 w-4.5 rounded-full bg-brand-orange text-white text-[9px] font-black flex items-center justify-center shrink-0 shadow-2xs">
                          {cartQty}
                        </span>
                      )}
                    </div>

                    <div className="my-1.5">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm line-clamp-2 leading-tight">
                        {prod.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[9px] sm:text-[10px] font-bold ${isLowStock ? "text-brand-orange" : "text-slate-400 dark:text-slate-500"}`}>
                          {isOutOfStock ? "Out of Stock" : `${prod.stock} left`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-1.5 mt-1">
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">₹{prod.price}</span>
                      <span className="text-[10px] sm:text-xs font-black text-brand-orange">
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
        <div className="lg:hidden fixed bottom-[72px] left-3 right-3 p-2.5 px-3.5 bg-slate-900/95 dark:bg-slate-800/95 text-white backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl flex items-center justify-between z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-brand-orange text-white flex items-center justify-center font-black text-xs shadow-xs">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Total Bill</span>
              <span className="text-xs sm:text-sm font-black text-brand-orange">
                ₹{cartTotal.toLocaleString()}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpenMobile(true)}
            className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          >
            <Receipt className="h-4 w-4" />
            Checkout Cart
          </button>
        </div>
      )}

      {/* RIGHT PANEL: Checkout Cart Panel (Desktop only) */}
      <div className="hidden lg:flex w-full lg:w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex-col h-full shadow-2xl relative">
        {renderCartContent()}
      </div>

      {/* Cart Drawer Overlay for Mobile viewports */}
      <AnimatePresence>
        {isCartOpenMobile && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex justify-end">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full sm:w-96 bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl relative pb-20"
            >
              {/* Drawer header */}
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/90">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="h-4 w-4 text-brand-orange" />
                  Your Checkout Cart
                </h3>
                <button 
                  onClick={() => setIsCartOpenMobile(false)}
                  className="p-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl cursor-pointer"
                >
                  <X className="h-4.5 w-4.5" />
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
              className="bg-white rounded-2xl w-full max-w-2xl p-5 border border-slate-100 shadow-2xl relative text-slate-700 font-sans max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsAddingProduct(false)}
                className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

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
                    supplierName: data.supplierName || "Standard Supplier",
                    barcode: data.barcode,
                    customFields: Object.keys(data.customFields).length > 0 ? JSON.stringify(data.customFields) : undefined,
                  });

                  if (res?.success) {
                    setIsAddingProduct(false);
                    showToast(res.isMerged ? (res.message || `✓ Updated "${data.name}"`) : "✓ Product added to catalog");
                  } else {
                    showToast(res?.message || "Failed to add product");
                  }
                }}
                onCancel={() => setIsAddingProduct(false)}
              />
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
