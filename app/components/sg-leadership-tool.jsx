"use client"

import { useState, useMemo, useRef, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════
   UNSG Candidate Leadership Profile Tool
   ═══════════════════════════════════════════ */

const DIMENSIONS = [
  { id: "charter", label: "Charter Interpretation", short: "Charter", pillar: 1,
    low: "Fidelity to core functions; avoids expansive reinterpretation",
    high: "Views Charter as living instrument; adaptive application to contemporary risks" },
  { id: "reform", label: "Reform & Accountability", short: "Reform", pillar: 1,
    low: "Procedural refinements and managerial efficiency",
    high: "Systemic modernization, transparency reforms, rethinking institutional architecture" },
  { id: "appointments", label: "Independence in Appointments", short: "Appointments", pillar: 1,
    low: "Maintains established geographic distribution of posts",
    high: "Merit-based appointments insulated from political pressure" },
  { id: "leadership", label: "Leadership Philosophy", short: "Leadership", pillar: 2,
    low: "Administrative coordinator and consensus facilitator",
    high: "Agenda-setting, norm-shaping, institutionally directive" },
  { id: "crisis", label: "Crisis Leadership", short: "Crisis", pillar: 2,
    low: "Limited crisis exposure; primarily bureaucratic profile",
    high: "Demonstrated high-stakes crisis management; innovation under pressure" },
  { id: "engagement", label: "Multilingual & Stakeholder Engagement", short: "Engagement", pillar: 2,
    low: "Focus on Member State diplomacy; limited public communication",
    high: "Cross-cultural fluency; digital platforms; civil society engagement" },
  { id: "climate", label: "Development & Climate Action", short: "Climate", pillar: 3,
    low: "Prioritizes delivery of existing frameworks (SDGs, Paris)",
    high: "New financing models, climate governance innovation, structural shifts" },
  { id: "peace", label: "Peace & Security Agenda", short: "Peace", pillar: 3,
    low: "Defers to formal Security Council processes",
    high: "Good offices, prevention, mediation, systemic conflict mitigation" },
  { id: "accountability", label: "Accountability to 8 Billion", short: "Accountability", pillar: 4,
    low: "Accountability primarily toward governments",
    high: "Centers affected communities, civil society, social movements" },
  { id: "gender", label: "Gender Equality & Inclusion", short: "Gender", pillar: 4,
    low: "Gender equality within existing frameworks",
    high: "Parity in leadership, institutional gender reform, explicit rights defense" },
  { id: "humanrights", label: "Human Rights & Rule of Law", short: "Human Rights", pillar: 4,
    low: "Reiterates commitment without strong enforcement",
    high: "Challenges violations, supports accountability mechanisms, elevates rights" },
];

const PILLARS = [
  { id: 1, name: "Institutional Ambition", color: "#2171D4" },   /* vivid blue */
  { id: 2, name: "Executive Capacity", color: "#12A67C" },       /* vivid teal-green */
  { id: 3, name: "Strategic Agenda", color: "#E08B18" },         /* vivid orange */
  { id: 4, name: "Normative Leadership", color: "#C43990" },     /* vivid magenta */
];

const PILLAR_COLORS = { 1: "#2171D4", 2: "#12A67C", 3: "#E08B18", 4: "#C43990" };

/* Axis color scale: Traditional (vivid blue) → Transformative (vivid green) */
function axisColor(score) {
  const t = Math.max(0, Math.min(1, score / 10));
  const r = Math.round(33 + t * (18 - 33));
  const g = Math.round(113 + t * (166 - 113));
  const b = Math.round(212 + t * (124 - 212));
  return `rgb(${r},${g},${b})`;
}

/* Colorblind-safe palette based on Wong (2011) + extended for 10 slots */
const CANDIDATE_COLORS = [
  "#0072B2", "#E69F00", "#009E73", "#CC79A7", "#56B4E9",
  "#D55E00", "#F0E442", "#000000", "#8C564B", "#377EB8",
];

const SOURCE_TYPES = [
  { id: "vision", label: "Vision Statement" },
  { id: "hearing", label: "Public Hearing" },
  { id: "speech", label: "Public Speech" },
];

// Sample candidates for demonstration
const SAMPLE_CANDIDATES = [
  {
    id: "c1", name: "Candidate A (Demo)", color: "#0072B2",
    source: "vision",
    scores: { charter: 7, reform: 8, appointments: 6, leadership: 8, crisis: 5, engagement: 7, climate: 9, peace: 6, accountability: 8, gender: 9, humanrights: 8 },
    notes: "Demonstrates transformative orientation across most dimensions, with particular strength in normative leadership.",
  },
  {
    id: "c2", name: "Candidate B (Demo)", color: "#E69F00",
    source: "vision",
    scores: { charter: 4, reform: 5, appointments: 7, leadership: 5, crisis: 8, engagement: 4, climate: 5, peace: 7, accountability: 4, gender: 5, humanrights: 6 },
    notes: "More procedural orientation with notable crisis leadership experience and appointments independence.",
  },
];

function avg(scores) {
  const vals = Object.values(scores).filter(v => v != null && v > 0);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 5;
}

function pillarAvg(scores, pillarId) {
  const dims = DIMENSIONS.filter(d => d.pillar === pillarId);
  const vals = dims.map(d => scores[d.id]).filter(v => v != null && v > 0);
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 5;
}

/* ═══ RADAR CHART ═══ */
function RadarChart({ candidate, size = 360, compares = [] }) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.34;
  const labelR = size * 0.46;
  const n = DIMENSIONS.length;

  function polarToCart(angle, r) {
    const a = angle - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  const angles = DIMENSIONS.map((_, i) => (2 * Math.PI * i) / n);

  const rings = [2, 4, 6, 8, 10];
  const gridLines = rings.map(v => {
    const r = (v / 10) * maxR;
    const pts = angles.map(a => polarToCart(a, r));
    return pts.map(p => `${p.x},${p.y}`).join(" ");
  });

  const spokes = angles.map(a => polarToCart(a, maxR));

  function dataPolygon(scores, color) {
    const pts = DIMENSIONS.map((d, i) => {
      const v = scores[d.id] || 0;
      const r = (v / 10) * maxR;
      return polarToCart(angles[i], r);
    });
    const pathStr = pts.map(p => `${p.x},${p.y}`).join(" ");
    return { pts, pathStr, color };
  }

  const mainPoly = dataPolygon(candidate.scores, candidate.color);
  const comparePolys = compares.map(c => dataPolygon(c.scores, c.color));

  const labels = DIMENSIONS.map((d, i) => {
    const p = polarToCart(angles[i], labelR);
    const pillarColor = PILLAR_COLORS[d.pillar];
    let textAnchor = "middle";
    if (p.x < cx - 10) textAnchor = "end";
    else if (p.x > cx + 10) textAnchor = "start";
    return { ...d, x: p.x, y: p.y, textAnchor, pillarColor };
  });

  // Dash patterns to differentiate overlays
  const dashPatterns = ["4 3", "8 4", "2 4", "6 2 2 2", "10 4 2 4"];

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
      {PILLARS.map(p => {
        const dims = DIMENSIONS.filter(d => d.pillar === p.id);
        const firstIdx = DIMENSIONS.indexOf(dims[0]);
        const lastIdx = DIMENSIONS.indexOf(dims[dims.length - 1]);
        const startAngle = angles[firstIdx] - Math.PI / n;
        const endAngle = angles[lastIdx] + Math.PI / n;
        const arcR = maxR + 6;
        const start = polarToCart(startAngle, arcR);
        const end = polarToCart(endAngle, arcR);
        const largeArc = (endAngle - startAngle) > Math.PI ? 1 : 0;
        const pathD = `M ${start.x} ${start.y} A ${arcR} ${arcR} 0 ${largeArc} 1 ${end.x} ${end.y}`;
        return <path key={p.id} d={pathD} fill="none" stroke={p.color} strokeWidth={4} strokeOpacity={0.5} strokeLinecap="round" />;
      })}
      {gridLines.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke="#e5e7eb" strokeWidth={i === 4 ? 1.2 : 0.6} />
      ))}
      {spokes.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e5e7eb" strokeWidth={0.6} />
      ))}
      {[2, 4, 6, 8, 10].map(v => {
        const r = (v / 10) * maxR;
        return (
          <text key={v} x={cx + 4} y={cy - r + 4} fontSize={10} fill="#999" fontFamily="monospace">
            {v}
          </text>
        );
      })}
      {/* Compare polygons */}
      {comparePolys.map((cp, i) => (
        <g key={i}>
          <polygon points={cp.pathStr} fill={cp.color} fillOpacity={0.08} stroke={cp.color} strokeWidth={1.5} strokeDasharray={dashPatterns[i % dashPatterns.length]} />
        </g>
      ))}
      {/* Main polygon */}
      <polygon points={mainPoly.pathStr} fill={candidate.color} fillOpacity={0.2} stroke={candidate.color} strokeWidth={2.5} />
      {mainPoly.pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill={candidate.color} stroke="#fff" strokeWidth={1.5} />
      ))}
      {labels.map((l, i) => (
        <text key={i} x={l.x} y={l.y} textAnchor={l.textAnchor} dominantBaseline="central"
          fontSize={12.5} fontWeight={700} fill={l.pillarColor} fontFamily="'Söhne', system-ui, sans-serif">
          {l.short}
        </text>
      ))}
    </svg>
  );
}

/* ═══ AXIS DOT WITH HOVER TOOLTIP ═══ */
function AxisDot({ c, isSelected, dotR, onCandidateClick }) {
  const [hovered, setHovered] = useState(false);
  const posColor = axisColor(c.x * 10);
  const shortName = c.name.length > 14 ? c.name.slice(0, 12) + "…" : c.name;
  const overall = avg(c.scores);
  const isStacked = c.row > 0;

  return (
    <div
      onClick={() => onCandidateClick && onCandidateClick(c)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        left: `${c.x * 100}%`,
        bottom: 6 + c.row * 62,
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
        transition: "all 0.2s ease",
        zIndex: hovered ? 20 : 1,
      }}
    >
      {/* Connector line to axis for stacked dots */}
      {isStacked && (
        <div style={{
          position: "absolute",
          bottom: -6 - (c.row > 0 ? 0 : 0),
          left: "50%",
          transform: "translateX(-50%)",
          width: 1,
          height: c.row * 62 - 20,
          borderLeft: "1px dashed #cbd5e1",
          pointerEvents: "none",
        }} />
      )}
      {/* Hover tooltip */}
      {hovered && (
        <div style={{
          position: "absolute",
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginBottom: 8,
          background: "#1e293b",
          color: "#fff",
          borderRadius: 8,
          padding: "10px 14px",
          whiteSpace: "nowrap",
          boxShadow: "0 4px 16px rgba(0,0,0,.25)",
          zIndex: 30,
          pointerEvents: "none",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{c.name}</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>
            Overall: {overall.toFixed(1)} / 10
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {PILLARS.map(p => (
              <div key={p.id} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 9, color: p.color, fontWeight: 600, marginBottom: 2 }}>
                  {p.name.split(" ")[0]}
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>
                  {pillarAvg(c.scores, p.id).toFixed(1)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: "#64748b", marginTop: 4, fontStyle: "italic" }}>
            Click to expand details
          </div>
          {/* Tooltip arrow */}
          <div style={{
            position: "absolute",
            bottom: -5,
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "6px solid #1e293b",
          }} />
        </div>
      )}
      {/* Dot with score */}
      <div style={{
        width: dotR * 2 + 4,
        height: dotR * 2 + 4,
        borderRadius: "50%",
        background: posColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: isSelected
          ? `0 0 0 3px ${posColor}40, 0 2px 10px ${c.color}35`
          : hovered
            ? `0 0 0 3px ${c.color}30, 0 2px 8px rgba(0,0,0,0.15)`
            : `0 1px 3px rgba(0,0,0,0.12)`,
        transition: "all 0.2s ease",
        opacity: isSelected || hovered ? 1 : 0.85,
        transform: hovered ? "scale(1.1)" : "scale(1)",
      }}>
        <div style={{
          width: dotR * 2,
          height: dotR * 2,
          borderRadius: "50%",
          background: c.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>
            {overall.toFixed(1)}
          </span>
        </div>
      </div>
      {/* Name below dot */}
      <div style={{
        fontSize: hovered ? 12 : 10,
        fontWeight: 700,
        color: c.color,
        whiteSpace: "nowrap",
        marginTop: 3,
        opacity: isSelected || hovered ? 1 : 0.75,
        maxWidth: hovered ? "none" : 90,
        overflow: hovered ? "visible" : "hidden",
        textOverflow: hovered ? "unset" : "ellipsis",
        textAlign: "center",
        transition: "all 0.15s ease",
      }}>
        {hovered ? c.name : shortName}
      </div>
    </div>
  );
}

/* ═══ SINGLE AXIS STRIP ═══ */
function AxisStrip({ candidates, onCandidateClick, selectedId }) {
  const dotR = 18;

  const positioned = useMemo(() => {
    const sorted = [...candidates].sort((a, b) => avg(a.scores) - avg(b.scores));
    const placed = [];
    sorted.forEach(c => {
      const x = avg(c.scores) / 10;
      let row = 0;
      // Stack if within ~5% of each other on the axis (prevents any visual overlap)
      while (placed.some(p => Math.abs(p.x - x) < 0.05 && p.row === row)) {
        row++;
      }
      placed.push({ ...c, x, row });
    });
    return placed;
  }, [candidates]);

  const maxRow = Math.max(0, ...positioned.map(p => p.row));

  return (
    <div style={{ width: "100%", padding: "0 16px", boxSizing: "border-box" }}>
      {/* Candidate dots area */}
      <div style={{
        position: "relative",
        height: 80 + maxRow * 62,
        marginBottom: 4,
      }}>
        {positioned.map(c => (
          <AxisDot key={c.id} c={c} isSelected={selectedId === c.id} dotR={dotR} onCandidateClick={onCandidateClick} />
        ))}
      </div>

      {/* Gradient bar — blue (Traditional) → green (Transformative) */}
      <div style={{
        height: 8,
        borderRadius: 4,
        background: "linear-gradient(to right, #2171D4 0%, #1A8CA8 50%, #12A67C 100%)",
        position: "relative",
      }}>
        {[0, 5, 10].map(v => (
          <div key={v} style={{
            position: "absolute",
            left: `${(v / 10) * 100}%`,
            top: -2,
            width: 1,
            height: 10,
            background: v === 5 ? "#94a3b8" : "transparent",
          }} />
        ))}
      </div>

      {/* Labels row below bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginTop: 10,
        padding: "0 2px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
            <rect x="3" y="3" width="10" height="10" rx="1" fill="none" stroke="#2171D4" strokeWidth="1.5" />
          </svg>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#2171D4", letterSpacing: 0.4, lineHeight: 1.2 }}>
              Traditional
            </div>
            <div style={{ fontSize: 10, color: "#6a9ad4", fontWeight: 500 }}>
              Procedural Manager
            </div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "#bbb", fontWeight: 600, fontFamily: "monospace", alignSelf: "center" }}>
          0 ——— 5 ——— 10
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, textAlign: "right" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#12A67C", letterSpacing: 0.4, lineHeight: 1.2 }}>
              Transformative
            </div>
            <div style={{ fontSize: 10, color: "#5dba98", fontWeight: 500 }}>
              Institutional Re-Architect
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" style={{ flexShrink: 0 }}>
            <polygon points="8,2 14,14 2,14" fill="none" stroke="#12A67C" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ═══ CSV UTILITIES ═══ */
function generateCSVTemplate() {
  const header = ["Name", "Source", "Notes",
    ...DIMENSIONS.map(d => d.id)
  ].join(",");
  const exampleRow = ['"Example Candidate"', "vision", '"Assessment notes"',
    ...DIMENSIONS.map(() => "5")
  ].join(",");
  return header + "\n" + exampleRow;
}

function downloadCSVTemplate() {
  const csv = generateCSVTemplate();
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "UNSG-leadership-grading-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function CandidatexportesCSV(candidates) {
  const header = ["Name", "Source", "Notes",
    ...DIMENSIONS.map(d => d.id)
  ].join(",");
  const rows = candidates.map(c => {
    return [
      '"' + (c.name || "").replace(/"/g, "'") + '"',
      c.source || "vision",
      '"' + (c.notes || "").replace(/"/g, "'") + '"',
      ...DIMENSIONS.map(d => c.scores[d.id] || 0)
    ].join(",");
  });
  const csv = header + "\n" + rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "UNSG-leadership-profiles-" + new Date().toISOString().slice(0, 10) + ".csv";
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSVImport(text) {
  const lines = text.split("\n").filter(l => l.trim() && !l.trim().startsWith("#"));
  if (lines.length < 2) return null;

  const rawHeader = lines[0];
  const header = [];
  let cur = "", inQ = false;
  for (let i = 0; i < rawHeader.length; i++) {
    const ch = rawHeader[i];
    if (ch === '"') { inQ = !inQ; }
    else if (ch === "," && !inQ) { header.push(cur.trim().toLowerCase()); cur = ""; }
    else { cur += ch; }
  }
  header.push(cur.trim().toLowerCase());

  const nameIdx = header.indexOf("name");
  if (nameIdx < 0) return null;
  const sourceIdx = header.indexOf("source");
  const notesIdx = header.indexOf("notes");

  const dimIdxMap = {};
  DIMENSIONS.forEach(d => {
    const idx = header.indexOf(d.id.toLowerCase());
    if (idx >= 0) dimIdxMap[d.id] = idx;
  });

  // Shuffle color assignment so imports don't always start with the same color
  const shuffledColors = [...CANDIDATE_COLORS].sort(() => Math.random() - 0.5);

  const candidates = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = [];
    let c2 = "", q = false;
    for (let j = 0; j < lines[i].length; j++) {
      const ch = lines[i][j];
      if (ch === '"') { q = !q; }
      else if (ch === "," && !q) { parts.push(c2); c2 = ""; }
      else { c2 += ch; }
    }
    parts.push(c2);

    const name = (parts[nameIdx] || "").trim();
    if (!name) continue;

    const scores = {};
    DIMENSIONS.forEach(d => {
      if (dimIdxMap[d.id] != null) {
        scores[d.id] = Math.max(0, Math.min(10, Number(parts[dimIdxMap[d.id]]) || 0));
      } else {
        scores[d.id] = 5;
      }
    });

    candidates.push({
      id: "csv" + Date.now() + "_" + i,
      name,
      source: sourceIdx >= 0 ? (parts[sourceIdx] || "vision").trim() : "vision",
      color: shuffledColors[candidates.length % shuffledColors.length],
      notes: notesIdx >= 0 ? (parts[notesIdx] || "").trim() : "",
      scores,
    });
  }
  return candidates.length > 0 ? candidates : null;
}

/* ═══ CANDIDATE CARD ═══ */
function CandidateCard({ candidate, allCandidates, onEdit, onDelete, forceExpanded, onToggle, cardRef }) {
  const expanded = forceExpanded;
  const [compareIds, setCompareIds] = useState([]);
  const compares = compareIds.map(id => allCandidates.find(c => c.id === id)).filter(Boolean);
  const overall = avg(candidate.scores);

  function toggleCompare(id) {
    setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  return (
    <div ref={cardRef} style={{
      background: "#fff",
      borderRadius: 12,
      border: expanded ? `2px solid ${candidate.color}40` : `2px solid ${candidate.color}18`,
      overflow: "hidden",
      transition: "all 0.2s ease",
    }}>
      {/* Header */}
      <div
        onClick={() => onToggle(candidate.id)}
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          cursor: "pointer",
          borderLeft: `4px solid ${candidate.color}`,
        }}
      >
        <div style={{
          width: 42, height: 42, borderRadius: "50%",
          background: candidate.color, display: "flex",
          alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>
            {overall.toFixed(1)}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
            {candidate.name}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginTop: 3 }}>
            Source: {SOURCE_TYPES.find(s => s.id === candidate.source)?.label || "Vision Statement"}
          </div>
        </div>
        {/* Pillar mini bars */}
        <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 32 }}>
          {PILLARS.map(p => {
            const val = pillarAvg(candidate.scores, p.id);
            return (
              <div key={p.id} title={p.name} style={{
                width: 10, height: `${(val / 10) * 100}%`,
                background: p.color, borderRadius: 2,
                minHeight: 3,
              }} />
            );
          })}
        </div>
        <svg width="18" height="18" viewBox="0 0 16 16" style={{
          transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease", flexShrink: 0,
        }}>
          <polyline points="4,6 8,10 12,6" fill="none" stroke="#94a3b8" strokeWidth="2" />
        </svg>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: "0 20px 20px", borderLeft: `4px solid ${candidate.color}` }}>
          {/* Compare selector — multi-select */}
          {allCandidates.length > 1 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                Overlay candidates:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {allCandidates.filter(c => c.id !== candidate.id).map(c => {
                  const active = compareIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      onClick={() => toggleCompare(c.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "5px 12px", borderRadius: 20,
                        border: active ? `2px solid ${c.color}` : "2px solid #e2e8f0",
                        background: active ? `${c.color}12` : "#fff",
                        cursor: "pointer", fontFamily: "inherit",
                        fontSize: 12, fontWeight: 600,
                        color: active ? c.color : "#94a3b8",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{
                        width: 10, height: 10, borderRadius: "50%",
                        background: active ? c.color : "#e2e8f0",
                        transition: "all 0.15s ease",
                      }} />
                      {c.name}
                    </button>
                  );
                })}
                {compareIds.length > 0 && (
                  <button
                    onClick={() => setCompareIds([])}
                    style={{
                      padding: "5px 10px", borderRadius: 20,
                      border: "1px solid #e2e8f0", background: "#f8fafc",
                      cursor: "pointer", fontFamily: "inherit",
                      fontSize: 11, fontWeight: 500, color: "#94a3b8",
                    }}
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Radar chart */}
          <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 4px" }}>
            <RadarChart candidate={candidate} size={340} compares={compares} />
          </div>

          {/* Overlay legend */}
          {compares.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 20, height: 3, background: candidate.color, borderRadius: 2 }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: candidate.color }}>{candidate.name}</span>
              </div>
              {compares.map((c, i) => {
                const dashPatterns = ["4 3", "8 4", "2 4", "6 2 2 2", "10 4 2 4"];
                return (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke={c.color} strokeWidth="2" strokeDasharray={dashPatterns[i % dashPatterns.length]} /></svg>
                    <span style={{ fontSize: 11, fontWeight: 600, color: c.color }}>{c.name}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pillar breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            {PILLARS.map(p => {
              const dims = DIMENSIONS.filter(d => d.pillar === p.id);
              const pAvg = pillarAvg(candidate.scores, p.id);
              return (
                <div key={p.id} style={{
                  padding: "12px 14px", borderRadius: 8,
                  background: `${p.color}12`, border: `1px solid ${p.color}30`,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: p.color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                    {p.name} — {pAvg.toFixed(1)}
                  </div>
                  {dims.map(d => (
                    <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                      <div style={{ flex: 1, fontSize: 12, color: "#334155", fontWeight: 500 }}>{d.short}</div>
                      <div style={{ width: 60, height: 5, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(candidate.scores[d.id] || 0) * 10}%`, background: p.color, borderRadius: 3, transition: "width 0.3s ease" }} />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", width: 20, textAlign: "right", fontFamily: "monospace" }}>
                        {candidate.scores[d.id] || 0}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Notes */}
          {candidate.notes && (
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, padding: "10px 12px", background: "#f8fafc", borderRadius: 6, marginBottom: 14 }}>
              {candidate.notes}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onEdit(candidate)} style={{
              fontSize: 12, fontWeight: 600, padding: "7px 16px", borderRadius: 6,
              border: "1px solid #e2e8f0", background: "#fff", color: "#475569",
              cursor: "pointer", fontFamily: "inherit",
            }}>Edit</button>
            <button onClick={() => onDelete(candidate.id)} style={{
              fontSize: 12, fontWeight: 600, padding: "7px 16px", borderRadius: 6,
              border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626",
              cursor: "pointer", fontFamily: "inherit",
            }}>Remove</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══ EDIT PANEL ═══ */
function EditPanel({ candidate, onSave, onCancel, usedColors }) {
  const [draft, setDraft] = useState(() => ({
    ...candidate,
    scores: { ...candidate.scores },
  }));

  function setScore(dimId, val) {
    setDraft(d => ({ ...d, scores: { ...d.scores, [dimId]: val } }));
  }

  return (
    <div style={{
      position: "fixed", top: 0, right: 0, width: 400, maxWidth: "100vw",
      height: "100vh", background: "#fff", zIndex: 200,
      boxShadow: "-4px 0 24px rgba(0,0,0,.1)", display: "flex", flexDirection: "column",
    }}>
      <div style={{
        padding: "16px 20px 12px", borderBottom: "1px solid #e2e8f0",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
          {candidate.id ? "Edit Candidate" : "Add Candidate"}
        </h3>
        <button onClick={onCancel} style={{
          background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8",
        }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px 80px" }}>
        {/* Name */}
        <label style={labelSt}>Candidate Name</label>
        <input
          value={draft.name}
          onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
          style={inputSt}
          placeholder="Full name"
        />

        {/* Color */}
        <label style={labelSt}>Color</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
          {CANDIDATE_COLORS.map(c => (
            <div
              key={c}
              onClick={() => setDraft(d => ({ ...d, color: c }))}
              style={{
                width: 24, height: 24, borderRadius: 6, background: c,
                cursor: "pointer", opacity: draft.color === c ? 1 : 0.4,
                border: draft.color === c ? "2px solid #0f172a" : "2px solid transparent",
                transition: "all 0.15s ease",
              }}
            />
          ))}
        </div>

        {/* Source */}
        <label style={labelSt}>Source Type</label>
        <select
          value={draft.source}
          onChange={e => setDraft(d => ({ ...d, source: e.target.value }))}
          style={{ ...inputSt, marginBottom: 12 }}
        >
          {SOURCE_TYPES.map(s => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>

        {/* Scores by pillar */}
        {PILLARS.map(p => {
          const dims = DIMENSIONS.filter(d => d.pillar === p.id);
          return (
            <div key={p.id} style={{ marginBottom: 16 }}>
              <div style={{
                fontSize: 11, fontWeight: 800, color: p.color,
                textTransform: "uppercase", letterSpacing: 0.6,
                paddingBottom: 6, borderBottom: `2px solid ${p.color}20`,
                marginBottom: 8,
              }}>
                {p.name}
              </div>
              {dims.map(d => (
                <div key={d.id} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#334155" }}>{d.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: p.color, fontFamily: "monospace" }}>
                      {draft.scores[d.id] || 0}
                    </span>
                  </div>
                  <input
                    type="range" min="0" max="10" step="1"
                    value={draft.scores[d.id] || 0}
                    onChange={e => setScore(d.id, Number(e.target.value))}
                    style={{ width: "100%", accentColor: p.color }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#94a3b8", lineHeight: 1.3, marginTop: 1 }}>
                    <span style={{ maxWidth: "45%" }}>{d.low}</span>
                    <span style={{ maxWidth: "45%", textAlign: "right" }}>{d.high}</span>
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        {/* Notes */}
        <label style={labelSt}>Notes</label>
        <textarea
          value={draft.notes || ""}
          onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))}
          style={{ ...inputSt, minHeight: 60, resize: "vertical" }}
          placeholder="Assessment notes, source references..."
        />
      </div>
      <div style={{
        padding: "12px 20px", borderTop: "1px solid #e2e8f0",
        display: "flex", gap: 8, justifyContent: "flex-end",
      }}>
        <button onClick={onCancel} style={{
          padding: "8px 16px", borderRadius: 6, border: "1px solid #e2e8f0",
          background: "#fff", color: "#475569", fontSize: 12, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit",
        }}>Cancel</button>
        <button
          onClick={() => onSave(draft)}
          disabled={!draft.name.trim()}
          style={{
            padding: "8px 16px", borderRadius: 6, border: "none",
            background: draft.name.trim() ? "#1e293b" : "#cbd5e1",
            color: "#fff", fontSize: 12, fontWeight: 600,
            cursor: draft.name.trim() ? "pointer" : "default", fontFamily: "inherit",
          }}
        >
          {candidate.id ? "Save" : "Add Candidate"}
        </button>
      </div>
    </div>
  );
}

/* ═══ METHODOLOGY MODAL ═══ */
function MethodModal({ onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,.4)", zIndex: 300,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 12, maxWidth: 560, width: "100%",
        maxHeight: "85vh", overflow: "auto", padding: "24px 28px",
        boxShadow: "0 20px 60px rgba(0,0,0,.2)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#0f172a" }}>Methodology</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>✕</button>
        </div>

        <p style={pSt}>This tool assesses UNSG candidates along a single strategic axis — from <strong>Traditional Procedural Manager</strong> to <strong>Transformative Institutional Re-Architect</strong> — across 11 dimensions organized into 4 pillars.</p>

        <p style={pSt}>Building on the <a href="https://1for8billion.org/" target="_blank" rel="noopener noreferrer" style={{ color: "#0072B2", fontWeight: 600 }}>1 for 8 Billion</a> coalition's requirements for an effective Secretary-General, the tool draws on vision statements, public hearings, and campaign speeches to map leadership archetypes.</p>

        <h3 style={hdSt}>The Axis</h3>
        <div style={blockSt}>
          <div style={{ marginBottom: 8 }}>
            <strong style={{ color: "#64748b" }}>0 — Traditional Procedural Manager:</strong> Operates within established Charter interpretations. Prioritizes consensus-building, deference to Member States, and incremental adjustment.
          </div>
          <div>
            <strong style={{ color: "#1e293b" }}>10 — Transformative Re-Architect:</strong> Interprets the Charter as a living mandate. Seeks structural modernization, institutional independence, and visible normative leadership.
          </div>
        </div>

        <h3 style={hdSt}>Pillars & Dimensions</h3>
        {PILLARS.map(p => {
          const dims = DIMENSIONS.filter(d => d.pillar === p.id);
          return (
            <div key={p.id} style={{ ...blockSt, borderLeft: `3px solid ${p.color}` }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: p.color, marginBottom: 6 }}>{p.name}</div>
              {dims.map(d => (
                <div key={d.id} style={{ marginBottom: 4, fontSize: 11.5, lineHeight: 1.5 }}>
                  <strong>{d.label}:</strong> {d.low} → {d.high}
                </div>
              ))}
            </div>
          );
        })}

        <h3 style={hdSt}>Scoring</h3>
        <p style={pSt}>Each dimension is scored 0–10. The overall axis position is the mean of all 11 scores. Pillar averages are shown in the radar chart and breakdown bars. The purpose is not to rank candidates but to map leadership archetypes in relation to today's fractured multilateral environment.</p>

        <h3 style={hdSt}>Radar Chart Ordering</h3>
        <p style={pSt}>Radar charts are only meaningful when the ordering of dimensions around the circle reflects a genuine relational structure — adjacent dimensions should be conceptually connected, not arbitrarily placed. In this tool, the 11 dimensions are ordered by pillar, following a deliberate logic:</p>
        <div style={blockSt}>
          <div style={{ marginBottom: 6 }}>The sequence moves from <strong>institutional foundations</strong> (how the candidate reads the Charter, approaches reform, and staffs the Secretariat) → to <strong>executive style</strong> (how they lead, handle crises, and engage stakeholders) → to <strong>substantive agenda</strong> (development/climate and peace/security priorities) → to <strong>normative commitments</strong> (accountability, gender, human rights).</div>
          <div style={{ marginBottom: 6 }}>This creates a coherent circular flow: institutional architecture → executive capacity to deliver → strategic priorities → normative vision → which loops back to shaping institutional architecture. Adjacent dimensions are thematically linked (e.g., Charter interpretation sits next to Reform; Gender sits next to Human Rights; Peace sits next to Accountability).</div>
          <div style={{ fontSize: 10, color: "#64748b", fontStyle: "italic" }}>The ordering is fixed and cannot be rearranged by users, precisely to prevent the manipulation of "area shapes" that makes radar charts misleading when label order is arbitrary. The pillar grouping is color-coded on the chart for transparency.</div>
        </div>

        <h3 style={hdSt}>Color Accessibility</h3>
        <p style={pSt}>All color palettes in this tool are designed using the Wong (2011) colorblind-safe palette and tested for deuteranopia, protanopia, and tritanopia accessibility. The four pillars use blue, green, amber, and pink — four hues maximally distinguishable across color vision types. The Traditional–Transformative axis uses a blue-to-green gradient, remaining clearly directional under all common forms of color vision deficiency.</p>

        <h3 style={hdSt}>Sources</h3>
        <p style={pSt}>Scoring draws on: vision statements submitted to the General Assembly, public hearings before Member States, and public speeches relevant to the SG campaign. Source type is tracked per candidate entry.</p>

        <div style={{ padding: "10px 12px", background: "#fffbeb", borderRadius: 6, fontSize: 11, lineHeight: 1.5, color: "#92400e" }}>
          <strong>Note:</strong> This is a prototype tool for missions and foreign ministries. It reflects assessment at a point in time and is dynamic by design.
        </div>
      </div>
    </div>
  );
}

/* ═══ DIMENSION INFO MODAL ═══ */
function DimInfoModal({ onClose }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,.4)", zIndex: 300,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 12, maxWidth: 640, width: "100%",
        maxHeight: "85vh", overflow: "auto", padding: "24px 28px",
        boxShadow: "0 20px 60px rgba(0,0,0,.2)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: "#0f172a" }}>Dimension Reference</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8" }}>✕</button>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {PILLARS.map(p => {
            const dims = DIMENSIONS.filter(d => d.pillar === p.id);
            return (
              <div key={p.id}>
                <div style={{ fontSize: 12, fontWeight: 800, color: p.color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, paddingBottom: 4, borderBottom: `2px solid ${p.color}20` }}>
                  {p.name}
                </div>
                {dims.map(d => (
                  <div key={d.id} style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: 6, marginBottom: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>{d.label}</div>
                    <div style={{ display: "flex", gap: 12, fontSize: 10.5, lineHeight: 1.4 }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 700, color: "#94a3b8" }}>0:</span>{" "}
                        <span style={{ color: "#64748b" }}>{d.low}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 700, color: "#1e293b" }}>10:</span>{" "}
                        <span style={{ color: "#334155" }}>{d.high}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══ QUIZ QUESTIONS ═══ */
const QUIZ_QUESTIONS = [
  {
    id: "q1", pillar: 1, dims: ["charter"],
    question: "How should the next Secretary-General interpret the UN Charter?",
    options: [
      { label: "Stick to the original text — the Charter's strength is its stability", score: 2, weight: 10 },
      { label: "Mostly follow established practice, with minor updates where needed", score: 4, weight: 10 },
      { label: "Adapt it pragmatically — the world has changed since 1945", score: 7, weight: 10 },
      { label: "Treat it as a living document that must evolve with new global realities", score: 9, weight: 10 },
    ],
  },
  {
    id: "q2", pillar: 1, dims: ["reform", "appointments"],
    question: "What kind of institutional reform matters most to you?",
    options: [
      { label: "Better management — make the existing system more efficient", score: 3, weight: 10 },
      { label: "Transparency — open up how decisions and appointments are made", score: 6, weight: 10 },
      { label: "Structural redesign — fundamentally rethink how the UN is organized", score: 9, weight: 10 },
      { label: "Less reform, more delivery — stop reorganizing and start executing", score: 2, weight: 10 },
    ],
  },
  {
    id: "q3", pillar: 2, dims: ["leadership"],
    question: "What leadership style should the SG bring?",
    options: [
      { label: "A skilled facilitator who builds consensus behind the scenes", score: 3, weight: 10 },
      { label: "A diplomatic bridge-builder who keeps all parties at the table", score: 5, weight: 10 },
      { label: "A visible global voice who sets the agenda and shapes norms", score: 8, weight: 10 },
      { label: "A bold institutional leader who drives change even when it's uncomfortable", score: 10, weight: 10 },
    ],
  },
  {
    id: "q4", pillar: 2, dims: ["crisis"],
    question: "How important is crisis leadership experience?",
    options: [
      { label: "Not essential — the SG role is more about long-term institution building", score: 3, weight: 6 },
      { label: "Helpful but not decisive — many skills matter", score: 5, weight: 8 },
      { label: "Very important — the next decade will be defined by crises", score: 8, weight: 10 },
      { label: "The single most important quality — we need someone battle-tested", score: 10, weight: 10 },
    ],
  },
  {
    id: "q5", pillar: 2, dims: ["engagement"],
    question: "Who should the SG primarily communicate with?",
    options: [
      { label: "Member State diplomats — that's where decisions are made", score: 2, weight: 10 },
      { label: "Heads of state and government leaders", score: 4, weight: 10 },
      { label: "A broad mix — governments, civil society, media, and the public", score: 7, weight: 10 },
      { label: "Everyone — including on social media and digital platforms, reaching 8 billion people", score: 9, weight: 10 },
    ],
  },
  {
    id: "q6", pillar: 3, dims: ["climate"],
    question: "On climate and development, the next SG should...",
    options: [
      { label: "Focus on delivering what's already been agreed — the SDGs and Paris Agreement", score: 3, weight: 10 },
      { label: "Push harder on implementation while exploring new financing models", score: 6, weight: 10 },
      { label: "Champion entirely new frameworks — current ones aren't working fast enough", score: 9, weight: 10 },
      { label: "This shouldn't be a top priority — security and peace come first", score: 1, weight: 4 },
    ],
  },
  {
    id: "q7", pillar: 3, dims: ["peace"],
    question: "On peace and security, the SG should...",
    options: [
      { label: "Respect Security Council authority — that's the architecture we have", score: 2, weight: 10 },
      { label: "Use good offices and quiet diplomacy to complement formal processes", score: 5, weight: 10 },
      { label: "Actively mediate and prevent conflicts, even without a Security Council mandate", score: 8, weight: 10 },
      { label: "Build entirely new conflict prevention tools — the current system is failing", score: 10, weight: 10 },
    ],
  },
  {
    id: "q8", pillar: 4, dims: ["accountability"],
    question: "Who should the UN be most accountable to?",
    options: [
      { label: "Member State governments — they fund and govern the system", score: 2, weight: 10 },
      { label: "Primarily governments, but with meaningful civil society input", score: 5, weight: 10 },
      { label: "Affected communities and people on the ground, not just capitals", score: 8, weight: 10 },
      { label: "All 8 billion people — the UN exists for humanity, not just states", score: 10, weight: 10 },
    ],
  },
  {
    id: "q9", pillar: 4, dims: ["gender", "humanrights"],
    question: "On gender equality and human rights, the SG should...",
    options: [
      { label: "Support existing frameworks and commitments without overreach", score: 3, weight: 10 },
      { label: "Strengthen implementation of current agreements and norms", score: 5, weight: 10 },
      { label: "Actively challenge violations and push for stronger accountability", score: 8, weight: 10 },
      { label: "Make this the defining normative commitment — parity, inclusion, and rights defense at all levels", score: 10, weight: 10 },
    ],
  },
];

/* ═══ MATCHING ALGORITHM ═══ */
function computeMatches(userProfile, candidates) {
  // userProfile: { targets: {dimId: score}, weights: {dimId: weight} }
  if (!userProfile || !userProfile.targets) return [];
  const maxPossibleDist = Math.sqrt(
    DIMENSIONS.reduce((sum, d) => sum + (userProfile.weights[d.id] || 5) * 100, 0)
  );
  return candidates.map(c => {
    let weightedSqSum = 0;
    const dimDetails = [];
    DIMENSIONS.forEach(d => {
      const target = userProfile.targets[d.id] ?? 5;
      const weight = userProfile.weights[d.id] ?? 5;
      const actual = c.scores[d.id] || 5;
      const gap = actual - target;
      weightedSqSum += weight * gap * gap;
      dimDetails.push({ dim: d, target, weight, actual, gap });
    });
    const dist = Math.sqrt(weightedSqSum);
    const matchPct = Math.max(0, Math.round((1 - dist / maxPossibleDist) * 100));
    return { candidate: c, matchPct, dist, dimDetails };
  }).sort((a, b) => b.matchPct - a.matchPct);
}

/* ═══ QUIZ TAB ═══ */
function QuizTab({ onComplete, existingProfile }) {
  const [step, setStep] = useState(existingProfile ? QUIZ_QUESTIONS.length : 0);
  const [answers, setAnswers] = useState(() => {
    if (existingProfile) return existingProfile._answers || {};
    return {};
  });

  const isComplete = step >= QUIZ_QUESTIONS.length;
  const progress = Math.min(step, QUIZ_QUESTIONS.length) / QUIZ_QUESTIONS.length;
  const currentQ = !isComplete ? QUIZ_QUESTIONS[step] : null;

  function selectOption(optIdx) {
    const q = QUIZ_QUESTIONS[step];
    const opt = q.options[optIdx];
    const newAnswers = { ...answers, [q.id]: { optIdx, score: opt.score, weight: opt.weight, dims: q.dims } };
    setAnswers(newAnswers);

    if (step + 1 >= QUIZ_QUESTIONS.length) {
      // Compute profile
      const targets = {};
      const weights = {};
      DIMENSIONS.forEach(d => { targets[d.id] = 5; weights[d.id] = 5; });
      Object.values(newAnswers).forEach(a => {
        a.dims.forEach(dimId => {
          targets[dimId] = a.score;
          weights[dimId] = a.weight;
        });
      });
      setStep(step + 1);
      onComplete({ targets, weights, _answers: newAnswers });
    } else {
      setStep(step + 1);
    }
  }

  function restart() {
    setAnswers({});
    setStep(0);
  }

  function goBack() {
    if (step > 0) setStep(step - 1);
  }

  // Results screen
  if (isComplete) {
    const targets = {};
    const weights = {};
    DIMENSIONS.forEach(d => { targets[d.id] = 5; weights[d.id] = 5; });
    Object.values(answers).forEach(a => {
      a.dims.forEach(dimId => { targets[dimId] = a.score; weights[dimId] = a.weight; });
    });

    // Determine archetype
    const overallAvg = Object.values(targets).reduce((a, b) => a + b, 0) / DIMENSIONS.length;
    let archetype = "Balanced Pragmatist";
    let archetypeDesc = "You want a Secretary-General who balances tradition with innovation.";
    if (overallAvg >= 8) { archetype = "Transformative Visionary"; archetypeDesc = "You want a bold leader who will fundamentally reshape the institution for a new era."; }
    else if (overallAvg >= 6.5) { archetype = "Reform Champion"; archetypeDesc = "You want a leader who actively drives modernization while respecting institutional foundations."; }
    else if (overallAvg >= 5) { archetype = "Adaptive Diplomat"; archetypeDesc = "You want a pragmatic leader who evolves the institution steadily without disruption."; }
    else if (overallAvg >= 3) { archetype = "Steady Steward"; archetypeDesc = "You prefer a leader who prioritizes stability, consensus, and proven approaches."; }
    else { archetype = "Traditionalist Guardian"; archetypeDesc = "You believe the UN works best when it stays close to its founding design."; }

    // Build a pseudo-candidate for the radar chart
    const userCandidate = { id: "user", name: "Your Priority Profile", color: "#1e293b", scores: targets };

    return (
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#12A67C", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            Your Result
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: "0 0 8px", lineHeight: 1.2 }}>
            {archetype}
          </h2>
          <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.5, maxWidth: 440, margin: "0 auto" }}>
            {archetypeDesc}
          </p>
        </div>

        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "20px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
            <RadarChart candidate={userCandidate} size={320} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {PILLARS.map(p => {
              const dims = DIMENSIONS.filter(d => d.pillar === p.id);
              const pAvg = dims.reduce((s, d) => s + (targets[d.id] || 5), 0) / dims.length;
              return (
                <div key={p.id} style={{ padding: "8px 12px", borderRadius: 6, background: `${p.color}10`, border: `1px solid ${p.color}25` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: p.color, textTransform: "uppercase" }}>{p.name}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{pAvg.toFixed(1)}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={restart} style={{ ...btnSt, background: "#fff", color: "#64748b", border: "1px solid #e2e8f0" }}>
            Retake Quiz
          </button>
          <button onClick={() => onComplete({ targets, weights, _answers: answers })} style={{ ...btnSt, background: "#1e293b", color: "#fff" }}>
            See My Matches →
          </button>
        </div>
      </div>
    );
  }

  // Question screen
  const pillar = PILLARS.find(p => p.id === currentQ.pillar);
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>
      {/* Progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{ flex: 1, height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress * 100}%`, background: "linear-gradient(to right, #2171D4, #12A67C)", borderRadius: 3, transition: "width 0.3s ease" }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", whiteSpace: "nowrap" }}>
          {step + 1} / {QUIZ_QUESTIONS.length}
        </span>
      </div>

      {/* Pillar tag */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "4px 12px", borderRadius: 20, background: `${pillar.color}12`,
        fontSize: 11, fontWeight: 700, color: pillar.color, marginBottom: 16,
      }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: pillar.color }} />
        {pillar.name}
      </div>

      {/* Question */}
      <h3 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a", lineHeight: 1.4, margin: "0 0 20px" }}>
        {currentQ.question}
      </h3>

      {/* Options */}
      <div style={{ display: "grid", gap: 10 }}>
        {currentQ.options.map((opt, i) => {
          const wasSelected = answers[currentQ.id]?.optIdx === i;
          return (
            <button
              key={i}
              onClick={() => selectOption(i)}
              style={{
                padding: "14px 18px", borderRadius: 10, textAlign: "left",
                border: wasSelected ? `2px solid ${pillar.color}` : "2px solid #e2e8f0",
                background: wasSelected ? `${pillar.color}08` : "#fff",
                cursor: "pointer", fontFamily: "inherit",
                fontSize: 14, fontWeight: 500, color: "#334155", lineHeight: 1.45,
                transition: "all 0.15s ease",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Back button */}
      {step > 0 && (
        <button onClick={goBack} style={{
          marginTop: 16, padding: "8px 16px", borderRadius: 6,
          border: "1px solid #e2e8f0", background: "#fff", color: "#94a3b8",
          fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
        }}>
          ← Back
        </button>
      )}
    </div>
  );
}

/* ═══ MATCHES TAB ═══ */
function MatchesTab({ userProfile, candidates, onViewCandidate }) {
  const matches = useMemo(() => computeMatches(userProfile, candidates), [userProfile, candidates]);
  const [expandedMatch, setExpandedMatch] = useState(null);

  if (!userProfile) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px", color: "#94a3b8" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>↑</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Take the quiz first</div>
        <div style={{ fontSize: 13, marginTop: 4 }}>Complete the quiz to see how candidates match your priorities.</div>
      </div>
    );
  }

  const userCandidate = { id: "user", name: "Your Priorities", color: "#94a3b8", scores: userProfile.targets };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 6px" }}>Your Candidate Matches</h2>
        <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Ranked by weighted alignment with your priority profile</p>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {matches.map((m, rank) => {
          const isExpanded = expandedMatch === m.candidate.id;
          const topStrengths = m.dimDetails.filter(d => d.weight >= 7 && Math.abs(d.gap) <= 2).slice(0, 3);
          const topGaps = m.dimDetails.filter(d => d.weight >= 7 && Math.abs(d.gap) > 2).sort((a, b) => Math.abs(b.gap) * b.weight - Math.abs(a.gap) * a.weight).slice(0, 3);

          return (
            <div key={m.candidate.id} style={{
              background: "#fff", borderRadius: 12,
              border: rank === 0 ? `2px solid ${m.candidate.color}40` : "1px solid #e2e8f0",
              overflow: "hidden",
            }}>
              {/* Match header */}
              <div
                onClick={() => setExpandedMatch(isExpanded ? null : m.candidate.id)}
                style={{
                  padding: "16px 20px", display: "flex", alignItems: "center", gap: 14,
                  cursor: "pointer", borderLeft: `4px solid ${m.candidate.color}`,
                }}
              >
                {/* Rank badge */}
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: rank === 0 ? "#12A67C" : rank < 3 ? "#e2e8f0" : "#f1f5f9",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 800, color: rank === 0 ? "#fff" : "#64748b",
                  flexShrink: 0,
                }}>
                  #{rank + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{m.candidate.name}</div>
                  {topStrengths.length > 0 && (
                    <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                      Strong on: {topStrengths.map(d => d.dim.short).join(", ")}
                    </div>
                  )}
                </div>
                {/* Match percentage */}
                <div style={{
                  fontSize: 22, fontWeight: 800,
                  color: m.matchPct >= 75 ? "#12A67C" : m.matchPct >= 50 ? "#E08B18" : "#C43990",
                }}>
                  {m.matchPct}%
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" style={{
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease", flexShrink: 0,
                }}>
                  <polyline points="4,6 8,10 12,6" fill="none" stroke="#94a3b8" strokeWidth="2" />
                </svg>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{ padding: "0 20px 20px", borderLeft: `4px solid ${m.candidate.color}` }}>
                  {/* Radar overlay: candidate vs your priorities */}
                  <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 8px" }}>
                    <RadarChart candidate={m.candidate} size={300} compares={[userCandidate]} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 16, height: 3, background: m.candidate.color, borderRadius: 2 }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: m.candidate.color }}>{m.candidate.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <svg width="16" height="4"><line x1="0" y1="2" x2="16" y2="2" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" /></svg>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8" }}>Your priorities</span>
                    </div>
                  </div>

                  {/* Dimension-by-dimension breakdown */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Alignment Breakdown</div>
                    {m.dimDetails.sort((a, b) => b.weight - a.weight).map(d => {
                      const absGap = Math.abs(d.gap);
                      const alignColor = absGap <= 1 ? "#12A67C" : absGap <= 3 ? "#E08B18" : "#C43990";
                      return (
                        <div key={d.dim.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, padding: "4px 0" }}>
                          <div style={{ width: 90, fontSize: 11, fontWeight: 600, color: PILLAR_COLORS[d.dim.pillar] }}>{d.dim.short}</div>
                          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 4 }}>
                            <div style={{ position: "relative", flex: 1, height: 8, background: "#f1f5f9", borderRadius: 4 }}>
                              {/* Your target marker */}
                              <div style={{
                                position: "absolute", left: `${d.target * 10}%`, top: -2, width: 2, height: 12,
                                background: "#94a3b8", borderRadius: 1, transform: "translateX(-50%)",
                              }} />
                              {/* Candidate score bar */}
                              <div style={{
                                position: "absolute", left: `${Math.min(d.actual, d.target) * 10}%`,
                                width: `${absGap * 10}%`, height: "100%",
                                background: `${alignColor}30`, borderRadius: 4,
                              }} />
                              {/* Candidate dot */}
                              <div style={{
                                position: "absolute", left: `${d.actual * 10}%`, top: 0, width: 8, height: 8,
                                borderRadius: "50%", background: alignColor, transform: "translateX(-50%)",
                              }} />
                            </div>
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: alignColor, width: 40, textAlign: "right" }}>
                            {absGap <= 1 ? "Match" : (d.gap > 0 ? "+" : "") + d.gap.toFixed(0)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {topGaps.length > 0 && (
                    <div style={{ padding: "10px 12px", background: "#FFF7ED", borderRadius: 6, fontSize: 12, color: "#92400e", lineHeight: 1.5, marginBottom: 10 }}>
                      <strong>Key gaps:</strong> {topGaps.map(d => `${d.dim.short} (you want ${d.target}, candidate scores ${d.actual})`).join("; ")}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══ MAIN APP ═══ */
const STORAGE_KEY = "unsg-leadership-profiles";

function saveToStorage(candidates) {
  try {
    const data = { candidates, savedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data.savedAt;
  } catch (e) { return null; }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
}

export default function UNSGLeadershipTool() {
  const [activeTab, setActiveTab] = useState(0); // 0=Quiz, 1=Matches, 2=Profiles
  const [userProfile, setUserProfile] = useState(null);
  const [candidates, setCandidates] = useState(() => {
    const saved = loadFromStorage();
    if (saved && saved.candidates && saved.candidates.length > 0) {
      return saved.candidates;
    }
    return SAMPLE_CANDIDATES;
  });
  const [selectedId, setSelectedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showMethod, setShowMethod] = useState(false);
  const [showDimRef, setShowDimRef] = useState(false);
  const [toast, setToast] = useState(null);
  const [savedAt, setSavedAt] = useState(() => {
    const saved = loadFromStorage();
    return saved ? saved.savedAt : null;
  });
  const fileRef = useRef(null);
  const cardRefs = useRef({});

  function handleAxisClick(c) {
    const newId = selectedId === c.id ? null : c.id;
    setSelectedId(newId);
    if (newId) {
      setExpandedId(newId);
      setTimeout(() => {
        const el = cardRefs.current[newId];
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 80);
    }
  }

  function ClientSideDateFooter() {
    const [date, setDate] = useState('');

    useEffect(() => {
      // This runs only on the client side
      setDate(new Date().toLocaleDateString());
    }, []);

    return (
      <footer>
        {date || "Loading date..."} {/* Placeholder content */}
      </footer>
    );
  }

  function handleCardToggle(id) {
    setExpandedId(prev => prev === id ? null : id);
    setSelectedId(prev => prev === id ? null : id);
  }

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const ts = saveToStorage(candidates);
    if (ts) setSavedAt(ts);
  }, [candidates]);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  function clearSavedData() {
    try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
    setCandidates(SAMPLE_CANDIDATES);
    setSavedAt(null);
    showToast("Saved data cleared — demo candidates restored");
  }

  function addCandidate() {
    setEditing({
      id: null, name: "",
      color: CANDIDATE_COLORS[candidates.length % CANDIDATE_COLORS.length],
      source: "vision",
      scores: DIMENSIONS.reduce((acc, d) => ({ ...acc, [d.id]: 5 }), {}),
      notes: "",
    });
  }

  function handleSave(draft) {
    if (draft.id) { setCandidates(cs => cs.map(c => c.id === draft.id ? draft : c)); }
    else { setCandidates(cs => [...cs, { ...draft, id: "c" + Date.now() }]); }
    setEditing(null);
    showToast(draft.id ? "Candidate updated" : "Candidate added");
  }

  function handleDelete(id) {
    setCandidates(cs => cs.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(null);
    showToast("Candidate removed");
  }

  function handleCSVUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const imported = parseCSVImport(ev.target.result);
      if (imported && imported.length > 0) {
        setCandidates(cs => [...cs, ...imported]);
        showToast(`Imported ${imported.length} candidate${imported.length > 1 ? "s" : ""}`);
      } else { showToast("Could not parse CSV. Check format and try again."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleQuizComplete(profile) {
    setUserProfile(profile);
    setActiveTab(1);
  }

  const TABS = [
    { id: 0, label: "What Kind of SG?", icon: "?" },
    { id: 1, label: "Your Matches", icon: "♟" },
    { id: 2, label: "Candidate Profiles", icon: "◈" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "'Söhne', 'Helvetica Neue', system-ui, -apple-system, sans-serif",
      color: "#0f172a",
    }}>
      {/* Top bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 2 }}>
                UNSG Selection 2026
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#0f172a", lineHeight: 1.2 }}>
                SG Leadership Navigator
              </h1>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setShowMethod(true)} style={topBtnSt}>Methodology</button>
              <button onClick={() => setShowDimRef(true)} style={topBtnSt}>Dimensions</button>
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 0 }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: "10px 20px",
                  fontSize: 13, fontWeight: 700,
                  color: activeTab === t.id ? "#0f172a" : "#94a3b8",
                  background: "none", border: "none",
                  borderBottom: activeTab === t.id ? "3px solid #1e293b" : "3px solid transparent",
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.15s ease",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                <span style={{ fontSize: 15 }}>{t.icon}</span>
                {t.label}
                {t.id === 1 && userProfile && (
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#12A67C", display: "inline-block" }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 0 && (
        <QuizTab onComplete={handleQuizComplete} existingProfile={userProfile} />
      )}

      {activeTab === 1 && (
        <MatchesTab
          userProfile={userProfile}
          candidates={candidates}
          onViewCandidate={(id) => { setActiveTab(2); setExpandedId(id); setSelectedId(id); }}
        />
      )}

      {activeTab === 2 && (
        <>
          {/* Profiles sub-header */}
          <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "10px 24px" }}>
            <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {PILLARS.map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: p.color }}>{p.name}</span>
                  </div>
                ))}
              </div>
              <button onClick={addCandidate} style={{ ...topBtnSt, background: "#1e293b", color: "#fff", border: "none", fontSize: 12, padding: "6px 14px" }}>
                + Add Candidate
              </button>
              <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" style={{ display: "none" }} onChange={handleCSVUpload} />
            </div>
          </div>

          <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 24px 12px" }}>
            {candidates.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 12, padding: "24px 12px 36px", marginBottom: 24, border: "1px solid #e2e8f0" }}>
                <AxisStrip candidates={candidates} onCandidateClick={handleAxisClick} selectedId={selectedId} />
              </div>
            )}

            {candidates.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 24px", background: "#fff", borderRadius: 12, border: "1px dashed #cbd5e1" }}>
                <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 12 }}>No candidates added yet</div>
                <button onClick={addCandidate} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#1e293b", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  Add First Candidate
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {candidates.map(c => (
                  <CandidateCard key={c.id} candidate={c} allCandidates={candidates}
                    onEdit={c => setEditing(c)} onDelete={handleDelete}
                    forceExpanded={expandedId === c.id} onToggle={handleCardToggle}
                    cardRef={el => { cardRefs.current[c.id] = el; }} />
                ))}
              </div>
            )}
          </div>

          {/* CSV tools footer */}
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 0", borderTop: "1px solid #e2e8f0", flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>Data:</span>
              <button onClick={downloadCSVTemplate} style={footerBtnSt}>↓ Download Template</button>
              <button onClick={() => fileRef.current && fileRef.current.click()} style={footerBtnSt}>↑ Import CSV</button>
              {candidates.length > 0 && <button onClick={() => exportCandidatesCSV(candidates)} style={footerBtnSt}>↓ Export Candidates</button>}
            </div>
          </div>
        </>
      )}

      {/* Global footer */}
      <div style={{ textAlign: "center", padding: "8px 0 16px", fontSize: 11, color: "#94a3b8" }}>
        {savedAt && (
          <div style={{ marginBottom: 4 }}>
            <span>Auto-saved {new Date(savedAt).toLocaleString()}</span>{" "}
            <button onClick={clearSavedData} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, border: "1px solid #e2e8f0", background: "#fff", color: "#94a3b8", cursor: "pointer", fontFamily: "inherit" }}>Clear</button>
          </div>
        )}
        Created by <span style={{ fontWeight: 700, color: "#64748b" }}>Policy Penguin Group</span>
        {" · "}
        Based on <a href="https://1for8billion.org/" target="_blank" rel="noopener noreferrer" style={{ color: "#2171D4", fontWeight: 600, textDecoration: "none" }}>1 for 8 Billion</a>
      </div>

      {/* Modals & Panels */}
      {editing && (
        <>
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,.2)", zIndex: 150 }} onClick={() => setEditing(null)} />
          <EditPanel candidate={editing} onSave={handleSave} onCancel={() => setEditing(null)} usedColors={candidates.map(c => c.color)} />
        </>
      )}
      {showMethod && <MethodModal onClose={() => setShowMethod(false)} />}
      {showDimRef && <DimInfoModal onClose={() => setShowDimRef(false)} />}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1e293b", color: "#fff", padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 400, boxShadow: "0 4px 16px rgba(0,0,0,.25)" }}>{toast}</div>
      )}
    </div>
  );
}

/* ═══ SHARED STYLES ═══ */
const btnSt = {
  padding: "10px 20px", borderRadius: 8, border: "none",
  fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
};
const topBtnSt = {
  padding: "8px 16px", borderRadius: 6, border: "1px solid #e2e8f0",
  background: "#fff", color: "#475569", fontSize: 13, fontWeight: 600,
  cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
};
const footerBtnSt = {
  padding: "6px 14px", borderRadius: 6, border: "1px solid #e2e8f0",
  background: "#fff", color: "#64748b", fontSize: 12, fontWeight: 600,
  cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
};
const labelSt = {
  display: "block", fontSize: 10, fontWeight: 700, color: "#475569",
  textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4, marginTop: 10,
};
const inputSt = {
  width: "100%", padding: "8px 10px", borderRadius: 6,
  border: "1px solid #e2e8f0", fontSize: 13, color: "#0f172a",
  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
  background: "#fff",
};
const pSt = { fontSize: 12, color: "#475569", lineHeight: 1.6, margin: "6px 0 10px" };
const hdSt = {
  fontSize: 13, fontWeight: 800, color: "#0f172a", margin: "16px 0 8px",
  textTransform: "uppercase", letterSpacing: 0.5, borderTop: "1px solid #e2e8f0", paddingTop: 12,
};
const blockSt = {
  padding: "10px 12px", background: "#f8fafc", borderRadius: 6,
  fontSize: 11.5, lineHeight: 1.55, color: "#475569", marginBottom: 8,
};
