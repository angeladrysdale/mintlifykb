import React, { useMemo, useState } from "react";

/**
 * FilterTable
 * - data: array of objects (rows)
 * - columns: optional [{ key, label }] to control order/labels
 *
 * Example:
 * <FilterTable
 *   data={[{ name: "Alice", team: "Platform" }]}
 *   columns={[{ key: "name", label: "Name" }, { key: "team", label: "Team" }]}
 * />
 */
export default function FilterTable({ data = [], columns }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc"); // "asc" | "desc"

  const resolvedColumns = useMemo(() => {
    if (columns?.length) return columns;
    const keys = data?.[0] ? Object.keys(data[0]) : [];
    return keys.map((k) => ({ key: k, label: prettyLabel(k) }));
  }, [columns, data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;

    return data.filter((row) =>
      resolvedColumns.some(({ key }) => {
        const val = row?.[key];
        return String(val ?? "").toLowerCase().includes(q);
      })
    );
  }, [data, query, resolvedColumns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;

    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a?.[sortKey];
      const bv = b?.[sortKey];

      // numeric sort when both look like numbers
      const an = Number(av);
      const bn = Number(bv);
      const bothNumeric =
        av !== null &&
        bv !== null &&
        av !== "" &&
        bv !== "" &&
        !Number.isNaN(an) &&
        !Number.isNaN(bn);

      let cmp;
      if (bothNumeric) {
        cmp = an - bn;
      } else {
        cmp = String(av ?? "").localeCompare(String(bv ?? ""), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }

      return sortDir === "asc" ? cmp : -cmp;
    });

    return copy;
  }, [filtered, sortKey, sortDir]);

  function onHeaderClick(key) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    }
  }

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(0,0,0,0.15)",
          }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {resolvedColumns.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => onHeaderClick(key)}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderBottom: "1px solid rgba(0,0,0,0.15)",
                    cursor: "pointer",
                    userSelect: "none",
                    whiteSpace: "nowrap",
                  }}
                  title="Click to sort"
                >
                  {label}
                  {sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={resolvedColumns.length}
                  style={{ padding: "12px", opacity: 0.7 }}
                >
                  No results
                </td>
              </tr>
            ) : (
              sorted.map((row, idx) => (
                <tr key={idx}>
                  {resolvedColumns.map(({ key }) => (
                    <td
                      key={key}
                      style={{
                        padding: "10px 12px",
                        borderBottom: "1px solid rgba(0,0,0,0.08)",
                        verticalAlign: "top",
                      }}
                    >
                      {renderCell(row?.[key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function prettyLabel(key) {
  return String(key)
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function renderCell(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  // If someone passes JSX, render it as-is:
  return React.isValidElement(value) ? value : String(value);
}