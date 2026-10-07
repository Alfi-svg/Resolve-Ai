"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, Sparkles, ShieldCheck, RotateCcw, GraduationCap, X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";

export const NotificationsBell: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: "NOTIF-01",
      title: "ResolveAI Active Protection",
      message: "Autonomous transaction anomaly monitoring is enabled. 24/7 self-healing ledger supervision active.",
      type: "AGENT_ALERT",
      is_read: false,
      created_at: new Date().toISOString()
    }
  ]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(1);
  const drawerRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = async () => {
    try {
      const res = await apiClient.getUserNotifications();
      if (res.notifications && res.notifications.length > 0) {
        setNotifications(res.notifications);
        setUnreadCount(res.unread_count);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await apiClient.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "AGENT_ALERT":
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case "UNDO_SUCCESS":
        return <RotateCcw className="w-4 h-4 text-amber-600" />;
      case "STUDENT_BENEFIT":
        return <GraduationCap className="w-4 h-4 text-indigo-600" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-upay-800" />;
    }
  };

  return (
    <div className="relative" ref={drawerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-surface-subtle hover:bg-surface-muted border border-surface-border text-gray-700 transition-all focus:outline-none"
        title="ResolveAI Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-[10px] font-extrabold text-white items-center justify-center">
              {unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown Popup */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-surface-border p-4 z-50 animate-in fade-in zoom-in-95 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-upay-800" />
              <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wide">
                Live ResolveAI Alerts
              </h4>
            </div>
            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-upay-700 hover:text-upay-900 flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark Read
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-2xl border transition-all text-xs space-y-1 ${
                  !n.is_read
                    ? "bg-emerald-50/50 border-emerald-200 text-gray-900"
                    : "bg-surface-subtle border-surface-border text-gray-600"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold">
                    {getIconForType(n.type)}
                    <span>{n.title}</span>
                  </div>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  )}
                </div>
                <p className="text-[11px] leading-relaxed text-gray-600">
                  {n.message}
                </p>
                <div className="text-[10px] text-gray-400 pt-0.5">
                  {new Date(n.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
