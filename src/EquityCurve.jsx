// ==========================================
// EQUITY CURVE (simplified)
// ==========================================
// One colored line per market showing cumulative realized P&L over
// time. Plain SVG, no dependency, no clutter.

export default function EquityCurve({ history = [], markets = [] }) {
  const getDate = (t) => t.exitDate || t.date;

  // Build a cumulative P&L series per market
  const series = markets
    .map((m) => {
      const points = history
        .filter((t) => t.market === m.key && getDate(t))
        .map((t) => ({
          time: new Date(`${getDate(t)}T12:00:00`).getTime(),
          pnl: Number(t.realizedPnL) || 0,
        }))
        .sort((a, b) => a.time - b.time);

      let running = 0;
      const cumulative = points.map((p) => ({
        time: p.time,
        equity: (running += p.pnl),
      }));

      return { ...m, points: cumulative };
    })
    .filter((s) => s.points.length > 0);

  if (series.length === 0) {
    return (
      <div style={emptyStyle}>
        No closed trades yet — the equity curve will appear once you have trade history.
      </div>
    );
  }

  // Scales
  const width = 1000;
  const height = 300;
  const pad = { top: 20, right: 20, bottom: 30, left: 60 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;

  const times = series.flatMap((s) => s.points.map((p) => p.time));
  const equities = series.flatMap((s) => s.points.map((p) => p.equity));

  const minT = Math.min(...times);
  const maxT = Math.max(...times) || minT + 1;
  const minE = Math.min(0, ...equities);
  const maxE = Math.max(0, ...equities) || 1;

  const x = (t) => pad.left + ((t - minT) / (maxT - minT || 1)) * w;
  const y = (v) => pad.top + h - ((v - minE) / (maxE - minE || 1)) * h;

  const zeroY = y(0);

  return (
    <div style={cardStyle}>
      <div style={headerRow}>
        <h3 style={{ fontSize: "20px", margin: 0 }}>📈 Equity Curve</h3>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {series.map((s) => (
            <span key={s.key} style={legendItem}>
              <span style={{ ...dot, background: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto" }}>
        {/* Zero baseline only — no extra grid clutter */}
        <line x1={pad.left} x2={width - pad.right} y1={zeroY} y2={zeroY}
          stroke="#475569" strokeWidth="1.5" strokeDasharray="4 4" />

        {series.map((s) => (
          <path
            key={s.key}
            fill="none"
            stroke={s.color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            d={s.points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.time)} ${y(p.equity)}`).join(" ")}
          />
        ))}
      </svg>

      <p style={noteStyle}>
        Cumulative realized P&L per market. Currencies differ (₹ / $), so lines show trend, not a directly comparable total.
      </p>
    </div>
  );
}

const cardStyle = {
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "16px",
  padding: "20px",
  marginBottom: "45px",
};

const emptyStyle = {
  ...cardStyle,
  textAlign: "center",
  color: "#64748b",
};

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "12px",
  marginBottom: "10px",
};

const legendItem = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "13px",
  color: "#cbd5e1",
};

const dot = {
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  display: "inline-block",
};

const noteStyle = {
  color: "#64748b",
  fontSize: "12px",
  marginTop: "10px",
  marginBottom: 0,
};