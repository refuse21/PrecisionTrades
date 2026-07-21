import { useState } from "react";
import DailyPlan from "./DailyPlan";
import PositionCard from "./PositionCard";

export default function Journal() {

  // =========================
  // STATES
  // =========================

  const [orders, setOrders] = useState([]);
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);

  const [editingIndex, setEditingIndex] = useState(null);

  const [search, setSearch] = useState("");

  const [marketFilter, setMarketFilter] = useState("All");
  const [productFilter, setProductFilter] = useState("All");

  const [screenshot, setScreenshot] = useState(null);

  const [form, setForm] = useState({
    market: "Indian Market",
    assetType: "Equity",
    product: "Intraday",
    symbol: "",
    action: "BUY",
    purpose: "New Position",
    quantity: "",
    price: "",
    date: "",
    strategy: "",
    notes: "",
  });

  // =========================
  // HELPERS
  // =========================

  const getCurrency = (market) => {
    switch (market) {
      case "Global Market":
      case "Forex":
      case "Crypto":
        return "$";
      default:
        return "₹";
    }
  };

  const getQuantityLabel = (market) => {
    switch (market) {
      case "Crypto":
        return "Coins";
      case "Forex":
        return "Lots";
      default:
        return "Shares";
    }
  };

  const tradingStyles = {
    "Indian Market": [
      "Intraday",
      "Swing",
      "Delivery",
    ],

    "Global Market": [
      "Intraday",
      "Swing",
      "Delivery",
    ],

    Forex: [
      "Intraday",
      "Swing",
    ],

    Crypto: [
      "Spot",
      "Perpetual",
    ],
  };

  // =========================
  // HANDLERS
  // =========================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleScreenshot = (e) => {
    if (!e.target.files.length) return;

    const file = e.target.files[0];

    setScreenshot(URL.createObjectURL(file));
  };

  const calculateAverage = (
    oldQty,
    oldPrice,
    newQty,
    newPrice
  ) => {
    return (
      (oldQty * oldPrice + newQty * newPrice) /
      (oldQty + newQty)
    );
  };

  // =========================
  // DASHBOARD VALUES
  // =========================

  const indianPnL = history
    .filter((t) => t.market === "Indian Market")
    .reduce((sum, t) => sum + t.realizedPnL, 0);

  const globalPnL = history
    .filter((t) => t.market === "Global Market")
    .reduce((sum, t) => sum + t.realizedPnL, 0);

  const forexPnL = history
    .filter((t) => t.market === "Forex")
    .reduce((sum, t) => sum + t.realizedPnL, 0);

  const cryptoPnL = history
    .filter((t) => t.market === "Crypto")
    .reduce((sum, t) => sum + t.realizedPnL, 0);

  const openPositions = positions.length;

  const closedTrades = history.length;

  const totalOrders = orders.length;

  const winningTrades = history.filter(
    (t) => t.realizedPnL > 0
  ).length;

  const winRate =
    closedTrades === 0
      ? 0
      : (
          (winningTrades / closedTrades) *
          100
        ).toFixed(1);

  const dashboard = {
    indianPnL,
    globalPnL,
    forexPnL,
    cryptoPnL,
    openPositions,
    closedTrades,
    totalOrders,
    winRate,
  };
    // =========================
  // FILTERED ORDERS
  // =========================

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.symbol
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      order.strategy
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      order.notes
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesMarket =
      marketFilter === "All" ||
      order.market === marketFilter;

    const matchesProduct =
      productFilter === "All" ||
      order.product === productFilter;

    return (
      matchesSearch &&
      matchesMarket &&
      matchesProduct
    );
  });

  // =========================
  // SAVE ORDER
  // =========================

  const saveOrder = () => {
  if (
    !form.symbol ||
    !form.quantity ||
    !form.price ||
    !form.date
  ) {
    alert("Please fill all required fields.");
    return;
  }

  const qty = Number(form.quantity);
  const price = Number(form.price);

  const orderData = {
    ...form,
    quantity: qty,
    price,
    screenshot,
  };

  // ==========================
  // EDIT ORDER
  // ==========================
  if (editingIndex !== null) {
    const updatedOrders = [...orders];
    updatedOrders[editingIndex] = orderData;
    setOrders(updatedOrders);

    setEditingIndex(null);

    setForm({
      market: "Indian Market",
      assetType: "Equity",
      product: "Intraday",
      symbol: "",
      action: "BUY",
      purpose: "New Position",
      quantity: "",
      price: "",
      date: "",
      strategy: "",
      notes: "",
    });

    setScreenshot(null);
    return;
  }

  // ==========================
  // NEW ORDER
  // ==========================

  let updatedPositions = [...positions];

  // NEW POSITION
  if (form.purpose === "New Position") {
    updatedPositions.push({
      symbol: form.symbol.toUpperCase(),
      market: form.market,
      product: form.product,
      action: form.action,
      qty,
      avgPrice: price,
      realizedPnL: 0,
      status: "Open",
      screenshot,
    });
  }

  // AVERAGE POSITION
  if (form.purpose === "Average Position") {
    const index = updatedPositions.findIndex(
      (p) =>
        p.symbol === form.symbol.toUpperCase() &&
        p.status !== "Closed"
    );

    if (index === -1) {
      alert("No Open Position Found");
      return;
    }

    if (updatedPositions[index].action !== form.action) {
      alert(
        `Cannot average a ${form.action} order into a ${updatedPositions[index].action} position.`
      );
      return;
    }

    updatedPositions[index].avgPrice =
      calculateAverage(
        updatedPositions[index].qty,
        updatedPositions[index].avgPrice,
        qty,
        price
      );

    updatedPositions[index].qty += qty;
  }

  setPositions(updatedPositions);

  setOrders([...orders, orderData]);

  setForm({
    market: "Indian Market",
    assetType: "Equity",
    product: "Intraday",
    symbol: "",
    action: "BUY",
    purpose: "New Position",
    quantity: "",
    price: "",
    date: "",
    strategy: "",
    notes: "",
  });

  setScreenshot(null);
};

  // =========================
  // EDIT ORDER
  // =========================

  const editOrder = (index) => {
    setForm({
      ...orders[index],
    });

    setScreenshot(
      orders[index].screenshot || null
    );

    setEditingIndex(index);
  };

  // =========================


  
    // =========================
  // PARTIAL EXIT
  // =========================

  const partialExit = (index) => {
    const exitQty = Number(prompt("Exit Quantity"));
    const exitPrice = Number(prompt("Exit Price"));

    if (!exitQty || !exitPrice) return;

    const updatedPositions = [...positions];
    const position = updatedPositions[index];

    if (exitQty > position.qty) {
      alert("Exit quantity exceeds current position.");
      return;
    }

   const pnl =
  position.action === "BUY"
    ? (exitPrice - position.avgPrice) * exitQty
    : (position.avgPrice - exitPrice) * exitQty;

    position.realizedPnL += pnl;
    position.qty -= exitQty;

    if (position.qty === 0) {
      position.status = "Closed";

      setHistory((prev) => [
        ...prev,
        {
          ...position,
        },
      ]);

      updatedPositions.splice(index, 1);
    } else {
      position.status = "Partial";
    }

    setPositions(updatedPositions);

    alert(
      `Booked P&L : ${getCurrency(position.market)}${pnl.toFixed(2)}`
    );
  };

  // =========================
  // FULL EXIT
  // =========================

  const fullExit = (index) => {
    const exitPrice = Number(prompt("Exit Price"));

    if (!exitPrice) return;

    const updatedPositions = [...positions];
    const position = updatedPositions[index];

   const pnl =
  position.action === "BUY"
    ? (exitPrice - position.avgPrice) * position.qty
    : (position.avgPrice - exitPrice) * position.qty;

    position.realizedPnL += pnl;

    position.qty = 0;
    position.status = "Closed";

    setHistory((prev) => [
      ...prev,
      {
        ...position,
      },
    ]);

    updatedPositions.splice(index, 1);

    setPositions(updatedPositions);

    alert(
      `Trade Closed\nP&L : ${getCurrency(position.market)}${position.realizedPnL.toFixed(2)}`
    );
  };
    // =========================
  // UI
  // =========================

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "1400px",
        margin: "auto",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>
        Trading Journal
      </h2>

      <DailyPlan />

      
      {/* ================= Search & Filters ================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <input
          placeholder="Search Symbol / Strategy / Notes"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={marketFilter}
          onChange={(e) =>
            setMarketFilter(e.target.value)
          }
        >
          <option value="All">All Markets</option>
          <option value="Indian Market">
            Indian Market
          </option>
          <option value="Global Market">
            Global Market
          </option>
          <option value="Forex">
            Forex
          </option>
          <option value="Crypto">
            Crypto
          </option>
        </select>

        <select
          value={productFilter}
          onChange={(e) =>
            setProductFilter(e.target.value)
          }
        >
          <option value="All">
            All Products
          </option>

          <option value="Intraday">
            Intraday
          </option>

          <option value="Swing">
            Swing
          </option>

          <option value="Delivery">
            Delivery
          </option>

          <option value="Spot">
            Spot
          </option>

          <option value="Perpetual">
            Perpetual
          </option>
        </select>
      </div>
            {/* ================= ADD ORDER ================= */}

      <div
        style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "30px",
        }}
      >
        <h3>
          {editingIndex !== null
            ? "Edit Order"
            : "Add Order"}
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          <select
            name="market"
            value={form.market}
            onChange={handleChange}
          >
            <option>Indian Market</option>
            <option>Global Market</option>
            <option>Forex</option>
            <option>Crypto</option>
          </select>

          <select
            name="product"
            value={form.product}
            onChange={handleChange}
          >
            {tradingStyles[form.market].map((style) => (
              <option key={style}>
                {style}
              </option>
            ))}
          </select>

          <input
            name="symbol"
            placeholder="Symbol"
            value={form.symbol}
            disabled={editingIndex !== null}
            onChange={handleChange}
          />
          {editingIndex !== null && (
  <div
    style={{
      background: "#3b2f0b",
      color: "#facc15",
      padding: "12px",
      borderRadius: "8px",
      marginBottom: "15px",
      border: "1px solid #facc15",
    }}
  >
    🔒 Core trade details are locked to preserve the accuracy of your historical P&L and analytics.
    <br />
    If any core trade details are incorrect, please delete the trade and create a new one.
  </div>
)}

          <select
            name="action"
            value={form.action}
            disabled={editingIndex !== null}
            onChange={handleChange}
          >
            <option>BUY</option>
            <option>SELL</option>
          </select>

          <select
            name="purpose"
            value={form.purpose}
            disabled={editingIndex !== null}
            onChange={handleChange}
          >
            <option>New Position</option>
            <option>Average Position</option>
          </select>

          <input
            type="number"
            name="quantity"
            placeholder={getQuantityLabel(form.market)}
            value={form.quantity}
            disabled={editingIndex !== null}
            onChange={handleChange}
          />

          <input
            type="number"
            name="price"
            placeholder={`${getCurrency(form.market)} Price`}
            value={form.price}
            disabled={editingIndex !== null}
            onChange={handleChange}
          />

          <input
            type="date"
            name="date"
            value={form.date}
            disabled={editingIndex !== null}
            onChange={handleChange}
          />

          <input
            name="strategy"
            placeholder="Strategy"
            value={form.strategy}
            onChange={handleChange}
          />

          <textarea
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={handleChange}
            style={{
              gridColumn: "1 / span 2",
              height: "80px",
            }}
          />

          <div
            style={{
              gridColumn: "1 / span 2",
            }}
          >
            <label>
              Trade Screenshot
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleScreenshot}
            />

            {screenshot && (
              <img
                src={screenshot}
                alt="Trade"
                style={{
                  width: "220px",
                  marginTop: "10px",
                  borderRadius: "8px",
                  border: "1px solid #444",
                }}
              />
            )}
          </div>
        </div>

        <button
          onClick={saveOrder}
          style={{
            marginTop: "20px",
            background: "#2563eb",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            width: "100%",
            fontSize: "16px",
          }}
        >
          {editingIndex !== null
            ? "Update Order"
            : "Save Order"}
        </button>
      </div>
            {/* ================= ORDERS ================= */}

      <div
        style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "30px",
        }}
      >
        <h3>Orders</h3>

        {filteredOrders.length === 0 ? (
          <p>No Orders Found</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th>Date</th>
                <th>Market</th>
                <th>Symbol</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Strategy</th>
                <th>Screenshot</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr key={orders.indexOf(order)}>
                  <td>{order.date}</td>
                  <td>{order.market}</td>
                  <td>{order.symbol}</td>
                  <td>{order.quantity}</td>

                  <td>
                    {getCurrency(order.market)}
                    {order.price}
                  </td>

                  <td>{order.strategy}</td>

                  <td>
                    {order.screenshot ? (
                      <img
                        src={order.screenshot}
                        alt="Trade"
                        style={{
                          width: "70px",
                          borderRadius: "6px",
                        }}
                      />
                    ) : (
                      "-"
                    )}
                  </td>

                  <td>
                    <button
                      onClick={() =>
                        editOrder(orders.indexOf(order))
                      }
                      style={{
                        marginRight: "8px",
                      }}
                    >
                      ✏️
                    </button>
                     </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= OPEN POSITIONS ================= */}

      <div
        style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "30px",
        }}
      >
        <h3>Open Positions</h3>

        {positions.length === 0 ? (
          <p>No Open Positions</p>
        ) : (
          positions.map((position, index) => (
            <PositionCard
              key={index}
              position={position}
              onPartialExit={() =>
                partialExit(index)
              }
              onFullExit={() =>
                fullExit(index)
              }
            />
          ))
        )}
      </div>
            {/* ================= TRADE HISTORY ================= */}

      <div
        style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "30px",
        }}
      >
        <h3>Trade History</h3>

        {history.length === 0 ? (
          <p>No Closed Trades</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th>Market</th>
                <th>Symbol</th>
                <th>Average Price</th>
                <th>P&L</th>
                <th>Screenshot</th>
              </tr>
            </thead>

            <tbody>
              {history.map((trade, index) => (
                <tr key={index}>
                  <td>{trade.market}</td>

                  <td>{trade.symbol}</td>

                  <td>
                    {getCurrency(trade.market)}
                    {trade.avgPrice.toFixed(2)}
                  </td>

                  <td
                    style={{
                      color:
                        trade.realizedPnL >= 0
                          ? "#22c55e"
                          : "#ef4444",
                      fontWeight: "bold",
                    }}
                  >
                    {getCurrency(trade.market)}
                    {trade.realizedPnL.toFixed(2)}
                  </td>

                  <td>
                    {trade.screenshot ? (
                      <img
                        src={trade.screenshot}
                        alt="Trade"
                        style={{
                          width: "70px",
                          borderRadius: "6px",
                        }}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}