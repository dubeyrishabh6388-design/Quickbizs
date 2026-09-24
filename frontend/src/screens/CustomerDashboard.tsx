import React, { useState, useEffect } from "react";
import { api } from "../config/api";
import { 
  Store, 
  Heart, 
  ShoppingBag, 
  LogOut, 
  MapPin, 
  Compass,
  ArrowRight,
  ChevronRight,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Sun,
  Moon,
  Plus,
  Minus,
  ShoppingCart,
  X,
  CheckCircle,
  FileText
} from "lucide-react";

interface CustomerDashboardProps {
  handleLogout: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

// Pre-seeded catalog items for Fresh Choice Supermarket (matching database IDs and prices)
const FRESH_CHOICE_PRODUCTS = [
  { id: "p1", name: "Amul Gold Milk (1L)", category: "Dairy", price: 66, unit: "Pkt" },
  { id: "p2", name: "Mother Dairy Paneer (200g)", category: "Dairy", price: 85, unit: "Pkt" },
  { id: "p3", name: "Aashirvaad Atta (5kg)", category: "Grocery", price: 270, unit: "Bag" },
  { id: "p4", name: "Fortune Soya Oil (1L)", category: "Grocery", price: 140, unit: "Bottle" },
  { id: "p5", name: "Maggi Noodles (12-pack)", category: "Snacks", price: 85, unit: "Pkt" },
  { id: "p6", name: "Tata Salt (1kg)", category: "Grocery", price: 28, unit: "Pkt" },
  { id: "p7", name: "Good Day Cookies", category: "Snacks", price: 20, unit: "Pkt" }
];

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ handleLogout, theme, toggleTheme }) => {
  const [profile, setProfile] = useState<any>(null);
  const [nearbyShops, setNearbyShops] = useState<any[]>([]);
  const [favourites, setFavourites] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [trustScore, setTrustScore] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"explore" | "orders">("explore");

  // Geolocation tracking
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Shop Catalog & Cart Drawer states
  const [selectedShop, setSelectedShop] = useState<any | null>(null);
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [pickupTimeOffset, setPickupTimeOffset] = useState("30"); // minutes from now
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [placedOrderResult, setPlacedOrderResult] = useState<any | null>(null);

  const [shopProducts, setShopProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fetchShopProducts = async (shopId: string) => {
    setLoadingProducts(true);
    try {
      const res = await api.get(`/products?businessId=${shopId}`);
      if (res.data?.success && res.data?.data?.products) {
        setShopProducts(res.data.data.products);
      }
    } catch (err) {
      console.error("Failed to load shop products catalog:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (selectedShop) {
      fetchShopProducts(selectedShop.id);
    } else {
      setShopProducts([]);
    }
  }, [selectedShop]);

  useEffect(() => {
    // 1. Get browser geolocation coords
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Default fallback to Delhi coordinates
          setLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    } else {
      setLocation({ lat: 28.6139, lng: 77.2090 });
    }
  }, []);

  // Fetch dashboard data function
  const fetchDashboardData = async () => {
    if (!location) return;
    try {
      setErrorMsg("");

      // Run concurrent requests
      const [profileRes, nearbyRes, favRes, orderRes, trustRes] = await Promise.all([
        api.get("/pwa-customer/profile").catch(() => null),
        api.get(`/business/nearby?lat=${location.lat}&lng=${location.lng}&radius=10000`).catch(() => null),
        api.get("/pwa-customer/favourites").catch(() => null),
        api.get("/pwa-customer/orders?page=1&limit=20").catch(() => null),
        api.get("/pwa-customer/trust-score").catch(() => null),
      ]);

      if (profileRes?.data?.success) {
        setProfile(profileRes.data.data);
      }
      
      let shops = [];
      if (nearbyRes?.data?.success && nearbyRes.data.data.length > 0) {
        shops = nearbyRes.data.data;
      } else {
        // Fallback geolocation override to load all active businesses
        const fallbackRes = await api.get(`/business/nearby?lat=0&lng=0&radius=99999999`).catch(() => null);
        if (fallbackRes?.data?.success) {
          shops = fallbackRes.data.data;
        }
      }
      setNearbyShops(shops);

      if (favRes?.data?.success) {
        setFavourites(favRes.data.data);
      }
      if (orderRes?.data?.success) {
        setOrders(orderRes.data.data.orders || []);
      }
      if (trustRes?.data?.success) {
        setTrustScore(trustRes.data.data);
      }

    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setErrorMsg("Failed to synchronize dashboard session cards.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [location]);

  // Cart operations
  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      const updated = { ...prev };
      if (newQty === 0) {
        delete updated[productId];
      } else {
        updated[productId] = newQty;
      }
      return updated;
    });
  };

  const getCartTotal = () => {
    return FRESH_CHOICE_PRODUCTS.reduce((sum, item) => {
      const qty = cart[item.id] || 0;
      return sum + qty * item.price;
    }, 0);
  };

  const getCartItemsCount = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  // Submit order checkout
  const handlePlaceOrder = async () => {
    if (getCartItemsCount() === 0 || !selectedShop) return;
    setIsSubmittingOrder(true);
    setErrorMsg("");

    // Calculate scheduled pickup time (X minutes in the future)
    const minutesToAdd = parseInt(pickupTimeOffset, 10);
    const pickupTime = new Date(Date.now() + minutesToAdd * 60 * 1000);

    const payload = {
      businessId: selectedShop.id,
      items: Object.entries(cart).map(([productId, quantity]) => ({
        productId,
        quantity
      })),
      scheduledPickupTime: pickupTime.toISOString(),
      orderNotes: orderNotes.trim() || "Customer self pickup",
      paymentMethod: "COD"
    };

    try {
      const response = await api.post("/pickup-orders", payload);
      if (response.data?.success) {
        setPlacedOrderResult(response.data.data);
        setCart({});
        setOrderNotes("");
        // Reload history
        fetchDashboardData();
      }
    } catch (err: any) {
      console.error("Place order failed:", err);
      setErrorMsg(err.response?.data?.message || "Failed to place pickup order. Double check limits.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 px-6">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-wider uppercase">Loading Customer PWA Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 pb-20 font-sans transition-colors duration-300">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 bg-brand-orange text-white rounded-xl flex items-center justify-center font-black">
            P
          </div>
          <div>
            <h1 className="text-md font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
              Quick<span className="text-brand-orange">Bizs</span> PWA
            </h1>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Zero-Queue Pickup</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {profile && (
            <div className="hidden sm:flex flex-col items-end mr-1 text-right">
              <span className="text-xs font-black text-slate-800 dark:text-slate-100">{profile.name}</span>
              <span className="text-[10px] text-slate-500 font-bold">{profile.phone}</span>
            </div>
          )}
          <button
            onClick={toggleTheme}
            className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-brand-orange rounded-xl transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </button>
          <button 
            onClick={handleLogout}
            className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 dark:text-rose-400 rounded-xl transition-colors cursor-pointer"
            aria-label="Logout Session"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        
        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 p-4 rounded-2xl flex gap-3 text-xs text-rose-800 dark:text-rose-200 leading-normal">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}
        
        {/* Trust Score & Welcome card */}
        {profile && (
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-brand-orange text-lg font-black uppercase">
                {profile.name[0]}
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Welcome, {profile.name}</h2>
                <p className="text-xs text-slate-500 font-medium">Browse hyperlocal stores and collect orders instantly without queues.</p>
              </div>
            </div>

            {trustScore && (
              <div className={`p-3.5 border rounded-2xl flex items-center gap-3 shrink-0 ${
                trustScore.restrictedStatus 
                  ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200" 
                  : "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200"
              }`}>
                {trustScore.restrictedStatus ? <AlertTriangle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                <div>
                  <div className="text-[10px] uppercase font-black opacity-60 tracking-wider">Pickup Trust score</div>
                  <div className="flex items-baseline gap-1.5 leading-none">
                    <span className="text-lg font-black">{trustScore.score}</span>
                    <span className="text-[10px] font-bold">/ 100</span>
                  </div>
                  {trustScore.restrictedStatus && (
                    <div className="text-[9px] font-bold mt-0.5 text-rose-500">Checkout limits restricted</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Navigator */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setActiveTab("explore")}
            className={`py-3 px-4 text-xs font-black border-b-2 transition-all cursor-pointer ${
              activeTab === "explore" 
                ? "border-brand-orange text-brand-orange font-bold" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            Explore Nearby Shops
          </button>
          <button 
            onClick={() => setActiveTab("orders")}
            className={`py-3 px-4 text-xs font-black border-b-2 transition-all cursor-pointer ${
              activeTab === "orders" 
                ? "border-brand-orange text-brand-orange font-bold" 
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            My Orders ({orders.length})
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "explore" && (
          <div className="space-y-6">
            
            {/* Favourites Section */}
            {favourites.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-rose-500">
                  <Heart className="h-4.5 w-4.5 fill-current" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider">Favourite Shops</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {favourites.map((fav: any) => (
                    <div 
                      key={fav.id}
                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-rose-50 dark:bg-slate-900 text-rose-500 rounded-xl flex items-center justify-center">
                          <Store className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white">{fav.business.name}</h4>
                          <span className="text-[10px] text-slate-500 font-medium">{fav.business.address}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Shops Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-brand-orange">
                <Compass className="h-4.5 w-4.5" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider">Nearby Stores (within 10km)</h3>
              </div>

              {nearbyShops.length === 0 ? (
                <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl text-center space-y-3 max-w-sm mx-auto shadow-sm">
                  <MapPin className="h-8 w-8 text-slate-400 mx-auto" />
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">No Shops Found nearby</h4>
                    <p className="text-[10px] text-slate-500 mt-1 font-semibold leading-relaxed">
                      We couldn't detect active local dairy or grocery stores within your geolocated range.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {nearbyShops.map((shop: any) => (
                    <div 
                      key={shop.id}
                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-4 hover:border-brand-orange/60 transition-all flex flex-col justify-between shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="h-10 w-10 bg-slate-100 dark:bg-slate-900 text-brand-orange rounded-2xl flex items-center justify-center">
                            <Store className="h-5.5 w-5.5" />
                          </div>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Open
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">{shop.name}</h4>
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold mt-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{shop.address || "Main Market"}</span>
                          </div>
                        </div>

                        <div className="text-[10px] text-slate-500 font-semibold border-t border-slate-100 dark:border-slate-800/80 pt-2">
                          Store hours: <strong className="text-slate-800 dark:text-slate-200">{shop.openingHours || "07:00-21:00"}</strong>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          setSelectedShop(shop);
                          setCart({});
                          setPlacedOrderResult(null);
                        }}
                        className="w-full mt-2 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-brand-orange hover:text-white text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98 shadow-sm"
                      >
                        <span>Start Shopping</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-800 dark:text-white">
              <ShoppingBag className="h-4.5 w-4.5" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider">Pickup Order History</h3>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-12 rounded-3xl text-center space-y-3 max-w-sm mx-auto shadow-sm">
                <ShoppingBag className="h-8 w-8 text-slate-400 mx-auto" />
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white">No Orders Placed Yet</h4>
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold leading-relaxed">
                    Select a nearby store to configure your first hyper-local pickup bag.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div 
                    key={order.id}
                    className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-slate-900 dark:text-white">{order.orderNumber}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          order.orderStatus === "COLLECTED" 
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : order.orderStatus === "CANCELLED" 
                              ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                              : "bg-brand-orange/10 text-brand-orange border border-brand-orange/20"
                        }`}>
                          {order.orderStatus}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {order.business?.name || "Fresh Choice Supermarket"}
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          <span>Scheduled: {new Date(order.scheduledPickupTime).toLocaleString()}</span>
                        </div>
                        {order.pickupPin && order.orderStatus !== "COLLECTED" && (
                          <div className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded inline-block">
                            Pickup PIN: {order.pickupPin}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 border-slate-100 dark:border-slate-800/80 pt-3 md:pt-0">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-black leading-none mb-1">Total items</div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{order.totalItems} items</span>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 uppercase font-black leading-none mb-1">Grand total</div>
                        <span className="text-sm font-black text-brand-orange">₹{order.totalAmount}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 hidden md:block" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* 4. SHOPPING CATALOG DRAWER MODAL */}
      {selectedShop && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          
          {/* Backdrop */}
          <div 
            onClick={() => setSelectedShop(null)}
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-md bg-white dark:bg-slate-950 h-full shadow-2xl flex flex-col justify-between overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center shrink-0">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-950 dark:text-white leading-tight">{selectedShop.name}</h3>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Product Catalog</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedShop(null)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Catalog list or Order Success */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {placedOrderResult ? (
                /* Successful Order checkout page */
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="h-16 w-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 stroke-[2.5]" />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-md font-black text-slate-950 dark:text-white">Pickup Order Placed!</h4>
                    <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-semibold">
                      Your items are reserved. Present the PIN code to the cashier during counter collection.
                    </p>
                  </div>

                  <div className="bg-slate-900 dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-800 w-full space-y-4 max-w-xs">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">SECURE COLLECTION PIN</div>
                      <span className="text-3xl font-black tracking-widest text-brand-orange">
                        {placedOrderResult.pickupPin}
                      </span>
                    </div>

                    <div className="border-t border-slate-800 pt-3 text-left space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Order Number:</span>
                        <strong className="text-slate-200">{placedOrderResult.orderNumber}</strong>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Grand Total:</span>
                        <strong className="text-brand-orange">₹{placedOrderResult.totalAmount}</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedShop(null);
                      setActiveTab("orders");
                    }}
                    className="py-3 px-6 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow"
                  >
                    <span>View in My Orders</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                /* Catalog shopping items list */
                <div className="space-y-4">
                  
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Select products to add</div>
                  
                  <div className="space-y-3">
                    {loadingProducts ? (
                      <div className="py-8 text-center text-xs text-slate-500 font-bold">
                        Loading product catalog...
                      </div>
                    ) : shopProducts.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-500 italic font-medium">
                        No products available in this shop's catalog.
                      </div>
                    ) : (
                      shopProducts.map((prod) => {
                        const qty = cart[prod.id] || 0;
                        return (
                          <div 
                            key={prod.id}
                            className="p-3 border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900/30 rounded-2xl flex items-center justify-between transition-all hover:border-slate-200 dark:hover:border-slate-800"
                          >
                            <div>
                              <span className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-500">{prod.category}</span>
                              <h4 className="text-xs font-bold text-slate-950 dark:text-white leading-tight">{prod.name}</h4>
                              <span className="text-[11px] font-black text-brand-orange mt-1 block">₹{prod.price} <span className="text-[10px] text-slate-500 font-bold">/ {prod.unit || "Pkt"}</span></span>
                            </div>

                            {qty === 0 ? (
                              <button
                                onClick={() => updateCartQty(prod.id, 1)}
                                className="py-1.5 px-3 border border-brand-orange hover:bg-brand-orange text-brand-orange hover:text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Add</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shrink-0">
                                <button 
                                  onClick={() => updateCartQty(prod.id, -1)}
                                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="text-xs font-black px-1.5 text-slate-900 dark:text-white">{qty}</span>
                                <button 
                                  onClick={() => updateCartQty(prod.id, 1)}
                                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Checkout fields */}
                  {getCartItemsCount() > 0 && (
                    <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-4">
                      
                      {/* 1. Pickup Slot schedule Selection */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Schedule Pickup Time
                        </label>
                        <select
                          value={pickupTimeOffset}
                          onChange={(e) => setPickupTimeOffset(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-brand-orange"
                        >
                          <option value="15">In 15 Minutes</option>
                          <option value="30">In 30 Minutes</option>
                          <option value="60">In 1 Hour</option>
                          <option value="120">In 2 Hours</option>
                        </select>
                      </div>

                      {/* 2. Order Notes */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Add Instruction Notes
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                          <textarea
                            rows={2}
                            value={orderNotes}
                            onChange={(e) => setOrderNotes(e.target.value)}
                            placeholder="e.g. Please pack cold items separately..."
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs focus:outline-none focus:border-brand-orange placeholder-slate-500 resize-none"
                          />
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Footer Summary & Place Order */}
            {!placedOrderResult && (
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">TOTAL PICKUP BAG</div>
                    <span className="text-md font-black text-slate-950 dark:text-white">{getCartItemsCount()} Items Selected</span>
                  </div>
                  <span className="text-xl font-black text-brand-orange">₹{getCartTotal()}</span>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={getCartItemsCount() === 0 || isSubmittingOrder}
                  className="w-full py-3 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingOrder ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      <span>Reserving Stock & Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4.5 w-4.5 animate-bounce" />
                      <span>Place Pickup Order & Reserve Stock</span>
                    </>
                  )}
                </button>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

// Quick Loading Spinner Component
const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`${className} animate-spin`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
export default CustomerDashboard;
