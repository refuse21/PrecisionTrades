import { useState } from "react";
import DailyPlan from "./DailyPlan";

export default function Dashboard({
  orders,
  positions,
  history,
}) {
  // ==========================
  // STATES
  // ==========================

  const [pnlView, setPnlView] = useState("monthly");

  // ==========================
  // DATE HELPERS
  // ==========================

  const today = new Date();

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const filteredHistory = history.filter((trade) => {
    const tradeDate = new Date(trade.exitDate || trade.date);
    
    if (pnlView === "weekly") {
      return tradeDate >= startOfWeek && tradeDate <= today;
    }

    return (
      tradeDate.getMonth() === today.getMonth() &&
      tradeDate.getFullYear() === today.getFullYear()
    );
  });

  // ==========================
  // MARKET P&L
  // ==========================

  const marketPnL = {
    indian: filteredHistory
      .filter((t) => t.market === "Indian Market")
      .reduce((sum, t) => sum + Number(t.realizedPnL || 0), 0),

    global: filteredHistory
      .filter((t) => t.market === "Global Market")
      .reduce((sum, t) => sum + Number(t.realizedPnL || 0), 0),

    forex: filteredHistory
      .filter((t) => t.market === "Forex")
      .reduce((sum, t) => sum + Number(t.realizedPnL || 0), 0),

    crypto: filteredHistory
      .filter((t) => t.market === "Crypto")
      .reduce((sum, t) => sum + Number(t.realizedPnL || 0), 0),
  };

  // ==========================
  // TODAY'S P&L
  // ==========================

 const todayTrades = history.filter((trade) => {
    const tradeDate = new Date(trade.exitDate || trade.date);

    return (
      tradeDate.toDateString() === today.toDateString()
    );
  });

  const todayPnLINR = todayTrades
    .filter((trade) => trade.market === "Indian Market")
    .reduce(
      (sum, trade) => sum + Number(trade.realizedPnL || 0),
      0
    );

  const todayPnLUSD = todayTrades
    .filter(
      (trade) =>
        trade.market === "Global Market" ||
        trade.market === "Forex" ||
        trade.market === "Crypto"
    )
    .reduce(
      (sum, trade) => sum + Number(trade.realizedPnL || 0),
      0
    );

  // ==========================
  // DASHBOARD STATS
  // ==========================

  const openPositions = positions.length;

  const closedTrades = history.length;

  const todayOrders = orders.filter(
    (order) =>
      order.date === today.toISOString().split("T")[0]
  ).length;

  const winningTrades = history.filter(
    (trade) => trade.realizedPnL > 0
  ).length;

  const winRate =
    closedTrades === 0
      ? 0
      : (
          (winningTrades / closedTrades) *
          100
        ).toFixed(1);

  // ==========================
  // COMMON CARD STYLE
  // ==========================

  const cardStyle = {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
  };

  // ==========================
  // UI
  // ==========================

  return (
    <div
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "30px",
      }}
    >
      <section style={{ marginBottom: "40px" }}>
        <h2
          style={{
            marginBottom: "20px",
            fontSize: "24px",
          }}
        >
          Today's Performance
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
          }}
        >
          <div style={cardStyle}>
            <h4>📈 Open Positions</h4>
            <h1>{openPositions}</h1>
          </div>

          <div style={cardStyle}>
            <h4>✅ Closed Trades</h4>
            <h1>{closedTrades}</h1>
          </div>

          <div style={cardStyle}>
            <h4>📒 Today's Orders</h4>
            <h1>{todayOrders}</h1>
          </div>

          <div style={cardStyle}>
            <h4>🏆 Win Rate</h4>
            <h1>{winRate}%</h1>
          </div>

          <div style={cardStyle}>
            <h4>💰 Today's P&L</h4>

            <h1
              style={{
                color:
                  todayPnLINR >= 0
                    ? "#22c55e"
                    : "#ef4444",
              }}
            >
              ₹ {todayPnLINR.toFixed(2)}
            </h1>

            <h1
              style={{
                color:
                  todayPnLUSD >= 0
                    ? "#22c55e"
                    : "#ef4444",
                marginTop: "6px",
              }}
            >
              $ {todayPnLUSD.toFixed(2)}
            </h1>
          </div>
        </div>
      </section>
            {/* ======================================
          Market Performance
      ====================================== */}

      <section
        style={{
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              margin: 0,
            }}
          >
            Market Performance
          </h2>

          <div>
            <button
              onClick={() => setPnlView("weekly")}
              style={{
                padding: "8px 18px",
                marginRight: "10px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                background:
                  pnlView === "weekly"
                    ? "#2563eb"
                    : "#334155",
                color: "white",
              }}
            >
              Weekly
            </button>

            <button
              onClick={() => setPnlView("monthly")}
              style={{
                padding: "8px 18px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                background:
                  pnlView === "monthly"
                    ? "#2563eb"
                    : "#334155",
                color: "white",
              }}
            >
              Monthly
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(250px,1fr))",
            gap: "20px",
          }}
        >
          <div style={cardStyle}>
            <h4>🇮🇳 Indian Market</h4>

            <h1
              style={{
                color:
                  marketPnL.indian >= 0
                    ? "#22c55e"
                    : "#ef4444",
              }}
            >
              ₹ {marketPnL.indian.toFixed(2)}
            </h1>
          </div>

          <div style={cardStyle}>
            <h4>🌍 Global Market</h4>

            <h1
              style={{
                color:
                  marketPnL.global >= 0
                    ? "#22c55e"
                    : "#ef4444",
              }}
            >
              $ {marketPnL.global.toFixed(2)}
            </h1>
          </div>

          <div style={cardStyle}>
            <h4>💱 Forex</h4>

            <h1
              style={{
                color:
                  marketPnL.forex >= 0
                    ? "#22c55e"
                    : "#ef4444",
              }}
            >
              $ {marketPnL.forex.toFixed(2)}
            </h1>
          </div>

          <div style={cardStyle}>
            <h4>₿ Crypto</h4>

            <h1
              style={{
                color:
                  marketPnL.crypto >= 0
                    ? "#22c55e"
                    : "#ef4444",
              }}
            >
              $ {marketPnL.crypto.toFixed(2)}
            </h1>
          </div>
        </div>
      </section>

      {/* ======================================
          Equity Curve
      ====================================== */}

      <section
        style={{
          marginBottom: "40px",
        }}
      >
        <div style={cardStyle}>
          <h2>📈 Equity Curve</h2>

          <div
            style={{
              height: "350px",
              borderRadius: "12px",
              background: "#0f172a",
              border: "1px dashed #334155",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <div style={{ fontSize: "70px" }}>
              📊
            </div>

            <h3>Equity Curve Coming Soon</h3>

            <p
              style={{
                color: "#94a3b8",
              }}
            >
              Your account growth chart will appear here.
            </p>
          </div>
        </div>
      </section>
            {/* ======================================
          Recent Activity
      ====================================== */}

      <section
        style={{
          marginBottom: "40px",
        }}
      >
        <div style={cardStyle}>
          <h2
            style={{
              marginBottom: "20px",
            }}
          >
            🕒 Recent Activity
          </h2>

          {history.length === 0 ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: "#94a3b8",
              }}
            >
              <div
                style={{
                  fontSize: "60px",
                  marginBottom: "15px",
                }}
              >
                📒
              </div>

              <h3>No Activity Yet</h3>

              <p>Your latest trades will appear here.</p>
            </div>
          ) : (
            history
              .slice()
              .reverse()
              .slice(0, 5)
              .map((trade, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "15px 0",
                    borderBottom: "1px solid #334155",
                  }}
                >
                  <div>
                    <strong>
                      {trade.action} {trade.symbol}
                    </strong>

                    <div
                      style={{
                        fontSize: "13px",
                        color: "#94a3b8",
                        marginTop: "5px",
                      }}
                    >
                      {trade.market}
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: "right",
                    }}
                  >
                    <div
                      style={{
                        color:
                          trade.realizedPnL >= 0
                            ? "#22c55e"
                            : "#ef4444",
                        fontWeight: "bold",
                      }}
                    >
                      {trade.market === "Indian Market"
                        ? "₹"
                        : "$"}
                      {Number(trade.realizedPnL || 0).toFixed(2)}
                    </div>

                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: "12px",
                      }}
                    >
                      {trade.date}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </section>
    </div>
  );
}