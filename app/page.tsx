"use client";

import { useState, useEffect } from "react";
import { DatabaseDashboard } from "@/components/database-dashboard";
import { InitialSetup } from "@/components/initial-setup";
import { LoginScreen } from "@/components/login-screen";
import { PinVerification } from "@/components/pin-verification";
import { Loader2 } from "lucide-react";

type AuthState = "loading" | "setup" | "login" | "pin" | "authenticated";

export default function Home() {
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if setup is complete
      const setupResponse = await fetch("/qdata/api/auth/check-setup");
      const setupData = await setupResponse.json();

      if (!setupData.setupComplete) {
        setAuthState("setup");
        return;
      }

      // Check if user is already authenticated
      const sessionResponse = await fetch("/qdata/api/auth/session");
      const sessionData = await sessionResponse.json();

      if (sessionData.authenticated) {
        if (sessionData.pinVerified) {
          setAuthState("authenticated");
        } else {
          setAuthState("pin");
        }
      } else {
        setAuthState("login");
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setAuthState("login");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/qdata/api/auth/logout", { method: "POST" });
      setAuthState("login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (authState === "loading") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading QData...</p>
        </div>
      </main>
    );
  }

  if (authState === "setup") {
    return (
      <main className="min-h-screen">
        <InitialSetup onSetupComplete={() => setAuthState("login")} />
      </main>
    );
  }

  if (authState === "login") {
    return (
      <main className="min-h-screen">
        <LoginScreen onLoginSuccess={() => setAuthState("pin")} />
      </main>
    );
  }

  if (authState === "pin") {
    return (
      <main className="min-h-screen">
        <PinVerification
          onVerified={() => setAuthState("authenticated")}
          onLogout={handleLogout}
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <DatabaseDashboard onLogout={handleLogout} />
    </main>
  );
}

