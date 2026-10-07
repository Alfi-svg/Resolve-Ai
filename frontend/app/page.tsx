"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/shared/navbar";
import { apiClient } from "@/lib/api-client";
import { 
  Gateway, 
  SyntheticTransaction, 
  TransactionTimeline, 
  SupportCase,
  User 
} from "@/types/synthetic";
import { HealthData } from "@/types/api";
import { UserPanel } from "@/features/user/user-panel";
import { AdminPanel } from "@/features/admin/admin-panel";
import { AlertTriangle, RefreshCw, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Real Backend Data State
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [userTransactions, setUserTransactions] = useState<SyntheticTransaction[]>([]);
  const [heroTimeline, setHeroTimeline] = useState<TransactionTimeline | null>(null);
  const [incidentStats, setIncidentStats] = useState<{ totalFailed: number; merchants: number } | null>(null);

  const loadData = async (targetRole: "USER" | "ADMIN" = role) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Perform Demo Login (POST /api/auth/demo-login)
      await apiClient.demoLogin(targetRole).catch((err) => {
        console.warn("Demo login warning:", err);
      });

      // 2. Fetch User Profile (GET /api/user/profile) & Health
      const [hData, profile] = await Promise.all([
        apiClient.getHealth().catch(() => null),
        apiClient.getUserProfile().catch(() => null),
      ]);
      setHealth(hData);
      setUserProfile(profile);

      // 3. Fetch Transactions & Cases according to role
      if (targetRole === "USER") {
        const [uTxns, uCases, gws] = await Promise.all([
          apiClient.getUserTransactions().catch(() => []),
          apiClient.getUserCases().catch(() => []),
          apiClient.getGateways().catch(() => []),
        ]);
        setUserTransactions(uTxns);
        setCases(uCases);
        setGateways(gws);
      } else {
        const [adminCases, allTxns, gws, heroTl, incTxns] = await Promise.all([
          apiClient.getAdminCases().catch(() => []),
          apiClient.getTransactions({ limit: 100 }).catch(() => []),
          apiClient.getGateways().catch(() => []),
          apiClient.getTransactionTimeline("TXN-8F31A2").catch(() => null),
          apiClient.getTransactions({ gatewayId: "GW-NPSB-SWITCH", status: "FAILED", limit: 500 }).catch(() => []),
        ]);
        setCases(adminCases);
        setUserTransactions(allTxns);
        setGateways(gws);
        setHeroTimeline(heroTl);

        if (incTxns && incTxns.length > 0) {
          const uniqueMerchants = new Set(incTxns.map((t) => t.merchant_id).filter(Boolean));
          setIncidentStats({
            totalFailed: incTxns.length,
            merchants: uniqueMerchants.size || 82,
          });
        }
      }
    } catch (err: any) {
      console.error("Critical error loading live data from FastAPI:", err);
      setError(err?.message || "Failed to load live data from FastAPI backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (newRole: "USER" | "ADMIN") => {
    setRole(newRole);
    await loadData(newRole);
  };

  useEffect(() => {
    loadData(role);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col">
      <Navbar
        currentRole={role}
        onRoleChange={handleRoleChange}
        backendHealthy={!!health?.database.healthy}
        demoAiMode={true}
      />

      {/* Global Error State Alert */}
      {error && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-center justify-between gap-3 text-xs shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span><strong>Backend Connection Error:</strong> {error} &bull; Check if FastAPI is running on :8000</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => loadData(role)} className="text-xs shrink-0 gap-1">
              <RefreshCw className="w-3 h-3" />
              Retry Connection
            </Button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && userTransactions.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-3">
          <div className="w-8 h-8 border-2 border-upay-800 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-gray-700 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-upay-700 animate-pulse" />
            Connecting to FastAPI backend &bull; Syncing real account ledger...
          </p>
        </div>
      )}

      {/* Render Active Role View */}
      {(!loading || userTransactions.length > 0) && (
        <>
          {role === "USER" ? (
            <UserPanel
              balance={userProfile?.wallet_balance ?? 14500.0}
              transactions={userTransactions}
              cases={cases}
              onRefreshData={() => loadData("USER")}
            />
          ) : (
            <AdminPanel
              gateways={gateways}
              cases={cases}
              transactions={userTransactions}
              heroTimeline={heroTimeline}
              incidentStats={incidentStats}
              onRefreshData={() => loadData("ADMIN")}
            />
          )}
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-surface-border bg-white py-6 mt-12 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-gray-700">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-upay-900">UPAY RESOLVEAI</span>
            <span>&bull; Modern MFS User Panel &amp; Admin Intelligence</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-gray-500">FastAPI: :8000</span>
            <span className="font-mono text-gray-500">Next.js: :3000</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
