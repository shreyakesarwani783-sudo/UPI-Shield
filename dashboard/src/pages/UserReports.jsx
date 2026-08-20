import { motion } from "framer-motion";
import { FileText, CheckCircle2, Eye, Clock } from "lucide-react";

const REPORTS = [
  { url: "https://sbi-kyc-verify.com", reason: "Fake SBI page asking for OTP", date: "2026-08-20", status: "Pending" },
  { url: "https://phonepe-reward.net", reason: "Fake reward claiming UPI details", date: "2026-08-19", status: "Reviewed" },
  { url: "https://paytm-cashback.in", reason: "Cashback scam page", date: "2026-08-18", status: "Confirmed" },
];

const statusIcon = {
  Confirmed: CheckCircle2,
  Reviewed: Eye,
  Pending: Clock,
};

const rowVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: "easeOut" }
  })
};

export default function UserReports() {
  return (
    <div>
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1><FileText size={22} strokeWidth={2.2} /> User Reports</h1>
        <p>Community-reported suspicious sites</p>
      </motion.div>

      <motion.div
        className="table-container"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
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
            {REPORTS.map((r, i) => {
              const StatusIcon = statusIcon[r.status] || Clock;
              return (
                <motion.tr
                  key={i}
                  custom={i}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <td style={{color: "#fff", fontFamily: "monospace", fontSize: "12px"}}>{r.url}</td>
                  <td>{r.reason}</td>
                  <td>{r.date}</td>
                  <td>
                    <span className={`badge ${
                      r.status === "Confirmed" ? "critical" :
                      r.status === "Reviewed" ? "warning" : "caution"
                    }`}>
                      <StatusIcon size={12} strokeWidth={2.4} style={{ marginRight: "4px", verticalAlign: "-2px" }} />
                      {r.status}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
}