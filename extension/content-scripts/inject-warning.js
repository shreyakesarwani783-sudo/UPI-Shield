// Full page warning overlay — Critical risk sites pe auto trigger

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SHOW_WARNING") {
    showWarningOverlay(message.data);
  }
});

function showWarningOverlay(data) {
  if (document.getElementById("upi-shield-overlay")) return;

  // Inject animation keyframes once
  if (!document.getElementById("upi-shield-styles")) {
    const style = document.createElement("style");
    style.id = "upi-shield-styles";
    style.textContent = `
      @keyframes upiFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes upiCardIn {
        from { opacity: 0; transform: scale(0.94) translateY(10px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes upiShake {
        0%, 100% { transform: translateX(0); }
        20% { transform: translateX(-4px); }
        40% { transform: translateX(4px); }
        60% { transform: translateX(-3px); }
        80% { transform: translateX(3px); }
      }
      @keyframes upiPulseGlow {
        0%, 100% { box-shadow: 0 0 60px rgba(255,71,87,0.4); }
        50% { box-shadow: 0 0 85px rgba(255,71,87,0.6); }
      }
      #upi-go-back:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(46,213,115,0.35); }
      #upi-proceed:hover { background: rgba(255,71,87,0.12) !important; }
      #upi-go-back, #upi-proceed { transition: all 0.2s ease; }
    `;
    document.head.appendChild(style);
  }

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
    animation: upiFadeIn 0.3s ease;
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
      animation: upiCardIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), upiPulseGlow 2.5s ease-in-out infinite 0.4s;
    ">
      <div style="animation: upiShake 0.6s ease 0.4s;">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#ff4757" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px;">
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
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

  document.getElementById("upi-go-back").addEventListener("click", () => {
    overlay.style.animation = "upiFadeIn 0.25s ease reverse";
    setTimeout(() => {
      overlay.remove();
      chrome.runtime.sendMessage({ type: "REDIRECT_SAFE" });
    }, 220);
  });

  document.getElementById("upi-proceed").addEventListener("click", () => {
    overlay.style.animation = "upiFadeIn 0.25s ease reverse";
    setTimeout(() => overlay.remove(), 220);
  });
}