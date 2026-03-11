export const PILLARS = [
  { id: 1, name: "Institutional Ambition", color: "#2171D4" },
  { id: 2, name: "Executive Capacity", color: "#12A67C" },
  { id: 3, name: "Strategic Agenda", color: "#E08B18" },
  { id: 4, name: "Normative Leadership", color: "#C43990" },
];

export const PILLAR_COLORS = {
  1: "#2171D4",
  2: "#12A67C",
  3: "#E08B18",
  4: "#C43990",
};

export const PILLAR_DESCRIPTIONS = {
  1: "How the candidate interprets the UN’s institutional role, reform needs, and staffing independence.",
  2: "How the candidate would exercise the office — leadership style, crisis readiness, and engagement approach.",
  3: "What the candidate prioritizes substantively — from emerging risks to development and peace and security.",
  4: "How far the candidate goes on accountability, gender equality, and human rights leadership.",
};

export const TOOL_DESCRIPTION =
  "This tool provides diplomats and analysts with a structured way to evaluate declared UN Secretary-General candidates. It assesses how candidates interpret the role, how they would exercise its authority, and whether their experience and leadership style align with the challenges facing the United Nations today. The framework is informed by the 1 for 8 Billion coalition’s criteria for an effective Secretary-General.";

export const SOURCE_TYPES = [
  { id: "vision", label: "Vision Statement" },
  { id: "hearing", label: "Public Hearing" },
  { id: "speech", label: "Public Speech" },
];

export const CANDIDATE_COLORS = [
  "#0072B2",
  "#E69F00",
  "#009E73",
  "#CC79A7",
  "#56B4E9",
  "#D55E00",
  "#F0E442",
  "#000000",
  "#8C564B",
  "#377EB8",
];

export const STORAGE_KEY = "sg-leadership-navigator-v3";

/*
  Move your current INDICATORS block here unchanged.
*/
export const INDICATORS = [
  {
    id: "charter",
    pillar: 1,
    label: "Charter Interpretation",
    short: "Charter",
    low: "Fidelity to core functions; avoids expansive reinterpretation",
    mid: "Pragmatic adaptation — work within established practice, update when clearly needed",
    high: "Views the Charter as a living instrument; adaptive application to contemporary risks",
    quiz: {
      question: "How should the next Secretary-General apply the UN Charter in today’s world?",
      positions: [
        { score: 2, label: "Apply the Charter as originally intended", detail: "The Charter’s strength is its stability. The SG should focus on faithfully implementing its established principles." },
        { score: 4, label: "Apply the Charter through established UN practice", detail: "The Charter should guide action as interpreted through decades of UN institutional practice and precedent." },
        { score: 7, label: "Adapt the Charter’s principles to new challenges", detail: "The Charter’s principles remain valid but should be applied flexibly to emerging threats such as cyber risks, climate change, and new technologies." },
        { score: 9, label: "Treat the Charter as a living framework for global governance", detail: "The Charter should evolve in interpretation so the UN can address risks and opportunities the founders could not anticipate." },
      ],
    },
  },
  {
    id: "reform",
    pillar: 1,
    label: "Reform & Institutional Modernization",
    short: "Reform",
    low: "Procedural refinements and managerial efficiency",
    mid: "Targeted modernization — reform specific systems without wholesale redesign",
    high: "Systemic modernization, transparency reforms, rethinking institutional architecture",
    quiz: {
      question: "What kind of institutional reform should the UN prioritize?",
      positions: [
        { score: 2, label: "Focus on efficiency within the current system", detail: "Improve management, reduce duplication, and ensure the system delivers on existing mandates." },
        { score: 4, label: "Strengthen coordination across the UN system", detail: "Improve collaboration between agencies and modernize management and performance systems." },
        { score: 7, label: "Realign mandates and structures to match today’s priorities", detail: "Review mandates, budgets, and institutional arrangements to better reflect current global challenges." },
        { score: 9, label: "Rethink how the UN system is organized", detail: "Consider major structural reforms to ensure the UN can address cross-border systemic risks." },
      ],
    },
  },
  {
    id: "appointments",
    pillar: 1,
    label: "Independence in Senior Appointments",
    short: "Appointments",
    low: "Maintains established geographic distribution of posts",
    mid: "Balanced approach — geographic representation with increased transparency",
    high: "Merit-based appointments insulated from political pressure",
    quiz: {
      question: "How should senior UN officials be selected?",
      positions: [
        { score: 2, label: "Maintain geographic balance in appointments", detail: "Regional representation should remain the primary principle guiding senior leadership selection." },
        { score: 4, label: "Combine regional balance with greater transparency", detail: "Maintain geographic representation while making the selection process more open and accountable." },
        { score: 7, label: "Prioritize qualifications while maintaining fair representation", detail: "Merit and leadership track record should guide appointments, while preserving geographic diversity." },
        { score: 9, label: "Establish fully merit-based and independent selection processes", detail: "Introduce open competitions and independent evaluation to reduce political influence." },
      ],
    },
  },
  {
    id: "leadership",
    pillar: 2,
    label: "Leadership Philosophy",
    short: "Leadership",
    low: "Administrative coordinator and consensus facilitator",
    mid: "Strategic facilitator — builds consensus but sets clear direction",
    high: "Agenda-setting, norm-shaping, institutionally directive",
    quiz: {
      question: "What leadership approach should the Secretary-General bring to the role?",
      positions: [
        { score: 2, label: "Facilitate dialogue among Member States", detail: "The SG should primarily act as a neutral convenor helping governments reach consensus." },
        { score: 4, label: "Bridge competing interests and maintain cooperation", detail: "The SG should keep all parties engaged while guiding negotiations toward compromise." },
        { score: 7, label: "Set strategic direction for the UN system", detail: "The SG should help shape priorities and mobilize the system around shared goals." },
        { score: 9, label: "Use the office to drive global change", detail: "The SG should actively push the UN system toward bold institutional and policy transformation." },
      ],
    },
  },
  {
    id: "crisis",
    pillar: 2,
    label: "Crisis Leadership",
    short: "Crisis",
    low: "Limited crisis exposure; primarily bureaucratic profile",
    mid: "Capable manager — can handle pressure, though not defined by it",
    high: "Demonstrated high-stakes crisis management; innovation under pressure",
    quiz: {
      question: "How important is crisis leadership experience for the next Secretary-General?",
      positions: [
        { score: 2, label: "Useful but not essential", detail: "The role requires diplomatic and managerial skills beyond crisis response." },
        { score: 4, label: "One important qualification among many", detail: "Crisis leadership experience is valuable but should be balanced with institutional expertise." },
        { score: 7, label: "A critical qualification for the role", detail: "The SG must have experience managing complex crises and high-stakes negotiations." },
        { score: 9, label: "The defining test of leadership", detail: "The next SG should have proven ability to lead under pressure in global crises." },
      ],
    },
  },
  {
    id: "engagement",
    pillar: 2,
    label: "Stakeholder Engagement",
    short: "Engagement",
    low: "Focus on Member State diplomacy; limited public communication",
    mid: "Broad diplomat — engages beyond Member States when strategic",
    high: "Cross-cultural fluency; digital platforms; civil society engagement",
    quiz: {
      question: "Who should the Secretary-General primarily engage with?",
      positions: [
        { score: 2, label: "Focus primarily on Member States", detail: "Diplomacy between governments should remain the SG’s main responsibility." },
        { score: 4, label: "Engage governments and key institutions", detail: "Heads of state, regional organizations, and major international institutions should be central partners." },
        { score: 7, label: "Work with a wide range of global stakeholders", detail: "Governments, civil society, academia, and business should all be active partners." },
        { score: 9, label: "Speak directly to people around the world", detail: "The SG should actively communicate with global citizens through media and digital platforms." },
      ],
    },
  },
  {
    id: "emergingrisks",
    pillar: 3,
    label: "Emerging Global Risks",
    short: "Emerging Risks",
    low: "Addresses new threats within existing institutional frameworks",
    mid: "Framework-plus — deliver on existing commitments while building new governance tools",
    high: "Champions new governance models for AI, climate, pandemics, and tech disruption",
    quiz: {
      question: "How should the UN address emerging global risks like AI, pandemics, and climate tipping points?",
      positions: [
        { score: 2, label: "Address them through existing global frameworks", detail: "Current institutions and treaties can adapt to emerging risks." },
        { score: 4, label: "Add targeted mechanisms where needed", detail: "Create expert groups and voluntary guidelines to manage new challenges." },
        { score: 7, label: "Develop new governance frameworks for emerging risks", detail: "Establish dedicated structures for issues like AI governance or planetary risks." },
        { score: 9, label: "Build new global governance systems for systemic risks", detail: "Create new global agreements or institutions to manage emerging threats." },
      ],
    },
  },
  {
    id: "development",
    pillar: 3,
    label: "Development Strategy",
    short: "Development",
    low: "Prioritizes delivery of existing development frameworks",
    mid: "Strengthens coordination and explores new financing tools",
    high: "Advocates financing innovation and structural shifts in development cooperation",
    quiz: {
      question: "When advancing global development, what should the Secretary-General prioritize most?",
      positions: [
        { score: 2, label: "Deliver existing development commitments", detail: "Focus on implementing the SDGs and existing global agreements. The frameworks already exist; the priority is improving delivery and accountability." },
        { score: 4, label: "Strengthen coordination across the UN development system", detail: "Improve alignment among UN agencies, development banks, and partners to make development efforts more coherent and effective." },
        { score: 7, label: "Mobilize new financing tools for development and climate", detail: "Expand instruments such as climate funds, debt swaps, blended finance, and partnerships to unlock new investment in development." },
        { score: 9, label: "Reform global economic rules and financial institutions", detail: "Advocate structural reform of global debt systems, trade rules, and development finance institutions to address systemic inequality." },
      ],
    },
  },
  {
    id: "peace",
    pillar: 3,
    label: "Peace & Security",
    short: "Peace",
    low: "Defers to formal Security Council processes",
    mid: "Active diplomacy — use good offices alongside formal Council processes",
    high: "Good offices, prevention, mediation, systemic conflict mitigation",
    quiz: {
      question: "On peace and security, the Secretary-General should primarily…",
      positions: [
        { score: 2, label: "Support Security Council leadership", detail: "The SG should reinforce the Council’s authority and processes." },
        { score: 4, label: "Use quiet diplomacy to support negotiations", detail: "Good offices and back-channel diplomacy should complement formal processes." },
        { score: 7, label: "Lead stronger conflict prevention and mediation efforts", detail: "Invest in early warning, mediation capacity, and preventive diplomacy." },
        { score: 9, label: "Build new global conflict-prevention capabilities", detail: "Develop innovative tools and partnerships to anticipate and manage crises." },
      ],
    },
  },
  {
    id: "accountability",
    pillar: 4,
    label: "Accountability to the Global Public",
    short: "Accountability",
    low: "Accountability primarily toward governments",
    mid: "Inclusive governance — primarily states, with structured civil society input",
    high: "Centers affected communities, civil society, social movements",
    quiz: {
      question: "Who should the United Nations ultimately be accountable to?",
      positions: [
        { score: 2, label: "Member States", detail: "Governments are the UN’s governing authority." },
        { score: 4, label: "Governments with civil society input", detail: "States remain central but should consult broader actors." },
        { score: 7, label: "People affected by UN action", detail: "Communities impacted by UN policies should have a stronger voice." },
        { score: 9, label: "People everywhere", detail: "The UN should strengthen accountability directly to global citizens." },
      ],
    },
  },
  {
    id: "gender",
    pillar: 4,
    label: "Gender Equality & Inclusion",
    short: "Gender",
    low: "Gender equality within existing frameworks",
    mid: "Strengthened implementation — push harder on existing commitments and norms",
    high: "Parity in leadership, institutional gender reform, explicit rights defense",
    quiz: {
      question: "What role should gender equality play in the UN’s leadership agenda?",
      positions: [
        { score: 2, label: "Continue implementing existing commitments", detail: "Current gender equality frameworks provide the right foundation." },
        { score: 4, label: "Strengthen monitoring and enforcement of commitments", detail: "Increase accountability for existing gender equality goals." },
        { score: 7, label: "Embed gender equality in institutional leadership", detail: "Ensure gender parity and integrate gender analysis into policy decisions." },
        { score: 9, label: "Make gender equality a defining leadership priority", detail: "Use the SG’s office to actively defend and advance gender rights globally." },
      ],
    },
  },
  {
    id: "humanrights",
    pillar: 4,
    label: "Human Rights & Rule of Law",
    short: "Human Rights",
    low: "Reiterates commitment without strong enforcement",
    mid: "Principled engagement — raise concerns consistently without confrontation",
    high: "Challenges violations, supports accountability mechanisms, elevates rights",
    quiz: {
      question: "How should the Secretary-General approach human rights diplomacy?",
      positions: [
        { score: 2, label: "Reaffirm universal human rights principles", detail: "Maintain commitment to global norms while preserving diplomatic balance." },
        { score: 4, label: "Raise concerns consistently through diplomacy", detail: "Address violations through reporting and quiet engagement." },
        { score: 7, label: "Speak out against violations and strengthen accountability", detail: "Use the SG’s voice to defend human rights and support enforcement mechanisms." },
        { score: 9, label: "Make human rights central to all UN action", detail: "Ensure human rights guide decisions across peace, development, and governance." },
      ],
    },
  },
];

export const DIMENSIONS = INDICATORS.map((i) => ({
  id: i.id,
  label: i.label,
  short: i.short,
  pillar: i.pillar,
  low: i.low,
  mid: i.mid,
  high: i.high,
}));

export const QUIZ_QUESTIONS = INDICATORS.map((i) => ({
  id: `q_${i.id}`,
  pillar: i.pillar,
  dim: i.id,
  question: i.quiz.question,
  positions: i.quiz.positions,
}));

export function matchStrengthLabel(pct) {
  if (pct >= 80) return "Very strong match";
  if (pct >= 65) return "Strong match";
  if (pct >= 50) return "Moderate match";
  return "Partial match";
}

export function avg(scores) {
  const vals = Object.values(scores || {}).filter(
    (v) => v != null && !Number.isNaN(v)
  );
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 5;
}

export function pillarAvg(scores, pillarId) {
  const dims = DIMENSIONS.filter((d) => d.pillar === pillarId);
  const vals = dims.map((d) => scores?.[d.id] ?? 5);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export function pillarLabel(v) {
  if (v <= 3) return "Traditional";
  if (v <= 5) return "Moderate";
  if (v <= 7) return "Reform-oriented";
  return "Transformative";
}

export function axisColor(score) {
  const t = Math.max(0, Math.min(1, score / 10));
  const r = Math.round(33 + t * (224 - 33));
  const g = Math.round(113 + t * (139 - 113));
  const b = Math.round(212 + t * (24 - 212));
  return `rgb(${r},${g},${b})`;
}

export function topTakeawayFromCandidate(candidate) {
  const sorted = [...PILLARS]
    .map((p) => ({ ...p, avg: pillarAvg(candidate.scores, p.id) }))
    .sort((a, b) => b.avg - a.avg);

  const top = sorted.slice(0, 2).map((p) => p.name);
  return `Strongest on ${top.join(" and ")}.`;
}

export function topTakeawayFromMatch(match) {
  const strongest = match.dimDetails
    .filter((d) => Math.abs(d.gap) <= 1)
    .slice(0, 3)
    .map((d) => d.dim.short);

  if (!strongest.length) {
    return "This candidate is a mixed fit with fewer strong point-for-point alignments.";
  }

  return `Best fit if you prioritize ${strongest.join(", ")}.`;
}

export function getArchetypeFromTargets(targets) {
  const overallAvg = avg(targets);

  let archetype = "Balanced Pragmatist";
  let archetypeDesc =
    "You want a Secretary-General who balances tradition with innovation.";

  if (overallAvg >= 8) {
    archetype = "Transformative Visionary";
    archetypeDesc =
      "You want a bold leader who would fundamentally reshape the institution for a new era.";
  } else if (overallAvg >= 6.5) {
    archetype = "Reform Champion";
    archetypeDesc =
      "You want a leader who actively drives modernization while respecting institutional foundations.";
  } else if (overallAvg >= 5) {
    archetype = "Adaptive Diplomat";
    archetypeDesc =
      "You want a pragmatic leader who evolves the institution steadily without disruption.";
  } else if (overallAvg >= 3) {
    archetype = "Steady Steward";
    archetypeDesc =
      "You prefer a leader who prioritizes stability, consensus, and proven approaches.";
  } else {
    archetype = "Traditionalist Guardian";
    archetypeDesc =
      "You believe the UN works best when it stays close to its founding design.";
  }

  return { archetype, archetypeDesc };
}

export function archetypeFromScores(scores) {
  const overall = avg(scores);
  if (overall >= 8) {
    return { label: "Transformative", color: "#E08B18", bg: "#FFF7ED", border: "#FED7AA" };
  }
  if (overall >= 6) {
    return { label: "Reform-oriented", color: "#12A67C", bg: "#ECFDF5", border: "#A7F3D0" };
  }
  if (overall >= 4) {
    return { label: "Moderate", color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0" };
  }
  return { label: "Traditional", color: "#2171D4", bg: "#EFF6FF", border: "#BFDBFE" };
}

export function computeMatches(userProfile, candidates) {
  if (!userProfile?.targets) return [];
  const maxPossibleDist = Math.sqrt(
    DIMENSIONS.reduce((sum, d) => sum + (userProfile.weights?.[d.id] || 10) * 100, 0)
  );

  return candidates
    .map((c) => {
      let weightedSqSum = 0;
      const dimDetails = [];

      DIMENSIONS.forEach((d) => {
        const target = userProfile.targets[d.id] ?? 5;
        const weight = userProfile.weights?.[d.id] ?? 10;
        const actual = c.scores?.[d.id] ?? 5;
        const gap = actual - target;
        weightedSqSum += weight * gap * gap;
        dimDetails.push({ dim: d, target, weight, actual, gap });
      });

      const dist = Math.sqrt(weightedSqSum);
      const matchPct =
        Math.round(Math.max(0, (1 - dist / maxPossibleDist) * 100) * 10) / 10;

      return { candidate: c, matchPct, dist, dimDetails };
    })
    .sort((a, b) => a.dist - b.dist);
}

export function narrativeGap(dimDetail) {
  const { dim, target, actual, gap } = dimDetail;
  if (Math.abs(gap) <= 1) return null;

  const userWants = target <= 3 ? dim.low : target <= 6 ? dim.mid : dim.high;
  const candidateIs = actual <= 3 ? dim.low : actual <= 6 ? dim.mid : dim.high;

  if (gap > 0) {
    return `You prefer a more traditional approach on ${dim.short.toLowerCase()} (“${userWants}”), but this candidate leans more transformative (“${candidateIs}”).`;
  }

  return `You want a more transformative approach on ${dim.short.toLowerCase()} (“${userWants}”), but this candidate is more traditional (“${candidateIs}”).`;
}