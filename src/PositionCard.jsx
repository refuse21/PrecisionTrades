export default function PositionCard({
  position,
  onPartialExit,
  onFullExit,
}) {
  const currency =
  position.market === "Crypto"
    ? "$"
    : position.market === "Forex"
    ? "$"
    : "₹";

  return (
    <div
      style={{
        background: "#1e293b",
        padding: "20px",
        borderRadius: "12px",
        marginTop: "20px",
        border: "1px solid #334155",
      }}
    >
      <h3>{position.symbol}</h3>

      <p>
        <strong>Quantity:</strong> {position.qty}
      </p>

      <p>
        <strong>Average Price:</strong> {currency}{position.avgPrice}
      </p>

      <p>
        <strong>Status:</strong> {position.status}
      </p>

      <p>
       <strong>Realized P&L:</strong> {currency}{position.realizedPnL}
     </p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        <button onClick={onPartialExit}>
          Partial Exit
        </button>

        <button onClick={onFullExit}>
          Full Exit
        </button>
      </div>
    </div>
  );
}