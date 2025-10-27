"use client";

import { Database as DatabaseIcon, Table, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface TableBrowserProps {
  database: string | null;
  onTableSelect: (tableName: string) => void;
}

export function TableBrowser({ database, onTableSelect }: TableBrowserProps) {
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (database) {
      fetchTables(database);
    }
  }, [database]);

  const fetchTables = async (dbName: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/qdata/api/tables?database=${encodeURIComponent(dbName)}`);
      const data = await response.json();
      
      if (data.success) {
        setTables(data.tables);
      } else {
        // Check if reconnection is needed
        if (data.needsReconnect) {
          toast({
            title: "Connection Lost",
            description: "Please reconnect to the database",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to fetch tables",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tables",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!database) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/50">
        <div className="text-center">
          <DatabaseIcon className="mx-auto h-16 w-16 text-slate-600 mb-4" />
          <h3 className="mb-2 text-lg font-semibold text-white">
            No Database Selected
          </h3>
          <p className="text-slate-400">
            Select a database from the sidebar to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
              <DatabaseIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{database}</h3>
              <p className="text-xs text-slate-400">
                {loading ? "Loading..." : `${tables.length} tables`}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : tables.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tables.map((tableName) => (
              <button
                key={tableName}
                onClick={() => onTableSelect(tableName)}
                className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-left transition-all hover:border-blue-500 hover:bg-slate-800 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <Table className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-medium text-white">{tableName}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Table className="mx-auto h-12 w-12 text-slate-600 mb-2" />
            <p className="text-slate-400">No tables in this database</p>
          </div>
        )}
      </div>
    </div>
  );
}
