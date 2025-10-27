"use client";

import { useState } from "react";
import { Shield, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface InitialSetupProps {
  onSetupComplete: () => void;
}

export function InitialSetup({ onSetupComplete }: InitialSetupProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (pin !== confirmPin) {
      toast({
        title: "PIN Mismatch",
        description: "PINs do not match",
        variant: "destructive",
      });
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be exactly 4 digits",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/qdata/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, pin }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✓ Setup Complete!",
          description: "Admin account created successfully",
        });
        onSetupComplete();
      } else {
        toast({
          title: "✗ Setup Failed",
          description: data.error || "Failed to create admin account",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Setup error:", error);
      toast({
        title: "✗ Error",
        description: "Failed to complete setup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/90 backdrop-blur-xl shadow-2xl">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome to QData
            </h1>
            <p className="text-slate-400 text-sm">
              First-time setup: Create your admin account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-300">
                Admin Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={20}
                  className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500"
                />
              </div>
              <p className="text-xs text-slate-500">3-20 characters</p>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="pl-10 pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500">Minimum 8 characters</p>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* PIN */}
            <div className="space-y-2">
              <Label htmlFor="pin" className="text-slate-300">
                Security PIN
              </Label>
              <Input
                id="pin"
                type="password"
                placeholder="1234"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                required
                pattern="\d{4}"
                maxLength={4}
                className="bg-slate-800 border-slate-700 text-white text-center text-2xl tracking-widest placeholder:text-slate-500 focus:border-emerald-500"
              />
              <p className="text-xs text-slate-500">4-digit PIN required on every login</p>
            </div>

            {/* Confirm PIN */}
            <div className="space-y-2">
              <Label htmlFor="confirmPin" className="text-slate-300">
                Confirm PIN
              </Label>
              <Input
                id="confirmPin"
                type="password"
                placeholder="1234"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                required
                pattern="\d{4}"
                maxLength={4}
                className="bg-slate-800 border-slate-700 text-white text-center text-2xl tracking-widest placeholder:text-slate-500 focus:border-emerald-500"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold py-6 text-base"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Creating Admin Account...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Create Admin Account
                </>
              )}
            </Button>
          </form>

          {/* Security Note */}
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-xs text-amber-400 text-center">
              🔒 Your credentials are stored securely with industry-standard encryption.
              Never share your PIN with anyone.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
