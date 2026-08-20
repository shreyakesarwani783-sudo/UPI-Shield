import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Overview from "./pages/Overview";
import FlaggedDomains from "./pages/FlaggedDomains";
import UserReports from "./pages/UserReports";
import ModelStats from "./pages/ModelStats";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <div className="logo">
            <span>🛡️</span>
            <h2>UPI Shield</h2>
          </div>
          <nav>
            <NavLink to="/" end className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              📊 Overview
            </NavLink>
            <NavLink to="/flagged" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              🚨 Flagged Domains
            </NavLink>
            <NavLink to="/reports" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              📝 User Reports
            </NavLink>
            <NavLink to="/model" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
              🤖 Model Stats
            </NavLink>
          </nav>
          <div className="sidebar-footer">
            <p>v0.1.0</p>
            <p>Backend: <span className="online">● Online</span></p>
          </div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/flagged" element={<FlaggedDomains />} />
            <Route path="/reports" element={<UserReports />} />
            <Route path="/model" element={<ModelStats />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;