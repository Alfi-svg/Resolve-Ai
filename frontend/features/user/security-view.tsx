"use client";

import React from "react";
import { 
  ShieldCheck, 
  Smartphone, 
  KeyRound, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  History,
  Fingerprint
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const SecurityView: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-upay-700" />
          Security & Account Protection
        </h2>
        <p className="text-xs text-gray-500">
          Manage your biometric credentials, authorized devices, and SafePay protection shield.
        </p>
      </div>

      <div className="space-y-4">
        {/* Security Shield Status */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-upay-50 to-transparent p-6 rounded-3xl border border-emerald-200 shadow-card flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-upay-900 uppercase tracking-wider">
                Upay SafePay Shield
              </span>
              <Badge variant="success">ACTIVE</Badge>
            </div>
            <h3 className="text-base font-extrabold text-gray-900">
              Account Security Status: High Protection
            </h3>
            <p className="text-xs text-gray-600">
              Zero unauthorized withdrawals detected. Real-time Risk Guard surveillance enabled.
            </p>
          </div>
          <Fingerprint className="w-12 h-12 text-upay-800 shrink-0" />
        </div>

        {/* Device Management */}
        <div className="bg-white rounded-3xl border border-surface-border p-6 shadow-card space-y-4">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Authorized Trusted Devices
          </h4>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-surface-subtle border border-surface-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-upay-100 text-upay-800 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">Apple iPhone 14</span>
                    <Badge variant="brand" className="text-[9px]">THIS DEVICE</Badge>
                  </div>
                  <p className="text-[11px] text-gray-500 font-mono">
                    ID: DEV-IPHONE-14 &bull; Last active: Just now
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700">Primary</span>
            </div>
          </div>
        </div>

        {/* Security Preferences */}
        <div className="bg-white rounded-3xl border border-surface-border p-6 shadow-card space-y-4 text-xs">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Authentication & Biometrics
          </h4>

          <div className="divide-y divide-surface-border">
            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-900 block">Biometric Login (FaceID / TouchID)</span>
                <span className="text-gray-500 text-[11px]">Require biometrics before launching app</span>
              </div>
              <span className="font-bold text-emerald-700">Enabled</span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-900 block">Upay Wallet 4-Digit Secret PIN</span>
                <span className="text-gray-500 text-[11px]">Last changed 60 days ago</span>
              </div>
              <Button size="sm" variant="outline" className="text-xs">
                Change PIN
              </Button>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-gray-900 block">Risk Guard Anomaly Alert Push</span>
                <span className="text-gray-500 text-[11px]">Immediate SMS/Push on unusual attempts</span>
              </div>
              <span className="font-bold text-emerald-700">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
