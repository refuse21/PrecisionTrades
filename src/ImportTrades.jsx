import { useState } from "react";
import useIsMobile from "./useIsMobile";

// ==========================
// MT5 STATEMENT IMPORTER
// ==========================
// Parses the "Positions" table from an MT5 History export
// (Terminal > Toolbox > History tab > right-click > Save as Report,
// opened in Excel and saved as CSV). Each row = one closed round-trip
// trade, already carrying open + close price/time + profit, which
// maps directly onto PrecisionTrades' `history` schema.

export default function ImportTrades({ history, setHistory }) {
  const isMobile = useIsMobile();

  const [rawRows, setRawRows] = useState([]);
  const [parsedTrades, setParsedTrades] = useState([]);
  const [market, setMarket] = useState("Forex");
  const [product, setProduct] = useState("Intraday");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [importedCount, setImportedCount] = useState(0);

  const getCurrency = (m) => {
    switch (m) {
      case "Global Market":
      case "Forex":
      case "Crypto":
        return "$";
      default:
        return "₹";
    }
  };

  // ==========================
  // CSV PARSING (handles quoted fields with commas)
  // ==========================

  const parseCSV = (text) => {
    const lines = text
      .split(/\r\n|\n|\r/)
      .filter((line) => line.trim() !== "");

    const parseLine = (line) => {
      const cells = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          cells.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      cells.push(current.trim());
      return cells;
    };

    return lines.map(parseLine);
  };

  // ==========================
  // COLUMN DETECTION
  // ==========================
  // MT5's "Positions" export typically has two Time and two Price
  // columns (open + close). When saved via Excel these often become
  // duplicate headers or "Time.1" / "Price.1". We match by alias
  // lists and fall back to position order (open cols before close cols).

  const ALIASES = {
    openTime: ["time", "open time"],
    symbol: ["symbol"],
    type: ["type", "direction"],
    volume: ["volume", "size", "lots"],
    openPrice: ["price", "open price"],
    closeTime: ["time.1", "close time"],
    closePrice: ["price.1", "close price"],
    profit: ["profit", "p&l", "p/l", "net profit"],
  };

  const detectColumns = (headerRow) => {
    const headers = headerRow.map((h) => h.toLowerCase().trim());

    const findAll = (aliasList) =>
      headers.reduce((acc, h, idx) => {
        if (aliasList.includes(h)) acc.push(idx);
        return acc;
      }, []);

    // Time and Price appear twice (open + close) with identical
    // headers in raw MT5 exports; grab both occurrences in order.
    const timeIdxs = findAll(ALIASES.openTime.concat(ALIASES.closeTime));
    const priceIdxs = findAll(ALIASES.openPrice.concat(ALIASES.closePrice));

    const symbolIdx = headers.findIndex((h) => ALIASES.symbol.includes(h));
    const typeIdx = headers.findIndex((h) => ALIASES.type.includes(h));
    const volumeIdx = headers.findIndex((h) => ALIASES.volume.includes(h));
    const profitIdx = headers.findIndex((h) => ALIASES.profit.includes(h));

    return {
      openTimeIdx: timeIdxs[0] ?? -1,
      closeTimeIdx: timeIdxs[1] ?? timeIdxs[0] ?? -1,
      openPriceIdx: priceIdxs[0] ?? -1,
      closePriceIdx: priceIdxs[1] ?? priceIdxs[0] ?? -1,
      symbolIdx,
      typeIdx,
      volumeIdx,
      profitIdx,
    };
  };

  // ==========================
  // FILE UPLOAD
  // ==========================

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError("");
    setParsedTrades([]);
    setImportedCount(0);
    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rows = parseCSV(text);

        if (rows.length < 2) {
          setError(
            "Couldn't find any trade rows in this file. Make sure you exported the Positions/History report from MT5."
          );
          return;
        }

        const headerRow = rows[0];
        const cols = detectColumns(headerRow);

        if (
          cols.symbolIdx === -1 ||
          cols.typeIdx === -1 ||
          cols.volumeIdx === -1 ||
          cols.openPriceIdx === -1 ||
          cols.profitIdx === -1
        ) {
          setError(
            "Couldn't recognize the columns in this file. Expected Symbol, Type, Volume, Price and Profit columns from an MT5 Positions export."
          );
          return;
        }

        const dataRows = rows.slice(1);
        setRawRows(dataRows);

        const trades = dataRows
          .map((row) => {
            const symbol = row[cols.symbolIdx];
            const typeRaw = (row[cols.typeIdx] || "").toLowerCase();

            if (!symbol || (!typeRaw.includes("buy") && !typeRaw.includes("sell"))) {
              return null; // skip balance/deposit/non-trade rows
            }

            const action = typeRaw.includes("sell") ? "SELL" : "BUY";
            const qty = Math.abs(parseFloat(row[cols.volumeIdx])) || 0;
            const avgPrice = parseFloat(row[cols.openPriceIdx]) || 0;
            const exitPrice =
              cols.closePriceIdx !== -1
                ? parseFloat(row[cols.closePriceIdx]) || avgPrice
                : avgPrice;
            const realizedPnL = parseFloat(row[cols.profitIdx]) || 0;

            const rawOpenDate = row[cols.openTimeIdx] || "";
            const rawCloseDate = row[cols.closeTimeIdx] || rawOpenDate;

            if (!symbol || !qty) return null;

            return {
              symbol: symbol.toUpperCase(),
              action,
              qty,
              avgPrice,
              exitPrice,
              realizedPnL,
              date: normalizeDate(rawOpenDate),
              exitDate: normalizeDate(rawCloseDate),
              status: "Closed",
              screenshot: null,
            };
          })
          .filter(Boolean);

        if (trades.length === 0) {
          setError(
            "No valid closed trades found in this file. Rows without a Buy/Sell type are skipped (e.g. balance or deposit lines)."
          );
          return;
        }

        setParsedTrades(trades);
      } catch (err) {
        setError("Couldn't read this file. Please make sure it's a CSV export.");
      }
    };

    reader.readAsText(file);
  };

  // MT5 dates come as "2026.08.20 14:35:02" — normalize to YYYY-MM-DD
  const normalizeDate = (raw) => {
    if (!raw) return "";
    const match = raw.match(/(\d{4})[.\-/](\d{2})[.\-/](\d{2})/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
    return raw.split(" ")[0] || raw;
  };

  // ==========================
  // CONFIRM IMPORT
  // ==========================

  const confirmImport = () => {
    const newHistoryEntries = parsedTrades.map((t) => ({
      symbol: t.symbol,
      market,
      product,
      action: t.action,
      qty: t.qty,
      avgPrice: t.avgPrice,
      exitPrice: t.exitPrice,
      realizedPnL: t.realizedPnL,
      status: "Closed",
      date: t.date,
      exitDate: t.exitDate,
      screenshot: null,
    }));

    setHistory([...history, ...newHistoryEntries]);
    setImportedCount(newHistoryEntries.length);
    setParsedTrades([]);
    setRawRows([]);
    setFileName("");
  };

  const cancelImport = () => {
    setParsedTrades([]);
    setRawRows([]);
    setFileName("");
    setError("");
  };

  // ==========================
  // UI
  // ==========================

  return (
    <div style={{ padding: "20px", maxWidth: "1100px", margin: "auto" }}>
      <h2 style={{ marginBottom: "10px" }}>Import Trades</h2>
      <p style={{ color: "#94a3b8", marginBottom: "25px" }}>
        Import closed trades from an MT5 statement export (e.g. XM MT5).
      </p>

      {/* ================= INSTRUCTIONS ================= */}

      <div
        style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "25px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>How to export from MT5</h3>
        <ol style={{ color: "#cbd5e1", lineHeight: "1.8", paddingLeft: "20px" }}>
          <li>In MT5, open the <strong>Toolbox</strong> panel and click the <strong>History</strong> tab.</li>
          <li>Right-click anywhere in the history list and choose <strong>Save as Report</strong>.</li>
          <li>Open the saved report and save/export it as a <strong>.csv</strong> file (in Excel: File → Save As → CSV).</li>
          <li>Upload that CSV file below.</li>
        </ol>
      </div>

      {/* ================= UPLOAD ================= */}

      <div
        style={{
          background: "#1e293b",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "25px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Upload Statement</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "12px",
            marginBottom: "15px",
          }}
        >
          <div>
            <label style={{ display: "block", marginBottom: "6px", color: "#94a3b8" }}>
              Market for imported trades
            </label>
            <select value={market} onChange={(e) => setMarket(e.target.value)} style={{ width: "100%" }}>
              <option>Forex</option>
              <option>Indian Market</option>
              <option>Global Market</option>
              <option>Crypto</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", color: "#94a3b8" }}>
              Product
            </label>
            <select value={product} onChange={(e) => setProduct(e.target.value)} style={{ width: "100%" }}>
              <option>Intraday</option>
              <option>Swing</option>
              <option>Delivery</option>
              <option>Spot</option>
              <option>Perpetual</option>
            </select>
          </div>
        </div>

        <input type="file" accept=".csv" onChange={handleFile} />

        {fileName && (
          <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "10px" }}>
            📄 {fileName}
          </p>
        )}

        {error && (
          <div
            style={{
              background: "#3b1f1f",
              color: "#f87171",
              padding: "12px",
              borderRadius: "8px",
              marginTop: "15px",
            }}
          >
            {error}
          </div>
        )}

        {importedCount > 0 && (
          <div
            style={{
              background: "#0b3b1f",
              color: "#4ade80",
              padding: "12px",
              borderRadius: "8px",
              marginTop: "15px",
            }}
          >
            ✅ Imported {importedCount} trade{importedCount !== 1 ? "s" : ""} into your Trade History.
          </div>
        )}
      </div>

      {/* ================= PREVIEW ================= */}

      {parsedTrades.length > 0 && (
        <div
          style={{
            background: "#1e293b",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "25px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            Preview — {parsedTrades.length} trade{parsedTrades.length !== 1 ? "s" : ""} found
          </h3>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Date</th>
                  <th style={{ textAlign: "left" }}>Symbol</th>
                  <th style={{ textAlign: "left" }}>Action</th>
                  <th style={{ textAlign: "left" }}>Qty</th>
                  <th style={{ textAlign: "left" }}>Entry</th>
                  <th style={{ textAlign: "left" }}>Exit</th>
                  <th style={{ textAlign: "left" }}>P&L</th>
                </tr>
              </thead>
              <tbody>
                {parsedTrades.slice(0, 25).map((t, i) => (
                  <tr key={i}>
                    <td>{t.date}</td>
                    <td>{t.symbol}</td>
                    <td>{t.action}</td>
                    <td>{t.qty}</td>
                    <td>
                      {getCurrency(market)}
                      {t.avgPrice.toFixed(2)}
                    </td>
                    <td>
                      {getCurrency(market)}
                      {t.exitPrice.toFixed(2)}
                    </td>
                    <td
                      style={{
                        color: t.realizedPnL >= 0 ? "#22c55e" : "#ef4444",
                        fontWeight: "bold",
                      }}
                    >
                      {getCurrency(market)}
                      {t.realizedPnL.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {parsedTrades.length > 25 && (
              <p style={{ color: "#94a3b8", fontSize: "13px", marginTop: "10px" }}>
                Showing first 25 of {parsedTrades.length} trades. All will be imported.
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button
              onClick={confirmImport}
              style={{
                padding: "12px 24px",
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Import {parsedTrades.length} Trade{parsedTrades.length !== 1 ? "s" : ""}
            </button>

            <button
              onClick={cancelImport}
              style={{
                padding: "12px 24px",
                background: "transparent",
                color: "#94a3b8",
                border: "1px solid #334155",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}