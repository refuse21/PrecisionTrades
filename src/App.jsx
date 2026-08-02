import Dashboard from "./Dashboard";
import Journal from "./Journal";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Home,
  TrendingUp,
  ClipboardList,
  Settings,
} from "lucide-react";

import StatCard from "./StatCard";

const monthlyPnL = {
  indian: 0,
  global: 0,
  forex: 0,
  crypto: 0,
};

const currentEquity = {
  indian: 0,
  global: 0,
  forex: 0,
  crypto: 0,
};

const recentActivity = [];

export default function App() {
  const [page, setPage] = useState("dashboard");

  const [orders, setOrders] = useState([]);
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);

  const [loaded, setLoaded] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const savedOrders = localStorage.getItem("orders");
    const savedPositions = localStorage.getItem("positions");
    const savedHistory = localStorage.getItem("history");

    if (savedOrders) setOrders(JSON.parse(savedOrders));
    if (savedPositions) setPositions(JSON.parse(savedPositions));
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    setLoaded(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("positions", JSON.stringify(positions));
  }, [positions, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("history", JSON.stringify(history));
  }, [history, loaded]);

  
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

        <div style={{ textAlign: "right" }}>
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
            {currentTime.toLocaleDateString(undefined, {
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
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Main Layout */}

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
            <Dashboard
              orders={orders}
              positions={positions}
              history={history}
            />
          )}

          {page === "journal" && (
            <Journal
              orders={orders}
              setOrders={setOrders}
              positions={positions}
              setPositions={setPositions}
              history={history}
              setHistory={setHistory}
            />
          )}

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