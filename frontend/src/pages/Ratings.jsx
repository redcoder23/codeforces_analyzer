import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

// Exact Codeforces rank colors
const RANK_COLORS = {
  Newbie: "#cccccc",           // Gray
  Pupil: "#77dd77",            // Light Green
  Specialist: "#77ddbb",       // Cyan/Teal
  Expert: "#aaaaff",           // Light Blue
  "Candidate Master": "#ff88ff", // Magenta/Purple
  Master: "#ffcc88",           // Orange
  "International Master": "#ffbb55", // Dark Orange
  GrandMaster: "#ff3333",      // Red
  "International GrandMaster": "#ff0000", // Bright Red
  "Legendary GrandMaster": "#aa0000", // Dark Red
};

function rankColor(title) {
  return RANK_COLORS[title] || "#cccccc";
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function Ratings() {
  const { handle } = useParams();
  const navigate = useNavigate();

  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Date range for analysis
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/ratings/${handle}`);
        const data = await res.json();
        if (!data.success) {
          setError(data.message || "Failed to load ratings.");
        } else {
          setRatings(data.data);
        }
      } catch {
        setError("Server unreachable.");
      } finally {
        setLoading(false);
      }
    })();
  }, [handle]);

  const handleAnalyze = () => {
    if (!fromDate || !toDate) return;
    const from = Math.floor(new Date(fromDate).getTime() / 1000);
    const to = Math.floor(new Date(toDate + "T23:59:59").getTime() / 1000);
    navigate(`/analysis/${handle}?from=${from}&to=${to}`);
  };

  const currentRating = ratings.length ? ratings[ratings.length - 1].newRating : null;
  const currentRank = ratings.length ? ratings[ratings.length - 1].user_newrank : null;
  const maxRating = ratings.length ? Math.max(...ratings.map((r) => r.newRating)) : null;
  const totalContests = ratings.length;

  return (
    <div style={styles.root}>
      <div style={styles.grid} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate("/")}>← Back</button>
          <div>
            <div style={styles.handleRow}>
              <span style={styles.handleText}>{handle}</span>
              {currentRank && (
                <span style={{ ...styles.rankBadge, color: rankColor(currentRank), borderColor: rankColor(currentRank) + "44", background: rankColor(currentRank) + "11" }}>
                  {currentRank}
                </span>
              )}
            </div>
            <p style={styles.headerSub}>Contest Rating History</p>
          </div>
        </div>

        {/* Stats row */}
        {!loading && !error && (
          <div style={styles.statsRow}>
            {[
              { label: "Current Rating", value: currentRating ?? "—" },
              { label: "Peak Rating", value: maxRating ?? "—" },
              { label: "Contests", value: totalContests },
            ].map((s) => (
              <div key={s.label} style={styles.statCard}>
                <div style={styles.statValue}>{s.value}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {loading && <div style={styles.status}>Loading contest history…</div>}
        {error && <div style={{ ...styles.status, color: "#ff6b6b" }}>⚠ {error}</div>}

        {/* Table and Analyze Section - Side by Side */}
        {!loading && !error && (
          <div style={styles.contentRow}>
            {/* Left Column - Table */}
            <div style={styles.tableColumn}>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {["Date", "Contest", "Rank", "Old Rank", "New Rank", "Change", "New Rating"].map((h) => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...ratings].reverse().map((r, i) => {
                      const change = r.ratingChange;
                      return (
                        <tr key={r.contestId} style={{ ...styles.tr, background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent" }}>
                          <td style={styles.td}>{fmtDate(r.Contestdate)}</td>
                          <td style={{ ...styles.td, maxWidth: 240, whiteSpace: "normal", lineHeight: 1.4 }}>
                            <a
                              href={`https://codeforces.com/contest/${r.contestId}`}
                              target="_blank"
                              rel="noreferrer"
                              style={styles.contestLink}
                            >
                              {r.contestName}
                            </a>
                          </td>
                          <td style={styles.td}>{r.rank ?? "—"}</td>
                          <td style={{ 
                            ...styles.td, 
                            color: rankColor(r.user_oldrank), 
                            fontWeight: 700,
                            fontSize: 14
                          }}>
                            {r.user_oldrank}
                          </td>
                          <td style={{ 
                            ...styles.td, 
                            color: rankColor(r.user_newrank), 
                            fontWeight: 700,
                            fontSize: 14
                          }}>
                            {r.user_newrank}
                          </td>
                          <td style={{ ...styles.td, color: change > 0 ? "#00ff88" : change < 0 ? "#ff6b6b" : "#aaa", fontFamily: "monospace" }}>
                            {change > 0 ? `+${change}` : change}
                          </td>
                          <td style={{ ...styles.td, fontFamily: "monospace", fontWeight: 700, color: "#c8e0d0" }}>{r.newRating}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column - Analyze Section */}
            {ratings.length > 0 && (
              <div style={styles.analyzeColumn}>
                <div style={styles.analyzeBar}>
                  <div style={styles.analyzeLabel}>Analyze Problems Solved Between</div>
                  <div style={styles.analyzeInputColumn}>
                    <div style={styles.dateField}>
                      <label style={styles.dateLabel}>From</label>
                      <input
                        type="date"
                        style={styles.dateInput}
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                    </div>
                    <div style={styles.dateField}>
                      <label style={styles.dateLabel}>To</label>
                      <input
                        type="date"
                        style={styles.dateInput}
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                      />
                    </div>
                    <button
                      style={{ ...styles.analyzeBtn, opacity: fromDate && toDate ? 1 : 0.4, cursor: fromDate && toDate ? "pointer" : "not-allowed", width: '100%' }}
                      onClick={handleAnalyze}
                      disabled={!fromDate || !toDate}
                    >
                      Analyze →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080c10; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.4); }
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
  header: {
    display: "flex",
    alignItems: "flex-start",
    gap: 20,
  },
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
    marginTop: 4,
  },
  handleRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  handleText: {
    fontSize: 32,
    fontWeight: 800,
    color: "#e8f0f8",
    letterSpacing: "-0.02em",
  },
  rankBadge: {
    padding: "4px 12px",
    borderRadius: 100,
    border: "1px solid",
    fontSize: 12,
    fontWeight: 700,
    fontFamily: "'Space Mono', monospace",
    letterSpacing: "0.04em",
  },
  headerSub: {
    color: "#3a5a6a",
    fontSize: 14,
    marginTop: 4,
    fontFamily: "'Space Mono', monospace",
  },
  statsRow: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },
  statCard: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
    padding: "18px 28px",
    flex: 1,
    minWidth: 140,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 800,
    color: "#00ff88",
    fontFamily: "'Space Mono', monospace",
    letterSpacing: "-0.02em",
  },
  statLabel: {
    fontSize: 11,
    color: "#3a5a6a",
    marginTop: 4,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  status: {
    color: "#3a5a6a",
    fontFamily: "'Space Mono', monospace",
    fontSize: 14,
    padding: "40px 0",
    textAlign: "center",
  },
  
  // Side-by-side layout
  contentRow: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
  },
  tableColumn: {
    flex: '1 1 60%',
    minWidth: 400,
  },
  analyzeColumn: {
    flex: '1 1 35%',
    minWidth: 300,
    display: "flex",
    flexDirection: "column",
  },
  tableWrapper: {
    overflowX: "auto",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    color: "#3a5a6a",
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    borderBottom: "1px solid rgba(255,255,255,0.07)",
    whiteSpace: "nowrap",
    background: "rgba(255,255,255,0.02)",
  },
  tr: {
    transition: "background 0.15s",
  },
  td: {
    padding: "12px 16px",
    color: "#8aa0b0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
    whiteSpace: "nowrap",
    fontSize: 13,
  },
  contestLink: {
    color: "#8aa0b0",
    textDecoration: "none",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    transition: "color 0.15s",
  },
  analyzeBar: {
    background: "rgba(0,255,136,0.04)",
    border: "1px solid rgba(0,255,136,0.15)",
    borderRadius: 14,
    padding: "24px 28px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    height: "fit-content",
    position: "sticky",
    top: 20,
  },
  analyzeLabel: {
    color: "#00ff88",
    fontFamily: "'Space Mono', monospace",
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  analyzeInputColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  dateField: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  dateLabel: {
    fontSize: 11,
    color: "#3a5a6a",
    fontFamily: "'Space Mono', monospace",
    letterSpacing: "0.06em",
  },
  dateInput: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#c8e0d0",
    fontFamily: "'Space Mono', monospace",
    fontSize: 13,
    outline: "none",
  },
  analyzeBtn: {
    background: "#00ff88",
    color: "#080c10",
    border: "none",
    borderRadius: 8,
    padding: "12px 28px",
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "'Space Mono', monospace",
    letterSpacing: "0.04em",
    transition: "opacity 0.2s",
    marginTop: 4,
  },
};
