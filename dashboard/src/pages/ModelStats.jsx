import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getStats } from "../api/dashboardClient";
import {
  BrainCircuit, Target, Crosshair, Gauge, Database,
  CheckCircle2, XCircle, AlertTriangle, Layers
} from "lucide-react";

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
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: "easeOut" }
  })
};

export default function ModelStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(res => setStats(res.data)).catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <span>Loading model stats...</span>
      </div>
    );
  }

  const cards = [
    { icon: Gauge, label: "Accuracy", value: stats.accuracy, decimals: 2, suffix: "%", color: "var(--green)" },
    { icon: Crosshair, label: "Precision", value: stats.precision, decimals: 2, suffix: "%", color: "var(--green)" },
    { icon: Target, label: "Recall", value: stats.recall, decimals: 2, suffix: "%", color: "var(--green)" },
    { icon: Layers, label: "F1 Score", value: stats.f1, decimals: 2, suffix: "%", color: "var(--green)" },
    { icon: Database, label: "Dataset Size", value: stats.dataset_size, sub: "Total URLs", color: "var(--green)" },
  ];

  const matrix = [
    { icon: CheckCircle2, value: stats.tn, label: "True Negative", sub: "Correctly identified safe", color: "var(--green)" },
    { icon: XCircle, value: stats.fp, label: "False Positive", sub: "Safe flagged as phishing", color: "var(--red)" },
    { icon: AlertTriangle, value: stats.fn, label: "False Negative", sub: "Phishing missed", color: "var(--yellow)" },
    { icon: CheckCircle2, value: stats.tp, label: "True Positive", sub: "Correctly caught phishing", color: "var(--green)" },
  ];

  const info = [
    ["Algorithm", stats.model],
    ["Training Samples", stats.train_split?.toLocaleString()],
    ["Test Samples", stats.test_split?.toLocaleString()],
    ["Features", stats.features],
    ["Trees", stats.trees],
    ["Max Depth", stats.max_depth],
  ];

  return (
    <div>
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1><BrainCircuit size={22} strokeWidth={2.2} /> Model Statistics</h1>
        <p>Random Forest classifier performance metrics</p>
      </motion.div>

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
              <CountUp value={c.value} decimals={c.decimals} />{c.suffix || ""}
            </div>
            {c.sub && <div className="sub">{c.sub}</div>}
          </motion.div>
        ))}
      </div>

      <motion.div
        className="chart-container"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.45 }}
      >
        <h3>Confusion Matrix</h3>
        <div className="confusion-grid">
          {matrix.map((m, i) => (
            <motion.div
              key={m.label}
              className="confusion-cell"
              style={{ background: `${m.color}1f`, borderColor: m.color }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.35 }}
              whileHover={{ scale: 1.03 }}
            >
              <m.icon size={18} strokeWidth={2} color={m.color} />
              <div className="confusion-value" style={{ color: m.color }}>
                <CountUp value={m.value} />
              </div>
              <div className="confusion-label">{m.label}</div>
              <div className="confusion-sub">{m.sub}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="chart-container"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.45 }}
      >
        <h3>Model Information</h3>
        <table>
          <tbody>
            {info.map(([k, v], i) => (
              <motion.tr
                key={k}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.05, duration: 0.3 }}
              >
                <td>{k}</td>
                <td style={{ color: "#6edcb4" }}>{v}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}