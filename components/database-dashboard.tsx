"use client";

import { useState, useEffect } from "react";
import * as React from "react";
import { Database, Table2, Zap, Moon, Sun, Search, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { ConnectionDialog } from "./connection-dialog";
import { QueryEditor } from "./query-editor";
import { TableBrowser } from "./table-browser";
import { useToast } from "@/hooks/use-toast";

export function DatabaseDashboard() {
  const [connected, setConnected] = useState(false);
  const [databases, setDatabases] = useState<string[]>([]);
  const [loadingDatabases, setLoadingDatabases] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDatabase, setSelectedDatabase] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"query" | "browse">("browse");
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    
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
        toast({
          title: "Error",
          description: "Failed to fetch databases",
          variant: "destructive",
        });
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
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
              <Database className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">QData</h1>
              <p className="text-xs text-slate-400">Modern MySQL Admin</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {connected && (
              <>
                <div className="mr-2 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-sm text-slate-300">Connected</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  className="border-slate-700 text-slate-300 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500"
                >
                  Disconnect
                </Button>
              </>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-slate-300 hover:text-white"
            >
              {mounted && theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

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
        <div className="flex flex-1 items-center justify-center">
          <Card className="w-full max-w-2xl border-slate-800 bg-slate-900/50 p-12 text-center backdrop-blur-xl">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
              <Database className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-3 text-3xl font-bold text-white">
              Welcome to QData
            </h2>
            <p className="mb-8 text-lg text-slate-400">
              Simple, beautiful MySQL database management
            </p>
            <div className="mb-8 grid gap-4 text-left sm:grid-cols-3">
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                <Zap className="mb-2 h-6 w-6 text-blue-500" />
                <h3 className="mb-1 font-semibold text-white">Lightning Fast</h3>
                <p className="text-sm text-slate-400">
                  Optimized for speed and performance
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                <Table2 className="mb-2 h-6 w-6 text-purple-500" />
                <h3 className="mb-1 font-semibold text-white">Modern UI</h3>
                <p className="text-sm text-slate-400">
                  Beautiful, intuitive interface
                </p>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                <Database className="mb-2 h-6 w-6 text-green-500" />
                <h3 className="mb-1 font-semibold text-white">Powerful Tools</h3>
                <p className="text-sm text-slate-400">
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
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-64 border-r border-slate-800 bg-slate-950/30 backdrop-blur-xl overflow-y-auto">
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search databases..."
                  className="pl-9 border-slate-800 bg-slate-900/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {loadingDatabases ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : filteredDatabases.length > 0 ? (
                <div className="space-y-1">
                  <p className="mb-2 text-xs font-semibold text-slate-400 uppercase">
                    Databases ({filteredDatabases.length})
                  </p>
                  {filteredDatabases.map((db) => (
                    <button
                      key={db}
                      onClick={() => {
                        setSelectedDatabase(db);
                        setSelectedTable(null);
                      }}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        selectedDatabase === db
                          ? "bg-blue-500/20 text-blue-400 font-medium"
                          : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        <span className="truncate">{db}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Database className="mx-auto h-12 w-12 text-slate-600 mb-2" />
                  <p className="text-sm text-slate-400">
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
              <div className="flex gap-1 px-4 pt-2">
                <button
                  onClick={() => setActiveTab("browse")}
                  className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === "browse"
                      ? "bg-slate-900/50 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Browse
                </button>
                <button
                  onClick={() => setActiveTab("query")}
                  className={`rounded-t-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === "query"
                      ? "bg-slate-900/50 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Query
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6">
              {activeTab === "browse" ? (
                <TableBrowser
                  database={selectedDatabase}
                  table={selectedTable}
                />
              ) : (
                <QueryEditor />
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
