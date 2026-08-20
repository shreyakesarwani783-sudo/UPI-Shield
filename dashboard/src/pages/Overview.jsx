import { useEffect, useState } from "react";
import { getStats } from "../api/dashboardClient";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";

const COLORS = ["#2ed573", "#ff4757", "#ffc800", "#ff7f50"];

export default function Overview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(res => setStats(res.data)).catch(console.error);
  }, []);

  if (!stats) return <div style={{color: "#6edcb4"}}>Loading...</div>;

  const pieData = [
    { name: "Safe", value: stats.safe },
    { name: "Flagged", value: stats.flagged },
  ];

  const barData = [
    { name: "Total Scans", value: stats.total_scans },
    { name: "Flagged", value: stats.flagged },
    { name: "Safe", value: stats.safe },
    { name: "Reports", value: stats.reports },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>📊 Overview</h1>
        <p>Real-time UPI Shield statistics</p>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total Scans</div>
          <div className="value">{stats.total_scans}</div>
          <div className="sub">All time</div>
        </div>
        <div className="stat-card">
          <div className="label">Flagged Sites</div>
          <div className="value" style={{color: "#ff4757"}}>{stats.flagged}</div>
          <div className="sub">Phishing detected</div>
        </div>
        <div className="stat-card">
          <div className="label">Safe Sites</div>
          <div className="value" style={{color: "#2ed573"}}>{stats.safe}</div>
          <div className="sub">Verified safe</div>
        </div>
        <div className="stat-card">
          <div className="label">User Reports</div>
          <div className="value" style={{color: "#ffc800"}}>{stats.reports}</div>
          <div className="sub">Community reports</div>
        </div>
        <div className="stat-card">
          <div className="label">ML Accuracy</div>
          <div className="value">{stats.accuracy}%</div>
          <div className="sub">{stats.dataset_size?.toLocaleString()} URLs trained</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
        <div className="chart-container">
          <h3>Safe vs Flagged</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80}
                dataKey="value" label={({name, value}) => `${name}: ${value}`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{background: "#0d2e24", border: "1px solid #6edcb4", borderRadius: "8px"}} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Scan Summary</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(110,220,180,0.1)" />
              <XAxis dataKey="name" tick={{fill: "#6edcb4", fontSize: 11}} />
              <YAxis tick={{fill: "#6edcb4", fontSize: 11}} />
              <Tooltip contentStyle={{background: "#0d2e24", border: "1px solid #6edcb4", borderRadius: "8px"}} />
              <Bar dataKey="value" fill="#6edcb4" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}