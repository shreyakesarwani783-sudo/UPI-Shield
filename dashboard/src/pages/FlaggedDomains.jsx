import { useState } from "react";
import { scanUrl } from "../api/dashboardClient";

const SAMPLE_DATA = [
  { url: "https://paytrn.com", score: 75, level: "Critical", date: "2026-08-20" },
  { url: "https://sbi-secure-login.com", score: 88, level: "Critical", date: "2026-08-20" },
  { url: "https://phonepe-verify.net", score: 72, level: "Warning", date: "2026-08-19" },
  { url: "https://hdfc-bank-update.com", score: 65, level: "Warning", date: "2026-08-19" },
  { url: "https://paytm-kyc-update.in", score: 80, level: "Critical", date: "2026-08-18" },
];

export default function FlaggedDomains() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await scanUrl(url);
      setResult(res.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1>🚨 Flagged Domains</h1>
        <p>Known phishing and suspicious sites</p>
      </div>

      {/* Live Scanner */}
      <div className="chart-container" style={{marginBottom: "24px"}}>
        <h3>🔍 Live URL Scanner</h3>
        <div style={{display: "flex", gap: "12px", marginBottom: "16px"}}>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Enter URL to scan..."
            style={{
              flex: 1, padding: "10px 14px", background: "#0a1a14",
              border: "1px solid rgba(110,220,180,0.3)", borderRadius: "8px",
              color: "#fff", fontSize: "13px"
            }}
          />
          <button onClick={handleScan} disabled={loading} style={{
            padding: "10px 24px", background: "#6edcb4", color: "#0a1a14",
            border: "none", borderRadius: "8px", fontWeight: "700",
            cursor: "pointer", fontSize: "13px"
          }}>
            {loading ? "Scanning..." : "Scan"}
          </button>
        </div>

        {result && (
          <div style={{
            background: "#0a1a14", borderRadius: "8px", padding: "16px",
            border: `1px solid ${result.level === "Safe" ? "#2ed573" : "#ff4757"}`
          }}>
            <p style={{color: "#6edcb4", marginBottom: "8px"}}>
              <strong>Level:</strong> {result.level} |
              <strong> Score:</strong> {result.risk_score}/100 |
              <strong> Confidence:</strong> {Math.round(result.confidence * 100)}%
            </p>
            {result.reasons.map((r, i) => (
              <p key={i} style={{fontSize: "12px", color: "#a0c8b0"}}>• {r}</p>
            ))}
            {result.explanation && (
              <p style={{marginTop: "10px", color: "#ffe066", fontSize: "12px"}}>
                💡 {result.explanation}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
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
              <tr key={i}>
                <td style={{color: "#fff", fontFamily: "monospace"}}>{row.url}</td>
                <td>{row.score}/100</td>
                <td>
                  <span className={`badge ${row.level.toLowerCase()}`}>
                    {row.level}
                  </span>
                </td>
                <td>{row.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}