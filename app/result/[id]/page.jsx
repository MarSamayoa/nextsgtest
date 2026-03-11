import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import ResultView from "@/app/components/ResultView";
import {
  computeMatches,
  getArchetypeFromTargets,
  matchStrengthLabel,
  topTakeawayFromMatch,
} from "@/lib/sg/shared";
import { SAMPLE_CANDIDATES } from "@/lib/sg/candidates";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default async function ResultPage({ params }) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("quiz_results")
    .select("*")
    .eq("id", id)
    .single();

 if (error || !data) {
  return (
    <div style={{ padding: 40, fontFamily: "system-ui, sans-serif" }}>
      <div>Result not found.</div>
      <pre>{JSON.stringify({ id, error }, null, 2)}</pre>
    </div>
  );
}

  const profile = {
    targets: data.targets,
    weights: data.weights,
    _selections: data.selections,
  };

  const { archetype, archetypeDesc } = getArchetypeFromTargets(profile.targets);
  const matches = computeMatches(profile, SAMPLE_CANDIDATES).slice(0, 3);

  return (
  <div
    style={{
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily:
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: "#0f172a",
      padding: "24px 0 48px",
    }}
  >
    <ResultView
  profile={profile}
  archetype={archetype}
  archetypeDesc={archetypeDesc}
  title="Saved Result"
  showActions={true}
  sharedMode={true}
/>

    <div
      id="top-matches"
      style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 18,
          border: "1px solid #e2e8f0",
          padding: 20,
          marginTop: 8,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 900,
            color: "#1e293b",
            textTransform: "uppercase",
            letterSpacing: 0.9,
            marginBottom: 14,
          }}
        >
          Top Candidate Matches
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {matches.map((m, idx) => (
            <div
              key={m.candidate.id}
              style={{
                padding: "14px 16px",
                borderRadius: 14,
                border: "1px solid #e2e8f0",
                background: idx === 0 ? "#f8fafc" : "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <div
                  style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}
                >
                  {idx + 1}. {m.candidate.name}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    color:
                      m.matchPct >= 75
                        ? "#12A67C"
                        : m.matchPct >= 50
                        ? "#E08B18"
                        : "#C43990",
                  }}
                >
                  {m.matchPct.toFixed(1)}%
                </div>
              </div>

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "#475569",
                  marginBottom: 6,
                }}
              >
                {matchStrengthLabel(m.matchPct)}
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: "#334155",
                  lineHeight: 1.6,
                }}
              >
                {topTakeawayFromMatch(m)}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <Link
            href="/"
            style={{
              color: "#2171D4",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            ← Take the quiz yourself
          </Link>
        </div>
      </div>
    </div>
  </div>
)};