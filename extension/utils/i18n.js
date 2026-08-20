// Simple i18n system for popup UI toggle

const TRANSLATIONS = {
  en: {
    appName: "UPI Shield",
    currentSite: "Current Site",
    scanning: "Scanning...",
    safe: "Safe",
    caution: "Caution",
    warning: "Warning",
    critical: "Critical!",
    unknownSite: "Unknown Site",
    noRedFlags: "No major red flags detected",
    riskAnalysis: "Risk Analysis",
    score: "Score",
    confidence: "Confidence",
    reportBtn: "Report this site",
    reporting: "Reporting...",
    reported: "Reported!",
    backendOnline: "Backend Online",
    backendOffline: "Backend Offline",
    checkingBackend: "Checking backend...",
    systemPage: "System page — not scannable",
    notApplicable: "N/A"
  },
  hi: {
    appName: "यूपीआई शील्ड",
    currentSite: "वर्तमान साइट",
    scanning: "स्कैन हो रहा है...",
    safe: "सुरक्षित",
    caution: "सावधानी",
    warning: "चेतावनी",
    critical: "गंभीर खतरा!",
    unknownSite: "अज्ञात साइट",
    noRedFlags: "कोई बड़ी समस्या नहीं मिली",
    riskAnalysis: "जोखिम विश्लेषण",
    score: "स्कोर",
    confidence: "विश्वास स्तर",
    reportBtn: "इस साइट की रिपोर्ट करें",
    reporting: "रिपोर्ट हो रही है...",
    reported: "रिपोर्ट हो गई!",
    backendOnline: "बैकएंड ऑनलाइन",
    backendOffline: "बैकएंड ऑफ़लाइन",
    checkingBackend: "बैकएंड जाँच रहे हैं...",
    systemPage: "सिस्टम पेज — स्कैन नहीं हो सकता",
    notApplicable: "लागू नहीं"
  }
};

async function getLang() {
  const result = await chrome.storage.local.get("uiLang");
  return result.uiLang || "en";
}

async function setLang(lang) {
  await chrome.storage.local.set({ uiLang: lang });
}

function t(key, lang) {
  return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.en[key] || key;
}