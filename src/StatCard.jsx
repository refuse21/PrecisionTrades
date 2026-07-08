export default function StatCard({ title, value, color }) {
  return (
    <div
      style={{
        backgroundColor: "#334155",
        padding: "20px",
        borderRadius: "12px",
        width: "180px",
        textAlign: "center",
      }}
    >
      <h3>{title}</h3>

      <h1 style={{ color }}>{value}</h1>
    </div>
  );
}