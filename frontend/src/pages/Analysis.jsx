import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

const TAG_COLORS = [
  "#00ff88","#00b4ff","#ff6b6b","#ffd166","#a78bfa","#34d399","#f472b6",
  "#60a5fa","#fb923c","#e879f9","#4ade80","#facc15","#38bdf8","#f87171",
];

function fmtDate(unix) {
  return new Date(unix * 1000).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}


function BarChart({ data }) {
  if (!data.length) return null;
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const barW = Math.max(28, Math.min(48, Math.floor(580 / data.length) - 6));
  const chartH = 160;

  return (
    <div style={{ overflowX: "auto" }}>
      <svg
        width={Math.max(600, data.length * (barW + 8) + 40)}
        height={chartH + 60}
        style={{ display: "block" }}
      >
        {data.map((d, i) => {
          const barH = Math.max(4, (d.count / maxCount) * chartH);
          const x = 20 + i * (barW + 8);
          const y = chartH - barH + 10;
          return (
            <g key={d.rating}>
              <rect
                x={x} y={y} width={barW} height={barH}
                rx={4}
                fill={d.rating === "Unrated" ? "#3a5a6a" : `hsl(${120 - (parseInt(d.rating) - 800) / 22}, 70%, 50%)`}
                opacity={0.85}
              />
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fill="#8aa0b0" fontSize={11} fontFamily="monospace">
                {d.count}
              </text>
              <text x={x + barW / 2} y={chartH + 28} textAnchor="middle" fill="#3a5a6a" fontSize={10} fontFamily="monospace">
                {d.rating}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}


function PieChart({ data, totalProblems }) {
  const top = data.slice(0, 12);
  const total = top.reduce((s, d) => s + d.count, 0);
  if (!total) return null;

  const cx = 120, cy = 120, r = 90, innerR = 54;
  let angle = -Math.PI / 2;
  const slices = top.map((d, i) => {
    const frac = d.count / total;
    const startA = angle;
    angle += frac * 2 * Math.PI;
    return { ...d, startA, endA: angle, color: TAG_COLORS[i % TAG_COLORS.length] };
  });

  function arc(cx, cy, r, startA, endA) {
    const x1 = cx + r * Math.cos(startA);
    const y1 = cy + r * Math.sin(startA);
    const x2 = cx + r * Math.cos(endA);
    const y2 = cy + r * Math.sin(endA);
    const large = endA - startA > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2}`;
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
      <svg width={240} height={240}>
        {slices.map((s) => {
          const outerPath = arc(cx, cy, r, s.startA, s.endA);
          const innerPath = arc(cx, cy, innerR, s.endA, s.startA);
          return (
            <path
              key={s.tag}
              d={`${outerPath} L${cx + innerR * Math.cos(s.endA)},${cy + innerR * Math.sin(s.endA)} ${innerPath} Z`}
              fill={s.color}
              opacity={0.85}
            />
          );
        })}
        <circle cx={cx} cy={cy} r={innerR - 2} fill="#0d1117" />
        <text x={cx} y={cy - 6} textAnchor="middle" fill="#e8f0f8" fontSize={20} fontWeight="bold" fontFamily="monospace">
          {totalProblems}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#3a5a6a" fontSize={10} fontFamily="monospace">
          PROBLEMS
        </text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 200 }}>
        {slices.map((s) => (
          <div key={s.tag} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#8aa0b0", fontFamily: "monospace", flex: 1 }}>{s.tag}</span>
            <span style={{ fontSize: 12, color: "#3a5a6a", fontFamily: "monospace" }}>{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Analysis() {
  const { handle } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/analysis/${handle}?from=${from}&to=${to}`);
        const json = await res.json();
        if (!json.success) setError(json.message || "Failed to load analysis.");
        else setData(json.data);
      } catch {
        setError("Server unreachable.");
      } finally {
        setLoading(false);
      }
    })();
  }, [handle, from, to]);

  const filteredProblems = (data?.problems || []).filter((p) => {
    const q = search.toLowerCase();
    return (
      p.problemkey?.toLowerCase().includes(q) ||
      String(p.rating || "").includes(q) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  });


  const sortedProblems = [...filteredProblems].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const handleExport = async () => {
    if (!data?.problems?.length) return;
    setExporting(true);
    try {
      const res = await fetch(`${API_BASE}/export/${handle}?from=${from}&to=${to}`, { method: "GET" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${handle}_problems_${from}_${to}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Make sure the backend export endpoint is set up.");
    } finally {
      setExporting(false);
    }
  };

  const handlePdfExport = async () => {
    if (!data?.problems?.length) return;
    setExporting(true);
    try {
      const res = await fetch(`${API_BASE}/export-pdf/${handle}?from=${from}&to=${to}`, { method: "GET" });
      if (!res.ok) throw new Error("PDF Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${handle}_problems_${from}_${to}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("PDF Export failed. Make sure the backend is running.");
    } finally {
      setExporting(false);
    }
  };

  const fromLabel = from ? fmtDate(parseInt(from)) : "—";
  const toLabel = to ? fmtDate(parseInt(to)) : "—";

  return (
    <div style={styles.root}>
      <div style={styles.grid} />
      <div style={styles.container}>
       
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate(`/ratings/${handle}`)}>← Ratings</button>
          <div>
            <div style={styles.titleRow}>
              <span style={styles.title}>Analysis</span>
              <span style={styles.handleChip}>{handle}</span>
            </div>
            <p style={styles.subtitle}>
              {fromLabel} → {toLabel}
            </p>
          </div>
        </div>

        {loading && <div style={styles.status}>Crunching data…</div>}
        {error && <div style={{ ...styles.status, color: "#ff6b6b" }}>⚠ {error}</div>}

        {!loading && !error && data && (
          <>
            {/* Stats */}
            <div style={styles.statsRow}>
              {[
                { label: "Problems Solved", value: data.problems.length },
                { label: "Unique Topics", value: data.tagDistribution.length },
                { label: "Rating Range", value: data.ratingDistribution.length ? `${data.ratingDistribution[0].rating} – ${data.ratingDistribution[data.ratingDistribution.length - 1].rating}` : "—" },
              ].map((s) => (
                <div key={s.label} style={styles.statCard}>
                  <div style={styles.statValue}>{s.value}</div>
                  <div style={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {data.problems.length === 0 ? (
              <div style={styles.status}>No problems solved in this date range.</div>
            ) : (
              <>
                {/* Charts */}
                <div style={styles.chartsRow}>
                  <div style={styles.chartCard}>
                    <div style={styles.chartTitle}>Problems by Rating</div>
                    <BarChart data={data.ratingDistribution} />
                  </div>
                  <div style={styles.chartCard}>
                    <div style={styles.chartTitle}>Topics Breakdown</div>
                    <PieChart data={data.tagDistribution} totalProblems={data.problems.length} />
                  </div>
                </div>

                {/* Problems List Section */}
                <div style={styles.problemsCard}>
                  <div style={styles.problemsHeader}>
                    <div>
                      <div style={styles.problemsTitle}>Problems List (Sorted by Rating)</div>
                      <div style={styles.problemsCount}>{filteredProblems.length} problems</div>
                    </div>
                    <input
                      type="text"
                      placeholder="Search problems…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={styles.searchInput}
                    />
                  </div>

                  {/* Problems Table */}
                  <div style={styles.problemsTableWrapper}>
                    <div style={styles.problemsTableHeader}>
                      <div style={{...styles.problemsTableCol, flex: '1.5', fontWeight: 'bold'}}>Problem</div>
                      <div style={{...styles.problemsTableCol, flex: '0.7', fontWeight: 'bold', textAlign: 'center'}}>Rating</div>
                      <div style={{...styles.problemsTableCol, flex: '2', fontWeight: 'bold'}}>Tags</div>
                    </div>

                    <div style={styles.problemsTableBody}>
                      {sortedProblems.map((p, i) => (
                        <div key={p.problemkey} style={{...styles.problemsTableRow, background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent"}}>
                          <div style={{...styles.problemsTableCol, flex: '1.5'}}>
                            <a href={p.url} target="_blank" rel="noreferrer" style={styles.problemLinkBig}>
                              {p.problemkey} ↗
                            </a>
                          </div>
                          <div style={{...styles.problemsTableCol, flex: '0.7', textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold'}}>
                            {p.rating ? (
                              <span style={{ color: `hsl(${120 - (p.rating - 800) / 22}, 65%, 55%)` }}>
                                {p.rating}
                              </span>
                            ) : (
                              <span style={{ color: "#3a5a6a" }}>—</span>
                            )}
                          </div>
                          <div style={{...styles.problemsTableCol, flex: '2'}}>
                            <div style={styles.tagsWrapper}>
                              {(p.tags || []).map((t, ti) => (
                                <span key={t} style={{ ...styles.tagBadge, background: TAG_COLORS[ti % TAG_COLORS.length] + "20", color: TAG_COLORS[ti % TAG_COLORS.length], border: `1px solid ${TAG_COLORS[ti % TAG_COLORS.length]}40` }}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Download Buttons */}
                  <div style={styles.downloadButtonsRow}>
                    <button style={{ ...styles.downloadPdfBtn, opacity: exporting ? 0.5 : 1 }} onClick={handlePdfExport} disabled={exporting}>
                      {exporting ? "📥 Downloading PDF..." : "📥 Download as PDF (Sorted by Rating)"}
                    </button>
                    <button style={{ ...styles.downloadExcelBtn, opacity: exporting ? 0.5 : 1 }} onClick={handleExport} disabled={exporting}>
                      {exporting ? "📥 Downloading Excel..." : "📊 Download as Excel"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080c10; }
        input::placeholder { color: #3a5a6a; }
        input:focus { outline: none; }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#080c10",
    fontFamily: "'Syne', sans-serif",
    position: "relative",
    padding: "40px 24px 80px",
  },
  grid: {
    position: "fixed",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,255,136,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,136,0.02) 1px, transparent 1px)
    `,
    backgroundSize: "48px 48px",
    pointerEvents: "none",
    zIndex: 0,
  },
  container: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1100,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 28,
  },
  header: { display: "flex", alignItems: "flex-start", gap: 20 },
  backBtn: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#5a7a8a",
    borderRadius: 8,
    padding: "8px 14px",
    cursor: "pointer",
    fontFamily: "'Space Mono', monospace",
    fontSize: 12,
    whiteSpace: "nowrap",
    marginTop: 6,
  },
  titleRow: { display: "flex", alignItems: "center", gap: 12 },
  title: { fontSize: 32, fontWeight: 800, color: "#e8f0f8", letterSpacing: "-0.02em" },
  handleChip: {
    background: "rgba(0,255,136,0.08)",
    border: "1px solid rgba(0,255,136,0.2)",
    color: "#00ff88",
    borderRadius: 100,
    padding: "4px 14px",
    fontSize: 13,
    fontFamily: "'Space Mono', monospace",
  },
  subtitle: { color: "#3a5a6a", fontSize: 13, marginTop: 4, fontFamily: "'Space Mono', monospace" },
  status: { color: "#3a5a6a", fontFamily: "'Space Mono', monospace", fontSize: 14, padding: "40px 0", textAlign: "center" },
  statsRow: { display: "flex", gap: 16, flexWrap: "wrap" },
  statCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    padding: "18px 28px",
    flex: 1,
    minWidth: 160,
  },
  statValue: { fontSize: 26, fontWeight: 800, color: "#00ff88", fontFamily: "'Space Mono', monospace" },
  statLabel: { fontSize: 11, color: "#3a5a6a", marginTop: 4, letterSpacing: "0.06em", textTransform: "uppercase" },
  chartsRow: { display: "flex", gap: 20, flexWrap: "wrap" },
  chartCard: {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: "24px",
    flex: 1,
    minWidth: 280,
    overflowX: "auto",
  },
  chartTitle: { fontSize: 13, color: "#5a7a8a", fontFamily: "'Space Mono', monospace", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 },

  problemsCard: {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: "24px",
  },
  problemsHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 20,
    flexWrap: "wrap",
  },
  problemsTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#e8f0f8",
    letterSpacing: "0.04em",
  },
  problemsCount: {
    fontSize: 12,
    color: "#3a5a6a",
    marginTop: 4,
    fontFamily: "'Space Mono', monospace",
  },
  searchInput: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "8px 14px",
    color: "#c8e0d0",
    fontFamily: "'Space Mono', monospace",
    fontSize: 12,
    outline: "none",
    minWidth: 200,
  },

  
  problemsTableWrapper: {
    marginBottom: 20,
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 8,
    overflow: "hidden",
  },
  problemsTableHeader: {
    display: "flex",
    background: "rgba(255,255,255,0.05)",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    padding: "14px 16px",
  },
  problemsTableCol: {
    fontSize: 11,
    color: "#3a5a6a",
    fontFamily: "'Space Mono', monospace",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  problemsTableBody: {
    maxHeight: "500px",
    overflowY: "auto",
  },
  problemsTableRow: {
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    padding: "14px 16px",
    transition: "background 0.15s",
  },
  problemLinkBig: {
    color: "#00b4ff",
    textDecoration: "none",
    fontFamily: "'Space Mono', monospace",
    fontWeight: 600,
    fontSize: 13,
    borderBottom: "1px solid rgba(0,180,255,0.3)",
    transition: "color 0.15s",
    cursor: "pointer",
  },
  tagsWrapper: {
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
  },
  tagBadge: {
    padding: "3px 8px",
    borderRadius: 4,
    fontSize: 10,
    fontFamily: "'Space Mono', monospace",
    whiteSpace: "nowrap",
  },

  
  downloadButtonsRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  downloadPdfBtn: {
    background: "rgba(0,180,255,0.1)",
    border: "1px solid rgba(0,180,255,0.4)",
    color: "#00b4ff",
    borderRadius: 8,
    padding: "12px 20px",
    fontSize: 13,
    fontFamily: "'Space Mono', monospace",
    cursor: "pointer",
    fontWeight: 700,
    letterSpacing: "0.04em",
    transition: "opacity 0.2s",
    flex: 1,
    minWidth: 200,
  },
  downloadExcelBtn: {
    background: "rgba(0,255,136,0.1)",
    border: "1px solid rgba(0,255,136,0.4)",
    color: "#00ff88",
    borderRadius: 8,
    padding: "12px 20px",
    fontSize: 13,
    fontFamily: "'Space Mono', monospace",
    cursor: "pointer",
    fontWeight: 700,
    letterSpacing: "0.04em",
    transition: "opacity 0.2s",
    flex: 1,
    minWidth: 200,
  },
};
