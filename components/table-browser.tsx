"use client";

import { Database as DatabaseIcon, Table, Loader2, Trash2, Copy, Download, FileText, Scissors, MoreVertical, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface TableBrowserProps {
  database: string | null;
  onTableSelect: (tableName: string) => void;
}

interface ContextMenuState {
  show: boolean;
  x: number;
  y: number;
  tableName: string;
}

export function TableBrowser({ database, onTableSelect }: TableBrowserProps) {
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    show: false,
    x: 0,
    y: 0,
    tableName: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (database) {
      fetchTables(database);
    }
  }, [database]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = () => setContextMenu({ show: false, x: 0, y: 0, tableName: "" });
    const handleScroll = () => setContextMenu({ show: false, x: 0, y: 0, tableName: "" });
    
    if (contextMenu.show) {
      document.addEventListener("click", handleClick);
      document.addEventListener("scroll", handleScroll, true);
      return () => {
        document.removeEventListener("click", handleClick);
        document.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [contextMenu.show]);

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

  const handleContextMenu = (e: React.MouseEvent, tableName: string) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      tableName,
    });
  };

  const handleCopyTableName = () => {
    navigator.clipboard.writeText(contextMenu.tableName);
    toast({
      title: "✓ Copied",
      description: `Table name "${contextMenu.tableName}" copied to clipboard`,
    });
  };

  const handleExportStructure = async () => {
    toast({
      title: "📥 Exporting Structure",
      description: `Exporting structure for ${contextMenu.tableName}...`,
    });
    // TODO: Implement structure export
    setTimeout(() => {
      toast({
        title: "Feature Coming Soon",
        description: "Export table structure will be implemented",
      });
    }, 500);
  };

  const handleTruncateTable = async () => {
    if (!confirm(`⚠️ Are you sure you want to TRUNCATE table "${contextMenu.tableName}"?\n\nThis will delete ALL data but keep the structure.`)) {
      return;
    }
    
    toast({
      title: "🗑️ Truncating Table",
      description: `Removing all data from ${contextMenu.tableName}...`,
    });
    // TODO: Implement truncate
    setTimeout(() => {
      toast({
        title: "Feature Coming Soon",
        description: "Truncate table will be implemented",
      });
    }, 500);
  };

  const handleDropTable = async () => {
    if (!confirm(`⚠️ DANGER: Are you sure you want to DROP table "${contextMenu.tableName}"?\n\nThis will permanently delete the table and ALL its data. This action CANNOT be undone!`)) {
      return;
    }
    
    const doubleConfirm = prompt(`Type the table name "${contextMenu.tableName}" to confirm deletion:`);
    if (doubleConfirm !== contextMenu.tableName) {
      toast({
        title: "❌ Cancelled",
        description: "Table name did not match. Drop cancelled.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "🗑️ Dropping Table",
      description: `Permanently deleting ${contextMenu.tableName}...`,
      variant: "destructive",
    });
    // TODO: Implement drop table
    setTimeout(() => {
      toast({
        title: "Feature Coming Soon",
        description: "Drop table will be implemented",
      });
    }, 500);
  };

  const handleDuplicateTable = async () => {
    const newName = prompt(`Enter new table name (copy of ${contextMenu.tableName}):`);
    if (!newName) return;

    toast({
      title: "📋 Duplicating Table",
      description: `Creating ${newName} from ${contextMenu.tableName}...`,
    });
    // TODO: Implement duplicate
    setTimeout(() => {
      toast({
        title: "Feature Coming Soon",
        description: "Duplicate table will be implemented",
      });
    }, 500);
  };

  const handleRenameTable = async () => {
    const newName = prompt(`Enter new name for table "${contextMenu.tableName}":`);
    if (!newName) return;

    toast({
      title: "✏️ Renaming Table",
      description: `Renaming ${contextMenu.tableName} to ${newName}...`,
    });
    // TODO: Implement rename
    setTimeout(() => {
      toast({
        title: "Feature Coming Soon",
        description: "Rename table will be implemented",
      });
    }, 500);
  };

  const handleRefreshTables = () => {
    if (database) {
      fetchTables(database);
      toast({
        title: "🔄 Refreshed",
        description: "Table list updated",
      });
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
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 sm:p-6">
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
          <button
            onClick={handleRefreshTables}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm transition-colors"
            title="Refresh tables"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
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
                onContextMenu={(e) => handleContextMenu(e, tableName)}
                className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-left transition-all hover:border-blue-500 hover:bg-slate-800 hover:shadow-lg hover:shadow-blue-500/10 relative group"
              >
                <Table className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-medium text-white flex-1">{tableName}</span>
                <MoreVertical className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
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

      {/* Custom Context Menu */}
      {contextMenu.show && (
        <div
          className="fixed bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-2 z-[9999] min-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Table className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-semibold text-white truncate">{contextMenu.tableName}</span>
            </div>
          </div>

          {/* View/Edit Options */}
          <div className="py-1">
            <button
              onClick={() => {
                onTableSelect(contextMenu.tableName);
                setContextMenu({ show: false, x: 0, y: 0, tableName: "" });
              }}
              className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-3 transition-colors"
            >
              <Table className="h-4 w-4 text-blue-400" />
              <span>Browse Data</span>
            </button>
            <button
              onClick={() => {
                handleCopyTableName();
                setContextMenu({ show: false, x: 0, y: 0, tableName: "" });
              }}
              className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-3 transition-colors"
            >
              <Copy className="h-4 w-4 text-purple-400" />
              <span>Copy Name</span>
            </button>
          </div>

          <div className="border-t border-slate-700 my-1"></div>

          {/* Structure Options */}
          <div className="py-1">
            <button
              onClick={() => {
                handleExportStructure();
                setContextMenu({ show: false, x: 0, y: 0, tableName: "" });
              }}
              className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-3 transition-colors"
            >
              <Download className="h-4 w-4 text-green-400" />
              <span>Export Structure</span>
            </button>
            <button
              onClick={() => {
                handleDuplicateTable();
                setContextMenu({ show: false, x: 0, y: 0, tableName: "" });
              }}
              className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-3 transition-colors"
            >
              <FileText className="h-4 w-4 text-cyan-400" />
              <span>Duplicate Table</span>
            </button>
            <button
              onClick={() => {
                handleRenameTable();
                setContextMenu({ show: false, x: 0, y: 0, tableName: "" });
              }}
              className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-3 transition-colors"
            >
              <FileText className="h-4 w-4 text-yellow-400" />
              <span>Rename Table</span>
            </button>
          </div>

          <div className="border-t border-slate-700 my-1"></div>

          {/* Dangerous Options */}
          <div className="py-1">
            <button
              onClick={() => {
                handleTruncateTable();
                setContextMenu({ show: false, x: 0, y: 0, tableName: "" });
              }}
              className="w-full px-3 py-2 text-left text-sm text-orange-400 hover:bg-orange-500/10 hover:text-orange-300 flex items-center gap-3 transition-colors"
            >
              <Scissors className="h-4 w-4" />
              <span>Truncate (Clear Data)</span>
            </button>
            <button
              onClick={() => {
                handleDropTable();
                setContextMenu({ show: false, x: 0, y: 0, tableName: "" });
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-3 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Drop Table</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
