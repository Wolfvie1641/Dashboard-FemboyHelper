import React, { useState, useEffect } from "react";
import { Zap, Database, RefreshCcw } from "lucide-react";

export default function DashboardHome() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = () => {
      fetch("https://backend-femboyhelper-production.up.railway.app/stats")
        .then((res) => res.json())
        .then(setStats);
    };
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);
  if (!stats) return <p className="text-gray-400">Loading stats…</p>;

  return (
    <div className="space-y-6">
      {/* ACTIVITY GRAPH */}
      <div className="glass bg-white/5 p-6 rounded-xl border border-white/10">
        <h2 className="text-xl font-bold mb-4">📊 Activity Metrics</h2>
        <div className="h-48 bg-black/20 rounded-lg">
          {/* Chart Placeholder */}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="glass bg-white/5 p-6 rounded-xl border border-white/10">
        <h2 className="text-xl font-bold mb-4">⚡ Quick Actions</h2>

        <div className="flex gap-4">

          <QuickButton
            label="Emergency Restart"
            color="red"
            icon={<Zap size={18} />}
          />

          <QuickButton
            label="Sync Commands"
            color="blue"
            icon={<RefreshCcw size={18} />}
            onClick={() => {
                fetch("http://localhost:3001/reload", { method: "POST" })
                .then(r => r.json())
                .then(() => alert("Commands synced!"));
            }}
         />


          <QuickButton
            label="Backup DB"
            color="purple"
            icon={<Database size={18} />}
          />

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  const colors = {
    blue: "bg-blue-600/20 text-blue-400",
    purple: "bg-purple-600/20 text-purple-400",
    yellow: "bg-yellow-600/20 text-yellow-400",
    green: "bg-green-600/20 text-green-400",
  };

  return (
    <div className={`glass p-5 rounded-xl border border-white/10 ${colors[color]}`}>
      <p className="text-md opacity-70">{title}</p>
      <h3 className="text-3xl font-bold mt-2">{value}</h3>
    </div>
  );
}

function QuickButton({ label, icon, color, onClick }) {
  const colors = {
    red: "border-red-700/40 bg-red-900/20 text-red-400 hover:bg-red-900/40",
    blue: "border-blue-700/40 bg-blue-900/20 text-blue-400 hover:bg-blue-900/40",
    purple: "border-purple-700/40 bg-purple-900/20 text-purple-400 hover:bg-purple-900/40",
  };

  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 rounded-lg border transition ${colors[color]} flex items-center gap-2`}
    >
      {icon}
      {label}
    </button>
  );
}
