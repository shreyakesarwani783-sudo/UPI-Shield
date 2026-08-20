# 🛡️ UPI Shield — Phishing Fraud Detection Extension

**Team BYTERIGHTS | Smart India Hackathon**

A Chrome extension + ML-powered backend that detects fake UPI/banking phishing websites in real-time and warns users before they enter sensitive information.

---

## 🎯 Problem Statement

UPI fraud is rising rapidly in India, with non-technical users being the most vulnerable to fake banking/payment login pages. UPI Shield acts as a real-time safety net — automatically scanning every website a user visits and blocking access to phishing pages before damage is done.

---

## ✨ Features

- **Real-time URL scanning** — every page load is automatically analyzed
- **ML-powered detection** — Random Forest classifier trained on 549K+ URLs
- **Heuristic engine** — typosquat detection, HTTPS checks, suspicious keyword matching
- **Full-page warning overlay** — auto-triggers on Critical-risk sites (no need to click the extension)
- **Gemini AI explanations** — plain-English reasoning for why a site is flagged
- **Bilingual UI** — English/Hindi toggle in the popup
- **Community reporting** — users can report suspicious sites
- **Live analytics dashboard** — real-time stats, flagged domains, model performance

---

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  Chrome          │─────▶│  FastAPI Backend  │─────▶│  Random Forest   │
│  Extension       │◀─────│  (REST API)       │◀─────│  ML Model        │
│  (Manifest V3)   │      │                    │      │                  │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                    │
                                    ├──▶ SQLite (scan history)
                                    ├──▶ Gemini API (explanations)
                                    └──▶ React Dashboard (analytics)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Extension | JavaScript, Chrome Manifest V3 |
| Backend | Python, FastAPI, Uvicorn |
| ML Model | scikit-learn (Random Forest) |
| AI Explanations | Google Gemini API |
| Database | SQLite |
| Dashboard | React, Vite, Recharts, Framer Motion |

---

## 📦 Project Structure

```
upi-phishing-detector/
├── extension/              # Chrome extension (Manifest V3)
│   ├── background/         # Service worker (badge logic, tab monitoring)
│   ├── content-scripts/    # Page scanner + warning overlay
│   ├── popup/               # Extension popup UI
│   ├── local-engine/        # Offline typosquat/allowlist checks
│   └── utils/                # API client, i18n
├── backend/                 # FastAPI server
│   ├── api/v1/               # Routes: scan, report, stats, admin
│   ├── services/             # Risk engine, ML service, heuristics, XAI
│   └── ml/                   # Model training scripts
├── dashboard/                # React analytics dashboard
│   └── src/pages/            # Overview, Flagged Domains, User Reports, Model Stats
└── test-pages/                # Hand-built fake phishing pages for testing
```

---

## 🚀 Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Chrome
- A Gemini API key ([Google AI Studio](https://aistudio.google.com))

### 1. Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
```

Create a `.env` file in `backend/` with:
```
GEMINI_API_KEY=your_key_here
```

Start the server:
```bash
python -m uvicorn main:app --reload --port 8000
```

### 2. Dashboard Setup

```bash
cd dashboard
npm install
npm run dev
```

Open `http://localhost:5173`

### 3. Extension Setup

1. Open Chrome → `chrome://extensions`
2. Enable **Developer Mode** (top-right toggle)
3. Click **Load unpacked** → select the `extension/` folder
4. Pin the extension for easy access

✅ Make sure the backend (port 8000) is running before using the extension — badge/popup will show "Backend Offline" otherwise.

---

## 🧪 Testing

Sample fake phishing pages are provided in `test-pages/` for demo purposes:
- `paytm-secure-login.html`
- `other-fake-scam-pages.html`

Serve them locally (e.g. VS Code Live Server) and visit them with the extension active — a full-page warning should trigger automatically.

The extension has been tested against 10+ legitimate banking/UPI sites (SBI, Paytm, PhonePe, HDFC, ICICI, etc.) with **zero false positives**.

---

## 📊 Model Performance

| Metric | Value |
|---|---|
| Accuracy | 85.39% |
| Precision | 88.43% |
| Recall | 56.04% |
| F1 Score | 69.0% |
| Dataset | 549,346 URLs |
| Algorithm | Random Forest (100 estimators, max depth 15) |

*(Model improvement to 90%+ accuracy via hyperparameter tuning and feature engineering is an ongoing effort.)*

---

## 👥 Team BYTERIGHTS

Built for Smart India Hackathon.

---

## 📄 License

This project was built for educational/hackathon purposes.