"use client";

import { useState, useEffect } from "react";
import { Activity, CheckCircle2, XCircle, Database, Table, Zap, Filter, Trash2, RefreshCw, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  action: string;
  details: string;
  database?: string;
  table?: string;
  status: 'success' | 'error';
  duration?: number;
}

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const url = `/qdata/api/logs?limit=100${filter !== 'all' ? `&status=${filter}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setLogs(data.logs);
      } else {
        toast({
          title: "✗ Failed to Load Logs",
          description: data.error || "Could not fetch audit logs",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast({
        title: "✗ Error",
        description: "Failed to load audit logs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear all audit logs?\n\nThis action cannot be undone!"
    );

    if (!confirmed) return;

    try {
      const response = await fetch("/qdata/api/logs", {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setLogs([]);
        toast({
          title: "✓ Logs Cleared",
          description: "All audit logs have been deleted",
        });
      } else {
        toast({
          title: "✗ Failed",
          description: data.error || "Could not clear logs",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error clearing logs:", error);
      toast({
        title: "✗ Error",
        description: "Failed to clear logs",
        variant: "destructive",
      });
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionIcon = (action: string) => {
    if (action.includes('query') || action.includes('execute')) return <Zap className="h-4 w-4" />;
    if (action.includes('database')) return <Database className="h-4 w-4" />;
    if (action.includes('table')) return <Table className="h-4 w-4" />;
    return <Activity className="h-4 w-4" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('delete') || action.includes('drop')) return 'text-red-400';
    if (action.includes('update') || action.includes('edit')) return 'text-blue-400';
    if (action.includes('create') || action.includes('insert')) return 'text-green-400';
    if (action.includes('query') || action.includes('select')) return 'text-purple-400';
    return 'text-slate-400';
  };

  return (
    <div className="space-y-4">
      <Card className="border-slate-800 bg-slate-900/50 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Audit Logs</h2>
              <p className="text-xs text-slate-400">Track all user actions</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={fetchLogs}
              variant="outline"
              size="sm"
              disabled={loading}
              className="flex-1 sm:flex-none border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
            >
              <RefreshCw className={`h-4 w-4 sm:mr-1 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Button
              onClick={clearLogs}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none border-red-700/50 bg-red-900/20 text-red-400 hover:bg-red-900/40"
            >
              <Trash2 className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 border-b border-slate-800 pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-slate-800 text-white font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('success')}
            className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-1 ${
              filter === 'success'
                ? 'bg-green-500/20 text-green-400 font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            Success
          </button>
          <button
            onClick={() => setFilter('error')}
            className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors flex items-center gap-1 ${
              filter === 'error'
                ? 'bg-red-500/20 text-red-400 font-medium'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <XCircle className="h-3 w-3" />
            Errors
          </button>
        </div>

        {/* Logs List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : logs.length > 0 ? (
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`p-3 sm:p-4 rounded-lg border transition-all hover:border-slate-700 ${
                  log.status === 'error'
                    ? 'bg-red-500/5 border-red-500/20'
                    : 'bg-slate-800/30 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      log.status === 'error'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {log.status === 'error' ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      getActionIcon(log.action)
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className={`text-sm font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </h3>
                      <span className="text-xs text-slate-500 flex items-center gap-1 flex-shrink-0">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-300 mb-2 break-words">
                      {log.details}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {log.username}
                      </span>
                      {log.database && (
                        <span className="flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          {log.database}
                        </span>
                      )}
                      {log.table && (
                        <span className="flex items-center gap-1">
                          <Table className="h-3 w-3" />
                          {log.table}
                        </span>
                      )}
                      {log.duration && (
                        <span className="text-purple-400">
                          {log.duration.toFixed(0)}ms
                        </span>
                      )}
                      {log.status === 'success' && (
                        <CheckCircle2 className="h-3 w-3 text-green-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Activity className="mx-auto h-12 w-12 text-slate-600 mb-2" />
            <p className="text-slate-400">No audit logs yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Actions will be tracked here
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
