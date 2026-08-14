export default function Analytics({ history = [] }) {
  // ==========================================
  // MARKET CONFIGURATION
  // ==========================================

  const markets = [
    {
      key: "Indian Market",
      name: "Indian Market",
      currency: "₹",
      icon: "🇮🇳",
    },
    {
      key: "Global Market",
      name: "Global Market",
      currency: "$",
      icon: "🌍",
    },
    {
      key: "Forex",
      name: "Forex",
      currency: "$",
      icon: "💱",
    },
    {
      key: "Crypto",
      name: "Crypto",
      currency: "$",
      icon: "₿",
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
    // Best Trade
    // ------------------------------------------

    const bestTrade =
      totalTrades === 0
        ? 0
        : Math.max(
            ...trades.map((trade) =>
              safeNumber(trade.realizedPnL)
            )
          );

    // ------------------------------------------
    // Worst Trade
    // ------------------------------------------

    const worstTrade =
      totalTrades === 0
        ? 0
        : Math.min(
            ...trades.map((trade) =>
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
      const trades = history.filter(
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