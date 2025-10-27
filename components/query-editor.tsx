"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Loader2, Copy, Download, Trash2, CheckCircle2, XCircle, Terminal, History, FileJson, FileSpreadsheet, Clock, Search, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface QueryHistoryEntry {
  id: string;
  query: string;
  timestamp: string;
  duration: number;
  status: 'success' | 'error';
  rowsAffected?: number;
  error?: string;
}

export function QueryEditor() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [queryTime, setQueryTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<QueryHistoryEntry[]>([]);
  const [historySearch, setHistorySearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (showHistory) {
      fetchHistory();
    }
  }, [showHistory]);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/qdata/api/query-history?limit=50');
      const data = await response.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const loadFromHistory = (historyQuery: string) => {
    setQuery(historyQuery);
    setShowHistory(false);
    toast({
      title: "✓ Query Loaded",
      description: "Query loaded from history",
    });
  };

  const executeQuery = async () => {
    if (!query.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a SQL query to execute",
        variant: "destructive",
      });
      return;
    }

    // Security warning for dangerous operations
    const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'ALTER'];
    const upperQuery = query.trim().toUpperCase();
    const hasDangerousOp = dangerousKeywords.some(keyword => 
      upperQuery.includes(keyword)
    );

    if (hasDangerousOp) {
      const confirmed = window.confirm(
        "⚠️ WARNING: This query contains potentially destructive operations (DROP/DELETE/TRUNCATE/ALTER).\n\n" +
        "This action cannot be undone!\n\n" +
        "Are you sure you want to proceed?"
      );
      
      if (!confirmed) {
        return;
      }
    }

    setLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      const response = await fetch("/qdata/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await response.json();
      const endTime = performance.now();
      setQueryTime(endTime - startTime);

      if (data.success) {
        setResults(data.results);
        setError(null);
        toast({
          title: "✓ Query Executed",
          description: `Completed in ${(endTime - startTime).toFixed(2)}ms`,
        });
      } else {
        setError(data.error || "Query execution failed");
        setResults(null);
        toast({
          title: "✗ Query Failed",
          description: data.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to execute query");
      setResults(null);
      toast({
        title: "✗ Execution Error",
        description: err.message || "Failed to execute query",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyQuery = () => {
    navigator.clipboard.writeText(query);
    toast({
      title: "✓ Copied",
      description: "Query copied to clipboard",
    });
  };

  const clearQuery = () => {
    setQuery("");
    setResults(null);
    setError(null);
    setQueryTime(null);
  };

  const exportResults = (format: 'csv' | 'json') => {
    if (!results || !Array.isArray(results) || results.length === 0) return;

    if (format === 'csv') {
      const csv = [
        Object.keys(results[0]).join(","),
        ...results.map((row) => 
          Object.values(row).map(val => 
            typeof val === 'string' && val.includes(',') ? `"${val}"` : val
          ).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `query-results-${Date.now()}.csv`;
      a.click();

      toast({
        title: "✓ Exported",
        description: "Results exported as CSV",
      });
    } else if (format === 'json') {
      const json = JSON.stringify(results, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `query-results-${Date.now()}.json`;
      a.click();

      toast({
        title: "✓ Exported",
        description: "Results exported as JSON",
      });
    }
  };

  const handleImportSQL = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.sql')) {
      toast({
        title: "❌ Invalid File",
        description: "Please select a .sql file",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      setQuery(text);
      toast({
        title: "✓ SQL File Loaded",
        description: `Loaded ${file.name} (${Math.round(text.length / 1024)}KB)`,
      });
      
      // Reset the input so the same file can be selected again
      e.target.value = '';
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to read SQL file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input for SQL import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".sql"
        className="hidden"
      />
      
      {/* Query Input - Terminal Style */}
      <Card className="border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-0 overflow-hidden shadow-2xl">
        {/* Terminal Header */}
        <div className="flex items-center justify-between bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors cursor-pointer"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 transition-colors cursor-pointer"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 transition-colors cursor-pointer"></div>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Terminal className="h-4 w-4" />
              <span className="text-sm font-mono hidden sm:inline">SQL Terminal</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowHistory(!showHistory)}
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <History className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">History</span>
            </Button>
            <Button
              onClick={handleImportSQL}
              variant="ghost"
              size="sm"
              className="hidden md:flex h-7 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Upload className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Import SQL</span>
            </Button>
            <Button
              onClick={copyQuery}
              variant="ghost"
              size="sm"
              disabled={!query.trim()}
              className="h-7 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Copy className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Copy</span>
            </Button>
            <Button
              onClick={clearQuery}
              variant="ghost"
              size="sm"
              disabled={!query.trim() && !results}
              className="h-7 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <Trash2 className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-4 sm:p-6">
          <div className="mb-3 flex items-center gap-2 text-emerald-400 font-mono text-sm">
            <span className="text-emerald-500">mysql&gt;</span>
            <span className="text-slate-500 text-xs sm:text-sm">Ready to execute queries...</span>
          </div>
          
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SELECT * FROM users WHERE id = 1;&#10;&#10;-- Your SQL magic happens here...&#10;-- Press Ctrl/Cmd + Enter to execute"
            className="w-full min-h-[180px] sm:min-h-[240px] resize-none rounded-lg border border-slate-700/50 bg-slate-950/50 px-4 py-3 font-mono text-sm text-slate-100 placeholder-slate-600 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                executeQuery();
              }
            }}
          />

          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono">
                Ctrl/⌘
              </kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-400 font-mono">
                Enter
              </kbd>
              <span className="hidden sm:inline">to execute</span>
            </div>
            <Button
              onClick={executeQuery}
              disabled={loading || !query.trim()}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Executing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Query
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Query Status */}
      {(queryTime !== null || error) && (
        <Card className="border-slate-800 bg-slate-900/50 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {error ? (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/20">
                    <XCircle className="h-4 w-4 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-400">Query Failed</p>
                    <p className="text-xs text-slate-500 break-all">{error}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-400">Query Successful</p>
                    <p className="text-xs text-slate-500">
                      Executed in {queryTime?.toFixed(2)}ms
                    </p>
                  </div>
                </>
              )}
            </div>
            {results && Array.isArray(results) && results.length > 0 && (
              <div className="flex gap-2">
                <Button
                  onClick={() => exportResults('csv')}
                  variant="outline"
                  size="sm"
                  className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button
                  onClick={() => exportResults('json')}
                  variant="outline"
                  size="sm"
                  className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  JSON
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Results Table */}
      {results && (
        <Card className="border-slate-800 bg-slate-900/50 p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Results</h3>
            <span className="text-sm text-slate-400">
              {Array.isArray(results) ? results.length : 0} row{results.length !== 1 ? "s" : ""}
            </span>
          </div>

          {Array.isArray(results) && results.length > 0 ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        #
                      </th>
                      {Object.keys(results[0]).map((column) => (
                        <th
                          key={column}
                          className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider whitespace-nowrap"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {results.map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-3 sm:px-4 py-3 text-sm text-slate-500">
                          {rowIndex + 1}
                        </td>
                        {Object.keys(results[0]).map((column) => (
                          <td
                            key={column}
                            className="px-3 sm:px-4 py-3 text-sm text-white font-mono max-w-xs truncate"
                            title={String(row[column])}
                          >
                            {row[column] === null ? (
                              <span className="text-slate-500 italic">NULL</span>
                            ) : (
                              String(row[column])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-2" />
              <p className="text-slate-400">
                {typeof results === "object" && "affectedRows" in results
                  ? `Query executed successfully. ${results.affectedRows} row(s) affected.`
                  : "Query executed successfully."}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Sample Queries */}
      {!results && !error && (
        <Card className="border-slate-800 bg-slate-900/50 p-4 sm:p-6">
          <h3 className="mb-4 text-sm font-semibold text-white">💡 Sample Queries</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { label: "Select all", query: "SELECT * FROM users LIMIT 10;" },
              { label: "Count rows", query: "SELECT COUNT(*) as total FROM users;" },
              { label: "Show databases", query: "SHOW DATABASES;" },
              { label: "Show tables", query: "SHOW TABLES;" },
            ].map((sample) => (
              <button
                key={sample.label}
                onClick={() => setQuery(sample.query)}
                className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-left transition-all hover:border-blue-500 hover:bg-slate-800"
              >
                <p className="mb-1 text-xs font-medium text-slate-400">{sample.label}</p>
                <code className="text-xs text-blue-400 break-all">{sample.query}</code>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Query History Panel */}
      {showHistory && (
        <Card className="border-slate-800 bg-slate-900/50 p-4 sm:p-6 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Query History</h3>
              <span className="text-xs text-slate-500">({history.length} queries)</span>
            </div>
            <Button
              onClick={() => setShowHistory(false)}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search queries..."
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>

          {/* History List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {history
              .filter(h => h.query.toLowerCase().includes(historySearch.toLowerCase()))
              .map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => loadFromHistory(entry.query)}
                  className="p-3 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500 cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <code className="text-sm text-blue-400 font-mono flex-1 truncate group-hover:text-blue-300">
                      {entry.query.length > 100 ? entry.query.substring(0, 100) + '...' : entry.query}
                    </code>
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                      entry.status === 'success' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {entry.status === 'success' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {entry.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{new Date(entry.timestamp).toLocaleString()}</span>
                    <span>•</span>
                    <span>{entry.duration.toFixed(0)}ms</span>
                    {entry.rowsAffected !== undefined && (
                      <>
                        <span>•</span>
                        <span>{entry.rowsAffected} rows</span>
                      </>
                    )}
                  </div>
                  {entry.error && (
                    <p className="mt-2 text-xs text-red-400 truncate">{entry.error}</p>
                  )}
                </div>
              ))}
            {history.filter(h => h.query.toLowerCase().includes(historySearch.toLowerCase())).length === 0 && (
              <div className="py-8 text-center">
                <History className="mx-auto h-12 w-12 text-slate-600 mb-2" />
                <p className="text-slate-400">No queries in history</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
