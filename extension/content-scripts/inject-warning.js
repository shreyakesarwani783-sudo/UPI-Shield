// Full page warning overlay — Critical risk sites pe auto trigger

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SHOW_WARNING") {
    showWarningOverlay(message.data);
  }
});

function showWarningOverlay(data) {
  // Already shown hai to dobara mat dikhao
  if (document.getElementById("upi-shield-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "upi-shield-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    background: rgba(10, 20, 15, 0.97);
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Segoe UI', sans-serif;
  `;

  overlay.innerHTML = `
    <div style="
      max-width: 520px;
      background: #0d2e24;
      border: 2px solid #ff4757;
      border-radius: 16px;
      padding: 40px;
      text-align: center;
      color: white;
      box-shadow: 0 0 60px rgba(255,71,87,0.4);
    ">
      <div style="font-size: 64px; margin-bottom: 16px;">🚨</div>
      <h1 style="color: #ff4757; font-size: 26px; margin-bottom: 12px;">
        DANGER — Phishing Site Detected!
      </h1>
      <p style="color: #ff4757; font-size: 15px; margin-bottom: 20px; font-weight: 600;">
        खतरा — यह साइट नकली है! (This site is FAKE!)
      </p>
      <div style="
        background: rgba(255,71,87,0.1);
        border: 1px solid rgba(255,71,87,0.3);
        border-radius: 8px;
        padding: 14px;
        margin-bottom: 20px;
        font-size: 13px;
        color: #ffb3b8;
        text-align: left;
      ">
        <strong>Risk Score:</strong> ${data.risk_score}/100 | 
        <strong>Level:</strong> ${data.level}<br><br>
        <strong>Red flags:</strong><br>
        ${data.reasons.map(r => `• ${r}`).join("<br>")}
        ${data.explanation ? `<br><br><strong>💡 What this means:</strong><br>${data.explanation}` : ""}
      </div>
      <p style="color: #a0c8b0; font-size: 13px; margin-bottom: 24px;">
        Do NOT enter your UPI PIN, OTP, or banking details here.<br>
        अपना UPI PIN, OTP या बैंकिंग जानकारी यहाँ न डालें।
      </p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="upi-go-back" style="
          padding: 12px 28px;
          background: #2ed573;
          color: #0d2e24;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        ">← Go Back (Safe)</button>
        <button id="upi-proceed" style="
          padding: 12px 28px;
          background: transparent;
          color: #ff4757;
          border: 1px solid #ff4757;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
        ">Proceed Anyway (Risky)</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Go back button
  document.getElementById("upi-go-back").addEventListener("click", () => {
  overlay.remove();
  chrome.runtime.sendMessage({ type: "REDIRECT_SAFE" });
  });

  // Proceed anyway
  document.getElementById("upi-proceed").addEventListener("click", () => {
    overlay.remove();
  });
}