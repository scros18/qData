import { DatabaseDashboard } from "@/components/database-dashboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <DatabaseDashboard />
    </main>
  );
}
