"use client";

import { useState, useEffect } from "react";
import { Table, Loader2, RefreshCw, Plus, Save, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

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
  const pageSize = 50;
  const { toast } = useToast();

  useEffect(() => {
    fetchTableData();
    fetchTableStructure();
  }, [database, table, page]);

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
                  className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 flex-1 sm:flex-initial"
                >
                  <RefreshCw className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-700 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 flex-1 sm:flex-initial"
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
                            className={`px-4 py-3 text-sm font-mono max-w-xs ${
                              isEditable ? 'cursor-pointer' : ''
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
                                className="w-full bg-slate-700 text-white px-2 py-1 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    </div>
  );
}
