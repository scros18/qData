"use client";

export function QueryEditor() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">SQL Query Editor</h3>
        <textarea
          className="h-48 w-full rounded-md border border-slate-700 bg-slate-800 p-4 font-mono text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Enter your SQL query here..."
        />
        <div className="mt-4 flex justify-end">
          <button className="rounded-md bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white hover:from-blue-600 hover:to-purple-700">
            Run Query
          </button>
        </div>
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">Results</h3>
        <p className="text-slate-400">No results to display</p>
      </div>
    </div>
  );
}
