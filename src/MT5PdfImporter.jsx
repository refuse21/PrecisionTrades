import { useMemo, useState } from "react";

const emptyForm = { strategy: "", notes: "" };

const getLinesFromPdf = async (file) => {
  if (!window.pdfjsLib) {
    throw new Error("PDF reader is still loading. Please try again in a moment.");
  }

  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  const buffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
  const lines = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const rows = new Map();

    for (const item of content.items) {
      if (!item.str || !item.str.trim()) continue;
      const x = item.transform?.[4] ?? 0;
      const y = item.transform?.[5] ?? 0;
      const key = Math.round(y / 2) * 2;
      if (!rows.has(key)) rows.set(key, []);
      rows.get(key).push({ x, text: item.str.trim() });
    }

    const pageLines = [...rows.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([, items]) =>
        items
          .sort((a, b) => a.x - b.x)
          .map((item) => item.text)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim()
      )
      .filter(Boolean);

    lines.push(...pageLines);
  }

  return lines;
};

const parseDateTime = (value) => {
  const match = value.match(/(\d{4}[./-]\d{2}[./-]\d{2})\s+(\d{2}:\d{2}:\d{2})/);
  if (!match) return null;
  return {
    date: match[1].replaceAll(".", "-").replaceAll("/", "-"),
    time: match[2],
  };
};

const parseTradeLine = (line, index) => {
  const dateTime = parseDateTime(line);
  if (!dateTime) return null;

  const tokens = line.split(/\s+/);
  const dateIndex = tokens.findIndex((token) => /^\d{4}[./-]\d{2}[./-]\d{2}$/.test(token));
  if (dateIndex < 0) return null;

  const timeIndex = dateIndex + 1;
  if (!/^\d{2}:\d{2}:\d{2}$/.test(tokens[timeIndex] || "")) return null;

  const afterTime = tokens.slice(timeIndex + 1);
  const sideIndex = afterTime.findIndex((token) => /^(buy|sell)$/i.test(token));
  if (sideIndex < 1) return null;

  const action = afterTime[sideIndex].toUpperCase();
  const symbol = afterTime[sideIndex - 1];
  const quantity = Number(String(afterTime[sideIndex + 1] || "").replace(/,/g, ""));
  const price = Number(String(afterTime[sideIndex + 2] || "").replace(/,/g, ""));

  if (!symbol || !Number.isFinite(quantity) || !Number.isFinite(price)) return null;
  if (/^(balance|credit|charge|deposit|withdrawal)$/i.test(symbol)) return null;

  return {
    id: `${dateTime.date}-${dateTime.time}-${symbol}-${action}-${index}`,
    market: "Forex",
    assetType: "Forex",
    product: "Intraday",
    symbol: symbol.toUpperCase(),
    action,
    purpose: "New Position",
    quantity,
    price,
    date: dateTime.date,
    time: dateTime.time,
    strategy: "",
    notes: "Imported from MT5 PDF",
    importedFrom: "MT5 PDF",
  };
};

const parseMt5Trades = (lines) => {
  const trades = lines.map(parseTradeLine).filter(Boolean);
  const seen = new Set();

  return trades.filter((trade) => {
    const key = `${trade.date}|${trade.time}|${trade.symbol}|${trade.action}|${trade.quantity}|${trade.price}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export default function MT5PdfImporter({ orders, setOrders }) {
  const [fileName, setFileName] = useState("");
  const [parsedTrades, setParsedTrades] = useState([]);
  const [selected, setSelected] = useState({});
  const [strategy, setStrategy] = useState(emptyForm.strategy);
  const [notes, setNotes] = useState(emptyForm.notes);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const selectedTrades = useMemo(
    () => parsedTrades.filter((trade) => selected[trade.id]),
    [parsedTrades, selected]
  );

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setStatus("Reading MT5 PDF…");
    setFileName(file.name);

    try {
      const lines = await getLinesFromPdf(file);
      const trades = parseMt5Trades(lines);
      setParsedTrades(trades);
      setSelected(Object.fromEntries(trades.map((trade) => [trade.id, true])));
      setStatus(
        trades.length
          ? `${trades.length} trade${trades.length === 1 ? "" : "s"} detected. Review them before importing.`
          : "No trade rows were detected. This PDF may use a different MT5 report layout."
      );
    } catch (error) {
      setParsedTrades([]);
      setSelected({});
      setStatus(error.message || "Could not read this PDF.");
    } finally {
      setBusy(false);
    }
  };

  const toggleAll = () => {
    const shouldSelectAll = selectedTrades.length !== parsedTrades.length;
    setSelected(Object.fromEntries(parsedTrades.map((trade) => [trade.id, shouldSelectAll])));
  };

  const importTrades = () => {
    if (!selectedTrades.length) return;

    const existingKeys = new Set(
      orders.map((order) => `${order.date}|${order.time}|${order.symbol}|${order.action}|${order.quantity}|${order.price}`)
    );

    const newTrades = selectedTrades
      .filter(
        (trade) =>
          !existingKeys.has(
            `${trade.date}|${trade.time}|${trade.symbol}|${trade.action}|${trade.quantity}|${trade.price}`
          )
      )
      .map((trade) => ({ ...trade, strategy, notes }));

    if (!newTrades.length) {
      setStatus("Those trades are already in the journal.");
      return;
    }

    setOrders([...orders, ...newTrades]);
    setParsedTrades([]);
    setSelected({});
    setStatus(`${newTrades.length} trade${newTrades.length === 1 ? "" : "s"} imported into the journal.`);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "auto" }}>
      <h2>Import MT5 Trades</h2>
      <p style={{ color: "#94a3b8" }}>
        Upload an MT5 PDF report. PrecisionTrades will detect trade rows and prepare them for your journal.
      </p>

      <div style={{ background: "#1e293b", padding: "20px", borderRadius: "12px", marginTop: "20px" }}>
        <label style={{ display: "block", marginBottom: "10px", fontWeight: 700 }}>
          MT5 Trade Report PDF
        </label>
        <input type="file" accept="application/pdf,.pdf" onChange={handleFile} disabled={busy} />
        {fileName && <p style={{ color: "#cbd5e1" }}>{fileName}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
          <input value={strategy} onChange={(e) => setStrategy(e.target.value)} placeholder="Strategy for imported trades (optional)" />
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes for imported trades (optional)" />
        </div>

        {status && <p style={{ color: "#cbd5e1", marginTop: "14px" }}>{status}</p>}
      </div>

      {parsedTrades.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h3>{selectedTrades.length} selected / {parsedTrades.length} detected</h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={toggleAll}>
                {selectedTrades.length === parsedTrades.length ? "Clear all" : "Select all"}
              </button>
              <button onClick={importTrades} disabled={!selectedTrades.length}>
                Import selected trades
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto", background: "#1e293b", borderRadius: "12px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ padding: "10px", textAlign: "left" }}>Import</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Date</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Time</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Symbol</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Side</th>
                  <th style={{ padding: "10px", textAlign: "right" }}>Volume</th>
                  <th style={{ padding: "10px", textAlign: "right" }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {parsedTrades.map((trade) => (
                  <tr key={trade.id} style={{ borderTop: "1px solid #334155" }}>
                    <td style={{ padding: "10px" }}>
                      <input
                        type="checkbox"
                        checked={!!selected[trade.id]}
                        onChange={() =>
                          setSelected((prev) => ({ ...prev, [trade.id]: !prev[trade.id] }))
                        }
                      />
                    </td>
                    <td style={{ padding: "10px" }}>{trade.date}</td>
                    <td style={{ padding: "10px" }}>{trade.time}</td>
                    <td style={{ padding: "10px" }}>{trade.symbol}</td>
                    <td style={{ padding: "10px" }}>{trade.action}</td>
                    <td style={{ padding: "10px", textAlign: "right" }}>{trade.quantity}</td>
                    <td style={{ padding: "10px", textAlign: "right" }}>{trade.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
