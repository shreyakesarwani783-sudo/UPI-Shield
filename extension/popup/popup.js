// Phase 9 — Popup uses cached scan result from service worker

chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
  const tab = tabs[0];
  const url = tab.url;

  const urlDisplay   = document.getElementById("currentUrl");
  const resultBox    = document.getElementById("resultBox");
  const resultIcon   = document.getElementById("resultIcon");
  const resultText   = document.getElementById("resultText");
  const resultReason = document.getElementById("resultReason");
  const apiBox       = document.getElementById("apiBox");
  const apiScore     = document.getElementById("apiScore");
  const explanation  = document.getElementById("explanation");

  if (!url || url.startsWith("chrome://")) {
    urlDisplay.textContent = "System page — not scannable";
    return;
  }

  urlDisplay.textContent = url;
  resultIcon.textContent = "⏳";
  resultText.textContent = "Scanning...";

  // Try cached result first (from service worker)
  const cacheKey = `scan_${tab.id}`;
  chrome.storage.session.get(cacheKey, async (cached) => {
    const data = cached[cacheKey];

    if (data) {
      showResult(data);
    } else {
      // Fallback: call API directly
      const result = await scanUrl(url);
      if (result) showResult(result);
    }
  });

  function showResult(data) {
    const level = data.level || "Unknown";

    const styles = {
      "Safe":     { cls: "safe",      icon: "✅", text: "Safe" },
      "Caution":  { cls: "caution",   icon: "⚠️", text: "Caution" },
      "Warning":  { cls: "warning",   icon: "🟠", text: "Warning" },
      "Critical": { cls: "suspicious",icon: "🚨", text: "Critical!" },
      "Unknown":  { cls: "unknown",   icon: "❓", text: "Unknown Site" }
    };

    const s = styles[level] || styles["Unknown"];
    resultBox.className = `result-box ${s.cls}`;
    resultIcon.textContent = s.icon;
    resultText.textContent = s.text;

    // Reasons
    if (data.reasons && data.reasons.length > 0) {
      resultReason.textContent = data.reasons[0];
    }

    // Backend score
    apiBox.style.display = "block";
    apiScore.textContent = `Score: ${data.risk_score}/100 | Confidence: ${Math.round(data.confidence * 100)}%`;

    // Gemini explanation
    if (data.explanation) {
      explanation.style.display = "block";
      explanation.textContent = `💡 ${data.explanation}`;
    }
  }
});