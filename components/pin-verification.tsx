"use client";

import { useState, useRef, useEffect } from "react";
import { Shield, Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface PinVerificationProps {
  onVerified: () => void;
  onLogout: () => void;
}

export function PinVerification({ onVerified, onLogout }: PinVerificationProps) {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newPin = [...pin];
    newPin[index] = value.slice(-1); // Only take last digit
    setPin(newPin);
    setError(false);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (index === 5 && value) {
      const fullPin = [...newPin];
      fullPin[index] = value;
      if (fullPin.every(d => d !== "")) {
        verifyPin(fullPin.join(""));
      }
    } else if (index < 5 && newPin.every(d => d !== "")) {
      verifyPin(newPin.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "Enter") {
      verifyPin(pin.join(""));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newPin = [...pin];
    
    for (let i = 0; i < pastedData.length; i++) {
      newPin[i] = pastedData[i];
    }
    
    setPin(newPin);
    
    if (pastedData.length === 6) {
      verifyPin(pastedData);
    } else {
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const verifyPin = async (pinValue: string) => {
    if (pinValue.length < 4) {
      toast({
        title: "Invalid PIN",
        description: "Please enter at least 4 digits",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/qdata/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pinValue }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✓ PIN Verified",
          description: "Access granted",
        });
        onVerified();
      } else {
        setError(true);
        setPin(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        toast({
          title: "✗ Invalid PIN",
          description: data.error || "Please try again",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("PIN verification error:", error);
      setError(true);
      toast({
        title: "✗ Error",
        description: "Failed to verify PIN",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearPin = () => {
    setPin(["", "", "", "", "", ""]);
    setError(false);
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Background blur overlay */}
      <div className="absolute inset-0 backdrop-blur-3xl bg-slate-950/80" />

      <Card className={`w-full max-w-md border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl relative z-10 transition-all ${
        error ? "animate-shake border-red-500/50" : ""
      }`}>
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br ${
              error ? "from-red-500 to-red-600" : "from-emerald-500 to-emerald-600"
            } mb-4 shadow-lg transition-all ${
              error ? "shadow-red-500/20 animate-pulse" : "shadow-emerald-500/20"
            }`}>
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Security PIN Required
            </h1>
            <p className="text-slate-400 text-sm">
              Enter your {pin.some(d => d) ? pin.filter(d => d).length : "4-6"} digit PIN to continue
            </p>
          </div>

          {/* PIN Input */}
          <div className="space-y-6">
            <div className="flex justify-center gap-2 sm:gap-3">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={loading}
                  className={`w-12 h-16 sm:w-14 sm:h-18 text-center text-3xl font-bold rounded-lg border-2 bg-slate-800/50 text-white transition-all focus:outline-none focus:scale-110 ${
                    error
                      ? "border-red-500 focus:border-red-400 focus:ring-4 focus:ring-red-500/20"
                      : digit
                      ? "border-emerald-500 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/20"
                      : "border-slate-700 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20"
                  } disabled:opacity-50`}
                />
              ))}
            </div>

            {/* Number Pad for Mobile */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto sm:hidden">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, "clear", 0, "back"].map((num) => (
                <Button
                  key={num}
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (num === "clear") {
                      clearPin();
                    } else if (num === "back") {
                      const lastFilledIndex = pin.findLastIndex(d => d !== "");
                      if (lastFilledIndex >= 0) {
                        const newPin = [...pin];
                        newPin[lastFilledIndex] = "";
                        setPin(newPin);
                        inputRefs.current[lastFilledIndex]?.focus();
                      }
                    } else {
                      const firstEmptyIndex = pin.findIndex(d => d === "");
                      if (firstEmptyIndex >= 0) {
                        handleChange(firstEmptyIndex, String(num));
                      }
                    }
                  }}
                  className="h-14 text-lg font-semibold bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                >
                  {num === "clear" ? (
                    <Delete className="h-5 w-5" />
                  ) : num === "back" ? (
                    "←"
                  ) : (
                    num
                  )}
                </Button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={clearPin}
                variant="outline"
                className="flex-1 border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
              >
                Clear
              </Button>
              <Button
                onClick={onLogout}
                variant="outline"
                className="flex-1 border-red-700/50 bg-red-900/20 text-red-400 hover:bg-red-900/40"
              >
                Logout
              </Button>
            </div>

            {loading && (
              <div className="flex items-center justify-center gap-2 text-slate-400">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent" />
                <span className="text-sm">Verifying...</span>
              </div>
            )}
          </div>

          {/* Security Note */}
          <div className="mt-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-xs text-amber-400 text-center">
              🔒 Your PIN is encrypted and never stored in plain text
            </p>
          </div>
        </div>
      </Card>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}
