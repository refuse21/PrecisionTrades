import { useState } from "react";
import EquityCurve from "./EquityCurve";

export default function Analytics({ history = [] }) {
  // ==========================================
  // TIME RANGE FILTER
  // ==========================================

  const [filterRange, setFilterRange] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const filterOptions = [
    { key: "1d", label: "1D" },
    { key: "1w", label: "1W" },
    { key: "1m", label: "1M" },
    { key: "3m", label: "3M" },
    { key: "all", label: "All" },
    { key: "custom", label: "Custom" },
  ];

  // Trades store the closing date on `exitDate`, falling back to the
  // entry `date` for any legacy/open records that lack it.
  const getTradeDate = (trade) => trade.exitDate || trade.date;

  const getRangeBounds = (range) => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    if (range === "custom") {
      const start = customStart
        ? new Date(`${customStart}T00:00:00`)
        : null;
      const customEndDate = customEnd
        ? new Date(`${customEnd}T23:59:59`)
        : end;

      return { start, end: customEndDate };
    }

    let start = null;

    if (range === "1d") {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
    } else if (range === "1w") {
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else if (range === "1m") {
      start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
    } else if (range === "3m") {
      start = new Date(now);
      start.setMonth(start.getMonth() - 3);
      start.setHours(0, 0, 0, 0);
    }

    return { start, end };
  };

  const filteredHistory =
    filterRange === "all"
      ? history
      : history.filter((trade) => {
          const dateStr = getTradeDate(trade);
          if (!dateStr) return false;

          const tradeDate = new Date(`${dateStr}T12:00:00`);
          if (Number.isNaN(tradeDate.getTime())) return false;

          const { start, end } = getRangeBounds(filterRange);

          if (start && tradeDate < start) return false;
          if (end && tradeDate > end) return false;

          return true;
        });
  // ==========================================
  // MARKET CONFIGURATION
  // ==========================================

  const markets = [
    {
      key: "Indian Market",
      name: "Indian Market",
      currency: "₹",
      icon: "🇮🇳",
      color: "#fb923c",
    },
    {
      key: "Global Market",
      name: "Global Market",
      currency: "$",
      icon: "🌍",
      color: "#38bdf8",
    },
    {
      key: "Forex",
      name: "Forex",
      currency: "$",
      icon: "💱",
      color: "#a855f7",
    },
    {
      key: "Crypto",
      name: "Crypto",
      currency: "$",
      icon: "₿",
      color: "#eab308",
    },
  ];

  // ==========================================
  // SAFE NUMBER HELPER
  // ==========================================

  const safeNumber = (value) => {
    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
  };

  // ==========================================
  // ANALYTICS CALCULATOR
  // ==========================================

  const calculateAnalytics = (trades) => {
    const totalTrades = trades.length;

    const winningTrades = trades.filter(
      (trade) => safeNumber(trade.realizedPnL) > 0
    );

    const losingTrades = trades.filter(
      (trade) => safeNumber(trade.realizedPnL) < 0
    );

    const winCount = winningTrades.length;
    const lossCount = losingTrades.length;

    // ------------------------------------------
    // Win Rate
    // ------------------------------------------

    const winRate =
      totalTrades === 0
        ? 0
        : (winCount / totalTrades) * 100;

    // ------------------------------------------
    // Gross Profit
    // ------------------------------------------

    const grossProfit = winningTrades.reduce(
      (sum, trade) =>
        sum + safeNumber(trade.realizedPnL),
      0
    );

    // ------------------------------------------
    // Gross Loss
    // ------------------------------------------

    const grossLoss = Math.abs(
      losingTrades.reduce(
        (sum, trade) =>
          sum + safeNumber(trade.realizedPnL),
        0
      )
    );

    // ------------------------------------------
    // Average Win
    // ------------------------------------------

    const averageWin =
      winCount === 0
        ? 0
        : grossProfit / winCount;

    // ------------------------------------------
    // Average Loss
    // ------------------------------------------

    const averageLoss =
      lossCount === 0
        ? 0
        : grossLoss / lossCount;

       // ------------------------------------------
    // Best Trade (largest win; 0 if no wins)
    // ------------------------------------------

    const bestTrade =
      winCount === 0
        ? 0
        : Math.max(
            ...winningTrades.map((trade) =>
              safeNumber(trade.realizedPnL)
            )
          );

    // ------------------------------------------
    // Worst Trade (biggest loss; 0 if no losses)
    // ------------------------------------------

    const worstTrade =
      lossCount === 0
        ? 0
        : Math.min(
            ...losingTrades.map((trade) =>
              safeNumber(trade.realizedPnL)
            )
          );

    // ------------------------------------------
    // Profit Factor
    // ------------------------------------------

    let profitFactor = "0.00";

    if (grossLoss === 0 && grossProfit > 0) {
      profitFactor = "∞";
    } else if (grossLoss > 0) {
      profitFactor = (
        grossProfit / grossLoss
      ).toFixed(2);
    }

    // ------------------------------------------
    // Total P&L
    // ------------------------------------------

    const totalPnL = trades.reduce(
      (sum, trade) =>
        sum + safeNumber(trade.realizedPnL),
      0
    );

    return {
      totalTrades,
      winCount,
      lossCount,
      winRate,
      grossProfit,
      grossLoss,
      averageWin,
      averageLoss,
      bestTrade,
      worstTrade,
      profitFactor,
      totalPnL,
    };
  };

  // ==========================================
  // MARKET ANALYTICS
  // ==========================================

  const marketAnalytics = markets.map(
    (market) => {
      const trades = filteredHistory.filter(
        (trade) =>
          trade.market === market.key
      );

      return {
        ...market,
        analytics:
          calculateAnalytics(trades),
      };
    }
  );

  // ==========================================
  // STYLES
  // ==========================================

  const cardStyle = {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "20px",
    boxShadow:
      "0 8px 20px rgba(0,0,0,0.25)",
  };

  const labelStyle = {
    color: "#94a3b8",
    fontSize: "14px",
    marginBottom: "8px",
  };

  const valueStyle = {
    fontSize: "30px",
    fontWeight: "700",
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "30px",
        color: "white",
      }}
    >
      {/* ======================================
          HEADER
      ====================================== */}

      <div
        style={{
          marginBottom: "35px",
        }}
      >
        <h2
          style={{
            fontSize: "28px",
            marginBottom: "8px",
          }}
        >
          📊 Trading Analytics
        </h2>

        <p
          style={{
            color: "#94a3b8",
            margin: 0,
          }}
        >
          Performance analysis by market.
        </p>
      </div>

      {/* ======================================
          TIME RANGE FILTER
      ====================================== */}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "10px",
          marginBottom: "35px",
        }}
      >
        {filterOptions.map((option) => {
          const isActive = filterRange === option.key;

          return (
            <button
              key={option.key}
              onClick={() =>
                setFilterRange(option.key)
              }
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                border: isActive
                  ? "1px solid #38bdf8"
                  : "1px solid #334155",
                background: isActive
                  ? "#0c4a6e"
                  : "#1e293b",
                color: isActive
                  ? "#7dd3fc"
                  : "#94a3b8",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {option.label}
            </button>
          );
        })}

        {filterRange === "custom" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginLeft: "6px",
            }}
          >
            <input
              type="date"
              value={customStart}
              onChange={(e) =>
                setCustomStart(e.target.value)
              }
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "7px 10px",
                color: "white",
                fontSize: "14px",
              }}
            />

            <span style={{ color: "#94a3b8" }}>
              to
            </span>

            <input
              type="date"
              value={customEnd}
              onChange={(e) =>
                setCustomEnd(e.target.value)
              }
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
                padding: "7px 10px",
                color: "white",
                fontSize: "14px",
              }}
            />
          </div>
        )}
      </div>

      {/* ======================================
          EQUITY CURVE
      ====================================== */}

      <EquityCurve history={filteredHistory} markets={markets} />

      {/* ======================================
          MARKET SECTIONS
      ====================================== */}

      {marketAnalytics.map((market) => {
        const a = market.analytics;

        return (
          <section
            key={market.key}
            style={{
              marginBottom: "45px",
            }}
          >
            {/* Market Heading */}

            <h3
              style={{
                fontSize: "22px",
                marginBottom: "20px",
              }}
            >
              {market.icon} {market.name}
            </h3>

            {/* Cards */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
              }}
            >
              {/* Total P&L */}

              <div style={cardStyle}>
                <div style={labelStyle}>
                  Total P&L
                </div>

                <div
                  style={{
                    ...valueStyle,
                    color:
                      a.totalPnL >= 0
                        ? "#22c55e"
                        : "#ef4444",
                  }}
                >
                  {market.currency}{" "}
                  {a.totalPnL.toFixed(2)}
                </div>
              </div>

              {/* Total Trades */}

              <div style={cardStyle}>
                <div style={labelStyle}>
                  Total Trades
                </div>

                <div style={valueStyle}>
                  {a.totalTrades}
                </div>
              </div>

              {/* Winning Trades */}

              <div style={cardStyle}>
                <div style={labelStyle}>
                  Winning Trades
                </div>

                <div
                  style={{
                    ...valueStyle,
                    color: "#22c55e",
                  }}
                >
                  {a.winCount}
                </div>
              </div>

              {/* Losing Trades */}

              <div style={cardStyle}>
                <div style={labelStyle}>
                  Losing Trades
                </div>

                <div
                  style={{
                    ...valueStyle,
                    color: "#ef4444",
                  }}
                >
                  {a.lossCount}
                </div>
              </div>

              {/* Win Rate */}

              <div style={cardStyle}>
                <div style={labelStyle}>
                  Win Rate
                </div>

                <div
                  style={{
                    ...valueStyle,
                    color: "#a855f7",
                  }}
                >
                  {a.winRate.toFixed(1)}%
                </div>
              </div>

              {/* Average Win */}

              <div style={cardStyle}>
                <div style={labelStyle}>
                  Average Win
                </div>

                <div
                  style={{
                    ...valueStyle,
                    color: "#22c55e",
                  }}
                >
                  {market.currency}{" "}
                  {a.averageWin.toFixed(2)}
                </div>
              </div>

              {/* Average Loss */}

              <div style={cardStyle}>
                <div style={labelStyle}>
                  Average Loss
                </div>

                <div
                  style={{
                    ...valueStyle,
                    color: "#ef4444",
                  }}
                >
                  -{market.currency}{" "}
                  {a.averageLoss.toFixed(2)}
                </div>
              </div>

              {/* Best Trade */}

              <div style={cardStyle}>
                <div style={labelStyle}>
                  Best Trade
                </div>

                <div
                  style={{
                    ...valueStyle,
                    color: "#22c55e",
                  }}
                >
                  {market.currency}{" "}
                  {a.bestTrade.toFixed(2)}
                </div>
              </div>

              {/* Worst Trade */}

              <div style={cardStyle}>
                <div style={labelStyle}>
                  Worst Trade
                </div>

                <div
                  style={{
                    ...valueStyle,
                    color: "#ef4444",
                  }}
                >
                  {market.currency}{" "}
                  {a.worstTrade.toFixed(2)}
                </div>
              </div>

              {/* Profit Factor */}

              <div style={cardStyle}>
                <div style={labelStyle}>
                  Profit Factor
                </div>

                <div
                  style={{
                    ...valueStyle,
                    color: "#38bdf8",
                  }}
                >
                  {a.profitFactor}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}