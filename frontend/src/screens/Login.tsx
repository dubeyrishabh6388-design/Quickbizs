import React, { useState } from "react";
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
  Sparkles
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

interface LoginProps {
  onAuthSuccess: (userData: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onAuthSuccess }) => {
  const [role, setRole] = useState<"CUSTOMER" | "MERCHANT" | null>(null);
  const [mode, setMode] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
  };

  const handleRoleSelect = (selectedRole: "CUSTOMER" | "MERCHANT") => {
    setRole(selectedRole);
    setMode("LOGIN");
    resetForms();
  };

  const handleBackToRole = () => {
    setRole(null);
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
      confirmPassword: data.confirmPassword
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl w-full mx-auto items-stretch">
              
              {/* Customer App Card */}
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

          <main className="w-full max-w-md mx-auto my-auto py-8">
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

              {role === "MERCHANT" && (
                <motion.div
                  key="merchant-auth"
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
                        {mode === "LOGIN" ? "Merchant Login" : "Register Business Store"}
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
                    <form onSubmit={merchLoginForm.handleSubmit(onMerchantLogin)} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Store Email or Phone
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            {...merchLoginForm.register("identifier")}
                            placeholder="e.g. owner@quickbizs.com"
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
                            className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300"
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
                  ) : (
                    <form onSubmit={merchRegisterForm.handleSubmit(onMerchantRegister)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Owner Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                            <input
                              type="text"
                              {...merchRegisterForm.register("ownerName")}
                              placeholder="e.g. Rishi"
                              disabled={isLoading}
                              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-emerald rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                            />
                          </div>
                          {merchRegisterForm.formState.errors.ownerName && (
                            <p className="text-[10px] text-rose-500 font-medium mt-1">{String(merchRegisterForm.formState.errors.ownerName.message)}</p>
                          )}
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Business Name
                          </label>
                          <input
                            type="text"
                            {...merchRegisterForm.register("businessName")}
                            placeholder="e.g. Verma Grocery"
                            disabled={isLoading}
                            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-emerald rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                          />
                          {merchRegisterForm.formState.errors.businessName && (
                            <p className="text-[10px] text-rose-500 font-medium mt-1">{String(merchRegisterForm.formState.errors.businessName.message)}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Store Phone
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
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Store Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                          <input
                            type="email"
                            {...merchRegisterForm.register("email")}
                            placeholder="e.g. verma@example.com"
                            disabled={isLoading}
                            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-emerald rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                          />
                        </div>
                        {merchRegisterForm.formState.errors.email && (
                          <p className="text-[10px] text-rose-500 font-medium mt-1">{String(merchRegisterForm.formState.errors.email.message)}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Business Address
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            {...merchRegisterForm.register("address")}
                            placeholder="e.g. JB Nagar Metro, Andheri East, Mumbai"
                            disabled={isLoading}
                            className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-brand-emerald rounded-xl pl-11 pr-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
                          />
                        </div>
                        {merchRegisterForm.formState.errors.address && (
                          <p className="text-[10px] text-rose-500 font-medium mt-1">{String(merchRegisterForm.formState.errors.address.message)}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                            Password
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
                              className="absolute right-4 top-3.5 text-slate-500 hover:text-slate-300"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {merchRegisterForm.formState.errors.password && (
                            <p className="text-[10px] text-rose-500 font-medium mt-1">{String(merchRegisterForm.formState.errors.password.message)}</p>
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

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 bg-brand-emerald hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Register Business & Sign In</span>}
                      </button>
                    </form>
                  )}

                  <div className="text-center pt-2 border-t border-slate-900/60">
                    <button
                      onClick={() => {
                        setMode(mode === "LOGIN" ? "REGISTER" : "LOGIN");
                        setErrorDetails(null);
                      }}
                      className="text-xs text-brand-emerald hover:underline font-bold cursor-pointer"
                    >
                      {mode === "LOGIN" ? "Register new store? Setup Wizard" : "Already registered? Sign In"}
                    </button>
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