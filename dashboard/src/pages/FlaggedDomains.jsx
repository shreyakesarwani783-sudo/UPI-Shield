import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { scanUrl } from "../api/dashboardClient";
import {
  ShieldAlert, Search, Loader2, CheckCircle2, XCircle, Lightbulb
} from "lucide-react";

const SAMPLE_DATA = [
  { url: "https://paytrn.com", score: 75, level: "Critical", date: "2026-08-20" },
  { url: "https://sbi-secure-login.com", score: 88, level: "Critical", date: "2026-08-20" },
  { url: "https://phonepe-verify.net", score: 72, level: "Warning", date: "2026-08-19" },
  { url: "https://hdfc-bank-update.com", score: 65, level: "Warning", date: "2026-08-19" },
  { url: "https://paytm-kyc-update.in", score: 80, level: "Critical", date: "2026-08-18" },
];

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" }
  })
};

export default function FlaggedDomains() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!url) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await scanUrl(url);
      setResult(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const isSafe = result?.level === "Safe";

  return (
    <div>
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1><ShieldAlert size={22} strokeWidth={2.2} /> Flagged Domains</h1>
        <p>Known phishing and suspicious sites</p>
      </motion.div>

      {/* Live Scanner */}
      <motion.div
        className="chart-container"
        style={{ marginBottom: "24px" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Search size={16} strokeWidth={2.2} /> Live URL Scanner
        </h3>
        <div className="scanner-row">
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleScan()}
            placeholder="Enter URL to scan..."
            className="scanner-input"
          />
          <button onClick={handleScan} disabled={loading} className="scan-btn">
            {loading ? (
              <>
                <Loader2 size={15} className="spin-icon" /> Scanning...
              </>
            ) : (
              <>
                <Search size={15} /> Scan
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              className="scan-result"
              style={{ borderColor: isSafe ? "var(--green)" : "var(--red)" }}
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <p className="scan-result-head">
                {isSafe
                  ? <CheckCircle2 size={16} color="var(--green)" />
                  : <XCircle size={16} color="var(--red)" />}
                <strong>{result.level}</strong>
                <span className="dim">Score: {result.risk_score}/100</span>
                <span className="dim">Confidence: {Math.round(result.confidence * 100)}%</span>
              </p>
              {result.reasons.map((r, i) => (
                <p key={i} className="scan-reason">• {r}</p>
              ))}
              {result.explanation && (
                <p className="scan-explanation">
                  <Lightbulb size={13} /> {result.explanation}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Table */}
      <motion.div
        className="table-container"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Risk Score</th>
              <th>Level</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_DATA.map((row, i) => (
              <motion.tr
                key={i}
                custom={i}
                variants={rowVariants}
                initial="hidden"
                animate="visible"
              >
                <td style={{color: "#fff", fontFamily: "monospace"}}>{row.url}</td>
                <td>{row.score}/100</td>
                <td>
                  <span className={`badge ${row.level.toLowerCase()}`}>
                    {row.level}
                  </span>
                </td>
                <td>{row.date}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}