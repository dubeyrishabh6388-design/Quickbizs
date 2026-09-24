import { env } from "../config/env";
import React, { useState, useEffect } from "react";
import { 
  ArrowLeft,
  Zap, 
  Flame, 
  ShoppingCart, 
  Trash2, 
  CheckCircle,
  Clock,
  UserCheck,
  Plus,
  Volume2,
  VolumeX,
  Layers,
  Copy,
  Printer,
  Share2,
  MessageSquare,
  Pin,
  Search,
  Merge,
  Ban,
  Scale,
  Hash
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  barcode?: string;
}

interface Combo {
  id: string;
  name: string;
  description: string | null;
  price: number;
  productIds: string; // JSON array of product IDs
}

interface CartItem {
  productId: string;
  name: string;
  price: number; // calculated final price
  unitPrice: number; // base price per unit
  quantity: number; // decimal quantity
  unit: string; // e.g. "kg", "g", "L", "ml", "pcs"
}

interface QueueItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface QueueSession {
  id: string;
  queueNumber: number;
  customerName: string;
  mobile: string | null;
  status: "Waiting" | "InProgress" | "Ready" | "Completed" | "Cancelled";
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  items: QueueItem[];
}

interface CounterHomeData {
  rushMode: boolean;
  sellingMode: string;
  timeCategory: string;
  frequentlySold: Product[];
  recentSales: any[];
  popularToday: Product[];
  combos: Combo[];
}

const smartProductCards = [
  {
    name: "🥛 Amul Milk",
    variants: [
      { label: "500ml", price: 30, id: "p1" },
      { label: "1L", price: 60, id: "p1-1L" },
    ]
  },
  {
    name: "🍫 Dairy Milk",
    variants: [
      { label: "₹5", price: 5, id: "p-dm-5" },
      { label: "₹10", price: 10, id: "p-dm-10" },
      { label: "₹20", price: 20, id: "p-dm-20" },
      { label: "₹50", price: 50, id: "p-dm-50" },
    ]
  },
  {
    name: "🧀 Paneer",
    variants: [
      { label: "100g", price: 40, id: "p-pn-100" },
      { label: "250g", price: 100, id: "p-pn-250" },
      { label: "500g", price: 200, id: "p-pn-500" },
    ]
  }
];


interface CounterModeProps {
  setActiveScreen: (screen: any) => void;
}

// Weight Machine Interface Adapter Mock
class WeightMachineAdapter {
  connectionType: "USB" | "Bluetooth" | "WiFi" = "USB";
  isScaleStable: boolean = true;
  currentScaleWeightKg: number = 0.00;

  async readWeight(): Promise<number> {
    // Simulated future hardware scale response
    return parseFloat((Math.random() * 2 + 0.1).toFixed(3));
  }
}

const scaleAdapter = new WeightMachineAdapter();

export const CounterMode: React.FC<CounterModeProps> = ({ setActiveScreen }) => {
  const [data, setData] = useState<CounterHomeData | null>(null);
  const [sellingMode, setSellingMode] = useState("Counter Speed Business");
  const [rushMode, setRushMode] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Multi-Customer Queue Engine States
  const [queues, setQueues] = useState<QueueSession[]>([]);
  const [activeQueueId, setActiveQueueId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mergeSourceId, setMergeSourceId] = useState<string | null>(null);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [nowTime, setNowTime] = useState(new Date().getTime());

  // Smart Weight & Quantity Engine Popover States
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [presetsData, setPresetsData] = useState<{ type: string; presets: any[] } | null>(null);
  const [customQtyValue, setCustomQtyValue] = useState("");
  const [isCustomQtyOpen, setIsCustomQtyOpen] = useState(false);
  const [scaleWeight, setScaleWeight] = useState(0.00);

  // Sound controls
  const [enableSounds, setEnableSounds] = useState(true);

  // Success Modal
  const [checkoutResult, setCheckoutResult] = useState<{
    total: number;
    cashPaid: number;
    change: number;
    paymentMethod: string;
  } | null>(null);

  // Cart local state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [editingPriceProductId, setEditingPriceProductId] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'catalog' | 'cart'>('catalog');

  // Quick Product Add Dialog states
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("Milk");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdCostPrice, setNewProdCostPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("100");
  const [newProdMinStock, setNewProdMinStock] = useState("10");
  const [newProdSupplier, setNewProdSupplier] = useState("General Supplier");

  // Touch gesture state helpers
  const [touchStartId, setTouchStartId] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState(0);

  // Audio Synthesizer
  const playSound = (type: "add" | "complete" | "error") => {
    if (!enableSounds) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "add") {
        osc.frequency.setValueAtTime(850, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === "complete") {
        osc.frequency.setValueAtTime(580, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.22);
      } else if (type === "error") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.28);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHomeData = async () => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/counter/home`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (json.success && json.data) {
        setData(json.data);
        setSellingMode(json.data.sellingMode);
        setRushMode(json.data.rushMode);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQueues = async () => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/queue`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await response.json();
      if (json.success && json.data) {
        setQueues(json.data);
        
        const activeList = (json.data as QueueSession[]).filter(
          (q) => q.status === "Waiting" || q.status === "InProgress" || q.status === "Ready"
        );
        if (activeList.length > 0 && !activeQueueId) {
          handleLoadQueue(activeList[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHomeData();
    fetchQueues();

    const ticker = setInterval(() => {
      setNowTime(new Date().getTime());
    }, 1000);

    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineSales();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(ticker);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const syncOfflineSales = async () => {
    const queueStr = localStorage.getItem("qb_offline_sales");
    if (!queueStr) return;

    const queue = JSON.parse(queueStr);
    if (queue.length === 0) return;

    setSyncStatus(`Syncing ${queue.length} offline transactions...`);
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    const remaining: any[] = [];

    for (const sale of queue) {
      try {
        const res = await fetch(`${env.apiUrl}/api/v1/checkout/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(sale),
        });
        const json = await res.json();
        if (!json.success) {
          remaining.push(sale);
        }
      } catch (err) {
        remaining.push(sale);
      }
    }

    localStorage.setItem("qb_offline_sales", JSON.stringify(remaining));
    setSyncStatus(remaining.length === 0 ? "Synced successfully!" : `Failed to sync ${remaining.length} sales.`);
    setTimeout(() => setSyncStatus(null), 3000);
    fetchHomeData();
    fetchQueues();
  };

  const handleUpdateSellingMode = async (mode: string) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/counter/selling-mode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sellingMode: mode }),
      });
      const json = await response.json();
      if (json.success) {
        setSellingMode(mode);
        showToast(`Selling mode set to ${mode}`);
        fetchHomeData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRushMode = async () => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    const nextMode = !rushMode;
    try {
      const response = await fetch(`${env.apiUrl}/api/v1/counter/rush-mode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rushMode: nextMode }),
      });
      const json = await response.json();
      if (json.success) {
        setRushMode(nextMode);
        showToast(nextMode ? "Rush Mode ON: Transitions disabled for high-speed billing." : "Rush Mode OFF");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Switch queues
  const handleLoadQueue = (qSession: QueueSession) => {
    playSound("add");
    setActiveQueueId(qSession.id);
    const cartItems = qSession.items.map((i) => ({
      productId: i.productId,
      name: i.productName,
      unitPrice: i.price,
      price: i.price * i.quantity,
      quantity: i.quantity,
      unit: "pcs",
    }));
    setCart(cartItems);
  };

  const handleCreateQueue = async (customerName?: string, mobile?: string, itemsList?: CartItem[]) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    const itemsPayload = (itemsList || cart).map((i) => ({
      productId: i.productId,
      productName: i.name,
      quantity: i.quantity,
      price: i.unitPrice,
    }));

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/queue/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerName: customerName || undefined,
          mobile: mobile || undefined,
          items: itemsPayload,
        }),
      });
      const json = await response.json();
      if (json.success && json.data) {
        playSound("complete");
        showToast(`Queue #${json.data.queueNumber} created!`);
        handleLoadQueue(json.data);
        fetchQueues();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const syncQueueCartItems = async (queueId: string, itemsList: CartItem[]) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    const itemsPayload = itemsList.map((i) => ({
      productId: i.productId,
      productName: i.name,
      quantity: i.quantity,
      price: i.unitPrice,
    }));

    try {
      await fetch(`${env.apiUrl}/api/v1/queue/${queueId}/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: itemsPayload }),
      });
      fetchQueues();
    } catch (e) {
      console.error(e);
    }
  };

  // Direct Add Product Tap (Old working style restored)
  const handleProductTap = async (product: Product) => {
    playSound("add");

    const existing = cart.find((item) => item.productId === product.id);
    let updatedCart: CartItem[];
    if (existing) {
      const nextQty = existing.quantity + 1;
      updatedCart = cart.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: nextQty, price: parseFloat((item.unitPrice * nextQty).toFixed(2)) }
          : item
      );
    } else {
      updatedCart = [
        ...cart,
        {
          productId: product.id,
          name: product.name,
          unitPrice: product.price,
          price: product.price,
          quantity: 1,
          unit: "pcs",
        },
      ];
    }

    setCart(updatedCart);
    playSound("complete");

    if (!activeQueueId) {
      await handleCreateQueue(undefined, undefined, updatedCart);
    } else {
      await syncQueueCartItems(activeQueueId, updatedCart);
    }
  };

  // Taps preset value instantly selects weight/quantity
  const handlePresetSelect = async (preset: any) => {
    if (!selectedProduct || !presetsData) return;

    let multiplier = 1.0;
    let unit = "pcs";

    if (presetsData.type === "WeightBased") {
      multiplier = preset.valueInKg;
      unit = "kg";
    } else if (presetsData.type === "VolumeBased") {
      multiplier = preset.valueInKg; // Volume ML/L compatibility
      unit = "L";
    } else {
      multiplier = preset.value;
      unit = "pcs";
    }

    const calculatedPrice = parseFloat((selectedProduct.price * multiplier).toFixed(2));
    
    // Add item to cart state
    const existing = cart.find((i) => i.productId === selectedProduct.id);
    let updatedCart: CartItem[];
    if (existing) {
      updatedCart = cart.map((i) =>
        i.productId === selectedProduct.id
          ? { 
              ...i, 
              quantity: multiplier, 
              price: calculatedPrice 
            }
          : i
      );
    } else {
      updatedCart = [
        ...cart,
        {
          productId: selectedProduct.id,
          name: selectedProduct.name,
          unitPrice: selectedProduct.price,
          price: calculatedPrice,
          quantity: multiplier,
          unit,
        },
      ];
    }

    setCart(updatedCart);
    playSound("complete");
    setSelectedProduct(null);
    setPresetsData(null);

    // Track analytics usage on backend
    const token = localStorage.getItem("qb_token");
    if (token) {
      await fetch(`${env.apiUrl}/api/products/${selectedProduct.id}/custom-quantity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ label: preset.label, type: presetsData.type }),
      });
    }

    if (!activeQueueId) {
      await handleCreateQueue(undefined, undefined, updatedCart);
    } else {
      await syncQueueCartItems(activeQueueId, updatedCart);
    }
  };

  // Custom keypads and weight machine adapters
  const handleCustomQtyConfirm = async () => {
    if (!selectedProduct || !customQtyValue || !presetsData) return;

    const val = parseFloat(customQtyValue);
    if (isNaN(val) || val <= 0) return;

    let unit = "pcs";
    if (presetsData.type === "WeightBased") unit = "kg";
    else if (presetsData.type === "VolumeBased") unit = "L";
    else if (presetsData.type === "LengthBased") unit = "m";

    const calculatedPrice = parseFloat((selectedProduct.price * val).toFixed(2));

    const existing = cart.find((i) => i.productId === selectedProduct.id);
    let updatedCart: CartItem[];
    if (existing) {
      updatedCart = cart.map((i) =>
        i.productId === selectedProduct.id
          ? { ...i, quantity: val, price: calculatedPrice }
          : i
      );
    } else {
      updatedCart = [
        ...cart,
        {
          productId: selectedProduct.id,
          name: selectedProduct.name,
          unitPrice: selectedProduct.price,
          price: calculatedPrice,
          quantity: val,
          unit,
        },
      ];
    }

    setCart(updatedCart);
    playSound("complete");
    setSelectedProduct(null);
    setPresetsData(null);
    setIsCustomQtyOpen(false);

    if (!activeQueueId) {
      await handleCreateQueue(undefined, undefined, updatedCart);
    } else {
      await syncQueueCartItems(activeQueueId, updatedCart);
    }
  };

  const handleReadScaleWeight = async () => {
    playSound("add");
    const weightVal = await scaleAdapter.readWeight();
    setScaleWeight(weightVal);
    setCustomQtyValue(String(weightVal));
    setIsCustomQtyOpen(true);
    showToast(`Weight machine scale stable: ${weightVal} kg fetched.`);
  };

  const handleComboClick = async (combo: Combo) => {
    const ids = JSON.parse(combo.productIds) as string[];
    let updatedCart = [...cart];

    ids.forEach((id) => {
      const prod = data?.frequentlySold.find((p) => p.id === id) || 
                   data?.popularToday.find((p) => p.id === id);
      const targetName = prod ? prod.name : "Combo Item";
      const targetPrice = prod ? prod.price : combo.price / ids.length;

      const existing = updatedCart.find((item) => item.productId === id);
      if (existing) {
        updatedCart = updatedCart.map((item) =>
          item.productId === id ? { ...item, quantity: item.quantity + 1, price: item.unitPrice * (item.quantity + 1) } : item
        );
      } else {
        updatedCart.push({ 
          productId: id, 
          name: targetName, 
          unitPrice: targetPrice,
          price: targetPrice,
          quantity: 1,
          unit: "pcs"
        });
      }
    });

    setCart(updatedCart);
    showToast(`Combo "${combo.name}" added to cart!`);

    if (!activeQueueId) {
      await handleCreateQueue(undefined, undefined, updatedCart);
    } else {
      await syncQueueCartItems(activeQueueId, updatedCart);
    }
  };

  const updateCartItemPrice = (productId: string, price: number) => {
    const updated = cart.map((item) =>
      item.productId === productId ? { ...item, price } : item
    );
    setCart(updated);
    if (activeQueueId) syncQueueCartItems(activeQueueId, updated);
  };

  const removeFromCart = (productId: string) => {
    playSound("error");
    const updated = cart.filter((item) => item.productId !== productId);
    setCart(updated);
    if (activeQueueId) syncQueueCartItems(activeQueueId, updated);
  };

  const clearCart = () => {
    playSound("error");
    setCart([]);
    if (activeQueueId) syncQueueCartItems(activeQueueId, []);
  };

  const totalAmount = cart.reduce((acc, item) => acc + item.price, 0);

  // Predictions shortcuts
  const getSmartCashShortcuts = (total: number) => {
    if (total <= 0) return [];
    const shortcuts = new Set<number>();
    shortcuts.add(total);

    const nextTen = Math.ceil(total / 10) * 10;
    if (nextTen > total) shortcuts.add(nextTen);

    const nextFifty = Math.ceil(total / 50) * 50;
    if (nextFifty > total) shortcuts.add(nextFifty);

    const standardNotes = [10, 20, 50, 100, 200, 500, 1000];
    standardNotes.forEach((n) => {
      if (n >= total) shortcuts.add(n);
    });

    return Array.from(shortcuts).sort((a, b) => a - b).slice(0, 5);
  };

  const handleInstantCheckout = async (method: "Cash" | "UPI" | "Card", cashPaid?: number) => {
    if (cart.length === 0) return;

    if (cashPaid !== undefined && cashPaid < totalAmount) {
      alert(`Error: Paid amount (₹${cashPaid}) cannot be less than Grand Total (₹${totalAmount}).`);
      return;
    }

    const paid = cashPaid || totalAmount;
    const change = Math.max(0, paid - totalAmount);

    if (activeQueueId) {
      const token = localStorage.getItem("qb_token");
      if (!token) return;

      try {
        const response = await fetch(`${env.apiUrl}/api/v1/queue/${activeQueueId}/complete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ paymentMethod: method }),
        });
        const json = await response.json();
        if (json.success) {
          playSound("complete");
          setCheckoutResult({
            total: totalAmount,
            cashPaid: paid,
            change,
            paymentMethod: method,
          });
          setCart([]);
          setActiveQueueId(null);
          fetchQueues();
          fetchHomeData();
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      const payload = {
        paymentMethod: method,
        totalAmount,
        items: cart,
        offlineId: `offline-${Date.now()}`,
      };
      queueOffline(payload);
    }
  };

  const queueOffline = (payload: any) => {
    const queueStr = localStorage.getItem("qb_offline_sales") || "[]";
    const queue = JSON.parse(queueStr);
    queue.push(payload);
    localStorage.setItem("qb_offline_sales", JSON.stringify(queue));
    playSound("complete");
    setCheckoutResult({
      total: totalAmount,
      cashPaid: totalAmount,
      change: 0,
      paymentMethod: payload.paymentMethod,
    });
    setCart([]);
    setActiveQueueId(null);
  };

  const handlePinQueue = async (qId: string, isPinned: boolean) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      await fetch(`${env.apiUrl}/api/v1/queue/${qId}/pin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPinned }),
      });
      fetchQueues();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelQueue = async (qId: string) => {
    if (!window.confirm("Cancel this queue cart session?")) return;
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      await fetch(`${env.apiUrl}/api/v1/queue/${qId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      playSound("error");
      if (activeQueueId === qId) {
        setCart([]);
        setActiveQueueId(null);
      }
      fetchQueues();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicateQueue = async (qId: string) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      await fetch(`${env.apiUrl}/api/v1/queue/${qId}/duplicate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      playSound("complete");
      fetchQueues();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMergeQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mergeSourceId || !activeQueueId) return;

    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const response = await fetch(`${env.apiUrl}/api/v1/queue/${mergeSourceId}/merge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetQueueId: activeQueueId }),
      });
      const json = await response.json();
      if (json.success) {
        playSound("complete");
        showToast("Carts merged successfully!");
        setIsMergeModalOpen(false);
        setMergeSourceId(null);
        handleLoadQueue(json.data);
        fetchQueues();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const formatTimer = (createdAtStr: string) => {
    const start = new Date(createdAtStr).getTime();
    const diffSec = Math.floor((nowTime - start) / 1000);
    if (diffSec < 0) return "00:00";
    const mins = Math.floor(diffSec / 60);
    const secs = diffSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "Ready": return "🟢 Ready";
      case "InProgress": return "🟡 In Progress";
      case "Waiting": return "🔴 Waiting";
      default: return "⚫ Cancelled";
    }
  };

  const filteredQueues = queues.filter((q) => {
    const qNum = String(q.queueNumber);
    const cName = (q.customerName || "").toLowerCase();
    const cMob = (q.mobile || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesProduct = q.items.some((i) =>
      i.productName.toLowerCase().includes(query)
    );

    return (
      qNum.includes(query) ||
      cName.includes(query) ||
      cMob.includes(query) ||
      matchesProduct
    );
  });

  const handleTouchStart = (e: React.TouchEvent, productId: string) => {
    setTouchStartId(productId);
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent, productId: string) => {
    if (touchStartId !== productId) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (diff < -60) {
      removeFromCart(productId);
      showToast("Removed item (Swipe Gesture)");
    } else if (diff > 60) {
      handleInstantCheckout("Cash");
      showToast("Checked out cart (Swipe Gesture)");
    }
    setTouchStartId(null);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdCategory || !newProdPrice || !newProdCostPrice) {
      alert("Please fill all required fields.");
      return;
    }

    const price = parseFloat(newProdPrice);
    const costPrice = parseFloat(newProdCostPrice);
    const stock = parseInt(newProdStock) || 100;
    const minStock = parseInt(newProdMinStock) || 10;

    if (isNaN(price) || price < 0 || isNaN(costPrice) || costPrice < 0 || stock < 0 || minStock < 0) {
      alert("Error: Prices, stock levels, and minimum quantities cannot be negative.");
      return;
    }

    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const response = await fetch(`${env.apiUrl}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newProdName,
          category: newProdCategory,
          price,
          costPrice,
          stock,
          minStock,
          supplierName: newProdSupplier,
        }),
      });

      const json = await response.json();
      if (json.success) {
        playSound("complete");
        showToast(`Product "${newProdName}" added successfully!`);
        setIsAddProductOpen(false);
        setNewProdName("");
        setNewProdPrice("");
        setNewProdCostPrice("");
        setNewProdStock("100");
        setNewProdMinStock("10");
        fetchHomeData();
      } else {
        playSound("error");
        alert(`Error: ${json.message || "Failed to create product"}`);
      }
    } catch (err) {
      console.error(err);
      playSound("error");
      alert("Failed to connect to server.");
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 font-sans p-4 sm:p-6 w-full ${
      rushMode ? "transition-none animate-none" : ""
    }`}>
      
      {/* Sync Status Banner */}
      {syncStatus && (
        <div className="bg-brand-orange text-white text-center py-2 px-4 rounded-xl text-xs font-bold mb-4 shadow animate-pulse">
          {syncStatus}
        </div>
      )}

      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-6 right-6 z-55 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-2xl animate-bounce">
          <CheckCircle className="h-5 w-5 text-emerald-400" />
          <span className="text-xs font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Popover/Drawer selector for Smart Weight & Quantity Engine */}
      {selectedProduct && presetsData && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-55">
          <div className="bg-white dark:bg-slate-850 w-full max-w-md p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 text-center space-y-4">
            
            <div className="flex items-center justify-between border-b pb-2">
              <div className="text-left">
                <span className="text-[10px] font-black text-brand-orange uppercase">Smart Weight & Qty Engine</span>
                <h3 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{selectedProduct.name}</h3>
                <span className="text-[10px] font-bold text-slate-400">Base Unit Price: ₹{selectedProduct.price}</span>
              </div>
              <button 
                onClick={() => { setSelectedProduct(null); setPresetsData(null); }}
                className="p-1 text-slate-400 hover:text-slate-600 text-xs font-black cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Smart Presets buttons grid */}
            <div className="space-y-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block text-left">
                ⚡ Tap to select weight / qty
              </span>
              <div className="grid grid-cols-2 gap-2">
                {presetsData.presets.map((preset: any) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    className="h-16 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl dark:bg-slate-900/30 dark:border-slate-800 dark:hover:bg-slate-800 text-xs font-black flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 leading-tight"
                  >
                    <span>{preset.label}</span>
                    <span className="text-[9px] text-brand-orange mt-1">
                      ₹{parseFloat((selectedProduct.price * (preset.valueInKg || preset.value || 1)).toFixed(1))}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Future-Ready Hardware Scale Sync Adapter panel */}
            <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl flex items-center justify-between text-left">
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Scale Sync Adapter</span>
                <span className="text-[10px] font-bold text-slate-700 dark:text-white flex items-center gap-1.5 mt-0.5">
                  <Scale className="h-4 w-4 text-emerald-500" /> USB weight machine linked (Weight: {scaleWeight > 0 ? `${scaleWeight} kg` : "0.00 kg"})
                </span>
              </div>
              <button
                onClick={handleReadScaleWeight}
                className="px-3 py-1.5 bg-emerald-650 text-white text-[9px] font-black rounded-lg cursor-pointer hover:bg-emerald-700 active:scale-95"
              >
                Fetch Weight
              </button>
            </div>

            {/* Custom inputs options */}
            <div className="border-t pt-3 flex items-center justify-between gap-3">
              <button
                onClick={() => setIsCustomQtyOpen(!isCustomQtyOpen)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white text-xs font-black rounded-xl cursor-pointer flex-1 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Hash className="h-4.5 w-4.5 text-brand-orange" />
                Custom Input
              </button>
            </div>

            {/* Visual decimal numeric keypads */}
            {isCustomQtyOpen && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={customQtyValue}
                    placeholder="0.00"
                    className="flex-1 bg-white dark:bg-slate-800 border rounded-xl px-3 py-2.5 text-sm font-black text-center text-slate-900 dark:text-white outline-none"
                  />
                  <button 
                    onClick={() => setCustomQtyValue("")}
                    className="px-3 py-2.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-black cursor-pointer"
                  >
                    Clear
                  </button>
                </div>

                {/* Decimal Keypad layout */}
                <div className="grid grid-cols-4 gap-1.5">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "."].map((char) => (
                    <button
                      key={char}
                      onClick={() => setCustomQtyValue(prev => prev + char)}
                      className="py-2.5 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-black rounded-lg cursor-pointer"
                    >
                      {char}
                    </button>
                  ))}
                  <button
                    onClick={handleCustomQtyConfirm}
                    className="col-span-4 py-2.5 bg-brand-orange hover:bg-brand-orange/95 text-white text-xs font-black rounded-lg cursor-pointer"
                  >
                    Confirm & Add
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Success Modal */}
      {checkoutResult && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-55">
          <div className="bg-white dark:bg-slate-850 w-full max-w-md p-6 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 text-center space-y-5 animate-scale-in">
            <div className="mx-auto h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
              <CheckCircle className="h-7 w-7" />
            </div>
            
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Sale Completed!</h3>
              <p className="text-[11px] text-slate-400 font-bold block mt-1">Cleared via {checkoutResult.paymentMethod}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="text-left">
                <span className="text-[9px] font-black text-slate-400 block uppercase">Paid Amount</span>
                <span className="text-sm font-black text-slate-800 dark:text-white">₹{checkoutResult.cashPaid}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-black text-slate-400 block uppercase">Return Change</span>
                <span className="text-lg font-black text-rose-500">₹{checkoutResult.change}</span>
              </div>
            </div>

            {checkoutResult.total >= 100 ? (
              <div className="space-y-2 pt-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Receipt Options</span>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => { window.print(); showToast("Sent print job."); }}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-850 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[10px] font-black rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Printer className="h-4 w-4 text-blue-500" /> Print
                  </button>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(`Dues cleared: ₹${checkoutResult.total}`); showToast("Receipt copied!"); }}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-850 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[10px] font-black rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Share2 className="h-4 w-4 text-emerald-500" /> Copy
                  </button>
                  <button 
                    onClick={() => { window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`QuickBizs Receipt: ₹${checkoutResult.total}`)}`, "_blank"); }}
                    className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-850 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[10px] font-black rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4 text-brand-orange" /> WhatsApp
                  </button>
                </div>
              </div>
            ) : (
              <span className="text-[10px] text-slate-400 font-bold italic block">Small bill: transaction cleared automatically.</span>
            )}

            <button
              onClick={() => setCheckoutResult(null)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl cursor-pointer"
            >
              Close & Next Customer
            </button>
          </div>
        </div>
      )}

      {/* Cart Merge Modal */}
      {isMergeModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-55">
          <div className="bg-white dark:bg-slate-800 w-full max-w-sm p-5 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-black text-slate-900 dark:text-white mb-4">Merge Queue Carts</h3>
            
            <form onSubmit={handleMergeQueue} className="space-y-4">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Source Cart (To Merge & Cancel)</label>
                <select
                  value={mergeSourceId || ""}
                  onChange={(e) => setMergeSourceId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-brand-orange cursor-pointer"
                >
                  <option value="" disabled>Select source cart...</option>
                  {queues
                    .filter((q) => q.id !== activeQueueId && (q.status === "Waiting" || q.status === "InProgress"))
                    .map((q) => (
                      <option key={q.id} value={q.id}>
                        Queue #{q.queueNumber} - {q.customerName} ({q.items.length} items)
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Target Active Cart (Destination)</label>
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-white">
                  Active Queue Cart ({cart.length} items loaded)
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMergeModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!mergeSourceId}
                  className="px-4 py-2 bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50 text-white text-xs font-black rounded-xl cursor-pointer shadow-md transition-colors"
                >
                  Merge Carts
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveScreen("dashboard")}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer shrink-0"
            title="Back to Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-brand-orange animate-pulse" />
                Weight & Qty Engine OS
              </h1>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black border tracking-wide uppercase ${
                isOnline 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800" 
                  : "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-800 animate-pulse"
              }`}>
                {isOnline ? "Online" : "Offline Mode"}
              </span>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time simultaneous customer cart manager designed for peak dairy/kirana rush hour operations
            </p>
          </div>
        </div>

        {/* Header configurations deck */}
        <div className="flex items-center gap-2.5">
          {/* Sounds switcher */}
          <button
            onClick={() => setEnableSounds(!enableSounds)}
            className={`p-2.5 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
              enableSounds 
                ? "bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-white" 
                : "bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-900 dark:border-slate-800"
            }`}
            title="Toggle Sounds Feedback"
          >
            {enableSounds ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          {/* Onboarding Mode Selection */}
          <select
            value={sellingMode}
            onChange={(e) => handleUpdateSellingMode(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:border-brand-orange cursor-pointer"
          >
            <option value="Counter Speed Business">⚡ Speed Mode</option>
            <option value="Retail Store">🛍️ Retail Store</option>
            <option value="Wholesale Business">📦 Wholesale</option>
          </select>

          {/* Rush Mode trigger */}
          <button
            onClick={handleToggleRushMode}
            className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 cursor-pointer font-bold text-xs transition-all ${
              rushMode 
                ? "bg-rose-600 border-rose-600 text-white shadow-rose-500/20" 
                : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
            }`}
            title="Toggle Rush Hour Mode"
          >
            <Flame className="h-4 w-4 text-brand-orange" />
            <span>Rush Hour</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Selector */}
      <div className="flex lg:hidden bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-205 dark:border-slate-700 mb-6 font-bold shadow-sm">
        <button
          onClick={() => setMobileTab('catalog')}
          className={`flex-1 py-3 text-center text-xs rounded-xl transition-all cursor-pointer ${
            mobileTab === 'catalog'
              ? 'bg-slate-900 text-white dark:bg-slate-700'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          🥛 Catalog & Queues
        </button>
        <button
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-3 text-center text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mobileTab === 'cart'
              ? 'bg-slate-900 text-white dark:bg-slate-700'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          🛒 Active Cart ({cart.reduce((acc, i) => acc + (i.unit === "pcs" ? i.quantity : 1), 0)})
          {totalAmount > 0 && <span className="bg-brand-orange text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">₹{totalAmount}</span>}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Columns (Col span 7/12) */}
        <div className={`lg:col-span-7 space-y-6 ${mobileTab === 'catalog' ? 'block' : 'hidden lg:block'}`}>
          
          {/* Active Queues Panel Row */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-5 rounded-3xl shadow-sm dark:shadow-slate-950/50 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-700/80 pb-3">
              <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider block flex items-center gap-2">
                <span className="p-1.5 bg-brand-orange/10 rounded-lg text-brand-orange">
                  <Layers className="h-4 w-4" />
                </span>
                Simultaneous Queue Customer Carts
              </span>
              
              {/* Search queues bar & create queue button */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search queue/product/mobile..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-brand-orange text-slate-900 dark:text-white w-44"
                  />
                </div>
                
                <button
                  onClick={() => handleCreateQueue()}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-black rounded-xl cursor-pointer flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
                >
                  <Plus className="h-4 w-4" /> New Queue
                </button>
              </div>
            </div>

            {/* Queues list deck */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
              {filteredQueues.length === 0 ? (
                <div className="col-span-2 py-10 text-center text-xs text-slate-500 dark:text-slate-400 font-medium italic bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700/80 p-6">
                  No matching queue sessions found. Tapping a product variant automatically creates a queue!
                </div>
              ) : (
                filteredQueues.map((q) => {
                  const isActive = q.id === activeQueueId;
                  const total = q.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
                  const itemSummaryText = q.items.map((i) => i.productName.split(" ")[0]).join(" + ");

                  return (
                    <div
                      key={q.id}
                      onClick={() => handleLoadQueue(q)}
                      className={`p-4 border rounded-2xl cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden shadow-xs hover:shadow-md ${
                        isActive 
                          ? "bg-slate-900 text-white border-2 border-emerald-500 dark:bg-slate-800 dark:border-emerald-400" 
                          : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                      } ${
                        rushMode ? "p-2.5 text-[10px] transition-none animate-none" : ""
                      }`}
                    >
                      {/* Pinned overlay */}
                      {q.isPinned && (
                        <div className="absolute top-2 right-2">
                          <Pin className="h-3.5 w-3.5 text-brand-orange fill-brand-orange" />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black tracking-wide uppercase opacity-80">
                            Queue #{q.queueNumber}
                          </span>
                          <span className="text-[10px] font-bold opacity-60">
                            {formatTimer(q.createdAt)}
                          </span>
                        </div>

                        <h5 className="font-extrabold text-sm truncate">
                          {q.customerName || "Guest Customer"}
                        </h5>
                        <p className="text-xs opacity-75 font-bold truncate">
                          {itemSummaryText || "Empty cart session"}
                        </p>
                        <div className="text-[10px] font-black mt-1">
                          {getStatusIndicator(q.status)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-700/50 pt-2.5 mt-3">
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          ₹{total.toLocaleString()}
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          {/* Pin shortcut */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePinQueue(q.id, !q.isPinned);
                            }}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-400 cursor-pointer"
                            title="Pin Queue"
                          >
                            <Pin className="h-3.5 w-3.5" />
                          </button>
                          
                          {/* Cancel queue */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelQueue(q.id);
                            }}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-400 hover:text-rose-500 cursor-pointer"
                            title="Cancel/Void Queue"
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </button>

                          {/* Duplicate queue */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateQueue(q.id);
                            }}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-400 hover:text-brand-orange cursor-pointer"
                            title="Duplicate Queue"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>

                          {/* Merge trigger */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMergeSourceId(q.id);
                              setIsMergeModalOpen(true);
                            }}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded text-slate-400 hover:text-emerald-500 cursor-pointer"
                            title="Merge with Active Cart"
                          >
                            <Merge className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Smart Product Cards (Tapping triggers Weight & Qty Engine Popover) */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-5 rounded-3xl shadow-sm dark:shadow-slate-950/50 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider block flex items-center gap-2">
                <span className="p-1.5 bg-brand-orange/10 rounded-lg text-brand-orange">
                  <Zap className="h-4 w-4" />
                </span>
                Smart Product Variants (Tap to select Weight/Qty)
              </span>
              <button
                onClick={() => setIsAddProductOpen(true)}
                className="px-3 py-1.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black rounded-xl cursor-pointer flex items-center gap-1 shadow-sm active:scale-95 transition-all"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {smartProductCards.map((card: { name: string; variants: any[] }, idx: number) => (
                <div key={idx} className="bg-slate-100/60 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between min-h-[145px] hover:border-brand-orange/40 transition-all">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white block mb-3 flex items-center gap-1.5">
                    {card.name}
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {card.variants.map((v: { id: string; label: string; price: number }) => (
                      <button
                        key={v.id}
                        onClick={() => handleProductTap({ id: v.id, name: `${card.name} (${v.label})`, price: v.price, category: card.name })}
                        className="py-3 px-2.5 bg-white hover:bg-brand-orange/5 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-black rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-orange/40 cursor-pointer shadow-xs hover:shadow transition-all text-center flex flex-col items-center justify-center leading-none group active:scale-95"
                      >
                        <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-brand-orange mb-1">{v.label}</span>
                        <span className="text-xs font-black text-brand-orange">₹{v.price}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time-Based Smart Selections Row */}
          {data && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-5 rounded-3xl shadow-sm dark:shadow-slate-950/50 space-y-4">
              <div className="flex items-center justify-between mb-2 border-b border-slate-100 dark:border-slate-700/80 pb-3">
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider block flex items-center gap-2">
                  <span className="p-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                    <Clock className="h-4 w-4" />
                  </span>
                  Smart Focus: {data.timeCategory}
                </span>
                <span className="text-xs text-brand-orange font-bold flex items-center gap-1">
                  Time-Sensitive Selections
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {data.frequentlySold.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => handleProductTap(prod)}
                    className="p-3.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-orange/40 rounded-2xl text-left cursor-pointer flex flex-col justify-between h-20 active:scale-[0.98] transition-all shadow-xs"
                  >
                    <span className="text-xs font-black text-slate-900 dark:text-white line-clamp-2 leading-tight">
                      {prod.name}
                    </span>
                    <span className="text-xs font-black text-brand-orange">
                      ₹{prod.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Combos (Bread+Milk, Milk+Curd) */}
          {data && data.combos && data.combos.length > 0 && (
            <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-5 rounded-3xl shadow-sm dark:shadow-slate-950/50 space-y-4">
              <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider block flex items-center gap-2">
                <span className="p-1.5 bg-brand-orange/10 rounded-lg text-brand-orange">
                  <Flame className="h-4 w-4" />
                </span>
                Quick Combos
              </span>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.combos.map((combo) => (
                  <button
                    key={combo.id}
                    onClick={() => handleComboClick(combo)}
                    className="p-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-brand-orange/40 rounded-2xl cursor-pointer text-left flex items-center justify-between gap-4 transition-all active:scale-[0.99] shadow-xs"
                  >
                    <div>
                      <h5 className="font-extrabold text-slate-900 dark:text-white text-xs leading-none">
                        {combo.name}
                      </h5>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mt-1">{combo.description}</span>
                    </div>
                    <span className="text-xs font-black text-white bg-brand-orange px-2.5 py-1 rounded-xl shadow-xs shrink-0">
                      ₹{combo.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Cart Summary, Quick Cash Prediction & One-Hand Checkout Deck (Col span 5/12) */}
        <div className={`lg:col-span-5 bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 p-6 rounded-3xl shadow-sm dark:shadow-slate-950/50 min-h-[500px] flex flex-col justify-between relative overflow-hidden ${mobileTab === 'cart' ? 'flex' : 'hidden lg:flex'}`}>
          <div className="absolute top-0 right-0 h-32 w-32 bg-brand-orange/10 rounded-full blur-3xl -z-10" />

          {/* Cart Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/80 pb-3">
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="p-1.5 bg-brand-orange/10 rounded-lg text-brand-orange">
                  <ShoppingCart className="h-4 w-4" />
                </span>
                Active Cart ({cart.reduce((acc, i) => acc + (i.unit === "pcs" ? i.quantity : 1), 0)} items)
              </h4>
              <button 
                onClick={clearCart}
                className="text-xs font-bold text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
              >
                Clear Cart
              </button>
            </div>

            {/* Cart Items List with custom Weight & Volume quantities display */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 font-bold italic bg-slate-100 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
                  Cart is empty. Tap products/variants above to instantly bill.
                </div>
              ) : (
                cart.map((item) => (
                  <div 
                    key={item.productId}
                    onTouchStart={(e) => handleTouchStart(e, item.productId)}
                    onTouchEnd={(e) => handleTouchEnd(e, item.productId)}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-700/70 rounded-2xl relative select-none"
                    title="Swipe Left to remove, Tap price to edit"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <h5 className="font-extrabold text-slate-900 dark:text-white text-xs truncate">{item.name}</h5>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mt-0.5">
                        {item.quantity} {item.unit} x ₹{item.unitPrice}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {editingPriceProductId === item.productId ? (
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateCartItemPrice(item.productId, parseFloat(e.target.value) || 0)}
                          onBlur={() => setEditingPriceProductId(null)}
                          autoFocus
                          className="w-16 bg-white dark:bg-slate-800 border border-brand-orange rounded-xl px-2 py-1 text-xs text-slate-900 dark:text-white font-black text-right outline-none shadow-sm"
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingPriceProductId(item.productId)}
                          className="text-xs font-black text-brand-orange cursor-pointer hover:underline border-b border-dashed border-brand-orange/40"
                          title="Tap to edit item price"
                        >
                          ₹{item.price.toLocaleString()}
                        </span>
                      )}
                      <button 
                        onClick={() => removeFromCart(item.productId)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Cash Prediction & One-Hand Checkout Deck */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700/80 space-y-4">
            
            {/* Quick Cash predictions shortcuts deck */}
            {totalAmount > 0 && (
              <div className="space-y-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">💵 Quick Cash Received Prediction</span>
                <div className="flex flex-wrap gap-1.5">
                  {getSmartCashShortcuts(totalAmount).map((cashVal) => (
                    <button
                      key={cashVal}
                      onClick={() => handleInstantCheckout("Cash", cashVal)}
                      className="px-3 py-2 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-black text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 hover:border-brand-orange/40 rounded-xl cursor-pointer flex-1 text-center shadow-xs transition-all active:scale-95"
                    >
                      ₹{cashVal}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active customer placeholder */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-wider">Active Customer</span>
              <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-brand-orange" />
                Guest Customer
              </span>
            </div>

            {/* Total balance summary */}
            <div className="flex justify-between items-center bg-brand-orange text-white px-5 py-4 rounded-2xl shadow-md">
              <span className="text-xs font-black uppercase tracking-wider text-white/90">Grand Total</span>
              <span className="text-2xl font-black">₹{totalAmount.toLocaleString()}</span>
            </div>

            {/* Giant One-Hand Buttons deck (Min 64px height) */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider block">One-Hand Instant Checkout (Min 64px)</span>
              
              <div className="grid grid-cols-3 gap-2">
                {/* Cash */}
                <button
                  onClick={() => handleInstantCheckout("Cash")}
                  disabled={cart.length === 0}
                  className="h-16 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-black rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center border border-slate-700"
                >
                  <span className="block text-[9px] font-bold text-slate-300 mb-0.5">Exact Amount</span>
                  💵 CASH
                </button>

                {/* UPI */}
                <button
                  onClick={() => handleInstantCheckout("UPI")}
                  disabled={cart.length === 0}
                  className="h-16 bg-brand-orange hover:bg-brand-orange-hover disabled:opacity-50 text-white text-xs font-black rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center border border-brand-orange/30"
                >
                  <span className="block text-[9px] font-bold text-orange-100 mb-0.5">Quick QR</span>
                  📱 UPI
                </button>

                {/* Card */}
                <button
                  onClick={() => handleInstantCheckout("Card")}
                  disabled={cart.length === 0}
                  className="h-16 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-black rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center border border-slate-700/50"
                >
                  <span className="block text-[9px] font-bold text-slate-300 mb-0.5">Swipe Card</span>
                  💳 CARD
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Quick Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full max-w-md p-6 rounded-3xl shadow-2xl relative">
            <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">
              Add New Product (Quick Counter Entry)
            </h3>
            
            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Buffalo Milk 1L, Marie Biscuit"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-850 dark:text-white outline-none focus:border-brand-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Category *</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-850 dark:text-white outline-none focus:border-brand-orange cursor-pointer"
                  >
                    <option value="Milk">Milk</option>
                    <option value="Chocolates">Chocolates</option>
                    <option value="Paneer">Paneer</option>
                    <option value="Curd">Curd</option>
                    <option value="Lassi">Lassi</option>
                    <option value="Cold Drinks">Cold Drinks</option>
                    <option value="Biscuits">Biscuits</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Supplier *</label>
                  <input
                    type="text"
                    required
                    value={newProdSupplier}
                    onChange={(e) => setNewProdSupplier(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-850 dark:text-white outline-none focus:border-brand-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-850 dark:text-white outline-none focus:border-brand-orange"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Cost Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newProdCostPrice}
                    onChange={(e) => setNewProdCostPrice(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white outline-none focus:border-brand-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-850 dark:text-white outline-none focus:border-brand-orange"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Min Stock Warning</label>
                  <input
                    type="number"
                    value={newProdMinStock}
                    onChange={(e) => setNewProdMinStock(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-850 dark:text-white outline-none focus:border-brand-orange"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-black rounded-xl cursor-pointer shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Floating Cart Summary Button */}
      {mobileTab === 'catalog' && cart.length > 0 && (
        <div className="fixed bottom-20 left-6 right-6 lg:hidden z-40">
          <button
            onClick={() => setMobileTab('cart')}
            className="w-full bg-brand-orange hover:bg-brand-orange/95 text-white py-4 px-6 rounded-2xl font-black text-xs shadow-2xl flex items-center justify-between transition-transform active:scale-[0.98]"
          >
            <span className="flex items-center gap-2">
              <ShoppingCart className="h-4.5 w-4.5 text-white animate-bounce" />
              View Active Cart ({cart.length} items)
            </span>
            <span>₹{totalAmount.toLocaleString()} →</span>
          </button>
        </div>
      )}
    </div>
  );
};
