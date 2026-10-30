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
  Scissors,
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  Receipt,
  Clock,
  CreditCard,
  Play,
  Pause,
  Scan,
  Share2,
  X,
  ChevronRight,
  Printer
} from "lucide-react";
import logo from "../assets/logo.jpg";
import customerImg from "../assets/groceries_customer.jpg";
import merchantImg from "../assets/merchant_laptop.jpg";
import { api } from "../config/api";
import { getUserFriendlyErrorMessage } from "../utils/errorMessage";

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

  // Auth Method (Password vs Email OTP)
  const [merchantAuthMethod, setMerchantAuthMethod] = useState<"PASSWORD" | "EMAIL_OTP">("PASSWORD");
  const [customerAuthMethod, setCustomerAuthMethod] = useState<"PASSWORD" | "EMAIL_OTP">("PASSWORD");

  // Email OTP State for Login
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);

  // Email Verification State for Registration
  const [regEmailVerified, setRegEmailVerified] = useState(false);
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpCode, setRegOtpCode] = useState("");
  const [isSendingRegOtp, setIsSendingRegOtp] = useState(false);
  const [isVerifyingRegOtp, setIsVerifyingRegOtp] = useState(false);
  const [regOtpCountdown, setRegOtpCountdown] = useState(0);
  const [regOtpSuccessMsg, setRegOtpSuccessMsg] = useState<string | null>(null);

  // Dynamic live clock for simulated POS terminal
  const [currentTime, setCurrentTime] = useState(() => 
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic Product Video & Motion Simulation State
  const [activeSimTab, setActiveSimTab] = useState(0);
  const [isSimPlaying, setIsSimPlaying] = useState(true);
  const [showVideoTourModal, setShowVideoTourModal] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Auto-advance simulation scenes every 5.5s
  useEffect(() => {
    if (!isSimPlaying) return;
    const interval = setInterval(() => {
      setActiveSimTab((prev) => (prev + 1) % 3);
    }, 5500);
    return () => clearInterval(interval);
  }, [isSimPlaying]);

  // OTP Resend Countdown Timers
  useEffect(() => {
    let timer: any = null;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpCountdown]);

  useEffect(() => {
    let timer: any = null;
    if (regOtpCountdown > 0) {
      timer = setInterval(() => {
        setRegOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [regOtpCountdown]);

  const resetOtpStates = () => {
    setOtpEmail("");
    setOtpCode("");
    setOtpSent(false);
    setOtpCountdown(0);
    setOtpSuccessMsg(null);
    setRegEmailVerified(false);
    setRegOtpSent(false);
    setRegOtpCode("");
    setRegOtpCountdown(0);
    setRegOtpSuccessMsg(null);
  };

  const handleSendOtp = async (targetEmail: string, roleType: "MERCHANT" | "CUSTOMER") => {
    const emailToUse = (targetEmail || "").trim();
    if (!emailToUse || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToUse)) {
      setErrorDetails("Please enter a valid email address.");
      return;
    }
    setIsSendingOtp(true);
    setErrorDetails(null);
    setOtpSuccessMsg(null);
    try {
      const res = await api.post("/auth/otp/send", {
        email: emailToUse,
        type: roleType,
      });
      if (res.data?.success) {
        setOtpSent(true);
        setOtpCountdown(60);
        setOtpSuccessMsg(res.data.message || `Verification code sent to ${emailToUse}`);
      } else {
        setErrorDetails(res.data?.message || "Failed to send verification code.");
      }
    } catch (err: any) {
      setErrorDetails(err.response?.data?.message || "Failed to send verification code. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (targetEmail: string, code: string, roleType: "MERCHANT" | "CUSTOMER") => {
    const emailToUse = (targetEmail || "").trim();
    const codeToUse = (code || "").trim();
    if (!emailToUse || !codeToUse || codeToUse.length < 6) {
      setErrorDetails("Please enter the complete 6-digit verification code.");
      return;
    }
    setIsVerifyingOtp(true);
    setErrorDetails(null);
    try {
      const res = await api.post("/auth/otp/verify", {
        email: emailToUse,
        otp: codeToUse,
        type: roleType,
      });
      if (res.data?.success && res.data?.data) {
        if (res.data.data.isExistingUser && res.data.data.accessToken) {
          onAuthSuccess(res.data.data);
        } else {
          setErrorDetails("No active account found for this email. Please register below.");
        }
      } else {
        setErrorDetails(res.data?.message || "Invalid verification code.");
      }
    } catch (err: any) {
      setErrorDetails(err.response?.data?.message || "Invalid or expired verification code.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSendRegOtp = async (targetEmail: string) => {
    const emailToUse = (targetEmail || "").trim();
    if (!emailToUse || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToUse)) {
      setErrorDetails("Please enter a valid store email address before requesting verification.");
      return;
    }
    setIsSendingRegOtp(true);
    setErrorDetails(null);
    setRegOtpSuccessMsg(null);
    try {
      const res = await api.post("/auth/otp/send", {
        email: emailToUse,
        type: "MERCHANT",
      });
      if (res.data?.success) {
        setRegOtpSent(true);
        setRegOtpCountdown(60);
        setRegOtpSuccessMsg(`Verification code sent to ${emailToUse}`);
      } else {
        setErrorDetails(res.data?.message || "Failed to send verification code.");
      }
    } catch (err: any) {
      setErrorDetails(err.response?.data?.message || "Failed to send verification code.");
    } finally {
      setIsSendingRegOtp(false);
    }
  };

  const handleVerifyRegOtp = async (targetEmail: string, code: string) => {
    const emailToUse = (targetEmail || "").trim();
    const codeToUse = (code || "").trim();
    if (!codeToUse || codeToUse.length < 6) {
      setErrorDetails("Please enter the 6-digit code.");
      return;
    }
    setIsVerifyingRegOtp(true);
    setErrorDetails(null);
    try {
      const res = await api.post("/auth/otp/verify", {
        email: emailToUse,
        otp: codeToUse,
        type: "MERCHANT",
      });
      if (res.data?.success) {
        setRegEmailVerified(true);
        setRegOtpSuccessMsg("Email verified successfully! ✓");
      } else {
        setErrorDetails(res.data?.message || "Invalid verification code.");
      }
    } catch (err: any) {
      setErrorDetails(err.response?.data?.message || "Invalid or expired verification code.");
    } finally {
      setIsVerifyingRegOtp(false);
    }
  };

  const resetForms = () => {
    custLoginForm.reset();
    custRegisterForm.reset();
    merchLoginForm.reset();
    merchRegisterForm.reset();
    setErrorDetails(null);
    setRegisterStep(1);
    setActiveSector("ALL");
    setCategorySearch("");
    resetOtpStates();
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
        setErrorDetails(getUserFriendlyErrorMessage(response.data?.message || "Registration failed."));
      }
    } catch (err: any) {
      setErrorDetails(getUserFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };
  void onCustomerRegister;

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
        setErrorDetails(getUserFriendlyErrorMessage(response.data?.message || "Login failed."));
      }
    } catch (err: any) {
      setErrorDetails(getUserFriendlyErrorMessage(err));
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
        setErrorDetails(getUserFriendlyErrorMessage(response.data?.message || "Store registration failed."));
      }
    } catch (err: any) {
      setErrorDetails(getUserFriendlyErrorMessage(err));
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
                  Business Management Software
                </span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900/60 border border-slate-800/80 rounded-full text-[10px] text-slate-300 font-bold shadow-sm backdrop-blur-sm"
            >
              <span className="text-brand-orange">★</span> Trusted by 5000+ businesses
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
                Powering <span className="text-brand-orange">Every</span> Business. Big or <span className="text-brand-orange">Small</span>.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-semibold max-w-md mx-auto leading-relaxed">
                Complete all-in-one software for POS billing, real-time inventory, GST invoicing, and customer ledger khata.
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
              © 2026 QuickBizs Technologies. Smart Business Management Software.
            </div>
          </footer>
        </div>
      ) : mode === "LOGIN" ? (
        // =========================================================================
        // LUXURY EDGE-TO-EDGE SPLIT SCREEN FOR LOGIN (ZERO VOIDS, 100% VIEWPORT)
        // =========================================================================
        <div className="w-full min-h-screen flex flex-col lg:flex-row relative z-10 overflow-x-hidden">
          
          {/* LEFT PANE (58%): ENTERPRISE PRODUCT SHOWCASE & REALTIME POS SIMULATION */}
          <div className="w-full lg:w-[56%] xl:w-[58%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-slate-950/70 backdrop-blur-xl relative overflow-hidden">
            {/* Ambient Multi-Hue Lighting Mesh */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 -right-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Fine Precision Grid Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

            {/* Top Brand Header & Live Engine Status */}
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img src={logo} alt="QuickBizs Logo" className="h-10 w-10 rounded-2xl object-cover shadow-xl ring-1 ring-white/10" />
                <div>
                  <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    Quick<span className="text-brand-orange">Bizs</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30 uppercase tracking-wider">
                      OS 2.4
                    </span>
                  </h1>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Business Management Software
                  </span>
                </div>
              </div>

              {/* Dynamic Live Status Indicator */}
              <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] font-semibold text-slate-300 shadow-md backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>Ledger Engine Active</span>
                <span className="text-slate-500 font-mono text-[10px] pl-1 border-l border-slate-800">99.98% Uptime</span>
              </div>
            </div>

            {/* Center Area: Hero Showcase & Simulated Terminal */}
            <div className="relative z-10 my-auto py-6 sm:py-8 space-y-6 max-w-2xl">
              {role === "CUSTOMER" ? (
                // CUSTOMER SHOWCASE
                <div className="space-y-6">
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/30 text-brand-orange text-xs font-bold tracking-wide">
                      <Sparkles className="h-3.5 w-3.5" />
                      QuickBizs Shopper Portal
                    </span>
                    <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
                      Shop Faster from Your <span className="text-brand-orange">Trusted</span> Local Stores.
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                      No more waiting in billing lines. Pre-order groceries, auto-track digital receipts, earn loyalty reward cashback and maintain a transparent digital Khata ledger with verified neighborhood shops.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-2">
                      <div className="h-9 w-9 rounded-xl bg-brand-orange/15 text-brand-orange flex items-center justify-center">
                        <Zap className="h-4.5 w-4.5" />
                      </div>
                      <h4 className="text-xs font-bold text-white">Express Counter Pickup</h4>
                      <p className="text-[11px] text-slate-400 leading-snug">Order ahead from your phone; your packed bag is ready at counter.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-2">
                      <div className="h-9 w-9 rounded-xl bg-brand-emerald/15 text-brand-emerald flex items-center justify-center">
                        <CheckCircle2 className="h-4.5 w-4.5" />
                      </div>
                      <h4 className="text-xs font-bold text-white">Digital Paperless Bills</h4>
                      <p className="text-[11px] text-slate-400 leading-snug">All your purchase receipts safely archived in your pocket app.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-2">
                      <div className="h-9 w-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                        <Star className="h-4.5 w-4.5" />
                      </div>
                      <h4 className="text-xs font-bold text-white">Loyalty & Cashback</h4>
                      <p className="text-[11px] text-slate-400 leading-snug">Earn reward points on every transaction and redeem on next visit.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 space-y-2">
                      <div className="h-9 w-9 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center">
                        <BookOpen className="h-4.5 w-4.5" />
                      </div>
                      <h4 className="text-xs font-bold text-white">Transparent Khata</h4>
                      <p className="text-[11px] text-slate-400 leading-snug">Live balance ledger, zero disputes, and easy UPI payment settlement.</p>
                    </div>
                  </div>
                </div>
              ) : (
                // ENTERPRISE MERCHANT SHOWCASE
                <>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/30 text-brand-orange text-xs font-bold tracking-wide">
                        <Sparkles className="h-3.5 w-3.5" />
                        Complete Business Management Platform
                      </div>

                      {/* Interactive Video Tour Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowVideoTourModal(true);
                          setTourStep(0);
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-emerald/15 hover:bg-brand-emerald/25 border border-brand-emerald/30 text-brand-emerald text-xs font-bold transition-all shadow-sm cursor-pointer group hover:scale-102"
                      >
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <Play className="h-3 w-3 fill-current group-hover:translate-x-0.5 transition-transform" />
                        <span>Watch 60s App Tour</span>
                      </button>
                    </div>

                    <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
                      Manage Every Aspect of Your{" "}
                      <span className="bg-gradient-to-r from-brand-orange via-amber-400 to-brand-emerald bg-clip-text text-transparent">
                        Business.
                      </span>{" "}
                      Big or Small.
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                      Chhote kirana dukaan se lekar multi-outlet supermarket & wholesale networks tak — express barcode billing, real-time inventory, GST invoices aur customer khata ek hi powerful platform par.
                    </p>
                  </div>

                  {/* ========================================================================= */}
                  {/* INTERACTIVE VIDEO & MOTION SIMULATOR (BASED ON REAL APPLICATION WORKFLOW) */}
                  {/* ========================================================================= */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-4 relative overflow-hidden group">
                    {/* Background Visual Texture with Merchant Context */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none mix-blend-overlay"
                      style={{ backgroundImage: `url(${merchantImg})` }}
                    />

                    {/* Simulator Video Header Bar */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 relative z-10">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                        </div>
                        <span className="text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider ml-1">
                          COUNTER #01 • LIVE APP SIMULATOR
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Play / Pause Toggle Button */}
                        <button
                          type="button"
                          onClick={() => setIsSimPlaying(!isSimPlaying)}
                          title={isSimPlaying ? "Pause Video Motion" : "Resume Video Motion"}
                          className="flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                        >
                          {isSimPlaying ? (
                            <>
                              <Pause className="h-3 w-3 text-amber-400" />
                              <span className="hidden sm:inline">PAUSE</span>
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3 text-emerald-400 fill-current" />
                              <span className="hidden sm:inline">RESUME</span>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/50">
                          <Clock className="h-3 w-3" />
                          <span>{currentTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Video Story Tabs with Active Progress Bar */}
                    <div className="grid grid-cols-3 gap-2 relative z-10">
                      {[
                        { id: 0, label: "0.3s Express POS", icon: Zap, color: "text-brand-orange" },
                        { id: 1, label: "Stock & FEFO Expiry", icon: Package, color: "text-brand-emerald" },
                        { id: 2, label: "Customer Khata & UPI", icon: BookOpen, color: "text-sky-400" },
                      ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeSimTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => {
                              setActiveSimTab(tab.id);
                              setIsSimPlaying(false);
                            }}
                            className={`relative p-2 rounded-xl text-left border transition-all cursor-pointer overflow-hidden ${
                              isActive 
                                ? "bg-slate-800/90 border-slate-700 shadow-md" 
                                : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700/80 text-slate-400"
                            }`}
                          >
                            {/* Animated Auto-Advance Progress Bar for Active Tab */}
                            {isActive && isSimPlaying && (
                              <motion.div
                                key={activeSimTab}
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 5.5, ease: "linear" }}
                                className="absolute top-0 left-0 bottom-0 bg-brand-orange/15 pointer-events-none"
                              />
                            )}
                            <div className="flex items-center gap-1.5 relative z-10">
                              <Icon className={`h-3.5 w-3.5 ${tab.color} shrink-0`} />
                              <span className={`text-[11px] font-bold truncate ${isActive ? "text-white" : "text-slate-400"}`}>
                                {tab.label}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Simulated Screen Stage (Interactive Dynamic Motion Scenes) */}
                    <div className="relative min-h-[175px] rounded-2xl bg-slate-950/90 border border-slate-800 p-4 overflow-hidden z-10">
                      <AnimatePresence mode="wait">
                        {/* SCENE 0: EXPRESS BARCODE SCANNING & INSTANT THERMAL BILLING */}
                        {activeSimTab === 0 && (
                          <motion.div
                            key="scene-pos"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.35 }}
                            className="space-y-3"
                          >
                            {/* Animated Red Laser Scanning Beam */}
                            <motion.div
                              animate={{ y: [0, 95, 0] }}
                              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                              className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_#f43f5e] pointer-events-none opacity-80"
                            />

                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800/80 pb-1.5">
                              <span className="flex items-center gap-1 text-brand-orange font-bold">
                                <Scan className="h-3 w-3" /> BARCODE SCANNER ACTIVE
                              </span>
                              <span className="text-slate-500">USB AUTO-FEED</span>
                            </div>

                            {/* Scanned Items Stream */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                                <div className="flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                  <span className="font-semibold text-slate-200">Fortune Sunlite Oil 1L</span>
                                  <span className="text-[10px] font-mono text-slate-500">[Batch: #FO-24]</span>
                                </div>
                                <span className="font-bold font-mono text-white">₹165.00</span>
                              </div>

                              <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                                <div className="flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                  <span className="font-semibold text-slate-200">Tata Salt Vacuum Evaporated 1kg</span>
                                  <span className="text-[10px] font-mono text-slate-500">[Batch: #TS-91]</span>
                                </div>
                                <span className="font-bold font-mono text-white">₹28.00</span>
                              </div>

                              <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/60">
                                <div className="flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                  <span className="font-semibold text-slate-200">Amul Butter 500g</span>
                                  <span className="text-[10px] font-mono text-slate-500">[Cold Rack]</span>
                                </div>
                                <span className="font-bold font-mono text-white">₹275.00</span>
                              </div>
                            </div>

                            {/* Animated Bill Total & Instant Print Slip */}
                            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-800/40">
                                <Printer className="h-3 w-3" />
                                <span>Thermal Slip Cut in 0.28s</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 uppercase mr-1.5">Total:</span>
                                <span className="text-sm font-black text-white font-mono">₹468.00</span>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* SCENE 1: SMART STOCK & FEFO EXPIRY AUTOMATION */}
                        {activeSimTab === 1 && (
                          <motion.div
                            key="scene-stock"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.35 }}
                            className="space-y-3"
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800/80 pb-1.5">
                              <span className="flex items-center gap-1 text-brand-emerald font-bold">
                                <Package className="h-3 w-3" /> FEFO BATCH & EXPIRY TELEMETRY
                              </span>
                              <span className="text-emerald-400 font-semibold">99.4% HEALTHY</span>
                            </div>

                            <div className="space-y-2">
                              <div className="p-2 rounded-xl bg-slate-900/60 border border-amber-500/30 space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-white">Basmati Rice Premium 25kg</span>
                                  <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-800/40">
                                    Expires in 18 Days
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400">
                                  Batch #BR-2024 • Smart Auto-discount (10% off) applied for priority clearance.
                                </p>
                              </div>

                              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-white">Maggi 2-Min Noodles (70g)</span>
                                  <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-800/40">
                                    Low Stock (4 pcs left)
                                  </span>
                                </div>
                                <div className="flex items-center justify-between pt-0.5 text-[10px]">
                                  <span className="text-slate-400">Threshold: 20 pcs</span>
                                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                    <Check className="h-3 w-3" /> PO Auto-Sent to Distributor
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* SCENE 2: CUSTOMER KHATA & WHATSAPP UPI SETTLEMENT */}
                        {activeSimTab === 2 && (
                          <motion.div
                            key="scene-khata"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.35 }}
                            className="space-y-3"
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800/80 pb-1.5">
                              <span className="flex items-center gap-1 text-sky-400 font-bold">
                                <BookOpen className="h-3 w-3" /> DIGITAL KHATA & UPI LEDGER
                              </span>
                              <span className="text-slate-500">AUTO-WHATSAPP</span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <div>
                                  <h6 className="font-bold text-white">Ramesh Kumar (Regular Store Shopper)</h6>
                                  <p className="text-[10px] text-slate-400">Account #KH-8802 • Khata Ledger</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400 uppercase block">Udhar Balance</span>
                                  <span className="text-sm font-black font-mono text-rose-400">₹3,450.00</span>
                                </div>
                              </div>

                              <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between text-[11px] text-emerald-300">
                                <div className="flex items-center gap-2">
                                  <Share2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                  <span>WhatsApp Payment QR Dispatched</span>
                                </div>
                                <span className="font-mono text-[10px] bg-emerald-900/40 px-2 py-0.5 rounded text-emerald-200">
                                  DELIVERED
                                </span>
                              </div>

                              <div className="p-2 rounded-lg bg-sky-950/30 border border-sky-800/40 flex items-center justify-between text-[11px] text-sky-300">
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                                  <span>Payment Received via PhonePe / UPI</span>
                                </div>
                                <span className="font-black font-mono text-emerald-400">₹0 BAL</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 4 Live Store Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 relative z-10">
                      <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-0.5">
                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase">
                          <span>Today's Sales</span>
                          <TrendingUp className="h-3 w-3 text-emerald-400" />
                        </div>
                        <p className="text-base font-black text-white tracking-tight">₹48,250</p>
                        <p className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                          <span>+18.4%</span> today
                        </p>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-0.5">
                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase">
                          <span>Invoices Cut</span>
                          <Receipt className="h-3 w-3 text-brand-orange" />
                        </div>
                        <p className="text-base font-black text-white tracking-tight">184</p>
                        <p className="text-[9px] text-slate-400 font-medium">Avg ₹262/bill</p>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-0.5">
                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase">
                          <span>Khata In</span>
                          <CreditCard className="h-3 w-3 text-sky-400" />
                        </div>
                        <p className="text-base font-black text-white tracking-tight">₹12,400</p>
                        <p className="text-[9px] text-sky-400 font-semibold">98.2% on-time</p>
                      </div>

                      <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-0.5">
                        <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase">
                          <span>Stock Health</span>
                          <Package className="h-3 w-3 text-purple-400" />
                        </div>
                        <p className="text-base font-black text-white tracking-tight">99.4%</p>
                        <p className="text-[9px] text-purple-300 font-semibold">0 stockout alerts</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Trust & Verification Row */}
            <div className="relative z-10 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-400 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <span className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-950 bg-brand-orange text-[9px] font-bold text-white flex items-center justify-center">R</span>
                  <span className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-950 bg-emerald-600 text-[9px] font-bold text-white flex items-center justify-center">S</span>
                  <span className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-950 bg-sky-600 text-[9px] font-bold text-white flex items-center justify-center">M</span>
                </div>
                <div>
                  <span className="font-bold text-white">10,000+ Stores</span>
                  <span className="text-slate-500 text-[11px] ml-1.5">• 4.9 ★★★★★ Rating</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> ISO 27001
                </span>
                <span>•</span>
                <span>256-bit SSL</span>
                <span>•</span>
                <span>GST Ready</span>
              </div>
            </div>
          </div>

          {/* RIGHT PANE (42%): FOCUSED LUXURY AUTH SUITE */}
          <div className="w-full lg:w-[44%] xl:w-[42%] min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 bg-slate-950/95 backdrop-blur-2xl relative">
            {/* Top Role Header */}
            <div className="flex items-center justify-end">
              <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                {role === "CUSTOMER" ? "Customer Portal" : "Merchant Store Portal"}
              </span>
            </div>

            {/* Center Authentication Card */}
            <div className="my-auto py-8 sm:py-10 max-w-md w-full mx-auto space-y-6">
              <div className="space-y-1.5">
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {role === "CUSTOMER" ? "Welcome Shopper 👋" : "Welcome Back 👋"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">
                  {role === "CUSTOMER" 
                    ? "Sign in to track orders, digital bills and earn cashback."
                    : "Sign in to access your billing counter, stock and khata ledger."
                  }
                </p>
              </div>

              {/* Segmented Control Switcher (Password vs Email OTP) */}
              <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (role === "CUSTOMER") setCustomerAuthMethod("PASSWORD");
                    else setMerchantAuthMethod("PASSWORD");
                    setErrorDetails(null);
                    setOtpSuccessMsg(null);
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    (role === "CUSTOMER" ? customerAuthMethod : merchantAuthMethod) === "PASSWORD"
                      ? "bg-slate-800 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (role === "CUSTOMER") setCustomerAuthMethod("EMAIL_OTP");
                    else setMerchantAuthMethod("EMAIL_OTP");
                    setErrorDetails(null);
                    setOtpSuccessMsg(null);
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    (role === "CUSTOMER" ? customerAuthMethod : merchantAuthMethod) === "EMAIL_OTP"
                      ? (role === "CUSTOMER" 
                          ? "bg-brand-orange/20 text-brand-orange border border-brand-orange/40 shadow-sm"
                          : "bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/40 shadow-sm")
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Email OTP</span>
                </button>
              </div>

              {/* Error Alert */}
              {errorDetails && (
                <div className="bg-rose-950/40 border border-rose-800/80 p-3.5 rounded-2xl flex gap-2.5 text-xs text-rose-200 leading-relaxed shadow-sm">
                  <AlertCircle className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorDetails}</span>
                </div>
              )}

              {/* OTP Success Alert */}
              {otpSuccessMsg && (
                <div className="bg-emerald-950/40 border border-emerald-800/80 p-3.5 rounded-2xl flex gap-2.5 text-xs text-emerald-200 leading-relaxed shadow-sm">
                  <CheckCircle2 className="h-4.5 w-4.5 text-brand-emerald shrink-0 mt-0.5" />
                  <span>{otpSuccessMsg}</span>
                </div>
              )}

              {/* Customer Forms */}
              {role === "CUSTOMER" && (
                <>
                  {customerAuthMethod === "PASSWORD" ? (
                    <form onSubmit={custLoginForm.handleSubmit(onCustomerLogin)} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Email or Mobile Number
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            {...custLoginForm.register("identifier")}
                            placeholder="e.g. 9876543210 or rishi@example.com"
                            disabled={isLoading}
                            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-orange rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                          />
                        </div>
                        {custLoginForm.formState.errors.identifier && (
                          <p className="text-[10px] text-rose-500 font-medium mt-1">
                            {String(custLoginForm.formState.errors.identifier.message)}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Password
                        </label>
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
                          <p className="text-[10px] text-rose-500 font-medium mt-1">
                            {String(custLoginForm.formState.errors.password.message)}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Sign In to Checkout</span>}
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      {!otpSent ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSendOtp(otpEmail, "CUSTOMER");
                          }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Registered Email Address
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                              <input
                                type="email"
                                value={otpEmail}
                                onChange={(e) => setOtpEmail(e.target.value)}
                                placeholder="e.g. shopper@example.com"
                                disabled={isSendingOtp}
                                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-orange rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={isSendingOtp || !otpEmail.trim()}
                            className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {isSendingOtp ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Mail className="h-4 w-4" />
                                <span>Send OTP to Email</span>
                              </>
                            )}
                          </button>
                        </form>
                      ) : (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleVerifyOtp(otpEmail, otpCode, "CUSTOMER");
                          }}
                          className="space-y-4"
                        >
                          <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Mail className="h-3.5 w-3.5 text-brand-orange shrink-0" />
                              <span className="truncate max-w-[190px] font-medium text-slate-200">{otpEmail}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setOtpSent(false);
                                setOtpCode("");
                                setOtpSuccessMsg(null);
                              }}
                              className="text-[10px] text-brand-orange hover:underline font-bold shrink-0 cursor-pointer"
                            >
                              Change
                            </button>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Enter 6-Digit Code
                            </label>
                            <div className="relative">
                              <ShieldCheck className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                              <input
                                type="text"
                                maxLength={6}
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                                placeholder="------"
                                autoFocus
                                disabled={isVerifyingOtp}
                                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-orange rounded-xl pl-11 pr-4 py-3 text-center tracking-[0.4em] font-mono text-base font-bold text-white placeholder-slate-600 focus:outline-none transition-colors"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={isVerifyingOtp || otpCode.length !== 6}
                            className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-lg active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {isVerifyingOtp ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Verify & Sign In
                              </span>
                            )}
                          </button>

                          <div className="text-center pt-1">
                            {otpCountdown > 0 ? (
                              <span className="text-[11px] text-slate-500 font-medium">
                                Resend code in <strong className="text-slate-300">{otpCountdown}s</strong>
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={isSendingOtp}
                                onClick={() => handleSendOtp(otpEmail, "CUSTOMER")}
                                className="text-xs text-brand-orange hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
                              >
                                <RefreshCw className="h-3 w-3" /> Resend Verification Code
                              </button>
                            )}
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Merchant Forms */}
              {role === "MERCHANT" && (
                <>
                  {merchantAuthMethod === "PASSWORD" ? (
                    <form onSubmit={merchLoginForm.handleSubmit(onMerchantLogin)} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Store Email, Mobile or Admin ID
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            {...merchLoginForm.register("identifier")}
                            placeholder="e.g. admin@quickbizs.com"
                            disabled={isLoading}
                            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-emerald rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors shadow-inner"
                          />
                        </div>
                        {merchLoginForm.formState.errors.identifier && (
                          <p className="text-[10px] text-rose-500 font-medium mt-1">
                            {String(merchLoginForm.formState.errors.identifier.message)}
                          </p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Password
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setMerchantAuthMethod("EMAIL_OTP");
                              setErrorDetails(null);
                            }}
                            className="text-[10px] text-brand-emerald hover:underline font-bold cursor-pointer"
                          >
                            Forgot? Use Email OTP
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                          <input
                            type={showPassword ? "text" : "password"}
                            {...merchLoginForm.register("password")}
                            placeholder="••••••••"
                            disabled={isLoading}
                            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-emerald rounded-xl pl-11 pr-11 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors shadow-inner"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {merchLoginForm.formState.errors.password && (
                          <p className="text-[10px] text-rose-500 font-medium mt-1">
                            {String(merchLoginForm.formState.errors.password.message)}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-gradient-to-r from-brand-emerald to-emerald-600 hover:from-emerald-500 hover:to-brand-emerald text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <span>Sign In to Store</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      {!otpSent ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSendOtp(otpEmail, "MERCHANT");
                          }}
                          className="space-y-4"
                        >
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Registered Store Email Address
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                              <input
                                type="email"
                                value={otpEmail}
                                onChange={(e) => setOtpEmail(e.target.value)}
                                placeholder="e.g. merchant@quickbizs.com"
                                disabled={isSendingOtp}
                                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-emerald rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors shadow-inner"
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">
                              We will send a secure 6-digit verification code to this inbox.
                            </p>
                          </div>

                          <button
                            type="submit"
                            disabled={isSendingOtp || !otpEmail.trim()}
                            className="w-full py-3.5 bg-brand-emerald hover:bg-emerald-600 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {isSendingOtp ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Mail className="h-4 w-4" />
                                <span>Send Verification Code</span>
                              </>
                            )}
                          </button>
                        </form>
                      ) : (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleVerifyOtp(otpEmail, otpCode, "MERCHANT");
                          }}
                          className="space-y-4"
                        >
                          <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Mail className="h-3.5 w-3.5 text-brand-emerald shrink-0" />
                              <span className="truncate max-w-[190px] font-medium text-slate-200">{otpEmail}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setOtpSent(false);
                                setOtpCode("");
                                setOtpSuccessMsg(null);
                              }}
                              className="text-[10px] text-brand-emerald hover:underline font-bold shrink-0 cursor-pointer"
                            >
                              Change
                            </button>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                              Enter 6-Digit Code
                            </label>
                            <div className="relative">
                              <ShieldCheck className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                              <input
                                type="text"
                                maxLength={6}
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                                placeholder="------"
                                autoFocus
                                disabled={isVerifyingOtp}
                                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-emerald rounded-xl pl-11 pr-4 py-3 text-center tracking-[0.4em] font-mono text-base font-bold text-white placeholder-slate-600 focus:outline-none transition-colors"
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 text-center mt-1.5">
                              Tip: Check your <strong>Spam / Junk</strong> folder if not in Inbox.
                            </p>
                          </div>

                          <button
                            type="submit"
                            disabled={isVerifyingOtp || otpCode.length !== 6}
                            className="w-full py-3.5 bg-brand-emerald hover:bg-emerald-600 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-lg active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                          >
                            {isVerifyingOtp ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Verify & Sign In
                              </span>
                            )}
                          </button>

                          <div className="text-center pt-1">
                            {otpCountdown > 0 ? (
                              <span className="text-[11px] text-slate-500 font-medium">
                                Resend code in <strong className="text-slate-300">{otpCountdown}s</strong>
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={isSendingOtp}
                                onClick={() => handleSendOtp(otpEmail, "MERCHANT")}
                                className="text-xs text-brand-emerald hover:underline font-bold cursor-pointer inline-flex items-center gap-1"
                              >
                                <RefreshCw className="h-3 w-3" /> Resend Verification Code
                              </button>
                            )}
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Link to Registration Wizard */}
              <div className="text-center pt-2 border-t border-slate-800/80">
                {role === "MERCHANT" ? (
                  <button
                    onClick={() => {
                      setMode("REGISTER");
                      setErrorDetails(null);
                    }}
                    className="text-xs text-brand-emerald hover:underline font-bold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span className="text-slate-400">Don't have a registered store?</span>
                    <span className="text-brand-emerald underline">Setup Wizard →</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setCustomerAuthMethod("PASSWORD");
                      setErrorDetails(null);
                    }}
                    className="text-xs text-brand-orange hover:underline font-bold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span className="text-slate-400">Need help signing in?</span>
                    <span className="text-brand-orange underline">Contact Support →</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bottom Security & Privacy Footnote */}
            <div className="text-center space-y-1 text-[11px] text-slate-500 font-medium">
              <p className="flex items-center justify-center gap-1.5 text-slate-400">
                <Lock className="h-3 w-3 text-emerald-400" />
                <span>End-to-End Encrypted Session • Multi-Tenant Isolated</span>
              </p>
              <p className="text-[10px] text-slate-600">
                © 2026 QuickBizs Technologies Inc. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      ) : (
        // =========================================================================
        // MULTI-STEP STORE SETUP WIZARD (REGISTER MODE - SPACIOUS 2-COLUMN LAYOUT)
        // =========================================================================
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 z-10 min-h-screen">
          <header className="flex items-center justify-between w-full max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
              <img src={logo} alt="QuickBizs Logo" className="h-9 w-9 rounded-xl object-cover shadow-lg" />
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  Quick<span className="text-brand-orange">Bizs</span>
                </h1>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  Business Management Software
                </span>
              </div>
            </div>
            <button 
              onClick={() => {
                setMode("LOGIN");
                setErrorDetails(null);
              }}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Sign In</span>
            </button>
          </header>

          <main className="w-full max-w-7xl mx-auto my-auto py-6 sm:py-8 transition-all duration-500">
            <AnimatePresence mode="wait">
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
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Store Email *
                                </label>
                                {regEmailVerified && (
                                  <span className="text-[10px] font-bold text-brand-emerald flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> Verified
                                  </span>
                                )}
                              </div>
                              <div className="relative">
                                <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                                <input
                                  type="email"
                                  {...merchRegisterForm.register("email")}
                                  placeholder="e.g. store@verma.com"
                                  disabled={isLoading}
                                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-emerald rounded-xl pl-11 pr-24 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                                />
                                {!regEmailVerified && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const emailVal = merchRegisterForm.getValues("email");
                                      handleSendRegOtp(emailVal);
                                    }}
                                    disabled={isSendingRegOtp}
                                    className="absolute right-2 top-2 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-brand-emerald rounded-lg text-[10px] font-bold transition-colors cursor-pointer border border-brand-emerald/30"
                                  >
                                    {isSendingRegOtp ? "Sending..." : regOtpSent ? "Resend OTP" : "Verify Email"}
                                  </button>
                                )}
                              </div>
                              {merchRegisterForm.formState.errors.email && (
                                <p className="text-[10px] text-rose-500 font-medium mt-1">{String(merchRegisterForm.formState.errors.email.message)}</p>
                              )}

                              {regOtpSuccessMsg && (
                                <p className="text-[10px] text-emerald-400 font-medium mt-1">{regOtpSuccessMsg}</p>
                              )}

                              {regOtpSent && !regEmailVerified && (
                                <div className="mt-2.5 p-3 rounded-xl bg-slate-900/90 border border-brand-emerald/30 space-y-2">
                                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                                    <span>Enter 6-digit code sent to your email:</span>
                                    {regOtpCountdown > 0 && <span className="text-slate-500">{regOtpCountdown}s</span>}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      maxLength={6}
                                      value={regOtpCode}
                                      onChange={(e) => setRegOtpCode(e.target.value.replace(/\D/g, ""))}
                                      placeholder="123456"
                                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-center font-mono text-sm tracking-widest text-white focus:outline-none focus:border-brand-emerald"
                                    />
                                    <button
                                      type="button"
                                      disabled={isVerifyingRegOtp || regOtpCode.length !== 6}
                                      onClick={() => {
                                        const emailVal = merchRegisterForm.getValues("email");
                                        handleVerifyRegOtp(emailVal, regOtpCode);
                                      }}
                                      className="px-3 py-1.5 bg-brand-emerald hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                      {isVerifyingRegOtp ? "Verifying..." : "Confirm"}
                                    </button>
                                  </div>
                                </div>
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
            © 2026 QuickBizs Technologies. Smart Business Management Software. All rights reserved.
          </footer>
        </div>
      )}

      {/* 60-SECOND INTERACTIVE APPLICATION TOUR MODAL */}
      <AnimatePresence>
        {showVideoTourModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/30">
                    <Play className="h-4 w-4 fill-current" />
                  </span>
                  <div>
                    <h3 className="text-base font-black text-white">QuickBizs Software Interactive Tour</h3>
                    <p className="text-[11px] text-slate-400">Step {tourStep + 1} of 4 • Complete Business Management OS</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVideoTourModal(false)}
                  className="p-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Tour Steps Content */}
              <div className="min-h-[200px]">
                {tourStep === 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-orange">
                      <Zap className="h-4 w-4" />
                      <span>01. LIGHTNING 0.3s EXPRESS POS BILLING</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Barcode scanning, USB electronic weighing scale sync, loose item lookup, and instant thermal receipt printing. Keep long counter lines moving at lightning speed.
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Speed Benchmark</span>
                        <span className="text-lg font-black text-white">0.3 Seconds</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Thermal Compatibility</span>
                        <span className="text-lg font-black text-emerald-400">2" & 3" ESC/POS</span>
                      </div>
                    </div>
                  </div>
                )}

                {tourStep === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-brand-emerald">
                      <Package className="h-4 w-4" />
                      <span>02. REAL-TIME INVENTORY & FEFO EXPIRY ENGINE</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Batch number tracking, automated First-Expiry-First-Out (FEFO) clearance pricing, low-stock threshold alerts, and automated purchase orders to distributors.
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Spoilage Reduction</span>
                        <span className="text-lg font-black text-brand-emerald">99.8% Saved</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Stockout Prevention</span>
                        <span className="text-lg font-black text-white">Auto 1-Click PO</span>
                      </div>
                    </div>
                  </div>
                )}

                {tourStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                      <BookOpen className="h-4 w-4" />
                      <span>03. CUSTOMER KHATA & AUTOMATED WHATSAPP UPI</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Maintain zero-dispute digital credit ledgers for neighborhood shoppers. Send automated payment reminders on WhatsApp with dynamic UPI QR codes for instant bank settlement.
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment Recovery</span>
                        <span className="text-lg font-black text-sky-400">3X Faster Recovery</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Dispute Ratio</span>
                        <span className="text-lg font-black text-white">0% (Verified Audit)</span>
                      </div>
                    </div>
                  </div>
                )}

                {tourStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                      <ShieldCheck className="h-4 w-4" />
                      <span>04. 100% OFFLINE-READY RESILIENT PWA</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Internet bandh ho jaye ya router crash kare — counter par billing kabhi rukti nahi. Local IndexedDB storage par fast checkout chalti rehti hai aur internet wapas aane par automatic sync ho jata hai.
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Offline Uptime</span>
                        <span className="text-lg font-black text-purple-400">100% Non-Stop</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Sync Conflict</span>
                        <span className="text-lg font-black text-white">Auto-Resolved</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Controls */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map((step) => (
                    <button
                      key={step}
                      type="button"
                      onClick={() => setTourStep(step)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        tourStep === step ? "w-6 bg-brand-emerald" : "w-2 bg-slate-800 hover:bg-slate-700"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {tourStep > 0 && (
                    <button
                      type="button"
                      onClick={() => setTourStep((prev) => prev - 1)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 cursor-pointer"
                    >
                      Previous
                    </button>
                  )}
                  {tourStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => setTourStep((prev) => prev + 1)}
                      className="px-4 py-1.5 rounded-xl bg-brand-emerald hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1 cursor-pointer shadow-lg"
                    >
                      <span>Next Feature</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowVideoTourModal(false)}
                      className="px-4 py-1.5 rounded-xl bg-brand-emerald hover:bg-emerald-600 text-white text-xs font-black cursor-pointer shadow-lg"
                    >
                      Get Started →
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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