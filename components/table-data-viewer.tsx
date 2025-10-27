"use client";

import { useState, useEffect } from "react";
import { Table, Loader2, RefreshCw, Plus, Save, X, ChevronLeft, ChevronRight, FileJson, FileSpreadsheet, Copy, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const NON_EDITABLE_COLUMNS = ['id', 'created_at', 'updated_at', 'timestamp'];

interface TableDataViewerProps {
  database: string;
  table: string;
  onBack: () => void;
}

interface EditingCell {
  rowIndex: number;
  column: string;
  value: any;
}

export function TableDataViewer({ database, table, onBack }: TableDataViewerProps) {
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editedRows, setEditedRows] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});
  const [contextMenu, setContextMenu] = useState<{ show: boolean; x: number; y: number; rowIndex: number; rowData: any }>({
    show: false,
    x: 0,
    y: 0,
    rowIndex: -1,
    rowData: null,
  });
  const pageSize = 50;
  const { toast } = useToast();

  useEffect(() => {
    fetchTableData();
    fetchTableStructure();
  }, [database, table, page]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu({ show: false, x: 0, y: 0, rowIndex: -1, rowData: null });
    if (contextMenu.show) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [contextMenu.show]);

  const fetchTableStructure = async () => {
    try {
      const response = await fetch(
        `/qdata/api/table-structure?database=${encodeURIComponent(database)}&table=${encodeURIComponent(table)}`
      );
      const result = await response.json();
      
      if (result.success) {
        setColumns(result.columns.map((col: any) => col.Field));
      }
    } catch (error) {
      console.error("Error fetching table structure:", error);
    }
  };

  const fetchTableData = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const response = await fetch(
        `/qdata/api/table-data?database=${encodeURIComponent(database)}&table=${encodeURIComponent(table)}&limit=${pageSize}&offset=${offset}`
      );
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setTotalRows(result.total || result.data.length);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to fetch table data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching table data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch table data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRows / pageSize);

  const handleCellDoubleClick = (rowIndex: number, column: string, value: any) => {
    // Don't allow editing of id, created_at, updated_at, or timestamp columns
    const nonEditableColumns = ['id', 'created_at', 'updated_at', 'timestamp'];
    if (nonEditableColumns.includes(column.toLowerCase())) {
      return;
    }

    setEditingCell({ rowIndex, column, value });
  };

  const handleCellChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingCell) return;

    const newValue = e.target.value;
    const updatedData = [...data];
    updatedData[editingCell.rowIndex][editingCell.column] = newValue;
    setData(updatedData);
    
    setEditedRows(prev => new Set(prev).add(editingCell.rowIndex));
    setEditingCell({ ...editingCell, value: newValue });
  };

  const handleCellBlur = () => {
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setEditingCell(null);
    } else if (e.key === 'Escape') {
      fetchTableData(); // Reload to cancel changes
      setEditingCell(null);
      setEditedRows(new Set());
    }
  };

  const saveChanges = async () => {
    if (editedRows.size === 0) return;

    setSaving(true);
    try {
      // Get the edited rows
      const rowsToUpdate = Array.from(editedRows).map(rowIndex => data[rowIndex]);

      // Detect primary key (usually 'id', but could be different)
      const primaryKey = columns.find(col => 
        col.toLowerCase() === 'id' || 
        col.toLowerCase().endsWith('_id') || 
        col.toLowerCase() === columns[0]
      ) || columns[0];

      // Update each row
      const updatePromises = rowsToUpdate.map(rowData =>
        fetch('/qdata/api/update-row', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            database,
            table,
            rowData,
            primaryKey,
          }),
        }).then(res => {
          if (!res.ok) throw new Error('Update failed');
          return res.json();
        })
      );

      await Promise.all(updatePromises);

      toast({
        title: "✓ Changes Saved",
        description: `Successfully updated ${editedRows.size} row(s)`,
      });

      setEditedRows(new Set());
      fetchTableData(); // Refresh to show latest data
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "✗ Save Failed",
        description: "Failed to save changes to database",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const cancelChanges = () => {
    fetchTableData();
    setEditedRows(new Set());
    setEditingCell(null);
  };

  const handleAddRow = () => {
    // Initialize new row data with null values for all columns except non-editable ones
    const initialData: Record<string, any> = {};
    columns.forEach(col => {
      if (!NON_EDITABLE_COLUMNS.includes(col.toLowerCase())) {
        initialData[col] = '';
      }
    });
    setNewRowData(initialData);
    setShowAddDialog(true);
  };

  const handleAddRowSubmit = async () => {
    try {
      setSaving(true);
      const response = await fetch('/qdata/api/add-row', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          database,
          table,
          rowData: newRowData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "✓ Row Added",
          description: "Successfully added new row to table",
        });
        setShowAddDialog(false);
        setNewRowData({});
        fetchTableData(); // Refresh to show new row
      } else {
        toast({
          title: "✗ Failed to Add Row",
          description: result.error || "Failed to add row",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding row:", error);
      toast({
        title: "✗ Error",
        description: "Failed to add row to database",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const exportTableData = (format: 'csv' | 'json') => {
    if (data.length === 0) return;

    if (format === 'csv') {
      const csv = [
        columns.join(","),
        ...data.map((row) =>
          columns.map(col => {
            const val = row[col];
            return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
          }).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${database}_${table}_${Date.now()}.csv`;
      a.click();

      toast({
        title: "✓ Exported",
        description: `Exported ${data.length} rows as CSV`,
      });
    } else if (format === 'json') {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${database}_${table}_${Date.now()}.json`;
      a.click();

      toast({
        title: "✓ Exported",
        description: `Exported ${data.length} rows as JSON`,
      });
    }
  };

  const handleRowContextMenu = (e: React.MouseEvent, rowIndex: number, rowData: any) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      rowIndex,
      rowData,
    });
  };

  const handleDuplicateRow = async () => {
    toast({
      title: "📋 Duplicating Row",
      description: "Creating a copy of this row...",
    });
    // TODO: Implement duplicate row
    setTimeout(() => {
      toast({
        title: "Feature Coming Soon",
        description: "Duplicate row will be implemented",
      });
    }, 500);
  };

  const handleDeleteRow = async () => {
    if (!confirm("⚠️ Are you sure you want to delete this row? This action cannot be undone.")) {
      return;
    }

    toast({
      title: "🗑️ Deleting Row",
      description: "Removing row from database...",
      variant: "destructive",
    });
    // TODO: Implement delete row
    setTimeout(() => {
      toast({
        title: "Feature Coming Soon",
        description: "Delete row will be implemented",
      });
    }, 500);
  };

  return (
    <div className="space-y-4">
      <Card className="border-slate-800 bg-slate-900/50 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              onClick={onBack}
              variant="outline"
              size="sm"
              className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-blue-500/20 flex-shrink-0">
              <Table className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                {database}.{table}
              </h3>
              <p className="text-xs text-slate-400">{totalRows} rows</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {editedRows.size > 0 ? (
              <>
                <Button
                  onClick={cancelChanges}
                  variant="outline"
                  size="sm"
                  className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 flex-1 sm:flex-initial"
                >
                  <X className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Cancel</span>
                </Button>
                <Button
                  onClick={saveChanges}
                  disabled={saving}
                  size="sm"
                  className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white flex-1 sm:flex-initial shadow-lg shadow-green-500/30"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 sm:mr-1 animate-spin" />
                      <span className="hidden sm:inline">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 sm:mr-1" />
                      <span className="hidden sm:inline">Save Changes</span>
                      <span className="sm:hidden">Save</span>
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => fetchTableData()}
                  variant="outline"
                  size="sm"
                  className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                >
                  <RefreshCw className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <Button
                  onClick={() => exportTableData('csv')}
                  variant="outline"
                  size="sm"
                  disabled={data.length === 0}
                  className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                >
                  <FileSpreadsheet className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">CSV</span>
                </Button>
                <Button
                  onClick={() => exportTableData('json')}
                  variant="outline"
                  size="sm"
                  disabled={data.length === 0}
                  className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                >
                  <FileJson className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">JSON</span>
                </Button>
                <Button
                  onClick={handleAddRow}
                  variant="outline"
                  size="sm"
                  className="border-blue-700 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                >
                  <Plus className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Add Row</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider w-12">
                    #
                  </th>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.map((row, rowIndex) => {
                  const isRowEdited = editedRows.has(rowIndex);
                  return (
                    <tr
                      key={rowIndex}
                      onContextMenu={(e) => handleRowContextMenu(e, rowIndex, row)}
                      className={`hover:bg-slate-800/50 transition-colors ${
                        isRowEdited ? 'bg-amber-500/10' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {(page - 1) * pageSize + rowIndex + 1}
                      </td>
                      {columns.map((column) => {
                        const isEditing =
                          editingCell?.rowIndex === rowIndex &&
                          editingCell?.column === column;
                        const isEditable = !NON_EDITABLE_COLUMNS.includes(
                          column.toLowerCase()
                        );
                        const cellValue = row[column];

                        return (
                          <td
                            key={column}
                            className={`px-4 py-3 text-sm font-mono max-w-xs transition-all duration-200 ease-out ${
                              isEditable ? 'cursor-pointer hover:bg-slate-800/30' : ''
                            }`}
                            onDoubleClick={() =>
                              isEditable &&
                              handleCellDoubleClick(rowIndex, column, cellValue)
                            }
                            title={isEditable ? 'Double-click to edit' : String(cellValue)}
                          >
                            {isEditing ? (
                              <input
                                type="text"
                                value={editingCell.value ?? ''}
                                onChange={handleCellChange}
                                onBlur={handleCellBlur}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                className="w-full bg-slate-700 text-white px-2 py-1 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-top-1"
                              />
                            ) : cellValue === null ? (
                              <span className="text-slate-500 italic">NULL</span>
                            ) : (
                              <span className={`${isEditable ? 'text-white' : 'text-slate-400'} truncate block`}>
                                {String(cellValue)}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <Table className="mx-auto h-12 w-12 text-slate-600 mb-2" />
            <p className="text-slate-400">No data in this table</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-800 gap-3">
            <div className="text-xs sm:text-sm text-slate-400 text-center sm:text-left">
              Page {page} of {totalPages} • Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, totalRows)} of {totalRows} rows
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                variant="outline"
                size="sm"
                className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 sm:mr-0" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <Button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                variant="outline"
                size="sm"
                className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4 sm:ml-0" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add Row Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add New Row to {table}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {columns
              .filter(col => !NON_EDITABLE_COLUMNS.includes(col.toLowerCase()))
              .map((column) => (
                <div key={column} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={column} className="text-right text-slate-300">
                    {column}
                  </Label>
                  <Input
                    id={column}
                    value={newRowData[column] || ''}
                    onChange={(e) => setNewRowData({ ...newRowData, [column]: e.target.value })}
                    className="col-span-3 bg-slate-800 border-slate-700 text-white"
                    placeholder={`Enter ${column}`}
                  />
                </div>
              ))}
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setNewRowData({});
              }}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddRowSubmit}
              disabled={saving}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Row
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Row Context Menu */}
      {contextMenu.show && (
        <div
          className="fixed bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-2 z-[9999] min-w-[180px] animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-700">
            <span className="text-xs font-semibold text-slate-400">Row #{(page - 1) * pageSize + contextMenu.rowIndex + 1}</span>
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              onClick={() => {
                // Start editing the first editable column
                const editableColumn = columns.find(col => !NON_EDITABLE_COLUMNS.includes(col.toLowerCase()));
                if (editableColumn) {
                  handleCellDoubleClick(contextMenu.rowIndex, editableColumn, contextMenu.rowData[editableColumn]);
                }
                setContextMenu({ show: false, x: 0, y: 0, rowIndex: -1, rowData: null });
              }}
              className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-3 transition-colors"
            >
              <Edit2 className="h-4 w-4 text-blue-400" />
              <span>Edit Row</span>
            </button>
            <button
              onClick={() => {
                handleDuplicateRow();
                setContextMenu({ show: false, x: 0, y: 0, rowIndex: -1, rowData: null });
              }}
              className="w-full px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-3 transition-colors"
            >
              <Copy className="h-4 w-4 text-purple-400" />
              <span>Duplicate Row</span>
            </button>
          </div>

          <div className="border-t border-slate-700 my-1"></div>

          {/* Dangerous Actions */}
          <div className="py-1">
            <button
              onClick={() => {
                handleDeleteRow();
                setContextMenu({ show: false, x: 0, y: 0, rowIndex: -1, rowData: null });
              }}
              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-3 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Row</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
