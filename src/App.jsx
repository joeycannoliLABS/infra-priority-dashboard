import { useState, useMemo } from "react";
import { INITIATIVES, DATA_META } from "./data.js";
import { scoreInitiative, computeTotal, getTier, DEFAULT_WEIGHTS } from "./scoring.js";

const TIER_CONFIG = {
  Critical: { bg: "#dc262615", border: "#dc2626", text: "#dc2626", label: "DO FIRST" },
  High: { bg: "#ea580c15", border: "#ea580c", text: "#ea580c", label: "DO NEXT" },
  Medium: { bg: "#ca8a0415", border: "#ca8a04", text: "#ca8a04", label: "PLAN" },
  Low: { bg: "#64748b15", border: "#64748b", text: "#64748b", label: "DEFER" },
};

const LOB_COLORS = {
  AvaCloud: "#3b82f6", Core: "#8b5cf6", Custody: "#06b6d4", PEG: "#10b981",
  Security: "#ef4444", Foundation: "#f59e0b", "Infra: Cost Optimization": "#ec4899",
  "Infra: Technical Improvement": "#6366f1", "Infra: Maintenance": "#78716c", "Data eng": "#14b8a6",
};

const CHANGE_COLORS = { added: "#10b981", removed: "#ef4444", status: "#3b82f6", priority: "#f59e0b", data: "#8b5cf6" };

function ScoreBar({ score, color }) {
  return (
    <div style={{ width: "100%", height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.5s ease" }} />
    </div>
  );
}

function TierBadge({ tier }) {
  const c = TIER_CONFIG[tier];
  return (
    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", padding: "2px 8px", borderRadius: 4, background: c.bg, color: c.text, border: `1px solid ${c.border}`, fontFamily: "'JetBrains Mono', 'SF Mono', monospace" }}>
      {c.label}
    </span>
  );
}

function LoBBadge({ lob }) {
  const color = LOB_COLORS[lob] || "#64748b";
  return (
    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 3, background: `${color}18`, color, border: `1px solid ${color}30`, whiteSpace: "nowrap" }}>
      {lob}
    </span>
  );
}

export default function App() {
  const [filterLoB, setFilterLoB] = useState("All");
  const [filterTier, setFilterTier] = useState("All");
  const [filterTeam, setFilterTeam] = useState("All");
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [weights, setWeights] = useState({ ...DEFAULT_WEIGHTS });
  const [showWeights, setShowWeights] = useState(false);

  const scored = useMemo(() => {
    return INITIATIVES.map((item, idx) => {
      const scores = scoreInitiative(item);
      const total = computeTotal(scores, weights);
      return { ...item, scores, total, idx };
    }).sort((a, b) => b.total - a.total);
  }, [weights]);

  const lobs = [...new Set(INITIATIVES.map(i => i.LoB).filter(Boolean))].sort();
  const teams = [...new Set(INITIATIVES.map(i => i["Main Team"]).filter(Boolean))].sort();

  const filtered = scored.filter(item => {
    if (filterLoB !== "All" && item.LoB !== filterLoB) return false;
    if (filterTeam !== "All" && item["Main Team"] !== filterTeam) return false;
    if (filterTier !== "All" && getTier(item.total) !== filterTier) return false;
    return true;
  });

  const tierCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  scored.forEach(i => tierCounts[getTier(i.total)]++);

  const inputStyle = { padding: "6px 10px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12, background: "white", color: "#334155", outline: "none", cursor: "pointer" };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#1e293b" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", padding: "28px 24px 20px", color: "white" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", color: "#94a3b8", marginBottom: 6, textTransform: "uppercase" }}>Infrastructure Prioritization Framework</div>
              <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, lineHeight: 1.3 }}>Objective Initiative Scoring</h1>
            </div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 8, padding: "8px 14px", fontSize: 11, color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ fontWeight: 700, color: "#e2e8f0", marginBottom: 2 }}>Updated {DATA_META.updatedDate}</div>
              {DATA_META.totalActive} active initiatives
            </div>
          </div>
          <p style={{ fontSize: 13, color: "#94a3b8", margin: "6px 0 0", maxWidth: 700, lineHeight: 1.5 }}>
            Weighted scoring across 4 dimensions to remove LoB bias. Each initiative scored 0–100 per dimension, then combined using adjustable weights.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
            {["Critical", "High", "Medium", "Low"].map(tier => {
              const c = TIER_CONFIG[tier];
              return (
                <div key={tier} onClick={() => setFilterTier(filterTier === tier ? "All" : tier)}
                  style={{ padding: "8px 16px", borderRadius: 8, cursor: "pointer", background: filterTier === tier ? c.text : "rgba(255,255,255,0.07)", border: `1px solid ${filterTier === tier ? c.text : "rgba(255,255,255,0.12)"}`, transition: "all 0.2s" }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: filterTier === tier ? "white" : c.text }}>{tierCounts[tier]}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: filterTier === tier ? "rgba(255,255,255,0.8)" : "#94a3b8", letterSpacing: "0.06em" }}>{c.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px 40px" }}>
        {/* Controls */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 16 }}>
          <select value={filterLoB} onChange={e => setFilterLoB(e.target.value)} style={inputStyle}>
            <option value="All">All Business Lines</option>
            {lobs.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} style={inputStyle}>
            <option value="All">All Teams</option>
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <div style={{ flex: 1 }} />
          <button onClick={() => setShowWeights(!showWeights)} style={{ ...inputStyle, background: showWeights ? "#1e293b" : "white", color: showWeights ? "white" : "#334155", fontWeight: 600 }}>
            {showWeights ? "Hide" : "Adjust"} Weights
          </button>
          <span style={{ fontSize: 12, color: "#64748b" }}>{filtered.length} initiatives</span>
        </div>

        {/* Weight Sliders */}
        {showWeights && (
          <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16, marginBottom: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <div style={{ gridColumn: "1/-1", fontSize: 12, color: "#64748b", marginBottom: 4 }}>Drag to adjust how much each dimension influences the final score. Weights auto-balance to sum to 100.</div>
            {Object.entries(weights).map(([key, val]) => {
              const labels = { strategic: "Strategic Alignment", risk: "Risk & Compliance", value: "Business Value", efficiency: "Execution Readiness" };
              return (
                <div key={key}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{labels[key]}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#3b82f6" }}>{val}%</span>
                  </div>
                  <input type="range" min={0} max={60} value={val} onChange={e => {
                    const newVal = Number(e.target.value); const diff = newVal - val;
                    const others = Object.keys(weights).filter(k => k !== key);
                    const othersTotal = others.reduce((s, k) => s + weights[k], 0);
                    if (othersTotal - diff < 0) return;
                    const nw = { ...weights, [key]: newVal };
                    others.forEach(k => { nw[k] = Math.max(0, Math.round(weights[k] - (diff * weights[k] / othersTotal))); });
                    const sum = Object.values(nw).reduce((a, b) => a + b, 0);
                    if (sum !== 100) nw[others[0]] += (100 - sum);
                    setWeights(nw);
                  }} style={{ width: "100%", accentColor: "#3b82f6" }} />
                </div>
              );
            })}
          </div>
        )}

        {/* Initiative List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map((item, rank) => {
            const tier = getTier(item.total); const tc = TIER_CONFIG[tier]; const isExpanded = expandedIdx === item.idx;
            return (
              <div key={item.idx} onClick={() => setExpandedIdx(isExpanded ? null : item.idx)}
                style={{ background: "white", borderRadius: 10, border: `1px solid ${isExpanded ? tc.border : "#e2e8f0"}`, cursor: "pointer", transition: "all 0.2s", boxShadow: isExpanded ? `0 0 0 1px ${tc.border}40, 0 4px 12px ${tc.border}15` : "0 1px 2px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, background: tc.bg, color: tc.text, border: `1.5px solid ${tc.border}`, flexShrink: 0, fontFamily: "'JetBrains Mono', monospace" }}>{rank + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item["Roadmap item"]}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
                      <TierBadge tier={tier} />
                      <LoBBadge lob={item.LoB} />
                      {item.Status && <span style={{ fontSize: 10, color: "#64748b", fontWeight: 500 }}>{item.Status}</span>}
                      {item.OKR && <span style={{ fontSize: 9, color: "#3b82f6", fontWeight: 600, background: "#3b82f610", padding: "1px 5px", borderRadius: 3 }}>OKR</span>}
                      {item["2026 AVL Strategy Aligned"] === "Yes" && <span style={{ fontSize: 9, color: "#10b981", fontWeight: 600, background: "#10b98110", padding: "1px 5px", borderRadius: 3 }}>STRATEGY</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: tc.text, fontFamily: "'JetBrains Mono', monospace" }}>{item.total}</div>
                    <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 500 }}>/ 100</div>
                  </div>
                </div>
                {isExpanded && (
                  <div style={{ padding: "0 16px 16px", borderTop: "1px solid #f1f5f9" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                      {[{ label: "Strategic Alignment", val: item.scores.strategic, color: "#3b82f6" }, { label: "Risk & Compliance", val: item.scores.risk, color: "#ef4444" }, { label: "Business Value", val: item.scores.value, color: "#10b981" }, { label: "Execution Readiness", val: item.scores.efficiency, color: "#f59e0b" }].map(dim => (
                        <div key={dim.label}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 11, color: "#64748b" }}>{dim.label}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: dim.color }}>{dim.val}</span>
                          </div>
                          <ScoreBar score={dim.val} color={dim.color} />
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11 }}>
                      {item["Business Value/Purpose"] && (
                        <div style={{ gridColumn: "1/-1", background: "#f8fafc", padding: 10, borderRadius: 6 }}>
                          <span style={{ fontWeight: 600, color: "#475569" }}>Business Purpose: </span>
                          <span style={{ color: "#64748b" }}>{item["Business Value/Purpose"]}</span>
                        </div>
                      )}
                      <div><span style={{ color: "#94a3b8" }}>Epic: </span><span style={{ fontWeight: 500 }}>{item.MotherEPIC || "—"}</span></div>
                      <div><span style={{ color: "#94a3b8" }}>Team: </span><span style={{ fontWeight: 500 }}>{item["Main Team"] || "—"}</span></div>
                      <div><span style={{ color: "#94a3b8" }}>Est. Effort: </span><span style={{ fontWeight: 500 }}>{item["Estimated Effort (FTE Weeks)"] ?? "TBD"} FTE weeks</span></div>
                      <div><span style={{ color: "#94a3b8" }}>Original Priority: </span><span style={{ fontWeight: 500 }}>{item["Priority "] ?? "—"}</span></div>
                      <div><span style={{ color: "#94a3b8" }}>Strategy Aligned: </span><span style={{ fontWeight: 500, color: item["2026 AVL Strategy Aligned"] === "Yes" ? "#10b981" : item["2026 AVL Strategy Aligned"] === "No" ? "#ef4444" : "#94a3b8" }}>{item["2026 AVL Strategy Aligned"] || "Unknown"}</span></div>
                      {item.Dependency && <div style={{ gridColumn: "1/-1" }}><span style={{ color: "#ef4444" }}>Dependency: </span><span style={{ fontWeight: 500 }}>{item.Dependency}</span></div>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Change Log + Methodology */}
        <div style={{ marginTop: 32, background: "white", borderRadius: 10, border: "1px solid #e2e8f0", padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 8px", color: "#1e293b" }}>Changes from Previous Run</h3>
          <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.8, marginBottom: 16 }}>
            {DATA_META.changeLog.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                <span style={{ color: CHANGE_COLORS[c.type], fontWeight: 700, fontSize: 10, textTransform: "uppercase", minWidth: 60 }}>{c.type}</span>
                <span>{c.text}</span>
              </div>
            ))}
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 12px", color: "#1e293b" }}>Scoring Methodology</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, fontSize: 12, color: "#475569", lineHeight: 1.6 }}>
            <div><div style={{ fontWeight: 700, color: "#3b82f6", marginBottom: 4 }}>Strategic Alignment ({weights.strategic}%)</div>2026 strategy alignment (Yes/No/Unknown), OKR linkage, current momentum, Q1 2026 plan presence.</div>
            <div><div style={{ fontWeight: 700, color: "#ef4444", marginBottom: 4 }}>Risk & Compliance ({weights.risk}%)</div>Security/compliance classification, disaster recovery, supply chain risk, maintenance urgency, incident response.</div>
            <div><div style={{ fontWeight: 700, color: "#10b981", marginBottom: 4 }}>Business Value ({weights.value}%)</div>Documented business purpose, OKR linkage, revenue-generating LoB, cost optimization potential, team priority signal.</div>
            <div><div style={{ fontWeight: 700, color: "#f59e0b", marginBottom: 4 }}>Execution Readiness ({weights.efficiency}%)</div>Low effort estimate, already in progress, no dependencies, scheduled in near-term planning cycle.</div>
          </div>
          <div style={{ marginTop: 12, padding: 10, background: "#f8fafc", borderRadius: 6, fontSize: 11, color: "#64748b", lineHeight: 1.6 }}>
            <strong>Bias removal:</strong> Each LoB rates their own initiatives as high priority (column R). This framework evaluates every initiative against company-wide criteria regardless of submitting team.
          </div>
        </div>
      </div>
    </div>
  );
}
