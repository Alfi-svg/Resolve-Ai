"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Smartphone, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  AlertCircle,
  CheckCircle2,
  Info,
  UserCheck
} from "lucide-react";
import { authService } from "@/lib/auth-service";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [roleTab, setRoleTab] = useState<"user" | "admin">("user");

  // User form state
  const [userPhone, setUserPhone] = useState<string>("01700000000");
  const [userPin, setUserPin] = useState<string>("123456");

  // Admin form state
  const [adminEmail, setAdminEmail] = useState<string>("admin@resolveai.demo");
  const [adminPassword, setAdminPassword] = useState<string>("admin123");

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already authenticated, redirect to appropriate portal
  useEffect(() => {
    const session = authService.getSession();
    if (session?.authenticated) {
      if (session.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/user");
      }
    }
  }, [router]);

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await authService.loginUser(userPhone, userPin);
      router.push("/user");
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid phone number or PIN.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      await authService.loginAdmin(adminEmail, adminPassword);
      router.push("/admin");
    } catch (err: any) {
      setErrorMessage(err.message || "Invalid administrator email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col justify-between relative overflow-hidden select-none">
      {/* Subtle background ambient gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-upay-950 via-upay-900 to-upay-800 text-white flex items-center justify-center font-black text-xl shadow-md">
            u
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-upay-950">
                UPAY <span className="text-upay-700">RESOLVEAI</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                Demo Auth
              </span>
            </div>
            <p className="text-[11px] font-semibold text-gray-500">
              Understand. Investigate. Resolve.
            </p>
          </div>
        </div>

        {/* Demo Environment Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs shadow-xs">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-bold text-[11px] uppercase tracking-wider">Demo Environment</span>
        </div>
      </header>

      {/* Main Authentication Card Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="max-w-md w-full space-y-6">
          {/* Header Banner */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-upay-900 border border-emerald-200 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-upay-700" />
              Autonomous Transaction Intelligence
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
              Sign In to ResolveAI
            </h1>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Select your persona below to access customer wallet operations or institutional risk surveillance.
            </p>
          </div>

          {/* Card Container */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-surface-border shadow-card p-6 sm:p-8 space-y-6">
            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-surface-subtle rounded-2xl border border-surface-border">
              <button
                type="button"
                onClick={() => {
                  setRoleTab("user");
                  setErrorMessage(null);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex flex-col items-center gap-0.5 transition-all ${
                  roleTab === "user"
                    ? "bg-white text-upay-950 shadow-sm border border-surface-border"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-upay-700" />
                  <span>User Login</span>
                </div>
                <span className="text-[10px] font-normal text-gray-400">
                  Wallet &amp; ResolveAI
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRoleTab("admin");
                  setErrorMessage(null);
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex flex-col items-center gap-0.5 transition-all ${
                  roleTab === "admin"
                    ? "bg-upay-900 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Admin Access</span>
                </div>
                <span className="text-[10px] font-normal text-slate-300">
                  Ops &amp; Risk Guard
                </span>
              </button>
            </div>

            {/* Error Message Notice */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            {/* USER LOGIN FORM */}
            {roleTab === "user" ? (
              <form onSubmit={handleUserLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      placeholder="01700000000"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-subtle border border-surface-border rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-upay-700 focus:bg-white transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 block">
                    Demo Account: <strong className="font-mono text-gray-600">01700000000</strong>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
                    6-Digit Wallet PIN
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      maxLength={6}
                      value={userPin}
                      onChange={(e) => setUserPin(e.target.value)}
                      placeholder="••••••"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-subtle border border-surface-border rounded-xl text-xs font-mono tracking-widest text-gray-900 focus:outline-none focus:ring-2 focus:ring-upay-700 focus:bg-white transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 block">
                    Demo PIN: <strong className="font-mono text-gray-600">123456</strong>
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full py-3 gap-2 justify-center font-bold text-xs shadow-sm mt-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      <span>Login to User Wallet</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              /* ADMIN LOGIN FORM */
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@resolveai.demo"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-subtle border border-surface-border rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-upay-700 focus:bg-white transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 block">
                    Demo Admin: <strong className="font-mono text-gray-600">admin@resolveai.demo</strong>
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">
                    Security Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-subtle border border-surface-border rounded-xl text-xs font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-upay-700 focus:bg-white transition-all"
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 block">
                    Demo Password: <strong className="font-mono text-gray-600">admin123</strong>
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="w-full py-3 gap-2 justify-center font-bold text-xs bg-slate-900 hover:bg-black text-white shadow-sm mt-2"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Access Operations Center</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Quick Autofill Helper for Judges */}
            <div className="pt-2 border-t border-surface-border space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block text-center">
                Quick Demo Autofill
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRoleTab("user");
                    setUserPhone("01700000000");
                    setUserPin("123456");
                    setErrorMessage(null);
                  }}
                  className="p-2 rounded-xl bg-surface-subtle hover:bg-emerald-50 border border-surface-border text-left transition-colors text-[11px]"
                >
                  <strong className="block text-gray-800 text-[10px]">Demo User</strong>
                  <span className="text-gray-400 text-[9px] font-mono">01700000000 / 123456</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRoleTab("admin");
                    setAdminEmail("admin@resolveai.demo");
                    setAdminPassword("admin123");
                    setErrorMessage(null);
                  }}
                  className="p-2 rounded-xl bg-surface-subtle hover:bg-emerald-50 border border-surface-border text-left transition-colors text-[11px]"
                >
                  <strong className="block text-gray-800 text-[10px]">Demo Admin</strong>
                  <span className="text-gray-400 text-[9px] font-mono">admin@... / admin123</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mandatory Demo Disclaimer Notice */}
          <div className="p-3.5 rounded-2xl bg-white border border-surface-border text-center space-y-1 shadow-xs">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-700 flex items-center justify-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              DEMO ENVIRONMENT
            </span>
            <p className="text-[11px] text-gray-400">
              No real authentication &bull; No real money &bull; Synthetic data
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-gray-400 border-t border-surface-border">
        Upay ResolveAI &bull; Production-Style Demo Authentication Layer
      </footer>
    </div>
  );
}
