import { env } from "../config/env";
import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  X, 
  Star, 
  History, 
  ArrowRight,
  Package,
  Users,
  Truck,
  Receipt,
  ShoppingBag,
  DollarSign,
  UserCheck,
  CheckCircle,
  Bell,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ScreenType } from "./Sidebar";

interface SearchResult {
  module: string;
  title: string;
  subtitle: string;
  action: string;
  targetId: string;
}

interface FavoriteItem {
  id: string;
  targetModule: string;
  targetId: string;
  title: string;
  subtitle?: string | null;
}

interface RecentSearch {
  id: string;
  searchText: string;
  searchModule: string;
}

interface GlobalSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveScreen: (screen: ScreenType) => void;
}

const FilterChips = [
  { label: "All", value: "All" },
  { label: "Products", value: "PRODUCTS" },
  { label: "Customers", value: "CUSTOMERS" },
  { label: "Suppliers", value: "SUPPLIERS" },
  { label: "Invoices", value: "INVOICES" },
  { label: "Purchases", value: "PURCHASES" },
  { label: "Expenses", value: "EXPENSES" },
  { label: "Tasks", value: "TASKS" },
];

export const GlobalSearchOverlay: React.FC<GlobalSearchOverlayProps> = ({ isOpen, onClose, setActiveScreen }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, SearchResult[]>>({});
  const [recent, setRecent] = useState<RecentSearch[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  
  // Keyboard navigation state
  const [flatResults, setFlatResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<any>(null);

  const fetchRecentAndFavorites = async () => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;
    try {
      const [recentRes, favRes] = await Promise.all([
        fetch(`${env.apiUrl}/api/v1/search/recent`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${env.apiUrl}/api/v1/search/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const recentJson = await recentRes.json();
      const favJson = await favRes.json();
      if (recentJson.success) setRecent(recentJson.data);
      if (favJson.success) setFavorites(favJson.data);
    } catch (err) {
      console.error("Failed to load search context details:", err);
    }
  };

  const handleSearch = async (val: string) => {
    if (!val.trim()) {
      setResults({});
      setFlatResults([]);
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const res = await fetch(`${env.apiUrl}/api/v1/search?q=${encodeURIComponent(val)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        setResults(json.data);
        
        // Flatten list for keyboard navigation index map
        const flat: SearchResult[] = [];
        Object.keys(json.data).forEach(key => {
          json.data[key].forEach((item: SearchResult) => {
            flat.push(item);
          });
        });
        setFlatResults(flat);
        setActiveIndex(flat.length > 0 ? 0 : -1);
      }
    } catch (err) {
      console.error("Failed executing search query:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecentAndFavorites();
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery("");
      setResults({});
      setFlatResults([]);
      setActiveIndex(-1);
      setSelectedFilter("All");
    }
  }, [isOpen]);

  // Debounced execution
  const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleSearch(val);
    }, 250);
  };

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(prev => (prev < flatResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : flatResults.length - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (activeIndex >= 0 && flatResults[activeIndex]) {
          handleSelectResult(flatResults[activeIndex]);
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, flatResults, activeIndex]);

  const handleSelectResult = (item: SearchResult) => {
    onClose();
    switch (item.action) {
      case "Open Product":
      case "Open Purchase":
        setActiveScreen("inventory");
        break;
      case "Open Customer":
        setActiveScreen("customers");
        break;
      case "Open Supplier":
        setActiveScreen("suppliers");
        break;
      case "Open Invoice":
        setActiveScreen("billing");
        break;
      case "Open Expense":
      case "Open Reports":
        setActiveScreen("reports");
        break;
      case "Open Staff":
        setActiveScreen("staff");
        break;
      case "Open Tasks":
        setActiveScreen("tasks");
        break;
      default:
        setActiveScreen("dashboard");
    }
  };

  const handleAddFavorite = async (item: SearchResult) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;

    try {
      const res = await fetch(`${env.apiUrl}/api/v1/search/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetModule: item.module,
          targetId: item.targetId,
          title: item.title,
          subtitle: item.subtitle,
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchRecentAndFavorites();
      }
    } catch (err) {
      console.error("Failed to add search favorite:", err);
    }
  };

  const handleRemoveFavorite = async (id: string) => {
    const token = localStorage.getItem("qb_token");
    if (!token) return;
    try {
      const res = await fetch(`${env.apiUrl}/api/v1/search/favorites/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) {
        fetchRecentAndFavorites();
      }
    } catch (err) {
      console.error("Failed to delete favorite:", err);
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case "PRODUCTS": return <Package className="h-4 w-4 text-brand-orange" />;
      case "CUSTOMERS": return <Users className="h-4 w-4 text-slate-400" />;
      case "SUPPLIERS": return <Truck className="h-4 w-4 text-slate-400" />;
      case "INVOICES": return <Receipt className="h-4 w-4 text-emerald-400" />;
      case "PURCHASES": return <ShoppingBag className="h-4 w-4 text-slate-400" />;
      case "EXPENSES": return <DollarSign className="h-4 w-4 text-rose-400" />;
      case "EMPLOYEES": return <UserCheck className="h-4 w-4 text-slate-400" />;
      case "TASKS": return <CheckCircle className="h-4 w-4 text-brand-orange" />;
      case "NOTIFICATIONS": return <Bell className="h-4 w-4 text-slate-400" />;
      default: return <Cpu className="h-4 w-4 text-slate-400" />;
    }
  };

  const filteredModules = Object.keys(results).filter(key => {
    if (selectedFilter === "All") return true;
    return key === selectedFilter;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black backdrop-blur-sm"
          />

          {/* Search Box Container */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="bg-slate-900/90 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden text-slate-100 flex flex-col font-sans max-h-[75vh]"
          >
            {/* Input Header */}
            <div className="flex items-center p-4 border-b border-slate-850 gap-3">
              <Search className="h-5 w-5 text-slate-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={onQueryChange}
                placeholder="Search anything... products, customers, transactions or type 'low stock', 'pending payments'"
                className="w-full bg-transparent border-none text-sm text-white focus:outline-none placeholder-slate-500"
              />
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Chips Category Filters */}
            <div className="px-4 py-2 flex flex-wrap items-center gap-1.5 border-b border-slate-850/50 bg-slate-950/20">
              {FilterChips.map(f => (
                <button
                  key={f.value}
                  onClick={() => setSelectedFilter(f.value)}
                  className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                    selectedFilter === f.value
                      ? "bg-brand-orange border-brand-orange text-white"
                      : "bg-slate-850/50 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Results body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar max-h-[50vh]">
              {loading && (
                <div className="space-y-3 py-4">
                  <div className="h-4 bg-slate-800 rounded-md w-1/3 animate-pulse" />
                  <div className="h-10 bg-slate-800 rounded-2xl animate-pulse" />
                  <div className="h-10 bg-slate-800 rounded-2xl animate-pulse" />
                </div>
              )}

              {/* Standard Dashboard Initial state (Favorites & Suggestions) */}
              {!query && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold">
                  {/* Pin Favorites */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />
                      Pinned Favorites
                    </h4>
                    {favorites.length === 0 ? (
                      <p className="text-slate-600 italic leading-loose">Pin products, customers or logs to view here.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {favorites.map(f => (
                          <div 
                            key={f.id}
                            className="p-2.5 bg-slate-950/40 hover:bg-slate-850/50 rounded-2xl border border-slate-850/50 flex justify-between items-center group cursor-pointer transition-all"
                            onClick={() => handleSelectResult({
                              module: f.targetModule,
                              title: f.title,
                              subtitle: f.subtitle || "",
                              action: f.targetModule === "PRODUCTS" ? "Open Product" : f.targetModule === "CUSTOMERS" ? "Open Customer" : "Open Reports",
                              targetId: f.targetId
                            })}
                          >
                            <div className="flex items-center gap-2">
                              {getModuleIcon(f.targetModule)}
                              <div>
                                <span className="text-white block font-bold">{f.title}</span>
                                <span className="text-[10px] text-slate-500 font-medium block">{f.subtitle}</span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveFavorite(f.id);
                              }}
                              className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recents Searches */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold flex items-center gap-1">
                      <History className="h-3.5 w-3.5 text-slate-400" />
                      Recent Searches
                    </h4>
                    {recent.length === 0 ? (
                      <p className="text-slate-600 italic leading-loose">No search query logs registered yet.</p>
                    ) : (
                      <div className="space-y-1">
                        {recent.slice(0, 5).map(r => (
                          <div
                            key={r.id}
                            onClick={() => {
                              setQuery(r.searchText);
                              handleSearch(r.searchText);
                            }}
                            className="p-2 bg-slate-950/20 hover:bg-slate-850/30 rounded-xl flex items-center justify-between text-slate-400 hover:text-white cursor-pointer transition-all"
                          >
                            <span className="font-semibold">{r.searchText}</span>
                            <ArrowRight className="h-3.5 w-3.5 opacity-0 hover:opacity-100" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Results rendering */}
              {query && !loading && filteredModules.length === 0 && (
                <div className="py-12 text-center text-slate-500 font-semibold text-xs">
                  No records matching "{query}" registered in database.
                </div>
              )}

              {query && !loading && filteredModules.map(moduleName => (
                <div key={moduleName} className="space-y-2 text-xs font-semibold">
                  <h4 className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-850 pb-1.5">
                    {moduleName}
                  </h4>
                  <div className="space-y-1.5">
                    {results[moduleName].map((item, idx) => {
                      // Calculate index in flatResults list to handle active highlighting
                      const flatIndex = flatResults.findIndex(f => f.targetId === item.targetId && f.module === item.module);
                      const isHighlighted = flatIndex === activeIndex;

                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                            isHighlighted
                              ? "bg-slate-800 border-slate-700 shadow-md"
                              : "bg-slate-950/40 border-slate-850/50 hover:bg-slate-850/30"
                          }`}
                          onClick={() => handleSelectResult(item)}
                        >
                          <div className="flex items-center gap-2.5">
                            {getModuleIcon(item.module)}
                            <div>
                              <span className="text-white block font-extrabold">{item.title}</span>
                              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{item.subtitle}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Pin to favorites trigger */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddFavorite(item);
                              }}
                              className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-brand-orange transition-colors"
                            >
                              <Star className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-[9px] font-extrabold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              Open
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Commands */}
            <div className="p-3 border-t border-slate-850 bg-slate-950/40 flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              <div className="flex gap-4">
                <span>↑↓ navigate</span>
                <span>↵ select</span>
                <span>esc close</span>
              </div>
              <span className="text-brand-orange">Global Command Console</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
