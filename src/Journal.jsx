import { useState } from "react";
import DailyPlan from "./DailyPlan";
import PositionCard from "./PositionCard";

export default function Journal({
  orders,
  setOrders,
  positions,
  setPositions,
  history,
  setHistory,
}) {

  // ==========================
  // STATES
  // ==========================

  const [editingIndex, setEditingIndex] = useState(null);

  // Returns today's date as YYYY-MM-DD in the user's LOCAL timezone.
  // (new Date().toISOString() gives the UTC date, which rolls over
  // before local midnight for timezones ahead of UTC, e.g. IST.)
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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

  // ==========================
  // HELPERS
  // ==========================

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

  // ==========================
  // FORM HANDLERS
  // ==========================

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

  // ==========================
  // AVERAGE PRICE
  // ==========================

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

  // ==========================
  // SEARCH & FILTER
  // ==========================

  const filteredOrders = orders.filter((order) => {

    const matchesSearch =
      (order.symbol || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      (order.strategy || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      (order.notes || "")
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
    // ==========================
  // SAVE ORDER
  // ==========================

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
      price: price,
      screenshot,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
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
    // NEW POSITION
    // ==========================

    let updatedPositions = [...positions];

    if (form.purpose === "New Position") {

      updatedPositions.push({
        symbol: form.symbol.toUpperCase(),
        market: form.market,
        product: form.product,
        action: form.action,
        qty: qty,
        avgPrice: price,
        realizedPnL: 0,
        status: "Open",
        screenshot,
        date: form.date,
      });

    }

    // ==========================
    // AVERAGE POSITION
    // ==========================

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

      if (
        updatedPositions[index].action !== form.action
      ) {
        alert(
          `Cannot average a ${form.action} position into a ${updatedPositions[index].action} trade.`
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

    setOrders([
      ...orders,
      orderData,
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

    setScreenshot(null);
  };

  // ==========================
  // EDIT ORDER
  // ==========================

  const editOrder = (index) => {

    setForm({
      ...orders[index],
    });

    setScreenshot(
      orders[index].screenshot || null
    );

    setEditingIndex(index);
  };
    // ==========================
  // PARTIAL EXIT
  // ==========================

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

    const closedQty = position.qty;

    position.realizedPnL += pnl;
    position.qty -= exitQty;

    // If fully closed after partial exit
    if (position.qty === 0) {

      position.status = "Closed";

      setHistory((prev) => [
        ...prev,
        {
          ...position,
          qty: closedQty,
          realizedPnL: position.realizedPnL,
          exitPrice,
          exitDate: getLocalDateString(),
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
  // ==========================
  // FULL EXIT
  // ==========================

  const fullExit = (index) => {

    const exitPrice = Number(prompt("Exit Price"));

    if (!exitPrice) return;

    const updatedPositions = [...positions];
    const position = updatedPositions[index];

    const pnl =
      position.action === "BUY"
        ? (exitPrice - position.avgPrice) * position.qty
        : (position.avgPrice - exitPrice) * position.qty;

    const closedQty = position.qty;

    position.realizedPnL += pnl;

    position.qty = 0;
    position.status = "Closed";

    setHistory((prev) => [
      ...prev,
      {
        ...position,
        qty: closedQty,
        realizedPnL: position.realizedPnL,
        exitPrice,
        exitDate: getLocalDateString(),
      },
    ]);

    updatedPositions.splice(index, 1);

    setPositions(updatedPositions);

    alert(
      `Trade Closed\nP&L : ${getCurrency(position.market)}${position.realizedPnL.toFixed(2)}`
    );
  };
    // ==========================
  // UI
  // ==========================

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
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={marketFilter}
          onChange={(e) => setMarketFilter(e.target.value)}
        >
          <option value="All">All Markets</option>
          <option value="Indian Market">Indian Market</option>
          <option value="Global Market">Global Market</option>
          <option value="Forex">Forex</option>
          <option value="Crypto">Crypto</option>
        </select>

        <select
          value={productFilter}
          onChange={(e) => setProductFilter(e.target.value)}
        >
          <option value="All">All Products</option>
          <option value="Intraday">Intraday</option>
          <option value="Swing">Swing</option>
          <option value="Delivery">Delivery</option>
          <option value="Spot">Spot</option>
          <option value="Perpetual">Perpetual</option>
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
          {editingIndex !== null ? "Edit Order" : "Add Order"}
        </h3>

        {editingIndex !== null && (
          <div
            style={{
              background: "#3b2f0b",
              color: "#facc15",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "15px",
            }}
          >
            🔒 Core trade details are locked.
            Only strategy, notes and screenshot can be edited.
          </div>
        )}

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
            disabled={editingIndex !== null}
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
            disabled={editingIndex !== null}
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
            disabled={editingIndex !== null}
            onChange={handleChange}
          />

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

          <div style={{ gridColumn: "1 / span 2" }}>
            <label>Trade Screenshot</label>

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
                }}
              />
            )}
          </div>
        </div>

        <button
          onClick={saveOrder}
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "12px",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
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
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => (
                <tr key={orders.indexOf(order)}>
                  <td>
                    <div>{order.date}</div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "#94a3b8",
                      }}
                    >
                      {order.time}
                    </div>
                  </td>

                  <td>{order.market}</td>

                  <td>{order.symbol}</td>

                  <td>{order.quantity}</td>

                  <td>
                    {getCurrency(order.market)}
                    {Number(order.price).toFixed(2)}
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
                    >
                      ✏️ Edit
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
                <th>Date</th>
                <th>Market</th>
                <th>Symbol</th>
                <th>Action</th>
                <th>Qty</th>
                <th>Avg Price</th>
                <th>Exit Price</th>
                <th>P&L</th>
                <th>Screenshot</th>
              </tr>
            </thead>

            <tbody>
              {[...history].reverse().map((trade, index) => (
                <tr key={index}>
                  <td>{trade.exitDate || trade.date}</td>

                  <td>{trade.market}</td>

                  <td>{trade.symbol}</td>

                  <td>{trade.action}</td>

                  <td>{trade.qty}</td>

                  <td>
                    {getCurrency(trade.market)}
                    {Number(trade.avgPrice).toFixed(2)}
                  </td>

                  <td>
                    {getCurrency(trade.market)}
                    {Number(trade.exitPrice || 0).toFixed(2)}
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
                    {Number(trade.realizedPnL).toFixed(2)}
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