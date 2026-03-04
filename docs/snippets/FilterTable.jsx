import { useMemo, useState } from "react";

export const FilterTable = ({ data = [], columns }) => {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const resolvedColumns = useMemo(() => {
    if (columns?.length) return columns;
    const keys = data?.[0] ? Object.keys(data[0]) : [];
    return keys.map((k) => ({ key: k, label: prettyLabel(k) }));
  }, [columns, data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) =>
      resolvedColumns.some(({ key }) =>
        String(row?.[key] ?? "").toLowerCase().includes(q)
      )
    );
  }, [data, query, resolvedColumns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a?.[sortKey];
      const bv = b?.[sortKey];
      const cmp = String(av ?? "").localeCompare(String(bv ?? ""), undefined, {
        numeric: true,
        sensitivity: "base",
      });
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [filtered, sortKey, sortDir]);

  const onHeaderClick = (key) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    }
  };

  return (
    <div className="not-prose">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search…"
        className="w-full px-3 py-2 mb-3 rounded-xl border border-zinc-950/20 dark:border-white/20 bg-transparent"
      />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {resolvedColumns.map(({ key, label }) => (
                <th
                  key={key}
                  onClick={() => onHeaderClick(key)}
                  className="text-left px-3 py-2 border-b border-zinc-950/20 dark:border-white/20 cursor-pointer select-none whitespace-nowrap"
                  title="Click to sort"
                >
                  {label}
                  {sortKey === key ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={i}>
                {resolvedColumns.map(({ key }) => (
                  <td
                    key={key}
                    className="px-3 py-2 border-b border-zinc-950/10 dark:border-white/10 align-top"
                  >
                    {String(row?.[key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <div className="py-3 text-sm opacity-70">No results</div>
        )}
      </div>
    </div>
  );
};

function prettyLabel(key) {
  return String(key)
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}