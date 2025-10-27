"use client";

import { useState, useEffect } from "react";
import { Users, UserPlus, Shield, Trash2, Eye, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface User {
  id: string;
  username: string;
  role: string;
  createdAt: string;
  createdBy?: string;
  lastLogin?: string;
  isActive: boolean;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    pin: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/qdata/api/auth/users");
      const data = await response.json();
      
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "✗ Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newUser.password.length < 8) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    if (!/^\d{4,6}$/.test(newUser.pin)) {
      toast({
        title: "Invalid PIN",
        description: "PIN must be 4-6 digits",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/qdata/api/auth/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "✓ User Created",
          description: `User ${newUser.username} created successfully`,
        });
        setDialogOpen(false);
        setNewUser({ username: "", password: "", pin: "" });
        fetchUsers();
      } else {
        toast({
          title: "✗ Failed",
          description: data.error || "Failed to create user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Create user error:", error);
      toast({
        title: "✗ Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="border-slate-800 bg-slate-900/50 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <Users className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">User Management</h2>
            <p className="text-sm text-slate-400">Manage QData users and permissions</p>
          </div>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 w-full sm:w-auto">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-900 border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-white">Create New User</DialogTitle>
              <DialogDescription className="text-slate-400">
                Add a new user to QData. They will be able to login and manage databases.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="newUsername" className="text-slate-300">
                  Username
                </Label>
                <Input
                  id="newUsername"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  required
                  minLength={3}
                  maxLength={20}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                    minLength={8}
                    className="pr-10 bg-slate-800 border-slate-700 text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPin" className="text-slate-300">
                  PIN (4-6 digits)
                </Label>
                <Input
                  id="newPin"
                  type="password"
                  value={newUser.pin}
                  onChange={(e) => setNewUser({ ...newUser, pin: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                  required
                  pattern="\d{4,6}"
                  maxLength={6}
                  className="bg-slate-800 border-slate-700 text-white text-center text-xl tracking-widest"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="flex-1 border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500"
                >
                  Create User
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card
              key={user.id}
              className="border-slate-800 bg-slate-800/50 p-3 sm:p-4 hover:bg-slate-800/70 transition-colors"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:justify-between">
                <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                  <div
                    className={`p-2 rounded-lg ${
                      user.role === "admin"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-blue-500/10 text-blue-500"
                    }`}
                  >
                    {user.role === "admin" ? (
                      <Shield className="h-5 w-5" />
                    ) : (
                      <Users className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-medium truncate">{user.username}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          user.role === "admin"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {user.role}
                      </span>
                      {!user.isActive && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:gap-4 mt-1 text-xs text-slate-400">
                      <span>Created: {formatDate(user.createdAt)}</span>
                      {user.lastLogin && <span>Last login: {formatDate(user.lastLogin)}</span>}
                      {user.createdBy && <span>By: {user.createdBy}</span>}
                    </div>
                  </div>
                </div>

                {user.role !== "admin" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    onClick={() => {
                      // TODO: Implement delete user
                      toast({
                        title: "Feature Coming Soon",
                        description: "User deletion will be implemented",
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No users found</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
