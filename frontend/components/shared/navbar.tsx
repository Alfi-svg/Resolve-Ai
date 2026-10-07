"use client";

import React from "react";
import { ShieldCheck, UserCheck, Bot, Sparkles, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NotificationsBell } from "@/components/shared/notifications-bell";

interface NavbarProps {
  currentRole: "USER" | "ADMIN";
  onRoleChange: (role: "USER" | "ADMIN") => void;
  backendHealthy: boolean;
  demoAiMode?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  backendHealthy,
  demoAiMode = true,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-surface-border shadow-fintech">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-upay-900 to-upay-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-extrabold text-xl tracking-tight">u</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-upay-950 tracking-tight">
                  UPAY <span className="text-upay-700">RESOLVEAI</span>
                </span>
                <Badge variant="brand" className="text-[10px] tracking-wide uppercase px-2 py-0">
                  <Sparkles className="w-3 h-3 mr-1 text-upay-600" />
                  AI Layer
                </Badge>
              </div>
              <p className="text-[11px] font-medium text-gray-700">
                Understand. Investigate. Resolve.
              </p>
            </div>
          </div>

          {/* System status & Role Switcher */}
          <div className="flex items-center gap-4">
            {/* ResolveAI Monitoring Status */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ResolveAI Active &bull; Monitored 24/7</span>
            </div>

            {/* Health pill */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-subtle border border-surface-border text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  backendHealthy ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                }`}
              />
              <span className="text-gray-600 font-medium">
                FastAPI: {backendHealthy ? "Connected" : "Reconnecting"}
              </span>
              {demoAiMode && (
                <span className="ml-1 text-[10px] font-semibold text-upay-800 bg-upay-100 px-1.5 py-0.5 rounded">
                  DEMO_AI
                </span>
              )}
            </div>

            {/* Notifications Drawer */}
            <NotificationsBell />

            {/* Persona / Role Badge */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-subtle border border-surface-border text-xs">
                {currentRole === "ADMIN" ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold text-gray-800">Admin</span>
                    <span className="text-[10px] text-gray-400 font-mono">admin@resolveai.demo</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-upay-700" />
                    <span className="font-bold text-gray-800">User</span>
                    <span className="text-[10px] text-gray-400 font-mono">01700000000</span>
                  </>
                )}
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.removeItem("upay_resolveai_demo_session");
                    window.location.href = "/login";
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-subtle hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-surface-border text-xs font-bold text-gray-600 transition-all shadow-xs"
                title="Logout from Demo Session"
              >
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
