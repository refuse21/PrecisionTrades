export default function Dashboard({
  indianPnL,
  globalPnL,
  forexPnL,
  cryptoPnL,
  openPositions,
  closedTrades,
  totalOrders,
  winRate,
}) {
  const cardStyle = {
  background: "#1e293b",
  padding: "20px",
  borderRadius: "15px",
  border: "1px solid #334155",
  boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  textAlign: "center",
};
  const pnlColor = (value) =>
    value >= 0 ? "#22c55e" : "#ef4444";

  return (
    <>
      {/* Market P&L */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: "18px",
          marginBottom: "20px",
        }}
      >
        <div
  style={cardStyle}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-6px)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0px)";
  }}
>
          <h4>🇮🇳 Indian</h4>
          <h2 style={{ fontSize: "32px" }}>
            ₹ {indianPnL.toFixed(2)}
          </h2>
        </div>

        <div
  style={cardStyle}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-6px)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "translateY(0px)";
  }}
>
          <h4 style={{ color: "#94a3b8" }}>🌍 Global</h4>
          <h2 style={{ fontSize: "32px" }}>
            $ {globalPnL.toFixed(2)}
          </h2>
        </div>

        <div style={cardStyle}>
          <h4 style={{ color: "#94a3b8" }}>💱 Forex</h4>
          <h2 style={{ fontSize: "32px" }}>
            $ {forexPnL.toFixed(2)}
          </h2>
        </div>

        <div style={cardStyle}>
          <h4 style={{ color: "#94a3b8" }}>₿ Crypto</h4>
          <h2 style={{ fontSize: "32px" }}>
            $ {cryptoPnL.toFixed(2)}
          </h2>
        </div>
      </div>

      {/* Statistics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(180px,1fr))",
          gap: "18px",
          marginBottom: "30px",
        }}
      >
        <div style={cardStyle}>
          <h4>Open Positions</h4>
          <h2>{openPositions}</h2>
        </div>

        <div style={cardStyle}>
          <h4>Closed Trades</h4>
          <h2>{closedTrades}</h2>
        </div>

        <div style={cardStyle}>
          <h4>Total Orders</h4>
          <h2>{totalOrders}</h2>
        </div>

        <div style={cardStyle}>
          <h4>Win Rate</h4>
          <h2>{winRate}%</h2>
        </div>
      </div>
    </>
  );
}