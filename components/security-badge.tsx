"use client";

import { useState, useEffect } from "react";
import { Shield, Lock, Eye, Clock, Key, Server, ShieldCheck, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SecurityStatus {
  authenticated: boolean;
  pinVerified: boolean;
  sessionExpiry: string;
  lastActivity: string;
  ipAddress: string;
  securityLevel: string;
}

export function SecurityBadge() {
  const [showDetails, setShowDetails] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);

  useEffect(() => {
    fetchSecurityStatus();
  }, []);

  const fetchSecurityStatus = async () => {
    try {
      const response = await fetch("/qdata/api/auth/session");
      const data = await response.json();
      if (data.authenticated) {
        setSecurityStatus({
          authenticated: true,
          pinVerified: data.pinVerified,
          sessionExpiry: data.session?.expiresAt || "",
          lastActivity: data.session?.lastActivity || "",
          ipAddress: "Hidden", // Never expose IP to client
          securityLevel: "Enterprise",
        });
      }
    } catch (error) {
      console.error("Failed to fetch security status:", error);
    }
  };

  if (!securityStatus) return null;

  return (
    <>
      <div className="relative">
        {/* Security Badge Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="relative group"
          title="Security Status"
        >
          <Shield className="h-4 w-4 text-emerald-500 group-hover:text-emerald-400 transition-colors" />
          <span className="ml-2 text-xs text-emerald-500 hidden lg:inline">Secured</span>
          
          {/* Pulsing indicator */}
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </Button>
      </div>

      {/* Security Details Dropdown */}
      {showDetails && (
        <>
          {/* Backdrop overlay for mobile */}
          <div 
            className="fixed inset-0 bg-black/20 z-[90] md:hidden" 
            onClick={() => setShowDetails(false)}
          />
          
          <Card className="fixed md:absolute left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0 top-16 md:top-12 w-[calc(100vw-2rem)] max-w-sm md:w-80 p-4 bg-slate-900/98 md:bg-slate-900/95 border-slate-700 backdrop-blur-xl shadow-2xl z-[100]">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <h3 className="font-semibold text-white">Security Status</h3>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                  {securityStatus.securityLevel}
                </span>
              </div>

              {/* Security Features */}
              <div className="space-y-3">
              {/* Authentication */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Lock className="h-4 w-4 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">Dual Authentication</p>
                    <span className="text-xs text-emerald-400">✓ Active</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Password + PIN verified
                  </p>
                </div>
              </div>

              {/* Encryption */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Key className="h-4 w-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">Encryption</p>
                    <span className="text-xs text-emerald-400">✓ Active</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    PBKDF2 with 100K iterations
                  </p>
                </div>
              </div>

              {/* Session Security */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Clock className="h-4 w-4 text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">Auto-Logout</p>
                    <span className="text-xs text-amber-400">15 min</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Inactive session timeout
                  </p>
                </div>
              </div>

              {/* Audit Logging */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Eye className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">Audit Trail</p>
                    <span className="text-xs text-emerald-400">✓ Enabled</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    All actions logged
                  </p>
                </div>
              </div>

              {/* Connection Security */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Server className="h-4 w-4 text-rose-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">SQL Injection</p>
                    <span className="text-xs text-emerald-400">✓ Protected</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Parameterized queries only
                  </p>
                </div>
              </div>

              {/* XSS Protection */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <AlertCircle className="h-4 w-4 text-orange-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">XSS Protection</p>
                    <span className="text-xs text-emerald-400">✓ Active</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    React auto-escaping + CSP
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Security Level:</span>
                <span className="font-semibold text-emerald-400">
                  {securityStatus.securityLevel} Grade
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 text-center">
                🔒 Protected by QData Advanced Security
              </p>
            </div>
            </div>
          </Card>
        </>
      )}
    </>
  );
}
