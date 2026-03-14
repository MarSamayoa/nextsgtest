import { DIMENSIONS, PILLARS, PILLAR_COLORS } from "@/lib/sg/shared";

export default function RadarChart({
  candidate,
  size = 340,
  compares = [],
  exportMode = false,
  compactLabels = false,
}) {
  const padX = exportMode ? 110 : 92;
  const padY = exportMode ? 90 : 72;

  const svgW = size + padX * 2;
  const svgH = size + padY * 2;

  const cx = svgW / 2;
  const cy = svgH / 2;

  const maxR = size * 0.32;
  const labelR = compactLabels ? size * 0.42 : size * 0.46;
  const n = DIMENSIONS.length;

  function polarToCart(angle, r) {
    const a = angle - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  const angles = DIMENSIONS.map((_, i) => (2 * Math.PI * i) / n);

  function dataPolygon(scores, color) {
    const pts = DIMENSIONS.map((d, i) => {
      const v = scores[d.id] || 0;
      const r = (v / 10) * maxR;
      return polarToCart(angles[i], r);
    });
    return { pts, str: pts.map((p) => `${p.x},${p.y}`).join(" "), color };
  }

  const mainPoly = dataPolygon(candidate.scores, candidate.color);
  const comparePolys = compares.map((c) => dataPolygon(c.scores, c.color));
  const dashPatterns = ["4 3", "8 4", "2 4", "6 2 2 2", "10 4 2 4"];

  return (
    <svg
      width={svgW}
      height={svgH}
      viewBox={`0 0 ${svgW} ${svgH}`}
      style={{ display: "block", overflow: "visible" }}
    >
      {PILLARS.map((p) => {
        const dims = DIMENSIONS.filter((d) => d.pillar === p.id);
        const firstIdx = DIMENSIONS.indexOf(dims[0]);
        const lastIdx = DIMENSIONS.indexOf(dims[dims.length - 1]);
        const startAngle = angles[firstIdx] - Math.PI / n;
        const endAngle = angles[lastIdx] + Math.PI / n;
        const arcR = maxR + 7;
        const start = polarToCart(startAngle, arcR);
        const end = polarToCart(endAngle, arcR);
        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
        const d = `M ${start.x} ${start.y} A ${arcR} ${arcR} 0 ${largeArc} 1 ${end.x} ${end.y}`;

        return (
          <path
            key={p.id}
            d={d}
            fill="none"
            stroke={p.color}
            strokeWidth={5}
            strokeOpacity={0.42}
            strokeLinecap="round"
          />
        );
      })}

      {[2, 4, 6, 8, 10].map((v, i) => {
        const r = (v / 10) * maxR;
        const pts = angles
          .map((a) => polarToCart(a, r))
          .map((p) => `${p.x},${p.y}`)
          .join(" ");
        return (
          <polygon
            key={i}
            points={pts}
            fill="none"
            stroke="#dbe3ea"
            strokeWidth={i === 4 ? 1.1 : 0.7}
          />
        );
      })}

      {angles.map((a, i) => {
        const p = polarToCart(a, maxR);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="#dbe3ea"
            strokeWidth={0.7}
          />
        );
      })}

      {[2, 4, 6, 8, 10].map((v) => {
        const r = (v / 10) * maxR;
        return (
          <text
            key={v}
            x={cx + 5}
            y={cy - r + 4}
            fontSize={10}
            fill="#475569"
            fontFamily="monospace"
          >
            {v}
          </text>
        );
      })}

      {comparePolys.map((cp, i) => (
        <polygon
          key={i}
          points={cp.str}
          fill={cp.color}
          fillOpacity={0.05}
          stroke={cp.color}
          strokeWidth={1.8}
          strokeDasharray={dashPatterns[i % dashPatterns.length]}
        />
      ))}

      <polygon
        points={mainPoly.str}
        fill={candidate.color}
        fillOpacity={0.18}
        stroke={candidate.color}
        strokeWidth={2.7}
      />

      {mainPoly.pts.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={4.5}
          fill={candidate.color}
          stroke="#fff"
          strokeWidth={1.6}
        />
      ))}

      {DIMENSIONS.map((d, i) => {
        const p = polarToCart(angles[i], labelR);

        let anchor = "middle";
        if (p.x < cx - 10) anchor = "end";
        if (p.x > cx + 10) anchor = "start";

        let dx = 0;
        let dy = 0;

        if (p.y < cy - maxR * 0.72) dy = -4;
        if (p.y > cy + maxR * 0.72) dy = 4;
        if (p.x < cx - maxR * 0.72) dx = -4;
        if (p.x > cx + maxR * 0.72) dx = 4;

        return (
          <text
            key={d.id}
            x={p.x + dx}
            y={p.y + dy}
            textAnchor={anchor}
            dominantBaseline="central"
            fontSize={12}
            fontWeight={800}
            fill={PILLAR_COLORS[d.pillar]}
            fontFamily="system-ui, sans-serif"
          >
            {compactLabels
              ? ({
                  charter: "Charter",
                  reform: "Reform",
                  appointments: "Appts",
                  leadership: "Lead",
                  crisis: "Crisis",
                  engagement: "Engage",
                  emergingrisks: "Risks",
                  development: "Dev",
                  peace: "Peace",
                  accountability: "Account.",
                  gender: "Gender",
                  humanrights: "Rights",
                }[d.id] || d.short)
              : d.short}
          </text>
        );
      })}
    </svg>
  );
}