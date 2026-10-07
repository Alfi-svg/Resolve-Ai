"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/shared/navbar";
import { AdminPanel } from "@/features/admin/admin-panel";
import { apiClient } from "@/lib/api-client";
import { authService, DemoSession } from "@/lib/auth-service";
import { 
  Gateway, 
  SyntheticTransaction, 
  TransactionTimeline, 
  SupportCase 
} from "@/types/synthetic";
import { HealthData } from "@/types/api";

export default function AdminPortalPage() {
  const router = useRouter();
  const [session, setSession] = useState<DemoSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [health, setHealth] = useState<HealthData | null>(null);

  // Admin Data State with reliable fallbacks to prevent any crash
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [transactions, setTransactions] = useState<SyntheticTransaction[]>([]);
  const [heroTimeline, setHeroTimeline] = useState<TransactionTimeline | null>(null);
  const [incidentStats, setIncidentStats] = useState<{ totalFailed: number; merchants: number } | null>({
    totalFailed: 341,
    merchants: 82,
  });

  // Authentication Guard Check
  useEffect(() => {
    const currentSession = authService.getSession();
    if (!currentSession || !currentSession.authenticated) {
      router.replace("/login");
      return;
    }

    if (currentSession.role !== "admin") {
      // Role protection: User trying to access /admin
      router.replace("/user");
      return;
    }

    setSession(currentSession);
    loadAdminData();
  }, [router]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [hData, adminCases, allTxns, gws, heroTl, incTxns] = await Promise.all([
        apiClient.getHealth().catch(() => null),
        apiClient.getAdminCases().catch(() => []),
        apiClient.getTransactions({ limit: 100 }).catch(() => []),
        apiClient.getGateways().catch(() => []),
        apiClient.getTransactionTimeline("TXN-8F31A2").catch(() => null),
        apiClient.getTransactions({ gatewayId: "GW-NPSB-SWITCH", status: "FAILED", limit: 500 }).catch(() => []),
      ]);

      setHealth(hData);
      if (adminCases && adminCases.length > 0) setCases(adminCases);
      if (allTxns && allTxns.length > 0) setTransactions(allTxns);
      if (gws && gws.length > 0) setGateways(gws);
      if (heroTl) setHeroTimeline(heroTl);

      if (incTxns && incTxns.length > 0) {
        const uniqueMerchants = new Set(incTxns.map((t) => t.merchant_id).filter(Boolean));
        setIncidentStats({
          totalFailed: incTxns.length,
          merchants: uniqueMerchants.size || 82,
        });
      }
    } catch (err) {
      console.warn("Using offline verified state for Admin Portal:", err);
    } finally {
      setLoading(false);
    }
  };

  // If redirecting or checking auth
  if (!session) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-600">
            Verifying Administrator Security Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col">
      <Navbar
        currentRole="ADMIN"
        onRoleChange={(role) => {
          if (role === "USER") {
            router.push("/user");
          }
        }}
        backendHealthy={!!health?.database.healthy}
        demoAiMode={true}
      />

      <main className="flex-1">
        <AdminPanel
          cases={cases}
          gateways={gateways}
          transactions={transactions}
          heroTimeline={heroTimeline}
          incidentStats={incidentStats}
          onRefreshData={loadAdminData}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-white py-6 mt-12 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-gray-700">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-upay-900">UPAY RESOLVEAI</span>
            <span>&bull; Operations Intelligence &amp; Risk Guard Surveillance (admin@resolveai.demo)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-gray-500 text-[11px]">Role: ADMIN</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white">
              Demo Environment
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
