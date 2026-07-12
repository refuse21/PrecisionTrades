export default function DailyPlan() {
  return (
    <div
      style={{
        background: "#1e293b",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "20px",
      }}
    >
      <h2>Today's Trading Plan</h2>

      <p>
        Plan your day before placing your first trade.
      </p>

      <input
        placeholder="Today's Goal"
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "15px",
        }}
      />
    </div>
  );
}