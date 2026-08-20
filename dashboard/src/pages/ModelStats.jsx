export default function ModelStats() {
  const stats = {
    accuracy: 85.39,
    precision: 88.43,
    recall: 56.04,
    f1: 69.0,
    dataset: 549346,
    trainSplit: 439476,
    testSplit: 109870,
    tp: 17533,
    tn: 76290,
    fp: 2295,
    fn: 13752,
  };

  return (
    <div>
      <div className="page-header">
        <h1>🤖 Model Statistics</h1>
        <p>Random Forest classifier performance metrics</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Accuracy</div>
          <div className="value">{stats.accuracy}%</div>
        </div>
        <div className="stat-card">
          <div className="label">Precision</div>
          <div className="value">{stats.precision}%</div>
        </div>
        <div className="stat-card">
          <div className="label">Recall</div>
          <div className="value">{stats.recall}%</div>
        </div>
        <div className="stat-card">
          <div className="label">F1 Score</div>
          <div className="value">{stats.f1}%</div>
        </div>
        <div className="stat-card">
          <div className="label">Dataset Size</div>
          <div className="value">{stats.dataset.toLocaleString()}</div>
          <div className="sub">Total URLs</div>
        </div>
      </div>

      {/* Confusion Matrix */}
      <div className="chart-container">
        <h3>Confusion Matrix</h3>
        <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", maxWidth: "400px"}}>
          <div style={{background: "rgba(46,213,115,0.15)", border: "1px solid #2ed573",
            borderRadius: "8px", padding: "20px", textAlign: "center"}}>
            <div style={{fontSize: "28px", fontWeight: "700", color: "#2ed573"}}>{stats.tn.toLocaleString()}</div>
            <div style={{fontSize: "12px", color: "#a0c8b0", marginTop: "4px"}}>True Negative</div>
            <div style={{fontSize: "11px", color: "#4a7a6a"}}>Correctly identified safe</div>
          </div>
          <div style={{background: "rgba(255,71,87,0.15)", border: "1px solid #ff4757",
            borderRadius: "8px", padding: "20px", textAlign: "center"}}>
            <div style={{fontSize: "28px", fontWeight: "700", color: "#ff4757"}}>{stats.fp.toLocaleString()}</div>
            <div style={{fontSize: "12px", color: "#a0c8b0", marginTop: "4px"}}>False Positive</div>
            <div style={{fontSize: "11px", color: "#4a7a6a"}}>Safe flagged as phishing</div>
          </div>
          <div style={{background: "rgba(255,200,0,0.15)", border: "1px solid #ffc800",
            borderRadius: "8px", padding: "20px", textAlign: "center"}}>
            <div style={{fontSize: "28px", fontWeight: "700", color: "#ffc800"}}>{stats.fn.toLocaleString()}</div>
            <div style={{fontSize: "12px", color: "#a0c8b0", marginTop: "4px"}}>False Negative</div>
            <div style={{fontSize: "11px", color: "#4a7a6a"}}>Phishing missed</div>
          </div>
          <div style={{background: "rgba(46,213,115,0.15)", border: "1px solid #2ed573",
            borderRadius: "8px", padding: "20px", textAlign: "center"}}>
            <div style={{fontSize: "28px", fontWeight: "700", color: "#2ed573"}}>{stats.tp.toLocaleString()}</div>
            <div style={{fontSize: "12px", color: "#a0c8b0", marginTop: "4px"}}>True Positive</div>
            <div style={{fontSize: "11px", color: "#4a7a6a"}}>Correctly caught phishing</div>
          </div>
        </div>
      </div>

      {/* Model Info */}
      <div className="chart-container">
        <h3>Model Information</h3>
        <table>
          <tbody>
            <tr><td>Algorithm</td><td style={{color:"#6edcb4"}}>Random Forest Classifier</td></tr>
            <tr><td>Training Samples</td><td style={{color:"#6edcb4"}}>{stats.trainSplit.toLocaleString()}</td></tr>
            <tr><td>Test Samples</td><td style={{color:"#6edcb4"}}>{stats.testSplit.toLocaleString()}</td></tr>
            <tr><td>Features</td><td style={{color:"#6edcb4"}}>13 URL-based features</td></tr>
            <tr><td>Trees</td><td style={{color:"#6edcb4"}}>100 estimators</td></tr>
            <tr><td>Max Depth</td><td style={{color:"#6edcb4"}}>15</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}