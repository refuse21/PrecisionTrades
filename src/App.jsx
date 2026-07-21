import Dashboard from "./Dashboard";
import Journal from "./Journal";
import { useState } from "react";
import {
  BarChart3,
  Home,
  TrendingUp,
  ClipboardList,
  Settings,
} from "lucide-react";

import StatCard from "./StatCard";


export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div
      style={{
        backgroundColor: "#0f172a",
        color: "white",
        minHeight: "100vh",
        fontFamily: "Arial",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 30px",
          borderBottom: "1px solid #334155",
        }}
      >
        <h1
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <BarChart3 size={30} />
          PrecisionTrades
        </h1>

        <h3><div style={{ textAlign: "right" }}>
  <h3 style={{ margin: 0 }}>
    👋 Welcome, Pritesh
  </h3>

  <p
    style={{
      margin: "4px 0 0",
      color: "#94a3b8",
      fontSize: "14px",
    }}
  >
    {new Date().toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })}
  </p>

  <p
    style={{
      margin: "2px 0 0",
      color: "#64748b",
      fontSize: "13px",
    }}
  >
    {new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}
  </p>
</div></h3>
      </div>

      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <div
          style={{
            width: "220px",
            borderRight: "1px solid #334155",
            padding: "25px",
          }}
        >
          <p
            onClick={() => setPage("dashboard")}
            style={{ cursor: "pointer", marginBottom: "20px" }}
          >
            <Home size={18} /> Dashboard
          </p>

          <p
            onClick={() => setPage("journal")}
            style={{ cursor: "pointer", marginBottom: "20px" }}
          >
            <ClipboardList size={18} /> Journal
          </p>

          <p
            onClick={() => setPage("analytics")}
            style={{ cursor: "pointer", marginBottom: "20px" }}
          >
            <TrendingUp size={18} /> Analytics
          </p>

          <p
            onClick={() => setPage("settings")}
            style={{ cursor: "pointer" }}
          >
            <Settings size={18} /> Settings
          </p>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, padding: "30px" }}>
          {page === "dashboard" && (
  <Dashboard />
)}
          
          {page === "journal" && <Journal />}

          {page === "analytics" && (
            <>
              <h2>Analytics</h2>
              <p>Charts and performance analytics will be added here.</p>
            </>
          )}

          {page === "settings" && (
            <>
              <h2>Settings</h2>
              <p>User preferences will be added here.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}