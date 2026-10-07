"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/auth-service";

export default function RootHomePage() {
  const router = useRouter();

  useEffect(() => {
    const session = authService.getSession();
    if (session && session.authenticated) {
      if (session.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/user");
      }
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f8faf9] flex items-center justify-center p-6">
      <div className="text-center space-y-3">
        <div className="w-9 h-9 rounded-2xl bg-upay-900 text-white flex items-center justify-center font-black mx-auto shadow-sm">
          u
        </div>
        <div className="w-6 h-6 border-2 border-upay-800 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-gray-500">
          Routing to Upay ResolveAI Portal...
        </p>
      </div>
    </div>
  );
}
