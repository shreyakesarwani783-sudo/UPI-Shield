const API_BASE = "http://127.0.0.1:8000/api/v1";

async function scanUrl(url) {
  try {
    const response = await fetch(`${API_BASE}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("UPI Shield API call failed:", error);
    return null;
  }
}

async function reportUrl(url) {
  try {
    const response = await fetch(`${API_BASE}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, reason: "Reported by user" })
    });
    return await response.json();
  } catch (error) {
    console.error("Report failed:", error);
    return null;
  }
}

// Report button listener
document.addEventListener("DOMContentLoaded", () => {
  const reportBtn = document.getElementById("reportBtn");
  if (reportBtn) {
    reportBtn.addEventListener("click", async () => {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const url = tabs[0].url;
        const result = await reportUrl(url);
        if (result) {
          reportBtn.textContent = "✅ Reported!";
          reportBtn.disabled = true;
        }
      });
    });
  }
});