import { useMemo, useState } from "react";

const numberValue = (value) => {
  const cleaned = String(value ?? "").replace(/\u00a0/g, " ").replace(/,/g, "").replace(/[^0-9+\-.]/g, "");
  const result = Number(cleaned);
  return Number.isFinite(result) ? result : null;
};

const dateTimeValue = (value) => {
  const match = String(value ?? "").trim().match(/(\d{4})[./-](\d{2})[./-](\d{2})\s+(\d{2}:\d{2}:\d{2})/);
  if (!match) return null;
  return { date: `${match[1]}-${match[2]}-${match[3]}`, time: match[4] };
};

const makeTrade = ({ index, ticket, openTime, type, volume, symbol, entry, sl, tp, closeTime, exit, commission, fee, swap, profit }) => {
  const opened = dateTimeValue(openTime);
  const closed = dateTimeValue(closeTime);
  const action = String(type ?? "").trim().toUpperCase();
  const quantity = numberValue(volume);
  const entryPrice = numberValue(entry);
  if (!opened || !/^(BUY|SELL)$/.test(action) || !symbol || quantity === null || entryPrice === null) return null;

  const commissionValue = numberValue(commission) ?? 0;
  const feeValue = numberValue(fee) ?? 0;
  const swapValue = numberValue(swap) ?? 0;
  const mt5Profit = numberValue(profit);
  const realizedPnL = mt5Profit === null ? null : mt5Profit + commissionValue + feeValue + swapValue;

  return {
    id: `${ticket || "mt5"}-${opened.date}-${opened.time}-${symbol}-${action}-${index}`,
    ticket: ticket || "",
    market: "Crypto",
    assetType: "Crypto",
    product: "Perpetual",
    symbol: String(symbol).trim().toUpperCase(),
    action,
    purpose: "New Position",
    quantity,
    price: entryPrice,
    date: opened.date,
    time: opened.time,
    strategy: "",
    notes: "Imported from MT5 history",
    importedFrom: "MT5 History",
    stopLoss: numberValue(sl),
    takeProfit: numberValue(tp),
    exitDate: closed?.date || "",
    exitTime: closed?.time || "",
    exitPrice: numberValue(exit),
    commission: commissionValue,
    fee: feeValue,
    swap: swapValue,
    mt5Profit,
    realizedPnL,
    status: closed ? "Closed" : "Open",
  };
};

const dedupe = (trades) => {
  const seen = new Set();
  return trades.filter((trade) => {
    const key = `${trade.ticket}|${trade.date}|${trade.time}|${trade.symbol}|${trade.action}|${trade.quantity}|${trade.price}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const parseHtml = (html) => {
  const document = new DOMParser().parseFromString(html, "text/html");
  const trades = [];

  document.querySelectorAll("table").forEach((table, tableIndex) => {
    const rows = [...table.querySelectorAll("tr")];
    const headerIndex = rows.findIndex((row) => {
      const cells = [...row.querySelectorAll("th,td")].map((cell) => cell.textContent.replace(/\s+/g, " ").trim().toLowerCase());
      return cells.includes("ticket") && cells.includes("type") && cells.includes("volume") && cells.includes("symbol");
    });
    if (headerIndex < 0) return;

    const headers = [...rows[headerIndex].querySelectorAll("th,td")].map((cell) => cell.textContent.replace(/\s+/g, " ").trim().toLowerCase());
    const timeColumns = headers.reduce((list, value, index) => value === "time" ? [...list, index] : list, []);
    const priceColumns = headers.reduce((list, value, index) => value === "price" ? [...list, index] : list, []);
    const find = (name) => headers.findIndex((value) => value === name);

    const columns = {
      ticket: find("ticket"),
      type: find("type"),
      volume: find("volume"),
      symbol: find("symbol"),
      sl: headers.findIndex((value) => value === "s / l" || value === "s/l"),
      tp: headers.findIndex((value) => value === "t / p" || value === "t/p"),
      commission: find("commission"),
      fee: find("fee"),
      swap: find("swap"),
      profit: find("profit"),
    };

    rows.slice(headerIndex + 1).forEach((row, rowIndex) => {
      const cells = [...row.querySelectorAll("th,td")].map((cell) => cell.textContent.replace(/\s+/g, " ").trim());
      if (cells.length < headers.length || timeColumns.length < 2 || priceColumns.length < 2) return;
      const trade = makeTrade({
        index: `${tableIndex}-${rowIndex}`,
        ticket: cells[columns.ticket],
        openTime: cells[timeColumns[0]],
        type: cells[columns.type],
        volume: cells[columns.volume],
        symbol: cells[columns.symbol],
        entry: cells[priceColumns[0]],
        sl: columns.sl >= 0 ? cells[columns.sl] : "",
        tp: columns.tp >= 0 ? cells[columns.tp] : "",
        closeTime: cells[timeColumns[1]],
        exit: cells[priceColumns[1]],
        commission: columns.commission >= 0 ? cells[columns.commission] : "0",
        fee: columns.fee >= 0 ? cells[columns.fee] : "0",
        swap: columns.swap >= 0 ? cells[columns.swap] : "0",
        profit: columns.profit >= 0 ? cells[columns.profit] : "",
      });
      if (trade) trades.push(trade);
    });
  });

  return dedupe(trades);
};

const getPdfLines = async (file) => {
  if (!window.pdfjsLib) throw new Error("PDF reader is still loading. Please try again in a moment.");
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const pdf = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const lines = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const rows = new Map();
    content.items.forEach((item) => {
      if (!item.str?.trim()) return;
      const x = item.transform?.[4] ?? 0;
      const y = item.transform?.[5] ?? 0;
      const key = Math.round(y / 2) * 2;
      if (!rows.has(key)) rows.set(key, []);
      rows.get(key).push({ x, text: item.str.trim() });
    });
    lines.push(...[...rows.entries()].sort((a, b) => b[0] - a[0]).map(([, items]) => items.sort((a, b) => a.x - b.x).map((item) => item.text).join(" ").replace(/\s+/g, " ").trim()).filter(Boolean));
  }
  return lines;
};

const parsePdf = (lines) => {
  const trades = [];
  lines.forEach((line, index) => {
    const tokens = line.split(/\s+/);
    const dateIndex = tokens.findIndex((token, i) => /^\d{4}[./-]\d{2}[./-]\d{2}$/.test(token) && /^\d{2}:\d{2}:\d{2}$/.test(tokens[i + 1] || ""));
    if (dateIndex < 0) return;
    const sideIndex = tokens.findIndex((token, i) => i > dateIndex + 1 && /^(buy|sell)$/i.test(token));
    if (sideIndex < 1) return;
    const trade = makeTrade({
      index,
      openTime: `${tokens[dateIndex]} ${tokens[dateIndex + 1]}`,
      ticket: tokens[dateIndex + 2],
      type: tokens[sideIndex],
      volume: tokens[sideIndex + 1],
      symbol: tokens[sideIndex + 2],
      entry: tokens[sideIndex + 3],
      sl: tokens[sideIndex + 4],
      tp: tokens[sideIndex + 5],
      closeTime: /^\d{4}[./-]\d{2}[./-]\d{2}$/.test(tokens[sideIndex + 6] || "") ? `${tokens[sideIndex + 6]} ${tokens[sideIndex + 7]}` : "",
      exit: tokens[sideIndex + 8],
      commission: tokens[sideIndex + 9],
      fee: tokens[sideIndex + 10],
      swap: tokens[sideIndex + 11],
      profit: tokens[sideIndex + 12],
    });
    if (trade) trades.push(trade);
  });
  return dedupe(trades);
};

export default function MT5PdfImporter({ orders, setOrders, setHistory }) {
  const [fileName, setFileName] = useState("");
  const [parsedTrades, setParsedTrades] = useState([]);
  const [selected, setSelected] = useState({});
  const [strategy, setStrategy] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const selectedTrades = useMemo(() => parsedTrades.filter((trade) => selected[trade.id]), [parsedTrades, selected]);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setFileName(file.name);
    setStatus(`Reading ${file.name}…`);
    try {
      const extension = file.name.toLowerCase().split(".").pop();
      const trades = extension === "html" || extension === "htm" ? parseHtml(await file.text()) : extension === "pdf" ? parsePdf(await getPdfLines(file)) : [];
      if (!trades.length && !["html", "htm", "pdf"].includes(extension)) throw new Error("Please upload an MT5 HTML or PDF report.");
      setParsedTrades(trades);
      setSelected(Object.fromEntries(trades.map((trade) => [trade.id, true])));
      setStatus(trades.length ? `${trades.length} trade${trades.length === 1 ? "" : "s"} detected. Review before importing.` : "No MT5 trade rows were detected in this file.");
    } catch (error) {
      setParsedTrades([]);
      setSelected({});
      setStatus(error.message || "Could not read this file.");
    } finally {
      setBusy(false);
    }
  };

  const importTrades = () => {
    if (!selectedTrades.length) return;
    const existing = new Set(orders.map((order) => `${order.ticket || ""}|${order.date}|${order.time}|${order.symbol}|${order.action}|${order.quantity}|${order.price}`));
    const newTrades = selectedTrades.filter((trade) => !existing.has(`${trade.ticket || ""}|${trade.date}|${trade.time}|${trade.symbol}|${trade.action}|${trade.quantity}|${trade.price}`)).map((trade) => ({ ...trade, strategy, notes: notes || trade.notes }));
    if (!newTrades.length) {
      setStatus("Those trades are already in the journal.");
      return;
    }
    setOrders([...orders, ...newTrades]);
    setHistory((current) => [...current, ...newTrades.filter((trade) => trade.status === "Closed").map((trade) => ({ ...trade, qty: trade.quantity, realizedPnL: trade.realizedPnL ?? trade.mt5Profit ?? 0 }))]);
    setParsedTrades([]);
    setSelected({});
    setStatus(`${newTrades.length} trade${newTrades.length === 1 ? "" : "s"} imported into the journal.`);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "auto" }}>
      <h2>Import MT5 History</h2>
      <p style={{ color: "#94a3b8" }}>Upload an MT5 HTML report or PDF report. Review the detected trades before they are added to your journal.</p>
      <div style={{ background: "#1e293b", padding: "20px", borderRadius: "12px", marginTop: "20px" }}>
        <label style={{ display: "block", marginBottom: "10px", fontWeight: 700 }}>MT5 History File</label>
        <input type="file" accept=".html,.htm,.pdf,text/html,application/pdf" onChange={handleFile} disabled={busy} />
        {fileName && <p style={{ color: "#cbd5e1" }}>{fileName}</p>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "16px" }}>
          <input value={strategy} onChange={(event) => setStrategy(event.target.value)} placeholder="Strategy for imported trades (optional)" />
          <input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Notes for imported trades (optional)" />
        </div>
        {status && <p style={{ color: "#cbd5e1", marginTop: "14px" }}>{status}</p>}
      </div>

      {parsedTrades.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <h3>{selectedTrades.length} selected / {parsedTrades.length} detected</h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setSelected(Object.fromEntries(parsedTrades.map((trade) => [trade.id, selectedTrades.length !== parsedTrades.length])))}>{selectedTrades.length === parsedTrades.length ? "Clear all" : "Select all"}</button>
              <button onClick={importTrades} disabled={!selectedTrades.length}>Import selected trades</button>
            </div>
          </div>
          <div style={{ overflowX: "auto", background: "#1e293b", borderRadius: "12px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{["Import", "Ticket", "Date", "Time", "Symbol", "Side", "Volume", "Entry", "Exit", "P&L"].map((header) => <th key={header} style={{ padding: "10px", textAlign: "left" }}>{header}</th>)}</tr></thead>
              <tbody>{parsedTrades.map((trade) => <tr key={trade.id} style={{ borderTop: "1px solid #334155" }}>
                <td style={{ padding: "10px" }}><input type="checkbox" checked={!!selected[trade.id]} onChange={() => setSelected((current) => ({ ...current, [trade.id]: !current[trade.id] }))} /></td>
                <td style={{ padding: "10px" }}>{trade.ticket || "—"}</td>
                <td style={{ padding: "10px" }}>{trade.date}</td>
                <td style={{ padding: "10px" }}>{trade.time}</td>
                <td style={{ padding: "10px" }}>{trade.symbol}</td>
                <td style={{ padding: "10px" }}>{trade.action}</td>
                <td style={{ padding: "10px" }}>{trade.quantity}</td>
                <td style={{ padding: "10px" }}>{trade.price}</td>
                <td style={{ padding: "10px" }}>{trade.exitPrice ?? "—"}</td>
                <td style={{ padding: "10px" }}>{trade.realizedPnL ?? "—"}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
