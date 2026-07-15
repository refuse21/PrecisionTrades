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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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

      console.log("Selected Market:", form.market),
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

      updatedPositions[index].avgPrice = calculateAverage(
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

  const partialExit = (index) => {
    const exitQty = Number(prompt("Exit Quantity"));
    const exitPrice = Number(prompt("Exit Price"));

    if (!exitQty || !exitPrice) return;

    const updatedPositions = [...positions];

    const position = updatedPositions[index];

    if (exitQty > position.qty) {
      alert("Exit quantity cannot exceed current quantity.");
      return;
    }

    const pnl =
      (exitPrice - position.avgPrice) * exitQty;

    position.realizedPnL += pnl;
    position.qty -= exitQty;

    if (position.qty === 0) {
      position.status = "Closed";

      setHistory((prev) => [...prev, position]);

      updatedPositions.splice(index, 1);
    } else {
      position.status = "Partial";
      updatedPositions[index] = position;
    }

    setPositions(updatedPositions);

    alert(`Booked P&L : ${currency}${pnl}`);
  };
const tradingStyles = {
  "Indian Market": ["Intraday", "Swing", "Delivery"],
  "Global Market": ["Intraday", "Swing", "Delivery"],
  Forex: ["Intraday", "Swing"],
  Crypto: ["Spot", "Perpetual"],
};

const currency =
  form.market === "Indian Market" ? "₹" : "$";

const quantityLabel =
  form.market === "Crypto"
    ? "Coins"
    : form.market === "Forex"
    ? "Lots"
    : "Shares";
  const fullExit = (index) => {
    const exitPrice = Number(prompt("Exit Price"));

    if (!exitPrice) return;

    const updatedPositions = [...positions];


    const position = updatedPositions[index];
    const currency =
       position.market === "Indian Market" ? "₹" : "$";
    console.log(position);

    const pnl =
      (exitPrice - position.avgPrice) * position.qty;

    position.realizedPnL += pnl;
    position.qty = 0;
    position.status = "Closed";

    setHistory((prev) => [...prev, position]);

    updatedPositions.splice(index, 1);

    setPositions(updatedPositions);

    alert(`Trade Closed\nP&L : ${currency}${position.realizedPnL}`);
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
    <option key={style} value={style}>
      {style}
    </option>
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
            placeholder={quantityLabel}
            value={form.quantity}
            onChange={handleChange}
          />

          <input
            type="number"
            name="price"
            placeholder={`${currency} Price`}
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

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>Date</th>
              <th>Symbol</th>
              <th>Action</th>
              <th>Purpose</th>
              <th>Qty</th>
              <th>Price</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order, index) => (
              <tr key={index}>
                <td>{order.date}</td>
                <td>{order.symbol}</td>
                <td>{order.action}</td>
                <td>{order.purpose}</td>
                <td>{order.quantity}</td>
                <td>{order.price}</td>
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

      {/* ---------------- CLOSED TRADES ---------------- */}

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
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Average Price</th>
                <th>Realized P&amp;L</th>
              </tr>
            </thead>

            <tbody>
              {history.map((trade, index) => (
                <tr key={index}>
                  <td>{trade.symbol}</td>
                  <td>₹{trade.avgPrice}</td>
                  <td
                    style={{
                      color:
                        trade.realizedPnL >= 0
                          ? "#22c55e"
                          : "#ef4444",
                      fontWeight: "bold",
                    }}
                  >
                    ₹{trade.realizedPnL}
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