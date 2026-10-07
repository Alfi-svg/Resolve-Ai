"use client";

export interface DemoUser {
  id: string;
  name: string;
  phone: string;
}

export interface DemoAdmin {
  id: string;
  name: string;
  email: string;
}

export interface DemoSession {
  authenticated: boolean;
  role: "user" | "admin";
  demo_mode: boolean;
  user?: DemoUser;
  admin?: DemoAdmin;
  id: string;
  name: string;
  loginTime: string;
}

const STORAGE_KEY = "upay_resolveai_demo_session";

// Listener callbacks for reactive session changes
type SessionListener = (session: DemoSession | null) => void;
const listeners: Set<SessionListener> = new Set();

const notifyListeners = (session: DemoSession | null) => {
  listeners.forEach((listener) => {
    try {
      listener(session);
    } catch (e) {
      console.error("Session listener error:", e);
    }
  });
};

export const authService = {
  /**
   * Subscribe to session state changes
   */
  subscribe(listener: SessionListener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /**
   * Get active session from localStorage (SSR-safe)
   */
  getSession(): DemoSession | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored) as DemoSession;
      if (parsed && parsed.authenticated) {
        return parsed;
      }
      return null;
    } catch (err) {
      console.warn("Failed to parse stored session:", err);
      return null;
    }
  },

  /**
   * Check if user is logged in
   */
  isAuthenticated(): boolean {
    const session = this.getSession();
    return !!session?.authenticated;
  },

  /**
   * Check if user has specific role
   */
  hasRole(role: "user" | "admin"): boolean {
    const session = this.getSession();
    return session?.authenticated === true && session?.role === role;
  },

  /**
   * Login as User (Phone + 6-digit PIN)
   * Calls POST /api/auth/demo/user
   */
  async loginUser(phone: string, pin: string): Promise<DemoSession> {
    const cleanPhone = phone.trim();
    const cleanPin = pin.trim();

    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api")
        .trim()
        .replace(/\/+$/, "")
        .replace(/\/api$/, "") + "/api";

      const res = await fetch(`${apiBase}/auth/demo/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, pin: cleanPin }),
      });

      if (!res.ok) {
        throw new Error("Invalid phone number or PIN.");
      }

      const data = await res.json();
      const session: DemoSession = {
        authenticated: true,
        role: "user",
        demo_mode: true,
        user: data.user || {
          id: "USR-1001",
          name: "Demo User",
          phone: cleanPhone,
        },
        id: data.user?.id || "USR-1001",
        name: data.user?.name || "Demo User",
        loginTime: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      }
      notifyListeners(session);
      return session;
    } catch (err: any) {
      // Offline fallback: if backend is sleeping/offline, validate demo credentials in-client
      if (cleanPhone === "01700000000" && cleanPin === "123456") {
        const fallbackSession: DemoSession = {
          authenticated: true,
          role: "user",
          demo_mode: true,
          user: {
            id: "USR-1001",
            name: "Demo User",
            phone: "01700000000",
          },
          id: "USR-1001",
          name: "Demo User",
          loginTime: new Date().toISOString(),
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackSession));
        }
        notifyListeners(fallbackSession);
        return fallbackSession;
      }

      throw new Error("Invalid phone number or PIN.");
    }
  },

  /**
   * Login as Operations Admin (Email + Password)
   * Calls POST /api/auth/demo/admin
   */
  async loginAdmin(email: string, password: string): Promise<DemoSession> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api")
        .trim()
        .replace(/\/+$/, "")
        .replace(/\/api$/, "") + "/api";

      const res = await fetch(`${apiBase}/auth/demo/admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      if (!res.ok) {
        throw new Error("Invalid administrator email or password.");
      }

      const data = await res.json();
      const session: DemoSession = {
        authenticated: true,
        role: "admin",
        demo_mode: true,
        admin: data.admin || {
          id: "ADM-001",
          name: "ResolveAI Admin",
          email: cleanEmail,
        },
        id: data.admin?.id || "ADM-001",
        name: data.admin?.name || "ResolveAI Admin",
        loginTime: new Date().toISOString(),
      };

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      }
      notifyListeners(session);
      return session;
    } catch (err: any) {
      // Offline fallback: if backend is sleeping/offline, validate demo credentials in-client
      if (cleanEmail === "admin@resolveai.demo" && cleanPassword === "admin123") {
        const fallbackSession: DemoSession = {
          authenticated: true,
          role: "admin",
          demo_mode: true,
          admin: {
            id: "ADM-001",
            name: "ResolveAI Admin",
            email: "admin@resolveai.demo",
          },
          id: "ADM-001",
          name: "ResolveAI Admin",
          loginTime: new Date().toISOString(),
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackSession));
        }
        notifyListeners(fallbackSession);
        return fallbackSession;
      }

      throw new Error("Invalid administrator email or password.");
    }
  },

  /**
   * Clear active session and broadcast logout
   */
  logout(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    notifyListeners(null);
  },
};
