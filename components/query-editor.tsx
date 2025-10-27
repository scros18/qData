"use client";

import { useState } from "react";
import { Play, Loader2, Copy, Download, Trash2, CheckCircle2, XCircle, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

export function QueryEditor() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [queryTime, setQueryTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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

  const exportResults = () => {
    if (!results || !Array.isArray(results) || results.length === 0) return;

    const csv = [
      Object.keys(results[0]).join(","),
      ...results.map((row) => Object.values(row).join(",")),
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
  };

  return (
    <div className="space-y-4">
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
              <Button
                onClick={exportResults}
                variant="outline"
                size="sm"
                className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
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
    </div>
  );
}
