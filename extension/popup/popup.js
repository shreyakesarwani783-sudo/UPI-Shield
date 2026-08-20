// Phase 9 — Popup uses cached scan result + i18n toggle

const ICONS = {
  safe: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  caution: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  warning: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  suspicious: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  unknown: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12.01" y2="16"/><path d="M12 12a2 2 0 1 0-2-2"/></svg>`,
  loading: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>`
};

let currentLang = "en";
let lastScanData = null;

async function initLang() {
  currentLang = await getLang();
  applyStaticTranslations();
}

function applyStaticTranslations() {
  document.getElementById("appTitle").textContent = t("appName", currentLang);
  document.getElementById("lblCurrentSite").textContent = t("currentSite", currentLang);
  document.getElementById("lblRiskAnalysis").textContent = t("riskAnalysis", currentLang);
  document.getElementById("reportBtnText").textContent = t("reportBtn", currentLang);
}

document.getElementById("langToggle").addEventListener("click", async () => {
  currentLang = currentLang === "en" ? "hi" : "en";
  await setLang(currentLang);
  applyStaticTranslations();
  if (lastScanData) renderResult(lastScanData);
});

chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
  await initLang();

  const tab = tabs[0];
  const url = tab.url;

  const urlDisplay    = document.getElementById("currentUrl");
  const resultIcon    = document.getElementById("resultIcon");
  const resultText    = document.getElementById("resultText");
  const statusDot     = document.querySelector(".status-dot");
  const backendStatus = document.getElementById("backendStatus");

  const isLocalDev = url && (
  url.includes("localhost") ||
  url.includes("127.0.0.1") ||
  /^https?:\/\/192\.168\./.test(url) ||
  /^https?:\/\/10\./.test(url)
);

if (!url || url.startsWith("chrome://") || isLocalDev) {
    urlDisplay.textContent = t("systemPage", currentLang);
    resultIcon.innerHTML = ICONS.unknown;
    resultText.textContent = t("notApplicable", currentLang);
    return;
  }

  urlDisplay.textContent = url;
  resultIcon.innerHTML = ICONS.loading;
  resultIcon.classList.add("spin");
  resultText.textContent = t("scanning", currentLang);
  backendStatus.textContent = t("checkingBackend", currentLang);

  const cacheKey = `scan_${tab.id}`;
  chrome.storage.session.get(cacheKey, async (cached) => {
    const data = cached[cacheKey];

    if (data) {
      lastScanData = data;
      renderResult(data);
    } else {
      const result = await scanUrl(url);
      if (result) {
        lastScanData = result;
        renderResult(result);
      } else {
        setBackendStatus(false);
      }
    }
  });
});

function setBackendStatus(online) {
  const statusDot = document.querySelector(".status-dot");
  const backendStatus = document.getElementById("backendStatus");
  if (!statusDot || !backendStatus) return;
  statusDot.className = `status-dot ${online ? "online" : "offline"}`;
  backendStatus.textContent = online ? t("backendOnline", currentLang) : t("backendOffline", currentLang);
}

function renderResult(data) {
  const resultBox    = document.getElementById("resultBox");
  const resultIcon   = document.getElementById("resultIcon");
  const resultText   = document.getElementById("resultText");
  const resultReason = document.getElementById("resultReason");
  const apiBox       = document.getElementById("apiBox");
  const apiScore     = document.getElementById("apiScore");
  const explanation  = document.getElementById("explanation");

  const level = data.level || "Unknown";

  const styles = {
    "Safe":     { cls: "safe",       icon: ICONS.safe,       key: "safe" },
    "Caution":  { cls: "caution",    icon: ICONS.caution,    key: "caution" },
    "Warning":  { cls: "warning",    icon: ICONS.warning,    key: "warning" },
    "Critical": { cls: "suspicious", icon: ICONS.suspicious, key: "critical" },
    "Unknown":  { cls: "unknown",    icon: ICONS.unknown,    key: "unknownSite" }
  };

  const s = styles[level] || styles["Unknown"];
  resultBox.className = `result-box ${s.cls}`;
  resultIcon.classList.remove("spin");
  resultIcon.innerHTML = s.icon;
  resultText.textContent = t(s.key, currentLang);
  setBackendStatus(true);

  if (data.reasons && data.reasons.length > 0) {
    resultReason.textContent = data.reasons[0];
  } else {
    resultReason.textContent = t("noRedFlags", currentLang);
  }

  apiBox.style.display = "block";
  apiScore.textContent = `${t("score", currentLang)}: ${data.risk_score}/100 | ${t("confidence", currentLang)}: ${Math.round(data.confidence * 100)}%`;

  if (data.explanation) {
    explanation.style.display = "block";
    explanation.textContent = `💡 ${data.explanation}`;
  }
}

// Report button listener
document.addEventListener("DOMContentLoaded", () => {
  const reportBtn = document.getElementById("reportBtn");
  const reportBtnText = document.getElementById("reportBtnText");

  if (reportBtn) {
    reportBtn.addEventListener("click", async () => {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const url = tabs[0].url;
        reportBtn.disabled = true;
        reportBtnText.textContent = t("reporting", currentLang);
        const result = await reportUrl(url);
        if (result) {
          reportBtnText.textContent = t("reported", currentLang);
        } else {
          reportBtn.disabled = false;
          reportBtnText.textContent = t("reportBtn", currentLang);
        }
      });
    });
  }
});