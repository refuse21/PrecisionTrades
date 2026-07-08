import { useState } from "react";

export default function Journal() {
  const [orders, setOrders] = useState([]);
  const [positions, setPositions] = useState([]);

  const [form, setForm] = useState({
    market: "Equity",
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
      updatedPositions.push({
        symbol: form.symbol.toUpperCase(),
        qty,
        avgPrice: price,
        status: "Open",
      });
    }

    if (form.purpose === "Average Position") {
      const index = updatedPositions.findIndex(
        (p) =>
          p.symbol === form.symbol.toUpperCase() &&
          p.status === "Open"
      );

      if (index === -1) {
        alert("No Open Position Found");
        return;
      }

      const position = updatedPositions[index];

      position.avgPrice = calculateAverage(
        position.qty,
        position.avgPrice,
        qty,
        price
      );

      position.qty += qty;

      updatedPositions[index] = position;
    }

    setPositions(updatedPositions);

    setOrders([
      ...orders,
      {
        ...form,
        quantity: qty,
        price: price,
      },
    ]);

    setForm({
      market: "Equity",
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

  return (
    <div style={{ padding: "20px" }}>
      <h2>Trading Journal</h2>

      {/* Add Order Form */}

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
            <option>Equity</option>
            <option>Futures</option>
            <option>Options</option>
            <option>Crypto</option>
          </select>

          <select
            name="product"
            value={form.product}
            onChange={handleChange}
          >
            <option>Intraday</option>
            <option>Delivery</option>
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
            placeholder="Quantity"
            value={form.quantity}
            onChange={handleChange}
          />

          <input
            type="number"
            name="price"
            placeholder="Price"
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

      {/* Orders */}

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

      {/* Open Positions */}

      <div
        style={{
          marginTop: "30px",
          background: "#1e293b",
          padding: "20px",
          borderRadius: "12px",
        }}
      >
        <h3>Open Positions</h3>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Quantity</th>
              <th>Average Price</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {positions.map((position, index) => (
              <tr key={index}>
                <td>{position.symbol}</td>
                <td>{position.qty}</td>
                <td>{position.avgPrice.toFixed(2)}</td>
                <td>{position.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}