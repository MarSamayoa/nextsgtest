"use client";

import RadarChart from "./RadarChart";
import { PILLARS, pillarAvg, pillarLabel } from "@/lib/sg/shared";


const surfaceCardSt = {
  background: "#fff",
  borderRadius: 18,
  border: "1px solid #e2e8f0",
  padding: 20,
};

const eyebrowSt = {
  fontSize: 12,
  fontWeight: 900,
  color: "#E08B18",
  textTransform: "uppercase",
  letterSpacing: 1.1,
  marginBottom: 8,
};

const btnSt = {
  padding: "11px 22px",
  borderRadius: 10,
  border: "none",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
  fontFamily: "inherit",
};

  export default function ResultView({
  profile,
  archetype,
  archetypeDesc,
  resultsExportRef,
  saveError,
  savedResultId,
  onRestart,
  onCopyLink,
  onDownloadPNG,
  onSeeMatches,
  title = "Your Result",
  showActions = true,
  sharedMode = false,
}) {
  const userCandidate = {
    id: "user",
    name: "Your Priority Profile",
    color: "#1e293b",
    scores: profile.targets,
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>
      <div ref={resultsExportRef}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={eyebrowSt}>Your Result</div>
          <h2
            style={{
              fontSize: 30,
              fontWeight: 900,
              color: "#0f172a",
              margin: "0 0 8px",
            }}
          >
            {archetype}
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "#334155",
              maxWidth: 520,
              margin: "0 auto",
              lineHeight: 1.6,
            }}
          >
            {archetypeDesc}
          </p>
        </div>

        <div style={surfaceCardSt}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            <RadarChart candidate={userCandidate} size={330} exportMode />
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {PILLARS.map((p) => {
              const pAvg = pillarAvg(profile.targets, p.id);

              return (
                <div
                  key={p.id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: `${p.color}0a`,
                    border: `1px solid ${p.color}22`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: p.color,
                        textTransform: "uppercase",
                        letterSpacing: 0.4,
                      }}
                    >
                      {p.name}
                    </span>

                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: "#334155",
                      }}
                    >
                      {pillarLabel(pAvg)} ({pAvg.toFixed(1)})
                    </span>
                  </div>

                  <div
                    style={{
                      height: 8,
                      borderRadius: 999,
                      background: "#e2e8f0",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${pAvg * 10}%`,
                        height: "100%",
                        background: p.color,
                        borderRadius: 999,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {saveError ? (
        <div
          style={{
            marginTop: 12,
            marginBottom: 4,
            fontSize: 12,
            color: "#b45309",
            textAlign: "center",
          }}
        >
          {saveError}
        </div>
      ) : null}

  {showActions ? (
  <div
    style={{
      display: "flex",
      gap: 10,
      justifyContent: "center",
      flexWrap: "wrap",
      marginTop: 12,
    }}
  >
    {onRestart ? (
      <button
        onClick={onRestart}
        style={{
          ...btnSt,
          background: "#fff",
          color: "#334155",
          border: "1px solid #e2e8f0",
        }}
      >
        Retake Quiz
      </button>
    ) : null}

    {onDownloadPNG ? (
      <button
        onClick={onDownloadPNG}
        style={{
          ...btnSt,
          background: "#fff",
          color: "#334155",
          border: "1px solid #e2e8f0",
        }}
      >
        Download PNG
      </button>
    ) : null}

    {savedResultId && onCopyLink ? (
      <button
        onClick={onCopyLink}
        style={{
          ...btnSt,
          background: "#fff",
          color: "#334155",
          border: "1px solid #e2e8f0",
        }}
      >
        Copy Result Link
      </button>
    ) : null}

    {(onSeeMatches || sharedMode) ? (
      <button
        onClick={() => {
          if (sharedMode) {
            const el = document.getElementById("top-matches");
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
          }
          onSeeMatches?.();
        }}
        style={{ ...btnSt, background: "#1e293b", color: "#fff" }}
      >
        See My Matches →
      </button>
    ) : null}
  </div>
) : null}
</div>
  );
}