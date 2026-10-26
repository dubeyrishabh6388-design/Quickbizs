import React, { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  ArrowRight, 
  Store, 
  Users, 
  AlertCircle, 
  Lock,
  User,
  Phone,
  Mail,
  MapPin,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  Check,
  Sparkles,
  Wrench,
  ShoppingCart,
  Pill,
  Shirt,
  Package,
  Layers,
  Smartphone,
  Tv,
  Glasses,
  Gem,
  Hammer,
  Truck,
  Building,
  Coffee,
  BookOpen,
  Search,
  Star,
  Utensils,
  Car,
  HeartPulse,
  Scissors
} from "lucide-react";
import logo from "../assets/logo.jpg";
import customerImg from "../assets/groceries_customer.jpg";
import merchantImg from "../assets/merchant_laptop.jpg";
import { api } from "../config/api";

// --- Validation Schemas ---
const customerLoginSchema = z.object({
  identifier: z.string().min(1, { message: "Email or Mobile number is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

const customerRegisterSchema = z.object({
  name: z.string().min(2, { message: "Full Name is required" }),
  phone: z.string()
    .min(10, { message: "Mobile number must be exactly 10 digits" })
    .max(10, { message: "Mobile number must be exactly 10 digits" })
    .regex(/^\d+$/, { message: "Mobile number must contain only digits" }),
  email: z.string().email({ message: "Invalid email format" }).optional().or(z.literal("")),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm password is required" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

const merchantLoginSchema = z.object({
  identifier: z.string().min(1, { message: "Email or Mobile number is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

const merchantRegisterSchema = z.object({
  ownerName: z.string().min(2, { message: "Owner Name is required" }),
  businessName: z.string().min(2, { message: "Business Name is required" }),
  phone: z.string()
    .min(10, { message: "Mobile number must be exactly 10 digits" })
    .max(10, { message: "Mobile number must be exactly 10 digits" })
    .regex(/^\d+$/, { message: "Mobile number must contain only digits" }),
  email: z.string().email({ message: "Invalid email format" }),
  address: z.string().min(5, { message: "Business address must be at least 5 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm password is required" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// Set to true or add "?customer=true" to the URL when ready to re-enable Customer login & onboarding
export const SHOW_CUSTOMER_PORTAL = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("customer") === "true";

export const LOGIN_ICON_MAP: Record<string, React.ElementType> = {
  ShoppingCart,
  Wrench,
  Zap,
  Package,
  Store,
  Hammer,
  Building,
  Layers,
  Truck,
  Shirt,
  Smartphone,
  Tv,
  Glasses,
  Gem,
  Pill,
  Coffee,
  Sparkles,
  BookOpen,
  Utensils,
  Car,
  HeartPulse,
  Scissors,
  ShieldCheck,
};

export const BUSINESS_CATEGORIES = [
  { id: "Grocery Store", label: "Grocery & Kirana", desc: "FMCG, Food & Provisions", icon: ShoppingCart },
  { id: "Automobile Shop", label: "Auto Parts & Trade", desc: "Spares, OEM & Lubes", icon: Wrench },
  { id: "Electrical Store", label: "Electrical & Lighting", desc: "Wires, MCBs, Switches", icon: Zap },
  { id: "Hardware Store", label: "Hardware & Tools", desc: "Tools, Fasteners, Paints", icon: Package },
  { id: "Plumbing Supplies", label: "Plumbing & Piping", desc: "CPVC, UPVC, Valves & Taps", icon: Wrench },
  { id: "Sanitaryware & Bath", label: "Sanitaryware & Bath", desc: "Commodes, Basins & Showers", icon: Store },
  { id: "Industrial Tools & Machinery", label: "Power & Hand Tools", desc: "Power Tools, Bits & Blades", icon: Hammer },
  { id: "Building Materials & Cement", label: "Building Materials & Cement", desc: "Cement, TMT Steel & Bricks", icon: Building },
  { id: "Timber & Plywood", label: "Timber & Plywood", desc: "Plywood, Flush Doors & Sunmica", icon: Layers },
  { id: "Wholesale Trader", label: "Wholesale & Bulk Trade", desc: "Master Cartons & Pallets", icon: Layers },
  { id: "Distributor", label: "Authorized Distributor", desc: "Channel Partner & Route Sales", icon: Truck },
  { id: "FMCG Distributor", label: "FMCG Super Stockist", desc: "Packaged CPG & Kirana Supply", icon: ShoppingCart },
  { id: "Authorized Dealer", label: "Dealership & Franchise", desc: "OEM Machinery & Equipment", icon: ShieldCheck },
  { id: "Clothing Store", label: "Clothing & Fashion", desc: "Garments, Sizes & Fabrics", icon: Shirt },
  { id: "Footwear Store", label: "Footwear & Shoes", desc: "Sizes, Soles & Box Stock", icon: Package },
  { id: "Mobile Store", label: "Mobile Phones & Gadgets", desc: "IMEI, Handsets & Accessories", icon: Smartphone },
  { id: "Electronics Store", label: "Electronics & Appliances", desc: "TVs, ACs & Serialized Items", icon: Tv },
  { id: "Furniture Store", label: "Furniture & Decor", desc: "Wood, Metal & Modular Units", icon: Store },
  { id: "Optical Store", label: "Optical & Eyewear", desc: "Frames, Power & Sunglasses", icon: Glasses },
  { id: "Jewellery Store", label: "Jewellery & Gold", desc: "Purity, Hallmarks & Rates", icon: Gem },
  { id: "Pharmacy", label: "Pharmacy & Medical", desc: "Medicines & Health Supplies", icon: Pill },
  { id: "Dairy Store", label: "Dairy & Milk Parlour", desc: "Milk, Paneer, Curd & Ghee", icon: Coffee },
  { id: "Bakery Store", label: "Bakery & Confectionery", desc: "Cakes, Bread, Buns & Cookies", icon: Coffee },
  { id: "Sweet Shop", label: "Sweet & Mithai Shop", desc: "Mithai, Namkeen & Gift Boxes", icon: Sparkles },
  { id: "Stationery Store", label: "Stationery & Office", desc: "Paper, Pens, Registers & Office", icon: BookOpen },
  { id: "Bookstore", label: "Bookstore & Publishing", desc: "ISBN, Titles & Academic Books", icon: BookOpen },
  { id: "Cosmetics Store", label: "Cosmetics & Beauty", desc: "Skincare, Makeup & Fragrances", icon: Sparkles },
  { id: "Paan & Convenience", label: "Paan & Convenience", desc: "Paan, Mints, Snacks & Drinks", icon: Store },
  { id: "Custom Business", label: "General Retail", desc: "Flexible Retail Setup", icon: Store },
];

const getCategoryHighlight = (id: string) => {
  const customMap: Record<string, { tag: string; highlights: string[]; badge: string }> = {
    "Grocery Store": {
      tag: "FMCG, Food & Provisions",
      highlights: [
        "Weight scale integration & loose item pricing",
        "Batch & Expiry alerts with automated FEFO",
        "Customer Khata with instant WhatsApp balance"
      ],
      badge: "Grocery & FMCG Engine"
    },
    "Automobile Shop": {
      tag: "Spares, OEM & Lubes",
      highlights: [
        "Part Number & OEM cross-referencing",
        "Vehicle Make, Model & Year fitment search",
        "Serial number tracking & warranty management"
      ],
      badge: "Auto Spares & OEM"
    },
    "Electrical Store": {
      tag: "Wires, MCBs & Switches",
      highlights: [
        "Wattage, Voltage & Brand attributes",
        "High-value serial & warranty management",
        "Fractional wire coil cut billing & meters"
      ],
      badge: "Electrical & Lighting"
    },
    "Hardware Store": {
      tag: "Tools, Fasteners & Paints",
      highlights: [
        "Dimensional & gauge measurement units",
        "Volume contractor pricing & tiered discounts",
        "Mixed retail & contractor Khata credit"
      ],
      badge: "Hardware & Construction"
    },
    "Mobile Store": {
      tag: "IMEI, Handsets & Gadgets",
      highlights: [
        "Dual-SIM IMEI validation with Luhn check",
        "Unit-level device serial & warranty lifecycle",
        "Instant barcode scan & rapid digital receipt"
      ],
      badge: "Mobile & IMEI Tracking"
    },
    "Electronics Store": {
      tag: "Appliances & Devices",
      highlights: [
        "Serial numbers & extended warranty cards",
        "Delivery, installation & technician tracking",
        "Brand model number fast search"
      ],
      badge: "Electronics & Appliances"
    },
    "Pharmacy": {
      tag: "Medicines & Health Supplies",
      highlights: [
        "Drug Schedule H / H1 regulatory tagging",
        "Batch-level FEFO automated shelf allocation",
        "Strip and tablet box subdivision pricing"
      ],
      badge: "Pharma Compliance Ready"
    },
    "Clothing Store": {
      tag: "Garments, Sizes & Fabrics",
      highlights: [
        "Size & Color variant matrix (S/M/L/XL/XXL)",
        "Single barcode lookup across variant matrix",
        "Seasonal discounts & clearance pricing"
      ],
      badge: "Apparel & Fashion Retail"
    },
    "Footwear Store": {
      tag: "Sizes, Soles & Box Stock",
      highlights: [
        "UK / EU shoe size matrix management",
        "Fast box barcode scanning & rack finder",
        "Gender & style categorization"
      ],
      badge: "Footwear & Shoes"
    },
    "Wholesale Trader": {
      tag: "Bulk B2B Trade & Cartons",
      highlights: [
        "Master carton to unit split conversions",
        "Multi-tier customer wholesale pricing",
        "Credit limit enforcement & balance alerts"
      ],
      badge: "Wholesale & Distribution"
    }
  };

  const found = customMap[id];
  if (found) return found;

  const catObj = BUSINESS_CATEGORIES.find(c => c.id === id);
  return {
    tag: catObj?.desc || "Retail & Trade Platform",
    highlights: [
      "Custom product attributes & fast search",
      "Instant barcode POS with thermal receipts",
      "Customer Khata ledger & automated stock alerts"
    ],
    badge: "Smart Retail Operating System"
  };
};

export const CATEGORY_SECTORS = [
  { id: "ALL", label: "All Trades", icon: Sparkles, matches: [] },
  { 
    id: "RETAIL", 
    label: "Grocery & Food", 
    icon: ShoppingCart, 
    matches: ["Grocery Store", "Dairy Store", "Bakery Store", "Sweet Shop", "Paan & Convenience", "Stationery Store", "Bookstore", "Cosmetics Store", "Custom Business"] 
  },
  { 
    id: "SPARES", 
    label: "Spares & Hardware", 
    icon: Wrench, 
    matches: ["Automobile Shop", "Electrical Store", "Hardware Store", "Plumbing Supplies", "Sanitaryware & Bath", "Industrial Tools & Machinery", "Building Materials & Cement", "Timber & Plywood"] 
  },
  { 
    id: "TECH", 
    label: "Mobile & Tech", 
    icon: Smartphone, 
    matches: ["Mobile Store", "Electronics Store", "Optical Store", "Jewellery Store"] 
  },
  { 
    id: "FASHION", 
    label: "Fashion & Lifestyle", 
    icon: Shirt, 
    matches: ["Clothing Store", "Footwear Store"] 
  },
  { 
    id: "TRADE", 
    label: "Wholesale & B2B", 
    icon: Truck, 
    matches: ["Wholesale Trader", "Distributor", "FMCG Distributor", "Authorized Dealer"] 
  },
  { 
    id: "PHARMA", 
    label: "Pharmacy & Health", 
    icon: Pill, 
    matches: ["Pharmacy"] 
  }
];

interface LoginProps {
  onAuthSuccess: (userData: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onAuthSuccess }) => {
  const [role, setRole] = useState<"CUSTOMER" | "MERCHANT" | null>(() => SHOW_CUSTOMER_PORTAL ? null : "MERCHANT");
  const [mode, setMode] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);
  const [activeSector, setActiveSector] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [businessType, setBusinessType] = useState("Grocery Store");
  const [sellingMode, setSellingMode] = useState("Retail Store");
  const [categorySearch, setCategorySearch] = useState("");
  const [categoriesList, setCategoriesList] = useState<any[]>(BUSINESS_CATEGORIES);

  useEffect(() => {
    let isMounted = true;
    api.get("/auth/business-categories")
      .then((res) => {
        if (isMounted && res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const mapped = res.data.data.map((cat: any) => ({
            ...cat,
            icon: LOGIN_ICON_MAP[cat.icon] || Store,
          }));
          setCategoriesList(mapped);
        }
      })
      .catch(() => {
        // Fallback to static list
      });
    return () => { isMounted = false; };
  }, []);

  const filteredCategories = useMemo(() => {
    return categoriesList.filter(c => {
      if (activeSector !== "ALL") {
        const sector = CATEGORY_SECTORS.find(s => s.id === activeSector);
        if (sector && !sector.matches.includes(c.id)) {
          return false;
        }
      }
      if (categorySearch.trim()) {
        const q = categorySearch.toLowerCase();
        return (
          c.label.toLowerCase().includes(q) || 
          c.desc.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [categoriesList, categorySearch, activeSector]);

  const selectedCategory = useMemo(() => {
    return categoriesList.find(c => c.id === businessType) || categoriesList[0];
  }, [categoriesList, businessType]);

  const selectedHighlight = useMemo(() => {
    return getCategoryHighlight(businessType);
  }, [categoriesList, businessType]);

  const SelectedCategoryIcon = selectedCategory?.icon || Store;

  // Forms setup
  const custLoginForm = useForm({ resolver: zodResolver(customerLoginSchema) });
  const custRegisterForm = useForm({ resolver: zodResolver(customerRegisterSchema) });
  const merchLoginForm = useForm({ resolver: zodResolver(merchantLoginSchema) });
  const merchRegisterForm = useForm({ resolver: zodResolver(merchantRegisterSchema) });

  const resetForms = () => {
    custLoginForm.reset();
    custRegisterForm.reset();
    merchLoginForm.reset();
    merchRegisterForm.reset();
    setErrorDetails(null);
    setRegisterStep(1);
    setActiveSector("ALL");
    setCategorySearch("");
  };

  const handleRoleSelect = (selectedRole: "CUSTOMER" | "MERCHANT") => {
    setRole(selectedRole);
    setMode("LOGIN");
    resetForms();
  };

  const handleBackToRole = () => {
    if (SHOW_CUSTOMER_PORTAL) {
      setRole(null);
    }
    resetForms();
  };

  // --- Customer Login Submit ---
  const onCustomerLogin = async (data: any) => {
    setIsLoading(true);
    setErrorDetails(null);
    try {
      const response = await api.post("/auth/login/customer", {
        identifier: data.identifier,
        password: data.password
      });
      if (response.data?.success && response.data?.data) {
        onAuthSuccess(response.data.data);
      } else {
        setErrorDetails(response.data?.message || "Login failed.");
      }
    } catch (err: any) {
      setErrorDetails(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Customer Register Submit ---
  const onCustomerRegister = async (data: any) => {
    setIsLoading(true);
    setErrorDetails(null);
    const payload = {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      password: data.password,
      confirmPassword: data.confirmPassword
    };
    try {
      const response = await api.post("/auth/register/customer", payload);
      if (response.data?.success && response.data?.data) {
        onAuthSuccess(response.data.data);
      } else {
        setErrorDetails(response.data?.message || "Registration failed.");
      }
    } catch (err: any) {
      setErrorDetails(err.response?.data?.message || "Mobile number or Email already registered.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Merchant Login Submit ---
  const onMerchantLogin = async (data: any) => {
    setIsLoading(true);
    setErrorDetails(null);
    try {
      const response = await api.post("/auth/login/merchant", {
        identifier: data.identifier,
        password: data.password
      });
      if (response.data?.success && response.data?.data) {
        onAuthSuccess(response.data.data);
      } else {
        setErrorDetails(response.data?.message || "Login failed.");
      }
    } catch (err: any) {
      setErrorDetails(err.response?.data?.message || "Invalid merchant credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Merchant Register Submit ---
  const onMerchantRegister = async (data: any) => {
    setIsLoading(true);
    setErrorDetails(null);
    const payload = {
      ownerName: data.ownerName,
      businessName: data.businessName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      password: data.password,
      confirmPassword: data.confirmPassword,
      businessType: businessType,
      sellingMode: sellingMode,
    };
    try {
      const response = await api.post("/auth/register/merchant", payload);
      if (response.data?.success && response.data?.data) {
        onAuthSuccess(response.data.data);
      } else {
        setErrorDetails(response.data?.message || "Store registration failed.");
      }
    } catch (err: any) {
      setErrorDetails(err.response?.data?.message || "Business registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-950 font-sans text-slate-200 relative overflow-hidden">
      
      {/* Background Ambient Lighting Glows */}
      <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-brand-orange/15 rounded-full blur-[160px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute top-1/4 right-10 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25"></div>

      {role === null ? (
        // --- PREMIUM ACCOUNT SELECTION SCREEN ---
        <div className="flex-1 flex flex-col justify-between p-6 md:p-12 z-10 min-h-screen max-w-7xl mx-auto w-full relative">
          
          {/* Header Bar */}
          <header className="flex items-center justify-between w-full">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <img src={logo} alt="QuickBizs Logo" className="h-9 w-9 rounded-xl object-cover shadow-lg" />
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight leading-none">
                  Quick<span className="text-brand-orange">Bizs</span>
                </h1>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  Local Commerce Platform
                </span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border border-slate-800/80 rounded-full text-[10px] text-slate-300 font-bold shadow-sm backdrop-blur-sm"
            >
              <span className="text-brand-orange">★</span> Trusted by 5000+ stores
              <div className="flex -space-x-2 overflow-hidden ml-1">
                <img className="inline-block h-5.5 w-5.5 rounded-full ring-2 ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Avatar 1" />
                <img className="inline-block h-5.5 w-5.5 rounded-full ring-2 ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Avatar 2" />
                <img className="inline-block h-5.5 w-5.5 rounded-full ring-2 ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Avatar 3" />
                <img className="inline-block h-5.5 w-5.5 rounded-full ring-2 ring-slate-900 object-cover" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Avatar 4" />
              </div>
            </motion.div>
          </header>

          {/* Hero Content */}
          <main className="flex-1 flex flex-col justify-center py-8 space-y-10">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-center space-y-3 max-w-2xl mx-auto"
            >
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
                Powering <span className="text-brand-orange">Local</span>. Delivering <span className="text-brand-orange">Trust</span>.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-semibold max-w-md mx-auto leading-relaxed">
                One platform for seamless ordering, inventory, and local commerce.
              </p>
              <div className="text-[11px] text-slate-500 font-bold uppercase tracking-widest pt-2">
                Choose your account type to continue
              </div>
            </motion.div>

            {/* Selection Grid */}
            <div className={`grid grid-cols-1 ${SHOW_CUSTOMER_PORTAL ? "lg:grid-cols-2" : "max-w-xl"} gap-8 max-w-6xl w-full mx-auto items-stretch`}>
              
              {/* Customer App Card (Hidden by default, preserved for future activation) */}
              {SHOW_CUSTOMER_PORTAL && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  whileHover={{ y: -6, scale: 1.01, borderColor: "rgba(249,115,22,0.4)" }}
                  className="relative flex flex-col justify-between p-6 sm:p-10 rounded-3xl border border-brand-orange/15 bg-slate-900/20 backdrop-blur-md overflow-hidden group shadow-2xl hover:shadow-[0_0_50px_-12px_rgba(249,115,22,0.25)] transition-all duration-300 min-h-[460px] cursor-pointer"
                >
                  {/* Image Mask background */}
                  <div 
                    className="absolute left-0 bottom-0 top-0 w-2/5 h-full opacity-35 mix-blend-lighten pointer-events-none bg-cover bg-left-top"
                    style={{ 
                      backgroundImage: `url(${customerImg})`,
                      maskImage: 'linear-gradient(to right, black 30%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to right, black 30%, transparent 100%)'
                    }}
                  />
                  
                  {/* Dotted path animation stylesheet */}
                  <style>{`
                    @keyframes dash {
                      to {
                        stroke-dashoffset: -20;
                      }
                    }
                    .animate-dash {
                      animation: dash 1.5s linear infinite;
                    }
                  `}</style>

                  {/* Curving SVG Dotted line with floating indicators */}
                  <svg className="absolute left-[35%] top-[10%] w-[100px] h-[180px] pointer-events-none hidden sm:block opacity-50" viewBox="0 0 100 180" fill="none">
                    <path d="M10,170 Q70,120 20,60 T80,10" stroke="#f97316" strokeWidth="2" strokeDasharray="5 5" className="animate-dash" strokeLinecap="round" />
                    <circle cx="80" cy="10" r="4" fill="#f97316" className="animate-pulse" />
                    <circle cx="10" cy="170" r="4" fill="#f97316" className="animate-pulse" />
                  </svg>

                  <motion.div 
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className="absolute left-[30%] top-[40%] bg-brand-orange/10 border border-brand-orange/20 p-1.5 rounded-full text-brand-orange hidden sm:block shadow-md"
                  >
                    <MapPin className="h-4.5 w-4.5 animate-pulse" />
                  </motion.div>
                  
                  <motion.div 
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
                    className="absolute left-[24%] top-[15%] bg-brand-orange/10 border border-brand-orange/20 p-1.5 rounded-full text-brand-orange hidden sm:block shadow-md"
                  >
                    <Users className="h-4.5 w-4.5" />
                  </motion.div>

                  <div className="relative z-10 w-full md:w-3/5 ml-auto flex flex-col justify-between h-full space-y-6">
                    <div className="space-y-4">
                      <div className="h-12 w-12 bg-brand-orange/10 text-brand-orange border border-brand-orange/25 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                        <Users className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-white leading-tight">Customer App</h3>
                        <p className="text-[11px] text-slate-400 mt-1 font-semibold leading-relaxed">
                          Order from your favorite local stores and pickup instantly.
                        </p>
                      </div>

                      <ul className="space-y-2 pt-2">
                        {[
                          "Browse local stores",
                          "Order products easily",
                          "Fast pickup",
                          "Secure & simple"
                        ].map((benefit, i) => (
                          <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
                            <span className="h-4.5 w-4.5 rounded-full bg-brand-orange/10 text-brand-orange flex items-center justify-center border border-brand-orange/20">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button 
                      onClick={() => handleRoleSelect("CUSTOMER")}
                      className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-98 transition-all hover:shadow-brand-orange/20"
                    >
                      <span>Continue as Customer</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Merchant Dashboard Card */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                whileHover={{ y: -6, scale: 1.01, borderColor: "rgba(16,185,129,0.4)" }}
                className="relative flex flex-col justify-between p-6 sm:p-10 rounded-3xl border border-emerald-500/15 bg-slate-900/20 backdrop-blur-md overflow-hidden group shadow-2xl hover:shadow-[0_0_50px_-12px_rgba(16,185,129,0.25)] transition-all duration-300 min-h-[460px] cursor-pointer"
              >
                {/* Image Mask background */}
                <div 
                  className="absolute right-0 bottom-0 top-0 w-2/5 h-full opacity-35 mix-blend-lighten pointer-events-none bg-cover bg-right-top"
                  style={{ 
                    backgroundImage: `url(${merchantImg})`,
                    maskImage: 'linear-gradient(to left, black 30%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to left, black 30%, transparent 100%)'
                  }}
                />

                {/* Floating analytics panel */}
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute right-[33%] top-[8%] z-20 w-[160px] bg-slate-950/90 border border-slate-800/80 rounded-2xl p-3 backdrop-blur-md shadow-2xl space-y-2.5 hidden sm:block"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Today's Orders</div>
                      <span className="text-sm font-black text-white">32</span>
                    </div>
                    <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1 py-0.5 rounded">+18%</span>
                  </div>
                  <div className="border-t border-slate-800/60 pt-2 flex justify-between items-start">
                    <div>
                      <div className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Total Sales</div>
                      <span className="text-xs font-black text-white">₹24,560</span>
                    </div>
                    <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1 py-0.5 rounded">+21%</span>
                  </div>
                  <svg className="w-full h-8 text-emerald-400 pt-1" viewBox="0 0 100 30" fill="none">
                    <path d="M0,25 Q15,22 30,12 T60,18 T90,5 T100,2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </motion.div>

                <div className="relative z-10 w-full md:w-3/5 mr-auto flex flex-col justify-between h-full space-y-6">
                  <div className="space-y-4">
                    <div className="h-12 w-12 bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <Store className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white leading-tight">Merchant Dashboard</h3>
                      <p className="text-[11px] text-slate-400 mt-1 font-semibold leading-relaxed">
                        Manage orders, inventory, and your store all in one place.
                      </p>
                    </div>

                    <ul className="space-y-2 pt-2">
                      {[
                        "Manage incoming orders",
                        "Track inventory",
                        "Print invoices",
                        "Grow your business"
                      ].map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
                          <span className="h-4.5 w-4.5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    onClick={() => handleRoleSelect("MERCHANT")}
                    className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-98 transition-all hover:shadow-emerald-500/20"
                  >
                    <span>Continue as Merchant</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>

            </div>
          </main>

          {/* Footer Bar & Copyright */}
          <footer className="space-y-6 pt-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="w-full max-w-5xl mx-auto bg-slate-900/40 border border-slate-900/60 rounded-3xl p-5 md:p-6 shadow-xl backdrop-blur-md grid grid-cols-2 md:grid-cols-4 gap-6 items-center"
            >
              
              <div className="flex items-center gap-3 group">
                <div className="h-10 w-10 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center shrink-0 border border-brand-orange/20 group-hover:rotate-12 transition-transform duration-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-white leading-tight uppercase tracking-wider">Secure & Reliable</h4>
                  <p className="text-[9px] text-slate-500 font-bold leading-none mt-1">Your data is always protected</p>
                </div>
              </div>

              <div className="flex items-center gap-3 group">
                <div className="h-10 w-10 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center shrink-0 border border-brand-orange/20 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-white leading-tight uppercase tracking-wider">Lightning Fast</h4>
                  <p className="text-[9px] text-slate-500 font-bold leading-none mt-1">Built for speed & performance</p>
                </div>
              </div>

              <div className="flex items-center gap-3 group">
                <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/20 group-hover:-rotate-12 transition-transform duration-300">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-white leading-tight uppercase tracking-wider">For Everyone</h4>
                  <p className="text-[9px] text-slate-500 font-bold leading-none mt-1">Simple to use for all business</p>
                </div>
              </div>

              <div className="flex items-center gap-3 group">
                <div className="h-10 w-10 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center shrink-0 border border-brand-orange/20 group-hover:animate-spin transition-transform duration-500">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-white leading-tight uppercase tracking-wider">Built for India</h4>
                  <p className="text-[9px] text-slate-500 font-bold leading-none mt-1">Designed for local needs</p>
                </div>
              </div>

            </motion.div>

            <div className="text-center text-[10px] text-slate-600 font-bold">
              © 2026 QuickBizs Hyperlocal Commerce Group. All rights reserved.
            </div>
          </footer>
        </div>
      ) : (
        // --- ORIGINAL LOGIN FORM CARD (KEPT EXACTLY AS-IS) ---
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 z-10 min-h-screen">
          
          <header className="flex items-center justify-between w-full max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <img src={logo} alt="QuickBizs Logo" className="h-9 w-9 rounded-xl object-cover shadow-lg" />
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Quick<span className="text-brand-orange">Bizs</span>
                </h1>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  Local Commerce Platform
                </span>
              </div>
            </div>
          </header>

          <main className={`w-full mx-auto my-auto py-6 sm:py-8 transition-all duration-500 ${role === "MERCHANT" && mode === "REGISTER" ? "max-w-7xl" : "max-w-md"}`}>
            <AnimatePresence mode="wait">
              {role === "CUSTOMER" && (
                <motion.div
                  key="customer-auth"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleBackToRole}
                      className="p-2 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                      <span className="text-[9px] text-brand-orange font-bold uppercase tracking-wider">
                        Customer PWA Account
                      </span>
                      <h3 className="text-md font-black text-white leading-tight">
                        {mode === "LOGIN" ? "Sign In to Checkout" : "Create Customer Profile"}
                      </h3>
                    </div>
                  </div>

                  {errorDetails && (
                    <div className="bg-rose-950/40 border border-rose-800/80 p-3.5 rounded-2xl flex gap-2.5 text-[11px] text-rose-200 leading-relaxed">
                      <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{errorDetails}</span>
                    </div>
                  )}

                  {mode === "LOGIN" ? (
                    <form onSubmit={custLoginForm.handleSubmit(onCustomerLogin)} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Mobile or Email
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            {...custLoginForm.register("identifier")}
                            placeholder="e.g. 9876543210 or customer@email.com"
                            disabled={isLoading}
                            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-orange rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                          />
                        </div>
                        {custLoginForm.formState.errors.identifier && (
                          <p className="text-[10px] text-rose-500 font-medium mt-1">{String(custLoginForm.formState.errors.identifier.message)}</p>
                        )}
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Password
                          </label>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                          <input
                            type={showPassword ? "text" : "password"}
                            {...custLoginForm.register("password")}
                            placeholder="••••••••"
                            disabled={isLoading}
                            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-orange rounded-xl pl-11 pr-11 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {custLoginForm.formState.errors.password && (
                          <p className="text-[10px] text-rose-500 font-medium mt-1">{String(custLoginForm.formState.errors.password.message)}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-lg active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Sign In & Order</span>}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={custRegisterForm.handleSubmit(onCustomerRegister)} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            {...custRegisterForm.register("name")}
                            placeholder="e.g. Rishi Dubey"
                            disabled={isLoading}
                            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-orange rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                          />
                        </div>
                        {custRegisterForm.formState.errors.name && (
                          <p className="text-[10px] text-rose-500 font-medium mt-1">{String(custRegisterForm.formState.errors.name.message)}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Mobile Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            {...custRegisterForm.register("phone")}
                            placeholder="e.g. 9876543210"
                            disabled={isLoading}
                            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-orange rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                          />
                        </div>
                        {custRegisterForm.formState.errors.phone && (
                          <p className="text-[10px] text-rose-500 font-medium mt-1">{String(custRegisterForm.formState.errors.phone.message)}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Email (Optional)
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                          <input
                            type="email"
                            {...custRegisterForm.register("email")}
                            placeholder="e.g. rishi@example.com"
                            disabled={isLoading}
                            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-orange rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                          />
                        </div>
                        {custRegisterForm.formState.errors.email && (
                          <p className="text-[10px] text-rose-500 font-medium mt-1">{String(custRegisterForm.formState.errors.email.message)}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                          <input
                            type={showPassword ? "text" : "password"}
                            {...custRegisterForm.register("password")}
                            placeholder="••••••••"
                            disabled={isLoading}
                            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-orange rounded-xl pl-11 pr-11 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {custRegisterForm.formState.errors.password && (
                          <p className="text-[10px] text-rose-500 font-medium mt-1">{String(custRegisterForm.formState.errors.password.message)}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                          <input
                            type={showPassword ? "text" : "password"}
                            {...custRegisterForm.register("confirmPassword")}
                            placeholder="••••••••"
                            disabled={isLoading}
                            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-orange rounded-xl pl-11 pr-11 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                          />
                        </div>
                        {custRegisterForm.formState.errors.confirmPassword && (
                          <p className="text-[10px] text-rose-500 font-medium mt-1">{String(custRegisterForm.formState.errors.confirmPassword.message)}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-lg active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Register & Sign In</span>}
                      </button>
                    </form>
                  )}

                  <div className="text-center pt-2 border-t border-slate-900/60">
                    <button
                      onClick={() => {
                        setMode(mode === "LOGIN" ? "REGISTER" : "LOGIN");
                        setErrorDetails(null);
                      }}
                      className="text-xs text-brand-orange hover:underline font-bold cursor-pointer"
                    >
                      {mode === "LOGIN" ? "New customer? Register Account" : "Already registered? Sign In"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* MERCHANT LOGIN MODE */}
              {role === "MERCHANT" && mode === "LOGIN" && (
                <motion.div
                  key="merchant-login"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleBackToRole}
                      className="p-2 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                      <span className="text-[9px] text-brand-emerald font-bold uppercase tracking-wider">
                        Merchant Store Portal
                      </span>
                      <h3 className="text-md font-black text-white leading-tight">
                        Merchant Login
                      </h3>
                    </div>
                  </div>

                  {errorDetails && (
                    <div className="bg-rose-950/40 border border-rose-800/80 p-3.5 rounded-2xl flex gap-2.5 text-[11px] text-rose-200 leading-relaxed">
                      <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{errorDetails}</span>
                    </div>
                  )}

                  <form onSubmit={merchLoginForm.handleSubmit(onMerchantLogin)} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Store Email, Mobile or Admin ID
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          {...merchLoginForm.register("identifier")}
                          placeholder="e.g. owner@quickbizs.com or admin"
                          disabled={isLoading}
                          className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-emerald rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                        />
                      </div>
                      {merchLoginForm.formState.errors.identifier && (
                        <p className="text-[10px] text-rose-500 font-medium mt-1">{String(merchLoginForm.formState.errors.identifier.message)}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                        <input
                          type={showPassword ? "text" : "password"}
                          {...merchLoginForm.register("password")}
                          placeholder="••••••••"
                          disabled={isLoading}
                          className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-emerald rounded-xl pl-11 pr-11 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {merchLoginForm.formState.errors.password && (
                        <p className="text-[10px] text-rose-500 font-medium mt-1">{String(merchLoginForm.formState.errors.password.message)}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 bg-brand-emerald hover:bg-emerald-600 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-lg active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Sign In & Manage</span>}
                    </button>
                  </form>

                  <div className="text-center pt-2 border-t border-slate-900/60">
                    <button
                      onClick={() => {
                        setMode("REGISTER");
                        setErrorDetails(null);
                      }}
                      className="text-xs text-brand-emerald hover:underline font-bold cursor-pointer"
                    >
                      Register new store? Setup Wizard
                    </button>
                  </div>
                </motion.div>
              )}

              {/* MERCHANT REGISTER MODE (WIDESCREEN 2-COLUMN SHOWCASE & SPATIOUS LAYOUT) */}
              {role === "MERCHANT" && mode === "REGISTER" && (
                <motion.div
                  key="merchant-register"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full"
                >
                  {/* Left Column: Interactive Store Preview & Value Proposition (Desktop Only) */}
                  <div className="hidden lg:flex lg:col-span-5 flex-col gap-6 sticky top-8">
                    {/* Ambient Glassmorphism Showcase Card */}
                    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-8 shadow-2xl space-y-6">
                      {/* Decorative Background Glows */}
                      <div className="absolute -top-24 -left-24 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none" />

                      {/* Header Badge */}
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] font-bold tracking-wide">
                          <Sparkles className="h-3.5 w-3.5" />
                          {selectedHighlight.badge}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 tracking-wide uppercase">
                          QuickBizs OS
                        </span>
                      </div>

                      {/* Dynamic Store Headline */}
                      <div className="space-y-2">
                        <h2 className="text-2xl font-black text-white leading-tight">
                          Built specifically for your <span className="text-brand-emerald">{selectedCategory.label}</span>.
                        </h2>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                          {selectedHighlight.tag}. Customized POS shortcuts, specialized attributes, and automated GST billing out of the box.
                        </p>
                      </div>

                      {/* Live Store Feature Spotlight */}
                      <motion.div 
                        key={businessType}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25 }}
                        className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 shadow-inner space-y-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-xl bg-brand-emerald/20 border border-brand-emerald/40 text-brand-emerald flex items-center justify-center shrink-0 shadow-lg">
                            <SelectedCategoryIcon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-black text-white truncate">{selectedCategory.label}</h4>
                            <p className="text-[10px] text-brand-emerald font-semibold">{sellingMode} Active</p>
                          </div>
                        </div>

                        <div className="space-y-2.5 pt-2 border-t border-emerald-900/40">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Features Enabled for This Store:</p>
                          {selectedHighlight.highlights.map((feat, idx) => (
                            <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
                              <span className="h-4.5 w-4.5 rounded-full bg-emerald-500/20 text-brand-emerald flex items-center justify-center shrink-0 border border-emerald-500/30">
                                <Check className="h-2.5 w-2.5 stroke-[3]" />
                              </span>
                              <span className="truncate">{feat}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Quick Metrics Bar */}
                      <div className="grid grid-cols-3 gap-3 pt-1">
                        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                          <p className="text-brand-emerald font-black text-sm">0.3s</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Express POS</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                          <p className="text-brand-orange font-black text-sm">100%</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Offline Ready</p>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                          <p className="text-teal-400 font-black text-sm">GST</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Ready Invoices</p>
                        </div>
                      </div>

                      {/* Trust & Rating Footnote */}
                      <div className="flex items-center gap-3 pt-3 border-t border-slate-800/80">
                        <div className="flex -space-x-2 overflow-hidden">
                          <div className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-900 bg-emerald-600 flex items-center justify-center text-[10px] font-bold text-white">R</div>
                          <div className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-900 bg-brand-orange flex items-center justify-center text-[10px] font-bold text-white">V</div>
                          <div className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-900 bg-teal-600 flex items-center justify-center text-[10px] font-bold text-white">M</div>
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400" />
                            ))}
                          </div>
                          <span>Trusted by 10,000+ merchants in India</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Spacious & Structured Registration Form */}
                  <div className="lg:col-span-7 bg-slate-950 border border-slate-800/90 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 relative">
                    
                    {/* Stepper Tabs Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={handleBackToRole}
                          className="p-2.5 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                        >
                          <ArrowLeft className="h-4 w-4" />
                        </button>
                        <div>
                          <span className="text-[10px] text-brand-emerald font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-brand-emerald animate-pulse" />
                            Merchant Store Setup
                          </span>
                          <h3 className="text-xl font-black text-white leading-tight mt-0.5">
                            {registerStep === 1 ? "Select Business Category" : "Store & Owner Account"}
                          </h3>
                        </div>
                      </div>

                      {/* Visual 2-Step Stepper */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setRegisterStep(1)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            registerStep === 1 
                              ? "bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/40 shadow-sm"
                              : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          <span className={`h-5 w-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                            registerStep === 1 ? "bg-brand-emerald text-slate-950" : "bg-slate-800 text-slate-300"
                          }`}>
                            1
                          </span>
                          <span>1. Trade Category</span>
                        </button>

                        <div className={`h-0.5 w-3 sm:w-6 rounded transition-all ${registerStep === 2 ? "bg-brand-emerald" : "bg-slate-800"}`} />

                        <button
                          type="button"
                          onClick={() => setRegisterStep(2)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            registerStep === 2 
                              ? "bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/40 shadow-sm"
                              : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          <span className={`h-5 w-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                            registerStep === 2 ? "bg-brand-emerald text-slate-950" : "bg-slate-800 text-slate-300"
                          }`}>
                            2
                          </span>
                          <span>2. Store Details</span>
                        </button>
                      </div>
                    </div>

                    {errorDetails && (
                      <div className="bg-rose-950/40 border border-rose-800/80 p-4 rounded-2xl flex gap-3 text-xs text-rose-200 leading-relaxed">
                        <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                        <span>{errorDetails}</span>
                      </div>
                    )}

                    {/* STEP 1: DEDICATED BUSINESS CATEGORY & OPERATING MODE SECTION */}
                    {registerStep === 1 && (
                      <motion.div
                        key="step-category"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-6"
                      >
                        {/* Sector Filter Bar */}
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div>
                              <h4 className="text-sm font-black text-slate-200">Browse by Industry Sector</h4>
                              <p className="text-[11px] text-slate-400">Select your trade to load specialized custom fields and POS configurations</p>
                            </div>

                            {/* Quick Search */}
                            <div className="relative w-full sm:w-60">
                              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                              <input
                                type="text"
                                value={categorySearch}
                                onChange={(e) => setCategorySearch(e.target.value)}
                                placeholder="Search 28+ categories..."
                                className="w-full bg-slate-900/90 border border-slate-800 hover:border-slate-700 focus:border-brand-emerald rounded-xl pl-8 pr-3 py-2 text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
                              />
                            </div>
                          </div>

                          {/* Sector Filter Pills */}
                          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 custom-scrollbar">
                            {CATEGORY_SECTORS.map((sector) => {
                              const SectorIcon = sector.icon;
                              const isActive = activeSector === sector.id;
                              return (
                                <button
                                  type="button"
                                  key={sector.id}
                                  onClick={() => setActiveSector(sector.id)}
                                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                                    isActive
                                      ? "bg-brand-emerald text-slate-950 border-brand-emerald font-black shadow-md shadow-emerald-500/20"
                                      : "bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                                  }`}
                                >
                                  <SectorIcon className="h-3.5 w-3.5" />
                                  <span>{sector.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Category Cards Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[340px] overflow-y-auto pr-2 custom-scrollbar p-0.5">
                          {filteredCategories.length > 0 ? (
                            filteredCategories.map((cat) => {
                              const Icon = cat.icon;
                              const isSelected = businessType === cat.id;
                              return (
                                <button
                                  type="button"
                                  key={cat.id}
                                  onClick={() => setBusinessType(cat.id)}
                                  className={`flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer relative group ${
                                    isSelected
                                      ? "bg-emerald-500/15 border-brand-emerald text-white shadow-lg ring-1 ring-brand-emerald"
                                      : "bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-900"
                                  }`}
                                >
                                  <div className={`p-2 rounded-xl shrink-0 transition-transform group-hover:scale-105 ${
                                    isSelected ? "bg-brand-emerald text-slate-950 font-bold" : "bg-slate-800 text-slate-400"
                                  }`}>
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs font-bold leading-tight truncate">{cat.label}</p>
                                      {isSelected && <Check className="h-3.5 w-3.5 text-brand-emerald shrink-0 ml-1" />}
                                    </div>
                                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-1">{cat.desc}</p>
                                  </div>
                                </button>
                              );
                            })
                          ) : (
                            <div className="col-span-full py-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
                              No categories found in this sector matching "{categorySearch}".
                            </div>
                          )}
                        </div>

                        {/* Operating Mode Selector */}
                        <div className="space-y-3 pt-4 border-t border-slate-900">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">Choose Operating Mode</h4>
                            <span className="text-[10px] font-semibold text-brand-emerald">B2C • B2B • Mixed</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            {[
                              { id: "Retail Store", label: "Retail (B2C)", desc: "Counter POS & Barcodes" },
                              { id: "Wholesale", label: "Wholesale (B2B)", desc: "Bulk Cartons & Credit Khata" },
                              { id: "Mixed Mode", label: "Mixed Store", desc: "B2C Retail & B2B Wholesale" }
                            ].map((modeOpt) => (
                              <button
                                type="button"
                                key={modeOpt.id}
                                onClick={() => setSellingMode(modeOpt.id)}
                                className={`py-3 px-3.5 text-left rounded-xl border transition-all cursor-pointer ${
                                  sellingMode === modeOpt.id
                                    ? "bg-brand-emerald/15 border-brand-emerald text-white shadow-sm ring-1 ring-brand-emerald"
                                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold">{modeOpt.label}</p>
                                  {sellingMode === modeOpt.id && <Check className="h-3.5 w-3.5 text-brand-emerald" />}
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5">{modeOpt.desc}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Step 1 Action Bar */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-800/80">
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span className="text-slate-500 font-medium">Selected Trade:</span>
                            <span className="font-bold text-white bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
                              <SelectedCategoryIcon className="h-3.5 w-3.5 text-brand-emerald" />
                              {selectedCategory.label} • {sellingMode}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setRegisterStep(2)}
                            className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] active:scale-[0.98] transition-all cursor-pointer group"
                          >
                            <span>Continue to Store Setup</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: DEDICATED STORE DETAILS & OWNER ACCOUNT FORM */}
                    {registerStep === 2 && (
                      <motion.div
                        key="step-details"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.25 }}
                        className="space-y-6"
                      >
                        {/* Selected Category Summary Banner */}
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-brand-emerald/20 border border-brand-emerald/40 text-brand-emerald flex items-center justify-center shrink-0">
                              <SelectedCategoryIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-black text-white">{selectedCategory.label}</p>
                                <span className="text-[10px] font-bold text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded-full border border-brand-emerald/20">
                                  {sellingMode}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">Dynamic attributes & tax rules automatically configured</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setRegisterStep(1)}
                            className="text-xs font-bold text-brand-emerald hover:underline cursor-pointer px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 hover:bg-emerald-500/20 transition-colors"
                          >
                            Change Category
                          </button>
                        </div>

                        <form onSubmit={merchRegisterForm.handleSubmit(onMerchantRegister)} className="space-y-5">
                          {/* Owner & Business Name */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Owner Name *
                              </label>
                              <div className="relative">
                                <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                                <input
                                  type="text"
                                  {...merchRegisterForm.register("ownerName")}
                                  placeholder="e.g. Rishi Verma"
                                  disabled={isLoading}
                                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-emerald rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                                />
                              </div>
                              {merchRegisterForm.formState.errors.ownerName && (
                                <p className="text-[10px] text-rose-500 font-medium mt-1">{String(merchRegisterForm.formState.errors.ownerName.message)}</p>
                              )}
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Business / Store Name *
                              </label>
                              <div className="relative">
                                <Store className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                                <input
                                  type="text"
                                  {...merchRegisterForm.register("businessName")}
                                  placeholder="e.g. Verma Retail & Spares"
                                  disabled={isLoading}
                                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-emerald rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                                />
                              </div>
                              {merchRegisterForm.formState.errors.businessName && (
                                <p className="text-[10px] text-rose-500 font-medium mt-1">{String(merchRegisterForm.formState.errors.businessName.message)}</p>
                              )}
                            </div>
                          </div>

                          {/* Phone & Email */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Store Phone (10 Digits) *
                              </label>
                              <div className="relative">
                                <Phone className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                                <input
                                  type="text"
                                  {...merchRegisterForm.register("phone")}
                                  placeholder="e.g. 9876543210"
                                  disabled={isLoading}
                                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-emerald rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                                />
                              </div>
                              {merchRegisterForm.formState.errors.phone && (
                                <p className="text-[10px] text-rose-500 font-medium mt-1">{String(merchRegisterForm.formState.errors.phone.message)}</p>
                              )}
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Store Email *
                              </label>
                              <div className="relative">
                                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                                <input
                                  type="email"
                                  {...merchRegisterForm.register("email")}
                                  placeholder="e.g. store@verma.com"
                                  disabled={isLoading}
                                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-emerald rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                                />
                              </div>
                              {merchRegisterForm.formState.errors.email && (
                                <p className="text-[10px] text-rose-500 font-medium mt-1">{String(merchRegisterForm.formState.errors.email.message)}</p>
                              )}
                            </div>
                          </div>

                          {/* Business Address */}
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Business Address *
                            </label>
                            <div className="relative">
                              <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                              <input
                                type="text"
                                {...merchRegisterForm.register("address")}
                                placeholder="e.g. Shop #4, Metro Market, Andheri East, Mumbai"
                                disabled={isLoading}
                                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-emerald rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                              />
                            </div>
                            {merchRegisterForm.formState.errors.address && (
                              <p className="text-[10px] text-rose-500 font-medium mt-1">{String(merchRegisterForm.formState.errors.address.message)}</p>
                            )}
                          </div>

                          {/* Password & Confirm Password */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Password (Min 6 Characters) *
                              </label>
                              <div className="relative">
                                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                                <input
                                  type={showPassword ? "text" : "password"}
                                  {...merchRegisterForm.register("password")}
                                  placeholder="••••••••"
                                  disabled={isLoading}
                                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-emerald rounded-xl pl-11 pr-11 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                                >
                                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                              {merchRegisterForm.formState.errors.password && (
                                <p className="text-[10px] text-rose-500 font-medium mt-1">{String(merchRegisterForm.formState.errors.password.message)}</p>
                              )}
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                Confirm Password *
                              </label>
                              <div className="relative">
                                <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                                <input
                                  type={showPassword ? "text" : "password"}
                                  {...merchRegisterForm.register("confirmPassword")}
                                  placeholder="••••••••"
                                  disabled={isLoading}
                                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-emerald rounded-xl pl-11 pr-11 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                                />
                              </div>
                              {merchRegisterForm.formState.errors.confirmPassword && (
                                <p className="text-[10px] text-rose-500 font-medium mt-1">{String(merchRegisterForm.formState.errors.confirmPassword.message)}</p>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons: Back and Submit */}
                          <div className="flex items-center gap-3 pt-3">
                            <button
                              type="button"
                              onClick={() => setRegisterStep(1)}
                              className="py-4 px-5 border border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                            >
                              <ArrowLeft className="h-4 w-4" />
                              <span>Back to Category</span>
                            </button>

                            <button
                              type="submit"
                              disabled={isLoading}
                              className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer group"
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <span>Register Business & Launch Store</span>
                                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}

                    <div className="text-center pt-3 border-t border-slate-900/80">
                      <button
                        onClick={() => {
                          setMode("LOGIN");
                          setErrorDetails(null);
                        }}
                        className="text-xs text-brand-emerald hover:underline font-bold cursor-pointer"
                      >
                        Already have a registered store? Sign In
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <footer className="text-center text-[10px] text-slate-600 font-bold max-w-7xl mx-auto w-full">
            © 2026 QuickBizs Hyperlocal Commerce Group. All rights reserved.
          </footer>
        </div>
      )}
    </div>
  );
};

// Loader Icon component
const Loader2 = ({ className }: { className?: string }) => (
  <svg className={`${className} animate-spin`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
export default Login;