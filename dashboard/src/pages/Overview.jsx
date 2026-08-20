import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getStats } from "../api/dashboardClient";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";
import {
  LayoutDashboard, ScanLine, ShieldAlert, ShieldCheck,
  MessageSquareWarning, BrainCircuit
} from "lucide-react";

const COLORS = ["#2ed573", "#ff4757", "#ffc800", "#ff7f50"];

// Animated count-up number
function CountUp({ value, decimals = 0 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const target = Number(value) || 0;
    const duration = 900;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value]);

  return <>{decimals ? display.toFixed(decimals) : Math.round(display).toLocaleString()}</>;
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" }
  })
};

export default function Overview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(res => setStats(res.data)).catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <span>Loading dashboard...</span>
      </div>
    );
  }

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

  const cards = [
    { icon: ScanLine, label: "Total Scans", value: stats.total_scans, sub: "All time", color: "var(--green)" },
    { icon: ShieldAlert, label: "Flagged Sites", value: stats.flagged, sub: "Phishing detected", color: "var(--red)" },
    { icon: ShieldCheck, label: "Safe Sites", value: stats.safe, sub: "Verified safe", color: "var(--green)" },
    { icon: MessageSquareWarning, label: "User Reports", value: stats.reports, sub: "Community reports", color: "var(--yellow)" },
    { icon: BrainCircuit, label: "ML Accuracy", value: stats.accuracy, sub: `${stats.dataset_size?.toLocaleString()} URLs trained`, color: "var(--green)", suffix: "%" },
  ];

  return (
    <div>
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1><LayoutDashboard size={22} strokeWidth={2.2} /> Overview</h1>
        <p>Real-time UPI Shield statistics</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {cards.map((c, i) => (
          <motion.div
            className="stat-card"
            key={c.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div className="stat-card-icon" style={{ color: c.color }}>
              <c.icon size={20} strokeWidth={2} />
            </div>
            <div className="label">{c.label}</div>
            <div className="value" style={{ color: c.color }}>
              <CountUp value={c.value} />{c.suffix || ""}
            </div>
            <div className="sub">{c.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
        <motion.div
          className="chart-container"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.45 }}
        >
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
        </motion.div>

        <motion.div
          className="chart-container"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48, duration: 0.45 }}
        >
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
        </motion.div>
      </div>
    </div>
  );
}