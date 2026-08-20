const REPORTS = [
  { url: "https://sbi-kyc-verify.com", reason: "Fake SBI page asking for OTP", date: "2026-08-20", status: "Pending" },
  { url: "https://phonepe-reward.net", reason: "Fake reward claiming UPI details", date: "2026-08-19", status: "Reviewed" },
  { url: "https://paytm-cashback.in", reason: "Cashback scam page", date: "2026-08-18", status: "Confirmed" },
];

export default function UserReports() {
  return (
    <div>
      <div className="page-header">
        <h1>📝 User Reports</h1>
        <p>Community-reported suspicious sites</p>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Reason</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {REPORTS.map((r, i) => (
              <tr key={i}>
                <td style={{color: "#fff", fontFamily: "monospace", fontSize: "12px"}}>{r.url}</td>
                <td>{r.reason}</td>
                <td>{r.date}</td>
                <td>
                  <span className={`badge ${
                    r.status === "Confirmed" ? "critical" :
                    r.status === "Reviewed" ? "warning" : "caution"
                  }`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}