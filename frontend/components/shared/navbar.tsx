"use client";

import React from "react";
import { ShieldCheck, UserCheck, Bot, Sparkles, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

            {/* Role Switcher (User vs Admin) */}
            <div className="flex items-center p-1 bg-surface-muted rounded-xl border border-surface-border">
              <button
                type="button"
                onClick={() => onRoleChange("USER")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === "USER"
                    ? "bg-white text-upay-900 shadow-sm border border-surface-border"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                User Panel
              </button>

              <button
                type="button"
                onClick={() => onRoleChange("ADMIN")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === "ADMIN"
                    ? "bg-upay-800 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Panel
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
