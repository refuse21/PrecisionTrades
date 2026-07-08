import { useState } from "react";
import {
  BarChart3,
  Home,
  TrendingUp,
  ClipboardList,
  Settings,
} from "lucide-react";

import StatCard from "./StatCard";
import Journal from "./Journal";

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

        <h3>👋 Welcome, Pritesh</h3>
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
            <>
              <h2>Dashboard</h2>

              <div
                style={{
                  display: "flex",
                  gap: "20px",
                  flexWrap: "wrap",
                  marginTop: "20px",
                }}
              >
                <StatCard
                  title="Total Trades"
                  value="25"
                  color="white"
                />

                <StatCard
                  title="Winning Trades"
                  value="18"
                  color="#22c55e"
                />

                <StatCard
                  title="Losing Trades"
                  value="7"
                  color="#ef4444"
                />

                <StatCard
                  title="Net Profit"
                  value="₹45,800"
                  color="#22c55e"
                />
              </div>

              <div
                style={{
                  marginTop: "40px",
                  background: "#1e293b",
                  padding: "20px",
                  borderRadius: "12px",
                }}
              >
                <h2>Recent Trades</h2>

                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      <th align="left">Date</th>
                      <th align="left">Stock</th>
                      <th align="left">Type</th>
                      <th align="left">P/L</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td>15 Jul</td>
                      <td>RELIANCE</td>
                      <td>BUY</td>
                      <td style={{ color: "#22c55e" }}>+₹2,500</td>
                    </tr>

                    <tr>
                      <td>14 Jul</td>
                      <td>NIFTY</td>
                      <td>SELL</td>
                      <td style={{ color: "#ef4444" }}>-₹800</td>
                    </tr>

                    <tr>
                      <td>13 Jul</td>
                      <td>BANKNIFTY</td>
                      <td>BUY</td>
                      <td style={{ color: "#22c55e" }}>+₹4,200</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
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