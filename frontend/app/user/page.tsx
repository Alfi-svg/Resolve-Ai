"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/shared/navbar";
import { UserPanel } from "@/features/user/user-panel";
import { apiClient } from "@/lib/api-client";
import { authService, DemoSession } from "@/lib/auth-service";
import { SyntheticTransaction, SupportCase, User } from "@/types/synthetic";
import { HealthData } from "@/types/api";
import { Radio } from "lucide-react";

export default function UserPortalPage() {
  const router = useRouter();
  const [session, setSession] = useState<DemoSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [health, setHealth] = useState<HealthData | null>(null);

  // User Data State with robust mock fallbacks to prevent any crash
  const [userProfile, setUserProfile] = useState<User>({
    id: "USR-1001",
    name: "Demo User",
    phone_masked: "+880 1700-***000",
    account_status: "ACTIVE",
    wallet_balance: 14500.0,
    risk_level: "LOW",
    created_at: new Date().toISOString(),
  });

  const defaultUserTransactions: SyntheticTransaction[] = [
    {
      id: "TXN-8F31A2",
      user_id: "USR-001",
      merchant_id: "MERCH-ABC-01",
      type: "QR_PAYMENT",
      amount: 2000.0,
      currency: "BDT",
      status: "PARTIAL_FAILURE",
      channel: "QR",
      device_id: "DEV-IPHONE-14",
      location: "Banani, Dhaka",
      created_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
      failure_code: "GW_TIMEOUT_504",
      gateway_id: "GW-BRAC-SWITCH",
      meta_info: {
        merchant_name: "ABC Cafe",
        qr_format: "BANGLA_QR",
        pos_terminal_id: "ABC-POS-04",
        counter: "Counter #2 (Pastry & Coffee)",
      },
    },
    {
      id: "TXN-RAHIM-500",
      user_id: "USR-001",
      type: "SEND_MONEY",
      amount: 500.0,
      currency: "BDT",
      status: "SUCCESS",
      channel: "APP",
      device_id: "DEV-IPHONE-14",
      location: "Dhaka, BD",
      created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      meta_info: {
        recipient_name: "Rahim",
        recipient_phone: "+880 1812-998877",
      },
    },
    {
      id: "TXN-UNIV-400",
      user_id: "USR-001",
      merchant_id: "MERCH-UNIV-01",
      type: "MERCHANT_PAYMENT",
      amount: 400.0,
      currency: "BDT",
      status: "SUCCESS",
      channel: "APP",
      device_id: "DEV-IPHONE-14",
      location: "DU Campus, Dhaka",
      created_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
      meta_info: {
        merchant_name: "University Store",
        benefit_category: "Student Benefit",
      },
    },
  ];

  const defaultUserCases: SupportCase[] = [
    {
      id: "CASE-8F31A2",
      user_id: "USR-001",
      transaction_id: "TXN-8F31A2",
      complaint: "QR payment debited but merchant not credited at ABC Cafe.",
      status: "INVESTIGATING",
      priority: "HIGH",
      risk_score: 5.0,
      assigned_admin: "Operations Sentinel",
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
  ];

  const [transactions, setTransactions] = useState<SyntheticTransaction[]>(defaultUserTransactions);
  const [cases, setCases] = useState<SupportCase[]>(defaultUserCases);

  // Authentication Guard Check
  useEffect(() => {
    const currentSession = authService.getSession();
    if (!currentSession || !currentSession.authenticated) {
      router.replace("/login");
      return;
    }

    if (currentSession.role !== "user") {
      // Role protection: Admin trying to access /user without explicit permission
      router.replace("/admin");
      return;
    }

    setSession(currentSession);
    loadUserData();
  }, [router]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [hData, profile, uTxns, uCases] = await Promise.all([
        apiClient.getHealth().catch(() => null),
        apiClient.getUserProfile().catch(() => null),
        apiClient.getUserTransactions().catch(() => defaultUserTransactions),
        apiClient.getUserCases().catch(() => defaultUserCases),
      ]);

      setHealth(hData);
      if (profile) setUserProfile(profile);
      if (uTxns && uTxns.length > 0) setTransactions(uTxns);
      if (uCases && uCases.length > 0) setCases(uCases);
    } catch (err) {
      console.warn("Using offline verified state for User Portal:", err);
    } finally {
      setLoading(false);
    }
  };

  // If redirecting or checking auth
  if (!session) {
    return (
      <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-upay-800 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-600">
            Verifying User Authentication Session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col">
      <Navbar
        currentRole="USER"
        onRoleChange={(role) => {
          if (role === "ADMIN") {
            router.push("/admin");
          }
        }}
        backendHealthy={!!health?.database.healthy}
        demoAiMode={true}
      />

      <main className="flex-1">
        <UserPanel
          balance={userProfile.wallet_balance}
          transactions={transactions}
          cases={cases}
          onRefreshData={loadUserData}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-border bg-white py-6 mt-12 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-gray-700">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-upay-900">UPAY RESOLVEAI</span>
            <span>&bull; Authenticated Customer Portal (01700000000)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-gray-500 text-[11px]">Role: USER</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Demo Environment
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
