import { useState } from "react";
import DailyPlan from "./DailyPlan";
import PositionCard from "./PositionCard";

export default function Journal() {
  const [orders, setOrders] = useState([]);
  const [positions, setPositions] = useState([]);
  const [history, setHistory] = useState([]);

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

  // ---------------- Currency ----------------

  const getCurrency = (market) => {
    switch (market) {
      case "Crypto":
      case "Forex":
      case "Global Market":
        return "$";

      default:
        return "₹";
    }
  };

  // ---------------- Quantity Label ----------------

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

  // ---------------- Product Options ----------------

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

  // ---------------- Handle Change ----------------

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ---------------- Average Price ----------------

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

  // ---------------- Save Order ----------------

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

    let updatedPositions = [...positions];

    if (form.purpose === "New Position") {
      updatedPositions.push({
        symbol: form.symbol.toUpperCase(),
        market: form.market,
        qty,
        avgPrice: price,
        realizedPnL: 0,
        status: "Open",
      });
    }

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

    setOrders([
      ...orders,
      {
        ...form,
        quantity: qty,
        price,
      },
    ]);

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
  };

  // ---------------- Partial Exit ----------------

  const partialExit = (index) => {
    const exitQty = Number(prompt("Exit Quantity"));
    const exitPrice = Number(prompt("Exit Price"));

    if (!exitQty || !exitPrice) return;

    const updatedPositions = [...positions];
    const position = updatedPositions[index];

    if (exitQty > position.qty) {
      alert("Exit quantity exceeds position.");
      return;
    }

    const pnl =
      (exitPrice - position.avgPrice) *
      exitQty;

    position.realizedPnL += pnl;
    position.qty -= exitQty;

    if (position.qty === 0) {
      position.status = "Closed";

      setHistory((prev) => [
        ...prev,
        { ...position },
      ]);

      updatedPositions.splice(index, 1);
    } else {
      position.status = "Partial";
    }

    setPositions(updatedPositions);

    alert(
      `Booked P&L : ${getCurrency(
        position.market
      )}${pnl.toFixed(2)}`
    );
  };

  // ---------------- Full Exit ----------------

  const fullExit = (index) => {
    const exitPrice = Number(prompt("Exit Price"));

    if (!exitPrice) return;

    const updatedPositions = [...positions];

    const position = updatedPositions[index];

    const pnl =
      (exitPrice - position.avgPrice) *
      position.qty;

    position.realizedPnL += pnl;
    position.qty = 0;
    position.status = "Closed";

    setHistory((prev) => [
      ...prev,
      { ...position },
    ]);

    updatedPositions.splice(index, 1);

    setPositions(updatedPositions);

    alert(
      `Trade Closed\nP&L : ${getCurrency(
        position.market
      )}${position.realizedPnL.toFixed(2)}`
    );
  };
    return (
    <div style={{ padding: "20px" }}>
      <h2>Trading Journal</h2>

      <DailyPlan />

      {/* ---------------- ADD ORDER ---------------- */}

      <div
        style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "12px",
          marginTop: "20px",
        }}
      >
        <h3>Add Order</h3>

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
              <option key={style}>{style}</option>
            ))}
          </select>

          <input
            name="symbol"
            placeholder="Symbol"
            value={form.symbol}
            onChange={handleChange}
          />

          <select
            name="action"
            value={form.action}
            onChange={handleChange}
          >
            <option>BUY</option>
            <option>SELL</option>
          </select>

          <select
            name="purpose"
            value={form.purpose}
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
            onChange={handleChange}
          />

          <input
            type="number"
            name="price"
            placeholder={`${getCurrency(form.market)} Price`}
            value={form.price}
            onChange={handleChange}
          />

          <input
            type="date"
            name="date"
            value={form.date}
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
          }}
        >
          Save Order
        </button>
      </div>

      {/* ---------------- ORDERS ---------------- */}

      <div
        style={{
          marginTop: "30px",
          background: "#1e293b",
          padding: "20px",
          borderRadius: "12px",
        }}
      >
        <h3>Orders</h3>

        <table style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Market</th>
              <th>Symbol</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order, index) => (
              <tr key={index}>
                <td>{order.date}</td>
                <td>{order.market}</td>
                <td>{order.symbol}</td>
                <td>{order.quantity}</td>
                <td>
                  {getCurrency(order.market)}
                  {order.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- OPEN POSITIONS ---------------- */}

      <div
        style={{
          marginTop: "30px",
          background: "#1e293b",
          padding: "20px",
          borderRadius: "12px",
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
              onPartialExit={() => partialExit(index)}
              onFullExit={() => fullExit(index)}
            />
          ))
        )}
      </div>

      {/* ---------------- HISTORY ---------------- */}

      <div
        style={{
          marginTop: "30px",
          background: "#1e293b",
          padding: "20px",
          borderRadius: "12px",
        }}
      >
        <h3>Trade History</h3>

        {history.length === 0 ? (
          <p>No Closed Trades</p>
        ) : (
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Market</th>
                <th>Symbol</th>
                <th>Average Price</th>
                <th>Realized P&L</th>
              </tr>
            </thead>

            <tbody>
              {history.map((trade, index) => (
                <tr key={index}>
                  <td>{trade.market}</td>

                  <td>{trade.symbol}</td>

                  <td>
                    {getCurrency(trade.market)}
                    {trade.avgPrice}
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
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}