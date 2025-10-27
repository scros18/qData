"use client";

import { useState, useEffect } from "react";
import * as React from "react";
import { Database, Table2, Zap, Moon, Sun, Search, Plus, Loader2, LogOut, Users as UsersIcon, Settings, Activity, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { ConnectionDialog } from "./connection-dialog";
import { QueryEditor } from "./query-editor";
import { TableBrowser } from "./table-browser";
import { TableDataViewer } from "./table-data-viewer";
import { UserManagement } from "./user-management";
import { AuditLogs } from "./audit-logs";
import { SystemPerformance } from "./system-performance";
import { useToast } from "@/hooks/use-toast";
import { SecurityBadge } from "./security-badge";

interface DatabaseDashboardProps {
  onLogout: () => void;
}

export function DatabaseDashboard({ onLogout }: DatabaseDashboardProps) {
  const [connected, setConnected] = useState(false);
  const [databases, setDatabases] = useState<string[]>([]);
  const [loadingDatabases, setLoadingDatabases] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"query" | "browse" | "users" | "logs" | "performance">("browse");
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    fetchUserInfo();
    
    // Check if there's a saved connection and auto-connect
    const savedConnection = localStorage.getItem('qdata_connection');
    if (savedConnection) {
      try {
        const config = JSON.parse(savedConnection);
        // Optionally auto-connect on load
        // autoConnect(config);
      } catch (e) {
        console.error('Failed to parse saved connection', e);
      }
    }
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("/qdata/api/auth/session");
      const data = await response.json();
      if (data.authenticated && data.user) {
        setUsername(data.user.username);
        setUserRole(data.user.role);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  // Fetch databases after connection
  useEffect(() => {
    if (connected) {
      fetchDatabases();
    }
  }, [connected]);

  const fetchDatabases = async () => {
    setLoadingDatabases(true);
    try {
      const response = await fetch("/qdata/api/databases");
      const data = await response.json();
      
      if (data.success) {
        setDatabases(data.databases);
      } else {
        // Check if reconnection is needed
        if (data.needsReconnect) {
          setConnected(false);
          toast({
            title: "Connection Lost",
            description: "Please reconnect to the database",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to fetch databases",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching databases:", error);
      toast({
        title: "Error",
        description: "Failed to fetch databases",
        variant: "destructive",
      });
    } finally {
      setLoadingDatabases(false);
    }
  };

  const handleConnect = () => {
    setConnected(true);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setDatabases([]);
    setSelectedDatabase(null);
    setSelectedTable(null);
    // Optionally clear saved credentials
    // localStorage.removeItem('qdata_connection');
  };

  const filteredDatabases = databases.filter((db) =>
    db.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="relative border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl z-50">
        <div className="container flex h-14 sm:h-16 items-center px-3 sm:px-4">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Simple Q Logo */}
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-sky-500 shadow-lg shadow-sky-500/50 hover:shadow-sky-500/70 transition-all">
              <span className="text-white font-bold text-lg sm:text-xl">Q</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">QData</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Security Badge */}
            <SecurityBadge />

            {/* User Info - Desktop Only */}
            {username && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700">
                <span className="text-xs text-slate-400">Logged in as:</span>
                <span className="text-sm font-medium text-white">{username}</span>
                {userRole === "admin" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                    Admin
                  </span>
                )}
              </div>
            )}

            {/* Connection Status Badge - Desktop */}
            {connected && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-slate-300">Connected</span>
              </div>
            )}

            {/* Disconnect Button */}
            {connected && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                className="border-slate-700 text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500 text-xs px-2 sm:px-3"
              >
                <span className="hidden sm:inline">Disconnect</span>
                <span className="sm:hidden">✕</span>
              </Button>
            )}
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-slate-300 hover:text-white hover:bg-slate-800 h-8 w-8 sm:h-10 sm:w-10"
            >
              {mounted && theme === "dark" ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="text-slate-300 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 sm:h-10 sm:w-10"
              title="Logout"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            {/* Connect Button */}
            {!connected && (
              <ConnectionDialog
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />
            )}
          </div>
        </div>
      </header>

      {!connected ? (
        // Welcome Screen
        <div className="flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-2xl border-slate-800 bg-slate-900/50 p-6 sm:p-12 text-center backdrop-blur-xl">
            <div className="mx-auto mb-4 sm:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-sky-500 shadow-lg shadow-sky-500/50">
              <span className="text-white font-bold text-4xl sm:text-5xl">Q</span>
            </div>
            <h2 className="mb-2 sm:mb-3 text-2xl sm:text-3xl font-bold text-white">
              Welcome to QData
            </h2>
            <p className="mb-6 sm:mb-8 text-base sm:text-lg text-slate-400">
              Simple, beautiful MySQL database management
            </p>
            <div className="mb-6 sm:mb-8 grid gap-3 sm:gap-4 text-left grid-cols-1 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 sm:p-4">
                <Zap className="mb-2 h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                <h3 className="mb-1 text-sm sm:text-base font-semibold text-white">Lightning Fast</h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Optimized for speed and performance
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 sm:p-4">
                <Table2 className="mb-2 h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
                <h3 className="mb-1 text-sm sm:text-base font-semibold text-white">Modern UI</h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Beautiful, intuitive interface
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 sm:p-4">
                <Database className="mb-2 h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                <h3 className="mb-1 text-sm sm:text-base font-semibold text-white">Powerful Tools</h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Everything you need to manage MySQL
                </p>
              </div>
            </div>
            <ConnectionDialog
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
            >
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Plus className="mr-2 h-5 w-5" />
                Connect to Database
              </Button>
            </ConnectionDialog>
          </Card>
        </div>
      ) : (
        // Main Dashboard
        <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
          {/* Sidebar */}
          <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/30 backdrop-blur-xl overflow-y-auto max-h-48 md:max-h-none">
            <div className="p-3 sm:p-4">
              <div className="relative mb-3 sm:mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search databases..."
                  className="pl-9 border-slate-800 bg-slate-900/50 text-sm h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {loadingDatabases ? (
                <div className="flex items-center justify-center py-6 sm:py-8">
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-blue-500" />
                </div>
              ) : filteredDatabases.length > 0 ? (
                <div className="space-y-1">
                  <p className="mb-2 text-xs font-semibold text-slate-400 uppercase">
                    Databases ({filteredDatabases.length})
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-1">
                    {filteredDatabases.map((db) => (
                      <button
                        key={db}
                        onClick={() => {
                          setSelectedDatabase(db);
                          setSelectedTable(null);
                          setActiveTab("browse"); // Always switch to Browse tab when selecting a database
                        }}
                        className={`w-full rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-left text-xs sm:text-sm transition-colors ${
                          selectedDatabase === db
                            ? "bg-blue-500/20 text-blue-400 font-medium"
                            : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Database className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{db}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-6 sm:py-8 text-center">
                  <Database className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-slate-600 mb-2" />
                  <p className="text-xs sm:text-sm text-slate-400">
                    {searchQuery ? "No databases found" : "No databases available"}
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex flex-1 flex-col overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-slate-800 bg-slate-950/30 backdrop-blur-xl">
              <div className="flex flex-wrap gap-1 px-3 sm:px-4 pt-2">
                <button
                  onClick={() => setActiveTab("browse")}
                  className={`rounded-t-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === "browse"
                      ? "bg-slate-900/50 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Table2 className="h-4 w-4 inline mr-1.5" />
                  <span>Browse</span>
                </button>
                <button
                  onClick={() => setActiveTab("query")}
                  className={`rounded-t-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === "query"
                      ? "bg-slate-900/50 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Zap className="h-4 w-4 inline mr-1.5" />
                  <span>Query</span>
                </button>
                {userRole === "admin" && (
                  <button
                    onClick={() => setActiveTab("users")}
                    className={`rounded-t-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                      activeTab === "users"
                        ? "bg-slate-900/50 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <UsersIcon className="h-4 w-4 inline mr-1.5" />
                    <span>Users</span>
                  </button>
                )}
                <button
                  onClick={() => setActiveTab("logs")}
                  className={`rounded-t-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === "logs"
                      ? "bg-slate-900/50 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Activity className="h-4 w-4 inline mr-1.5" />
                  <span>Logs</span>
                </button>
                <button
                  onClick={() => setActiveTab("performance")}
                  className={`rounded-t-lg px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors ${
                    activeTab === "performance"
                      ? "bg-slate-900/50 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Gauge className="h-4 w-4 inline mr-1.5" />
                  <span>Performance</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              <div className={activeTab === "performance" ? "h-full overflow-hidden" : "h-full overflow-auto p-3 sm:p-4 md:p-6"}>
                {activeTab === "users" ? (
                  <UserManagement />
                ) : activeTab === "logs" ? (
                  <AuditLogs />
                ) : activeTab === "performance" ? (
                  <SystemPerformance />
                ) : activeTab === "browse" ? (
                selectedTable && selectedDatabase ? (
                  <TableDataViewer
                    database={selectedDatabase}
                    table={selectedTable}
                    onBack={() => setSelectedTable(null)}
                  />
                ) : (
                  <TableBrowser
                    database={selectedDatabase}
                    onTableSelect={(tableName) => setSelectedTable(tableName)}
                  />
                )
              ) : (
                <QueryEditor />
              )}
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
