// Service Worker — Tab navigation listener + Badge colors

const LEVEL_COLORS = {
  "Safe":     { color: "#2ed573", text: "✓" },
  "Caution":  { color: "#ffc800", text: "!" },
  "Warning":  { color: "#ff7f50", text: "!!" },
  "Critical": { color: "#ff4757", text: "✕" },
  "Unknown":  { color: "#747d8c", text: "?" }
};

const API_BASE = "http://127.0.0.1:8000/api/v1";

// URLs that should never be auto-scanned (dev/local/system)
function shouldSkipScan(url) {
  if (!url) return true;
  if (url.startsWith("chrome://")) return true;
  if (url.startsWith("chrome-extension://")) return true;
  if (url.startsWith("about:")) return true;
  if (url.startsWith("edge://")) return true;

  try {
    const u = new URL(url);
    const host = u.hostname;

    // Skip localhost / dev servers / private IPs
    if (host === "localhost" || host === "127.0.0.1") return true;
    if (/^192\.168\.\d+\.\d+$/.test(host)) return true;
    if (/^10\.\d+\.\d+\.\d+$/.test(host)) return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(host)) return true;

    return false;
  } catch (e) {
    return true;
  }
}

// Scan URL and update badge
async function scanAndUpdateBadge(tabId, url) {
  if (shouldSkipScan(url)) {
    chrome.action.setBadgeText({ text: "", tabId });
    return;
  }

  try {
    // Set loading badge
    chrome.action.setBadgeBackgroundColor({ color: "#747d8c", tabId });
    chrome.action.setBadgeText({ text: "...", tabId });

    const response = await fetch(`${API_BASE}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    if (!response.ok) throw new Error("API error");

    const data = await response.json();
    const level = data.level || "Unknown";
    const badge = LEVEL_COLORS[level] || LEVEL_COLORS["Unknown"];

    // Update badge
    chrome.action.setBadgeBackgroundColor({ color: badge.color, tabId });
    chrome.action.setBadgeText({ text: badge.text, tabId });

    // Store result for popup to use
    chrome.storage.session.set({ [`scan_${tabId}`]: data });

    // If Critical — inject warning overlay
    if (level === "Critical") {
      chrome.tabs.sendMessage(tabId, {
        type: "SHOW_WARNING",
        data: data
      });
    }

  } catch (error) {
    // Backend down — show grey badge
    chrome.action.setBadgeBackgroundColor({ color: "#747d8c", tabId });
    chrome.action.setBadgeText({ text: "?", tabId });
  }
}

// Listen for tab navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    scanAndUpdateBadge(tabId, tab.url);
  }
});

// Listen for tab switch
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url) {
    scanAndUpdateBadge(activeInfo.tabId, tab.url);
  }
});

// Safe redirect handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "REDIRECT_SAFE") {
    chrome.tabs.update(sender.tab.id, { url: "chrome://newtab" });
  }
});