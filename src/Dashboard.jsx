import DailyPlan from "./DailyPlan";

export default function Dashboard() {
  // ==========================================
  // Temporary Data (Later we'll connect Journal)
  // ==========================================

  const todayPerformance = {
    openPositions: 0,
    closedTrades: 0,
    todayTrades: 0,
    winRate: 0,
  };

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

  // ==========================================
  // Common Card Style
  // ==========================================

  const cardStyle = {
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
  };

  // ==========================================
  // Dashboard
  // ==========================================

  return (
    <div
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "30px",
      }}
    >
      


     {/* ======================================
        Today's Performance
====================================== */}

<section
  style={{
    marginBottom: "40px",
  }}
>
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
      gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
      gap: "20px",
    }}
  >
    {/* Open Positions */}

    <div style={cardStyle}>
      <h4
        style={{
          color: "#94a3b8",
          marginBottom: "10px",
        }}
      >
        📈 Open Positions
      </h4>

      <h1
        style={{
          fontSize: "38px",
          color: "#38bdf8",
        }}
      >
        {todayPerformance.openPositions}
      </h1>
    </div>

    {/* Closed Trades */}

    <div style={cardStyle}>
      <h4
        style={{
          color: "#94a3b8",
          marginBottom: "10px",
        }}
      >
        ✅ Closed Trades
      </h4>

      <h1
        style={{
          fontSize: "38px",
          color: "#22c55e",
        }}
      >
        {todayPerformance.closedTrades}
      </h1>
    </div>

    {/* Today's Orders */}

    <div style={cardStyle}>
      <h4
        style={{
          color: "#94a3b8",
          marginBottom: "10px",
        }}
      >
        📒 Today's Orders
      </h4>

      <h1
        style={{
          fontSize: "38px",
          color: "#f59e0b",
        }}
      >
        {todayPerformance.todayTrades}
      </h1>
    </div>

    {/* Win Rate */}

    <div style={cardStyle}>
      <h4
        style={{
          color: "#94a3b8",
          marginBottom: "10px",
        }}
      >
        🏆 Win Rate
      </h4>

      <h1
        style={{
          fontSize: "38px",
          color: "#a855f7",
        }}
      >
        {todayPerformance.winRate}%
      </h1>
    </div>
  </div>
</section>

      {/* ======================================
        Monthly Market P&L
====================================== */}

<section
  style={{
    marginBottom: "40px",
  }}
>
  <h2
    style={{
      marginBottom: "20px",
      fontSize: "24px",
    }}
  >
    Monthly Market P&L
  </h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
      gap: "20px",
    }}
  >

    {/* Indian */}

    <div style={cardStyle}>
      <h4
        style={{
          color: "#94a3b8",
          marginBottom: "12px",
        }}
      >
        🇮🇳 Indian Market
      </h4>

      <h1
        style={{
          fontSize: "36px",
          color:
            monthlyPnL.indian >= 0
              ? "#22c55e"
              : "#ef4444",
        }}
      >
        ₹ {monthlyPnL.indian.toFixed(2)}
      </h1>
    </div>

    {/* Global */}

    <div style={cardStyle}>
      <h4
        style={{
          color: "#94a3b8",
          marginBottom: "12px",
        }}
      >
        🌍 Global Market
      </h4>

      <h1
        style={{
          fontSize: "36px",
          color:
            monthlyPnL.global >= 0
              ? "#22c55e"
              : "#ef4444",
        }}
      >
        $ {monthlyPnL.global.toFixed(2)}
      </h1>
    </div>

    {/* Forex */}

    <div style={cardStyle}>
      <h4
        style={{
          color: "#94a3b8",
          marginBottom: "12px",
        }}
      >
        💱 Forex
      </h4>

      <h1
        style={{
          fontSize: "36px",
          color:
            monthlyPnL.forex >= 0
              ? "#22c55e"
              : "#ef4444",
        }}
      >
        $ {monthlyPnL.forex.toFixed(2)}
      </h1>
    </div>

    {/* Crypto */}

    <div style={cardStyle}>
      <h4
        style={{
          color: "#94a3b8",
          marginBottom: "12px",
        }}
      >
        ₿ Crypto
      </h4>

      <h1
        style={{
          fontSize: "36px",
          color:
            monthlyPnL.crypto >= 0
              ? "#22c55e"
              : "#ef4444",
        }}
      >
        $ {monthlyPnL.crypto.toFixed(2)}
      </h1>
    </div>

  </div>
</section>

      {/* ======================================
        Daily Plan + Current Equity
====================================== */}

<section
  style={{
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "20px",
    marginBottom: "40px",
  }}
>

  

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

    <h2
      style={{
        marginBottom: "20px",
      }}
    >
      📈 Equity Curve
    </h2>

    <div
      style={{
        height: "350px",
        borderRadius: "12px",
        background: "#0f172a",
        border: "1px dashed #334155",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        flexDirection: "column",
      }}
    >

      <div
        style={{
          fontSize: "70px",
        }}
      >
        📊
      </div>

      <h3
        style={{
          marginTop: "15px",
        }}
      >
        Equity Curve Coming Soon
      </h3>

      <p
        style={{
          color: "#94a3b8",
          marginTop: "10px",
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

    {recentActivity.length === 0 ? (

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

        <p>
          Your latest trades will appear here.
        </p>
      </div>

    ) : (

      recentActivity.map((trade, index) => (

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
              {trade.action}
            </strong>

            {" "}

            {trade.symbol}

          </div>

          <div
            style={{
              color: "#94a3b8",
            }}
          >
            {trade.date}
          </div>

        </div>

      ))

    )}

  </div>
</section>
    </div>
  );
}