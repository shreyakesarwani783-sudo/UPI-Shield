import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { Shield, LayoutDashboard, Flag, FileText, Cpu } from "lucide-react";
import Overview from "./pages/Overview";
import FlaggedDomains from "./pages/FlaggedDomains";
import UserReports from "./pages/UserReports";
import ModelStats from "./pages/ModelStats";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="logo">
            <div className="logo-icon">
              <Shield size={26} strokeWidth={2.2} />
              <div className="logo-pulse"></div>
            </div>
            <h2>UPI Shield</h2>
          </div>
          <nav>
            <NavLink to="/" end className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <LayoutDashboard size={18} strokeWidth={2} />
              <span>Overview</span>
            </NavLink>
            <NavLink to="/flagged" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <Flag size={18} strokeWidth={2} />
              <span>Flagged Domains</span>
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <FileText size={18} strokeWidth={2} />
              <span>User Reports</span>
            </NavLink>
            <NavLink to="/model" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              <Cpu size={18} strokeWidth={2} />
              <span>Model Stats</span>
            </NavLink>
          </nav>
          <div className="sidebar-footer">
            <p>v0.1.0</p>
            <p>Backend: <span className="online"><span className="status-dot"></span>Online</span></p>
          </div>
        </aside>

        {/* Main Content */}
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