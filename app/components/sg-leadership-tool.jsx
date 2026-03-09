"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/* =========================================================
   SG Leadership Navigator
   Full single-file rebuild
   ========================================================= */

const PILLARS = [
  { id: 1, name: "Institutional Ambition", color: "#2171D4" },
  { id: 2, name: "Executive Capacity", color: "#12A67C" },
  { id: 3, name: "Strategic Agenda", color: "#E08B18" },
  { id: 4, name: "Normative Leadership", color: "#C43990" },
];

const PILLAR_COLORS = {
  1: "#2171D4",
  2: "#12A67C",
  3: "#E08B18",
  4: "#C43990",
};

const PILLAR_DESCRIPTIONS = {
  1: "How the candidate interprets the UN’s institutional role, reform needs, and staffing independence.",
  2: "How the candidate would exercise the office — leadership style, crisis readiness, and engagement approach.",
  3: "What the candidate prioritizes substantively — from emerging risks to development and peace and security.",
  4: "How far the candidate goes on accountability, gender equality, and human rights leadership.",
};

const TOOL_DESCRIPTION =
  "This tool provides diplomats and analysts with a structured way to evaluate declared UN Secretary-General candidates. It assesses how candidates interpret the role, how they would exercise its authority, and whether their experience and leadership style align with the challenges facing the United Nations today. The framework is informed by the 1 for 8 Billion coalition’s criteria for an effective Secretary-General.";

const SOURCE_TYPES = [
  { id: "vision", label: "Vision Statement" },
  { id: "hearing", label: "Public Hearing" },
  { id: "speech", label: "Public Speech" },
];

const CANDIDATE_COLORS = [
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

const INDICATORS = [
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
        {
          score: 2,
          label: "Apply the Charter as originally intended",
          detail:
            "The Charter’s strength is its stability. The SG should focus on faithfully implementing its established principles.",
        },
        {
          score: 4,
          label: "Apply the Charter through established UN practice",
          detail:
            "The Charter should guide action as interpreted through decades of UN institutional practice and precedent.",
        },
        {
          score: 7,
          label: "Adapt the Charter’s principles to new challenges",
          detail:
            "The Charter’s principles remain valid but should be applied flexibly to emerging threats such as cyber risks, climate change, and new technologies.",
        },
        {
          score: 9,
          label: "Treat the Charter as a living framework for global governance",
          detail:
            "The Charter should evolve in interpretation so the UN can address risks and opportunities the founders could not anticipate.",
        },
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
        {
          score: 2,
          label: "Focus on efficiency within the current system",
          detail:
            "Improve management, reduce duplication, and ensure the system delivers on existing mandates.",
        },
        {
          score: 4,
          label: "Strengthen coordination across the UN system",
          detail:
            "Improve collaboration between agencies and modernize management and performance systems.",
        },
        {
          score: 7,
          label: "Realign mandates and structures to match today’s priorities",
          detail:
            "Review mandates, budgets, and institutional arrangements to better reflect current global challenges.",
        },
        {
          score: 9,
          label: "Rethink how the UN system is organized",
          detail:
            "Consider major structural reforms to ensure the UN can address cross-border systemic risks.",
        },
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
        {
          score: 2,
          label: "Maintain geographic balance in appointments",
          detail:
            "Regional representation should remain the primary principle guiding senior leadership selection.",
        },
        {
          score: 4,
          label: "Combine regional balance with greater transparency",
          detail:
            "Maintain geographic representation while making the selection process more open and accountable.",
        },
        {
          score: 7,
          label: "Prioritize qualifications while maintaining fair representation",
          detail:
            "Merit and leadership track record should guide appointments, while preserving geographic diversity.",
        },
        {
          score: 9,
          label: "Establish fully merit-based and independent selection processes",
          detail:
            "Introduce open competitions and independent evaluation to reduce political influence.",
        },
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
        {
          score: 2,
          label: "Facilitate dialogue among Member States",
          detail:
            "The SG should primarily act as a neutral convenor helping governments reach consensus.",
        },
        {
          score: 4,
          label: "Bridge competing interests and maintain cooperation",
          detail:
            "The SG should keep all parties engaged while guiding negotiations toward compromise.",
        },
        {
          score: 7,
          label: "Set strategic direction for the UN system",
          detail:
            "The SG should help shape priorities and mobilize the system around shared goals.",
        },
        {
          score: 9,
          label: "Use the office to drive global change",
          detail:
            "The SG should actively push the UN system toward bold institutional and policy transformation.",
        },
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
        {
          score: 2,
          label: "Useful but not essential",
          detail:
            "The role requires diplomatic and managerial skills beyond crisis response.",
        },
        {
          score: 4,
          label: "One important qualification among many",
          detail:
            "Crisis leadership experience is valuable but should be balanced with institutional expertise.",
        },
        {
          score: 7,
          label: "A critical qualification for the role",
          detail:
            "The SG must have experience managing complex crises and high-stakes negotiations.",
        },
        {
          score: 9,
          label: "The defining test of leadership",
          detail:
            "The next SG should have proven ability to lead under pressure in global crises.",
        },
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
        {
          score: 2,
          label: "Focus primarily on Member States",
          detail:
            "Diplomacy between governments should remain the SG’s main responsibility.",
        },
        {
          score: 4,
          label: "Engage governments and key institutions",
          detail:
            "Heads of state, regional organizations, and major international institutions should be central partners.",
        },
        {
          score: 7,
          label: "Work with a wide range of global stakeholders",
          detail:
            "Governments, civil society, academia, and business should all be active partners.",
        },
        {
          score: 9,
          label: "Speak directly to people around the world",
          detail:
            "The SG should actively communicate with global citizens through media and digital platforms.",
        },
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
      question:
        "How should the UN address emerging global risks like AI, pandemics, and climate tipping points?",
      positions: [
        {
          score: 2,
          label: "Address them through existing global frameworks",
          detail: "Current institutions and treaties can adapt to emerging risks.",
        },
        {
          score: 4,
          label: "Add targeted mechanisms where needed",
          detail:
            "Create expert groups and voluntary guidelines to manage new challenges.",
        },
        {
          score: 7,
          label: "Develop new governance frameworks for emerging risks",
          detail:
            "Establish dedicated structures for issues like AI governance or planetary risks.",
        },
        {
          score: 9,
          label: "Build new global governance systems for systemic risks",
          detail:
            "Create new global agreements or institutions to manage emerging threats.",
        },
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
      question:
        "When advancing global development, what should the Secretary-General prioritize most?",
      positions: [
        {
          score: 2,
          label: "Deliver existing development commitments",
          detail:
            "Focus on implementing the SDGs and existing global agreements. The frameworks already exist; the priority is improving delivery and accountability.",
        },
        {
          score: 4,
          label: "Strengthen coordination across the UN development system",
          detail:
            "Improve alignment among UN agencies, development banks, and partners to make development efforts more coherent and effective.",
        },
        {
          score: 7,
          label: "Mobilize new financing tools for development and climate",
          detail:
            "Expand instruments such as climate funds, debt swaps, blended finance, and partnerships to unlock new investment in development.",
        },
        {
          score: 9,
          label: "Reform global economic rules and financial institutions",
          detail:
            "Advocate structural reform of global debt systems, trade rules, and development finance institutions to address systemic inequality.",
        },
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
        {
          score: 2,
          label: "Support Security Council leadership",
          detail: "The SG should reinforce the Council’s authority and processes.",
        },
        {
          score: 4,
          label: "Use quiet diplomacy to support negotiations",
          detail:
            "Good offices and back-channel diplomacy should complement formal processes.",
        },
        {
          score: 7,
          label: "Lead stronger conflict prevention and mediation efforts",
          detail:
            "Invest in early warning, mediation capacity, and preventive diplomacy.",
        },
        {
          score: 9,
          label: "Build new global conflict-prevention capabilities",
          detail:
            "Develop innovative tools and partnerships to anticipate and manage crises.",
        },
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
        {
          score: 2,
          label: "Member States",
          detail: "Governments are the UN’s governing authority.",
        },
        {
          score: 4,
          label: "Governments with civil society input",
          detail: "States remain central but should consult broader actors.",
        },
        {
          score: 7,
          label: "People affected by UN action",
          detail:
            "Communities impacted by UN policies should have a stronger voice.",
        },
        {
          score: 9,
          label: "People everywhere",
          detail:
            "The UN should strengthen accountability directly to global citizens.",
        },
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
      question:
        "What role should gender equality play in the UN’s leadership agenda?",
      positions: [
        {
          score: 2,
          label: "Continue implementing existing commitments",
          detail:
            "Current gender equality frameworks provide the right foundation.",
        },
        {
          score: 4,
          label: "Strengthen monitoring and enforcement of commitments",
          detail: "Increase accountability for existing gender equality goals.",
        },
        {
          score: 7,
          label: "Embed gender equality in institutional leadership",
          detail:
            "Ensure gender parity and integrate gender analysis into policy decisions.",
        },
        {
          score: 9,
          label: "Make gender equality a defining leadership priority",
          detail:
            "Use the SG’s office to actively defend and advance gender rights globally.",
        },
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
      question:
        "How should the Secretary-General approach human rights diplomacy?",
      positions: [
        {
          score: 2,
          label: "Reaffirm universal human rights principles",
          detail:
            "Maintain commitment to global norms while preserving diplomatic balance.",
        },
        {
          score: 4,
          label: "Raise concerns consistently through diplomacy",
          detail: "Address violations through reporting and quiet engagement.",
        },
        {
          score: 7,
          label: "Speak out against violations and strengthen accountability",
          detail:
            "Use the SG’s voice to defend human rights and support enforcement mechanisms.",
        },
        {
          score: 9,
          label: "Make human rights central to all UN action",
          detail:
            "Ensure human rights guide decisions across peace, development, and governance.",
        },
      ],
    },
  },
];

const DIMENSIONS = INDICATORS.map((i) => ({
  id: i.id,
  label: i.label,
  short: i.short,
  pillar: i.pillar,
  low: i.low,
  mid: i.mid,
  high: i.high,
}));

const QUIZ_QUESTIONS = INDICATORS.map((i) => ({
  id: `q_${i.id}`,
  pillar: i.pillar,
  dim: i.id,
  question: i.quiz.question,
  positions: i.quiz.positions,
}));

const SAMPLE_CANDIDATES = [
  {
    id: "c_bachelet",
    name: "Michelle Bachelet",
    color: "#0072B2",
    source: "vision",
    visionUrl:
      "https://www.un.org/sg/sites/default/files/document/2026-02/bachelet-vision-en.pdf",
    scores: {
      charter: 6,
      reform: 7,
      appointments: 7,
      leadership: 7,
      crisis: 8,
      engagement: 7,
      emergingrisks: 7,
      development: 7,
      peace: 7,
      accountability: 7,
      gender: 7,
      humanrights: 7,
    },
    evidence: {
      charter: {
        quote:
          "The Preamble of the 1945 Charter remains a living guide to preserve peace, defend human dignity, uphold international law, and promote social progress.",
        page: "p.6",
        context:
          "Bachelet discusses the Charter in a section reflecting on the UN’s foundational principles.",
        explanation:
          "Calling the Charter a 'living guide' supports a moderately transformative score.",
      },
      reform: {
        quote:
          "The United Nations faces the challenge of reviewing and modernizing its internal structures to make them more effective, efficient, and coherent.",
        page: "p.3",
        context: "Appears in 'Looking Inward: Institutional Reform with Purpose.'",
        explanation:
          "Supports a reformist score focused on modernization and streamlining.",
      },
      appointments: {
        quote:
          "The Secretary-General bears a particular responsibility to ensure that the appointment of senior officials reflects the highest standards of competence, integrity, and efficiency.",
        page: "p.5",
        context: "Bachelet links appointments to institutional credibility.",
        explanation: "Supports a merit-oriented appointments score.",
      },
      leadership: {
        quote:
          "Leadership capable of combining continuity and adaptation, principles and action.",
        page: "p.2",
        context: "Her framing of the leadership the UN now requires.",
        explanation: "Signals strategic leadership without maximal disruption.",
      },
      crisis: {
        quote:
          "My career as Minister of Health and Defense and as Head of State required me to lead complex decision-making processes in critical contexts.",
        page: "p.1",
        context: "Bachelet references her leadership experience in Chile.",
        explanation: "Direct evidence of high-level crisis leadership.",
      },
      engagement: {
        quote:
          "The UN’s legitimacy is inseparably linked to its ability to be perceived as useful and close to people.",
        page: "p.4",
        context: "Appears in 'Looking Outward: Reconnecting with People.'",
        explanation: "Supports a strong public-facing engagement orientation.",
      },
      emergingrisks: {
        quote:
          "The rapid advance of technology, cyberattacks, and climate crises have outpaced States’ capacities.",
        page: "p.7",
        context: "Bachelet identifies emerging risks as central.",
        explanation:
          "She names new risks clearly, though with less system-redesign detail.",
      },
      development: {
        quote:
          "We must advance a true reform of the international financial architecture, facilitating debt relief and accelerating a just energy transition.",
        page: "p.9",
        context: "Development challenges and climate justice section.",
        explanation:
          "Places her toward the ambitious end of development strategy.",
      },
      peace: {
        quote: "Prevention must lie at the heart of the UN’s action.",
        page: "p.8",
        context: "Bachelet centers prevention and mediation.",
        explanation: "Supports a proactive peace and security posture.",
      },
      accountability: {
        quote:
          "The United Nations must demonstrate tangible results and maintain the trust of the peoples it serves.",
        page: "p.4",
        context: "She links legitimacy to visible impact and public trust.",
        explanation: "Supports a broader accountability conception.",
      },
      gender: {
        quote:
          "Empowering women and girls and ensuring their full participation in peace processes and decision-making is essential.",
        page: "p.11",
        context: "Bachelet ties gender equality to peacebuilding.",
        explanation: "Supports a strong gender equality score.",
      },
      humanrights: {
        quote:
          "The respect for and promotion of human rights must remain at the core of all UN action.",
        page: "p.13",
        context: "Opening line of her human rights section.",
        explanation: "Supports a consistently rights-forward profile.",
      },
    },
    notes:
      "Reform Champion profile. Calls the Charter 'a living guide' and stresses prevention, mediation, merit-based appointments, and reconnecting with people.",
  },
  {
    id: "c_grossi",
    name: "Rafael Grossi",
    color: "#E69F00",
    source: "vision",
    visionUrl:
      "https://www.un.org/sg/sites/default/files/document/2025-12/grossi-vision-en.pdf",
    scores: {
      charter: 4,
      reform: 7,
      appointments: 7,
      leadership: 6,
      crisis: 8,
      engagement: 5,
      emergingrisks: 6,
      development: 5,
      peace: 7,
      accountability: 5,
      gender: 5,
      humanrights: 6,
    },
    evidence: {
      charter: {
        quote:
          "The United Nations must protect its founding values while responding to the world as it is.",
        page: "p.1",
        context:
          "Grossi discusses continuity with pragmatic operational adaptation.",
        explanation:
          "Signals continuity with adaptation, not expansive reinterpretation.",
      },
      reform: {
        quote:
          "Over the years, the Organization has accumulated overlapping mandates and fragmented functions.",
        page: "p.4",
        context: "Section on modern management and renewal.",
        explanation: "Supports a clearly reformist score.",
      },
      appointments: {
        quote:
          "Institutions perform best when they draw on society’s full talent pool.",
        page: "p.4",
        context: "Institutional performance and staffing quality.",
        explanation: "Supports a merit-oriented appointments score.",
      },
      leadership: {
        quote:
          "Real leadership does not retreat from complexity but rises to its challenges.",
        page: "p.2",
        context: "Grossi’s description of leadership.",
        explanation: "Indicates strategic resolve in a pragmatic frame.",
      },
      crisis: {
        quote:
          "For the past six years I have been leading a global organization that operates at the intersection of international peace and security, energy, science, and development.",
        page: "p.1",
        context: "Reference to IAEA leadership.",
        explanation: "Strong support for a high crisis leadership score.",
      },
      engagement: {
        quote:
          "Multilateral institutions can deliver real, positive impact, provided they remain accountable, focused, credible, and deeply committed to engaging those they serve.",
        page: "p.1",
        context: "Engagement framed through impact and credibility.",
        explanation:
          "Some engagement ambition, but still more state- and institution-centered.",
      },
      emergingrisks: {
        quote:
          "For the past 6 years I have been leading a global organization that operates at the intersection of international peace and security, energy, science, and development.",
        page: "p.1",
        context: "Risk framing mainly through science, energy, and nuclear governance.",
        explanation: "Supports a moderate emerging-risks score.",
      },
      development: {
        quote:
          "A grounded, sectoral approach… focused on achievable outcomes and measurable progress.",
        page: "p.3–4",
        context: "Development discussed in operational terms.",
        explanation: "Stronger on delivery than systemic reform.",
      },
      peace: {
        quote:
          "The United Nations must return to its founding promise — to save humanity from the scourge of war.",
        page: "p.2",
        context: "Opening line of peace and security priority.",
        explanation: "Supports a strong peace and security score.",
      },
      accountability: {
        quote:
          "The world does not need more declarations. It needs a United Nations capable of responding to the real demands of our time, with impartiality and a results-oriented approach grounded in facts.",
        page: "p.1",
        context: "Grossi ties credibility to delivery and impartiality.",
        explanation:
          "Supports accountability as institutional credibility and results.",
      },
      gender: {
        quote:
          "Equal opportunity for men and women is not a matter of image or political correctness. When implemented correctly, it leads to better outcomes.",
        page: "p.4",
        context: "Gender framed as institutional performance.",
        explanation: "Supports a mid-range gender score.",
      },
      humanrights: {
        quote:
          "The pursuit of peace and security is inseparable from the defence of human dignity.",
        page: "p.3",
        context: "Opening statement of his human rights section.",
        explanation: "Supports a principled human rights score.",
      },
    },
    notes:
      "Adaptive Diplomat profile. Strong on operational reform and peace/security, with more state-centric accountability framing.",
  },
  {
    id: "c_grynspan",
    name: "Rebeca Grynspan",
    color: "#009E73",
    source: "vision",
    visionUrl:
      "https://www.un.org/sg/sites/default/files/document/2026-03/grynspan-vision-en.pdf",
    scores: {
      charter: 6,
      reform: 8,
      appointments: 8,
      leadership: 8,
      crisis: 8,
      engagement: 8,
      emergingrisks: 8,
      development: 8,
      peace: 8,
      accountability: 8,
      gender: 7,
      humanrights: 7,
    },
    evidence: {
      charter: {
        quote:
          "Article 100 of the Charter binds the Secretary-General to serve the Organization alone—not any government, bloc, or ideology.",
        page: "p.4",
        context: "Grounds the independence of the office.",
        explanation: "Supports a moderately transformative score.",
      },
      reform: {
        quote: "We must shift from siloed approaches to a culture of performance.",
        page: "p.5",
        context: "Institutional reform agenda.",
        explanation: "Supports one of the strongest reform scores.",
      },
      appointments: {
        quote:
          "I will commit to transparent, merit-based and geographically equitable appointments.",
        page: "p.5",
        context: "Accountability and reform commitments.",
        explanation: "Directly supports a high appointments score.",
      },
      leadership: {
        quote:
          "Stewardship, at this moment, requires more than continuity. It requires the willingness to listen when the truth is uncomfortable, to propose new ideas when the room resists, to persist when others leave.",
        page: "p.7",
        context: "Leadership style the UN now requires.",
        explanation: "Strongly supports an agenda-setting leadership score.",
      },
      crisis: {
        quote:
          "After months of work, two agreements were brokered between the UN, Türkiye, the Russian Federation and Ukraine.",
        page: "p.2",
        context: "Black Sea Grain Initiative.",
        explanation: "Direct evidence of high-stakes crisis diplomacy.",
      },
      engagement: {
        quote:
          "We need to focus on the core of our story, engage with people and in formats, languages and platforms that people use.",
        page: "p.5",
        context: "Legitimacy as partly a communication problem.",
        explanation: "Supports the strongest engagement score.",
      },
      emergingrisks: {
        quote:
          "AI is moving faster than any technology in history… cyberspace has become a critical domain… biotechnology is entering territory with questions we have not begun to answer.",
        page: "p.6",
        context: "Future-facing section.",
        explanation: "Supports a high emerging-risks score.",
      },
      development: {
        quote:
          "The UN must help widen the pathways to economic opportunities and help remove the structural constraints that stifle people’s potential.",
        page: "p.6",
        context: "Links development outcomes to structural barriers.",
        explanation: "Places her toward the transformative end.",
      },
      peace: {
        quote:
          "As Secretary-General, my priority will be to restore confidence in the UN as a trusted convener in theatres of conflict… investing political capital in preventive diplomacy.",
        page: "p.2",
        context: "Peace agenda centers mediation and prevention.",
        explanation: "Supports a proactive peace and security score.",
      },
      accountability: {
        quote:
          "I will introduce clear metrics, public reporting, and independent evaluation so that results are measurable.",
        page: "p.5",
        context: "Commitment to making the UN more accountable.",
        explanation: "Supports the strongest accountability score.",
      },
      gender: {
        quote:
          "The dignity of every person and the rights of women and girls are inseparable from these foundations.",
        page: "p.4",
        context: "Links women’s rights to peace and dignity.",
        explanation: "Supports a strong gender score.",
      },
      humanrights: {
        quote:
          "The Secretary-General must actively defend these frameworks as the foundations on which peace and security depend.",
        page: "p.4",
        context: "Refers to international law and human rights frameworks.",
        explanation: "Supports a robust human rights score.",
      },
    },
    notes:
      "Transformative Visionary profile. Most expansive future-facing vision, strongest on AI, biotech, cyberspace, development reform, and accountability.",
  },
  {
    id: "c_sall",
    name: "Macky Sall",
    color: "#CC79A7",
    source: "vision",
    visionUrl:
      "https://www.un.org/sg/sites/default/files/document/2026-03/macky-sall-vision-fr.pdf",
    scores: {
      charter: 4,
      reform: 5,
      appointments: 4,
      leadership: 5,
      crisis: 6,
      engagement: 5,
      emergingrisks: 4,
      development: 5,
      peace: 5,
      accountability: 4,
      gender: 5,
      humanrights: 4,
    },
    evidence: {
      charter: {
        quote:
          "Une organisation… ancrée dans ses missions originelles, adaptée aux réalités du présent et du futur.",
        page: "p.2",
        context: "Anchored in original missions while adjusted to present realities.",
        explanation: "Supports a traditional-to-moderate Charter score.",
      },
      reform: {
        quote:
          "Trois exigences majeures guideront mon action : rationaliser, simplifier, optimiser.",
        page: "p.4",
        context: "Governance reform section.",
        explanation:
          "Supports a mid-range reform score focused on efficiency.",
      },
      appointments: {
        quote:
          "No explicit proposal regarding reform of appointment procedures appears in the vision statement.",
        page: "—",
        context: "No direct appointments reform proposal.",
        explanation:
          "Score reflects implied continuation of prevailing practices.",
      },
      leadership: {
        quote:
          "Une approche fondée sur l’écoute, le dialogue et le pragmatisme.",
        page: "p.2",
        context: "Sall describes his leadership style.",
        explanation: "Supports a facilitator / bridge-building model.",
      },
      crisis: {
        quote:
          "Quarante années de gestion des affaires publiques, dont douze années comme Président de la République.",
        page: "p.1",
        context: "Long public leadership experience.",
        explanation: "Supports meaningful crisis leadership experience.",
      },
      engagement: {
        quote:
          "Je m’emploierai à être un Secrétaire général facilitateur et bâtisseur de ponts entre toutes les parties prenantes.",
        page: "p.3",
        context: "Bridge-builder among states and stakeholders.",
        explanation: "Supports a moderate engagement score.",
      },
      emergingrisks: {
        quote:
          "De nouveaux défis… comme les menaces sanitaires transfrontalières et le progrès fulgurant des technologies dont l’intelligence artificielle constitue la dernière manifestation.",
        page: "p.3",
        context: "Acknowledges AI and health threats.",
        explanation: "Supports limited recognition of emerging risks.",
      },
      development: {
        quote:
          "C’est pourquoi je m’engage à promouvoir davantage l’investissement et le commerce pour favoriser des partenariats porteurs de croissance et de prospérité partagées.",
        page: "p.3",
        context: "Development framed around investment and trade.",
        explanation: "Supports a moderate development score.",
      },
      peace: {
        quote:
          "La paix, la sécurité et le développement restent intrinsèquement liés et se renforcent mutuellement.",
        page: "p.2",
        context: "Presents peace, security, and development as linked.",
        explanation: "Supports a moderate peace score.",
      },
      accountability: {
        quote:
          "La satisfaction de ses Etats membres et des peuples de la Planète.",
        page: "p.5",
        context: "Legitimacy through Member States and peoples.",
        explanation: "Supports a more state-centered accountability score.",
      },
      gender: {
        quote:
          "La lutte contre les violences faites aux femmes et aux filles, leur autonomisation et le soutien à la jeunesse doivent rester au cœur de l’agenda international.",
        page: "p.3",
        context: "Gender acknowledged among key priorities.",
        explanation: "Supports a moderate gender score.",
      },
      humanrights: {
        quote:
          "No explicit standalone human rights pillar appears in the vision statement.",
        page: "—",
        context: "Human rights referenced indirectly but not centrally.",
        explanation: "Supports a lower human rights score.",
      },
    },
    notes:
      "Steady Steward profile. Emphasizes pragmatism, sovereignty, rationalization, and bridge-building.",
  },
];

const STORAGE_KEY = "sg-leadership-navigator-v3";

/* =========================================================
   Helpers
   ========================================================= */

function matchStrengthLabel(pct) {
  if (pct >= 80) return "Very strong match";
  if (pct >= 65) return "Strong match";
  if (pct >= 50) return "Moderate match";
  return "Partial match";
}

   function topTakeawayFromCandidate(candidate) {
  const sorted = [...PILLARS]
    .map((p) => ({ ...p, avg: pillarAvg(candidate.scores, p.id) }))
    .sort((a, b) => b.avg - a.avg);

  const top = sorted.slice(0, 2).map((p) => p.name);
  return `Strongest on ${top.join(" and ")}.`;
}

function topTakeawayFromMatch(match) {
  const strongest = match.dimDetails
    .filter((d) => Math.abs(d.gap) <= 1)
    .slice(0, 3)
    .map((d) => d.dim.short);

  if (!strongest.length) {
    return "This candidate is a mixed fit with fewer strong point-for-point alignments.";
  }

  return `Best fit if you prioritize ${strongest.join(", ")}.`;
}

function avg(scores) {
  const vals = Object.values(scores || {}).filter(
    (v) => v != null && !Number.isNaN(v)
  );
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 5;
}

function pillarAvg(scores, pillarId) {
  const dims = DIMENSIONS.filter((d) => d.pillar === pillarId);
  const vals = dims.map((d) => scores?.[d.id] ?? 5);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function pillarLabel(v) {
  if (v <= 3) return "Traditional";
  if (v <= 5) return "Moderate";
  if (v <= 7) return "Reform-oriented";
  return "Transformative";
}

function axisColor(score) {
  const t = Math.max(0, Math.min(1, score / 10));
  const r = Math.round(33 + t * (224 - 33));
  const g = Math.round(113 + t * (139 - 113));
  const b = Math.round(212 + t * (24 - 212));
  return `rgb(${r},${g},${b})`;
}

function generateCSVTemplate() {
  const header = ["Name", "Source", "Notes", ...DIMENSIONS.map((d) => d.id)].join(",");
  const row = ['"Example Candidate"', "vision", '"Assessment notes"', ...DIMENSIONS.map(() => "5")].join(",");
  return `${header}\n${row}`;
}

function downloadCSVTemplate() {
  const blob = new Blob([generateCSVTemplate()], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "SG-leadership-template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function exportCandidatesCSV(candidates) {
  const header = ["Name", "Source", "Notes", ...DIMENSIONS.map((d) => d.id)].join(",");
  const rows = candidates.map((c) =>
    [
      `"${(c.name || "").replace(/"/g, "'")}"`,
      c.source || "vision",
      `"${(c.notes || "").replace(/"/g, "'")}"`,
      ...DIMENSIONS.map((d) => c.scores?.[d.id] ?? 5),
    ].join(",")
  );
  const csv = `${header}\n${rows.join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `SG-leadership-profiles-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSVImport(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return null;

  const header = lines[0].split(",").map((x) => x.trim().toLowerCase());
  const nameIdx = header.indexOf("name");
  const sourceIdx = header.indexOf("source");
  const notesIdx = header.indexOf("notes");
  if (nameIdx < 0) return null;

  const out = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(",");
    const name = (parts[nameIdx] || "").replace(/^"|"$/g, "").trim();
    if (!name) continue;

    const scores = {};
    DIMENSIONS.forEach((d) => {
      const idx = header.indexOf(d.id.toLowerCase());
      scores[d.id] =
        idx >= 0 ? Math.max(0, Math.min(10, Number(parts[idx]) || 5)) : 5;
    });

    out.push({
      id: `csv_${Date.now()}_${i}`,
      name,
      source: sourceIdx >= 0 ? (parts[sourceIdx] || "vision").trim() : "vision",
      notes:
        notesIdx >= 0
          ? (parts[notesIdx] || "").replace(/^"|"$/g, "").trim()
          : "",
      color: CANDIDATE_COLORS[out.length % CANDIDATE_COLORS.length],
      scores,
      evidence: {},
    });
  }
  return out.length ? out : null;
}

function saveToStorage(candidates) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ candidates, savedAt: Date.now() }));
  } catch {}
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function computeMatches(userProfile, candidates) {
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
      const matchPct = Math.round(Math.max(0, (1 - dist / maxPossibleDist) * 100) * 10) / 10;

      return { candidate: c, matchPct, dist, dimDetails };
    })
    .sort((a, b) => a.dist - b.dist);
}

function narrativeGap(dimDetail) {
  const { dim, target, actual, gap } = dimDetail;
  if (Math.abs(gap) <= 1) return null;
  const userWants = target <= 3 ? dim.low : target <= 6 ? dim.mid : dim.high;
  const candidateIs = actual <= 3 ? dim.low : actual <= 6 ? dim.mid : dim.high;
  if (gap > 0) {
    return `You prefer a more traditional approach on ${dim.short.toLowerCase()} (“${userWants}”), but this candidate leans more transformative (“${candidateIs}”).`;
  }
  return `You want a more transformative approach on ${dim.short.toLowerCase()} (“${userWants}”), but this candidate is more traditional (“${candidateIs}”).`;
}

function useScrollableHint(ref) {
  const [state, setState] = useState({ top: false, bottom: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const top = el.scrollTop > 8;
      const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 8;
      setState({ top, bottom });
    };

    update();
    el.addEventListener("scroll", update);
    window.addEventListener("resize", update);

    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ref]);

  return state;
}

/* =========================================================
   Core UI bits
   ========================================================= */

function ModalShell({ onClose, children, maxWidth = 760 }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.42)",
        zIndex: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth,
          maxHeight: "88vh",
          overflow: "auto",
          background: "#fff",
          borderRadius: 18,
          boxShadow: "0 24px 80px rgba(15,23,42,.25)",
          border: "1px solid #e2e8f0",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function SideDrawer({ open, onClose, title, subtitle, children }) {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,.35)",
        zIndex: 650,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "min(560px, 100vw)",
          height: "100%",
          background: "#fff",
          boxShadow: "-16px 0 50px rgba(15,23,42,.18)",
          borderLeft: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "18px 20px 14px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>{title}</div>
            {subtitle ? (
              <div style={{ fontSize: 12, color: "#334155", marginTop: -2, lineHeight: 1.5 }}>
                {subtitle}
              </div>
            ) : null}
          </div>
          <button onClick={onClose} style={iconBtnSt}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

function FixedPopover({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        right: 24,
        top: 96,
        width: 360,
        maxWidth: "calc(100vw - 32px)",
        maxHeight: "calc(100vh - 120px)",
        overflow: "auto",
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        boxShadow: "0 20px 60px rgba(15,23,42,.18)",
        zIndex: 700,
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{title}</div>
        <button onClick={onClose} style={iconBtnSt}>✕</button>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
}

function EvidencePopover({ indicator, candidate }) {
  const [open, setOpen] = useState(false);
  const ev = candidate?.evidence?.[indicator.id];
  if (!ev) return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: "1px solid #e2e8f0",
          background: "#fff",
          color: "#334155",
          fontSize: 11,
          fontWeight: 800,
          cursor: "pointer",
          marginLeft: 8,
          lineHeight: 1,
          padding: 0,
        }}
      >
        i
      </button>

      <FixedPopover
        open={open}
        onClose={() => setOpen(false)}
        title={`${indicator.label} — ${candidate.scores?.[indicator.id] ?? 0}/10`}
      >
        <div style={{ fontSize: 12, fontStyle: "italic", color: "#334155", lineHeight: 1.6, marginBottom: 10 }}>
          “{ev.quote}”
        </div>
        <div style={{ fontSize: 11, color: "#334155", marginBottom: 6 }}>
          <strong>Page:</strong> {ev.page}
        </div>
        <div style={{ fontSize: 11.5, color: "#334155", lineHeight: 1.55, marginBottom: 8 }}>
          <strong>Context:</strong> {ev.context}
        </div>
        <div style={{ fontSize: 11.5, color: "#334155", lineHeight: 1.55 }}>
          <strong>Why this score:</strong> {ev.explanation}
        </div>
      </FixedPopover>
    </>
  );
}

/* =========================================================
   Radar Chart
   ========================================================= */

function RadarChart({ candidate, size = 340, compares = [], exportMode = false }) {
  const padX = exportMode ? 110 : 92;
  const padY = exportMode ? 90 : 72;

  const svgW = size + padX * 2;
  const svgH = size + padY * 2;

  const cx = svgW / 2;
  const cy = svgH / 2;

  const maxR = size * 0.32;
  const labelR = size * 0.46;
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
            {d.short}
          </text>
        );
      })}
    </svg>
  );
}

/* =========================================================
   Axis
   ========================================================= */

function AxisDot({ c, isSelected, dotR, onCandidateClick, labelAbove }) {
  const [hovered, setHovered] = useState(false);
  const overall = avg(c.scores);
  const shortName = c.name.length > 12 ? `${c.name.slice(0, 12)}…` : c.name;
  const isStacked = c.row > 0;
  const posColor = axisColor(c.x * 10);

  return (
    <div
      onClick={() => onCandidateClick?.(c)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        left: `${c.x * 100}%`,
        bottom: 8 + c.row * 58,
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: labelAbove ? "column-reverse" : "column",
        alignItems: "center",
        cursor: "pointer",
        zIndex: hovered ? 10 : 1,
      }}
    >
      {isStacked ? (
        <div
          style={{
            position: "absolute",
            bottom: -6,
            left: "50%",
            transform: "translateX(-50%)",
            width: 1,
            height: c.row * 58 - 18,
            borderLeft: "1px dashed #cbd5e1",
          }}
        />
      ) : null}

      <div
        style={{
          width: dotR * 2 + 4,
          height: dotR * 2 + 4,
          borderRadius: "50%",
          background: posColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isSelected
            ? `0 0 0 3px ${posColor}38, 0 8px 20px rgba(15,23,42,.12)`
            : "0 4px 14px rgba(15,23,42,.10)",
          transform: hovered ? "scale(1.04)" : "scale(1)",
          transition: "all .15s ease",
        }}
      >
        <div
          style={{
            width: dotR * 2,
            height: dotR * 2,
            borderRadius: "50%",
            background: c.color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#fff", fontSize: 12, fontWeight: 800 }}>
            {overall.toFixed(1)}
          </span>
        </div>
      </div>

      <div
        style={{
          marginTop: labelAbove ? 0 : 12,
          marginBottom: labelAbove ? 12 : 0,
          fontSize: 9.5,
          fontWeight: 800,
          color: c.color,
          whiteSpace: "nowrap",
          maxWidth: 104,
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "center",
        }}
      >
        {hovered ? c.name : shortName}
      </div>
    </div>
  );
}

function AxisStrip({ candidates, onCandidateClick, selectedId, userProfile, showUserMarker = true }) {
  const dotR = 19;

  const positioned = useMemo(() => {
    const sorted = [...candidates].sort((a, b) => avg(a.scores) - avg(b.scores));
    const placed = [];
    sorted.forEach((c, sortIdx) => {
      const x = avg(c.scores) / 10;
      let row = 0;
      while (placed.some((p) => Math.abs(p.x - x) < 0.07 && p.row === row)) row++;
      placed.push({ ...c, x, row, labelAbove: sortIdx % 2 === 1 });
    });
    return placed;
  }, [candidates]);

  const maxRow = Math.max(0, ...positioned.map((p) => p.row));
  const userAvg = userProfile?.targets ? avg(userProfile.targets) : null;

  return (
    <div style={{ width: "100%", padding: "0 18px", boxSizing: "border-box" }}>
      <div style={{ position: "relative", height: 88 + maxRow * 62, marginBottom: 8 }}>
        {positioned.map((c) => (
          <AxisDot
            key={c.id}
            c={c}
            isSelected={selectedId === c.id}
            dotR={dotR}
            onCandidateClick={onCandidateClick}
            labelAbove={c.labelAbove}
          />
        ))}

       {showUserMarker && userAvg != null ? (
  <div
    style={{
      position: "absolute",
      left: `${(userAvg / 10) * 100}%`,
      bottom: -30,
      transform: "translateX(-50%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      zIndex: 12,
      pointerEvents: "none",
    }}
  >
    <div
      style={{
        width: 14,
        height: 14,
        borderRadius: 3,
        border: "2px solid #1e293b",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: "rotate(45deg)",
        boxShadow: "0 1px 3px rgba(0,0,0,.08)",
        marginBottom: 4,
      }}
    >
      <div
        style={{
          width: 5,
          height: 5,
          borderRadius: 1,
          background: "#1e293b",
          transform: "rotate(-45deg)",
        }}
      />
    </div>

    <div
      style={{
        width: 1,
        height: 10,
        background: "#1e293b",
        opacity: 0.28,
        marginBottom: 5,
      }}
    />

    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: "#334155",
        whiteSpace: "nowrap",
        lineHeight: 1,
      }}
    >
      You are here
    </div>
  </div>
) : null}
      </div>

      <div
        style={{
          height: 10,
          borderRadius: 999,
          background:
            "linear-gradient(to right, #2171D4 0%, #8C7E6C 48%, #E08B18 100%)",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginTop: 12,
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <rect x="3" y="3" width="10" height="10" rx="1" fill="none" stroke="#2171D4" strokeWidth="1.5" />
          </svg>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#2171D4" }}>Traditional</div>
            <div style={{ fontSize: 10.5, color: "#6a9ad4", fontWeight: 600 }}>
              Procedural Steward
            </div>
          </div>
        </div>

        <div style={{ fontSize: 11, color: "#b0b8c5", fontWeight: 700, fontFamily: "monospace", paddingTop: 5 }}>
          0 ——— 5 ——— 10
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, textAlign: "right" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#E08B18" }}>Transformative</div>
            <div style={{ fontSize: 10.5, color: "#c4882e", fontWeight: 600 }}>
              Institutional Re-Architect
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <polygon points="8,2 14,14 2,14" fill="none" stroke="#E08B18" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   Quiz
   ========================================================= */

function QuizPosition({ pos, value, pillarColor, onSelect }) {
  const [open, setOpen] = useState(false);
  const isSelected = value === pos.score;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}
    >
      <button
        type="button"
        onClick={() => onSelect(pos.score)}
        style={{
          width: 540,
          maxWidth: "100%",
          padding: "18px 20px",
          borderRadius: 18,
          border: isSelected ? `3px solid ${pillarColor}` : "2px solid #dbe3ea",
          background: isSelected ? `${pillarColor}10` : "#fff",
          cursor: "pointer",
          fontFamily: "inherit",
          fontSize: 15,
          fontWeight: 700,
          color: "#334155",
          lineHeight: 1.35,
          transition: "all .15s ease",
          textAlign: "center",
          boxShadow: isSelected ? `0 0 0 2px ${pillarColor}20` : "none",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <span style={{ flex: 1 }}>{pos.label}</span>

          <span
            onMouseEnter={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            onMouseLeave={(e) => {
              e.stopPropagation();
              setOpen(false);
            }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "#f1f5f9",
              border: "1px solid #cbd5e1",
              color: "#475569",
              fontSize: 12,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              cursor: "help",
              position: "relative",
            }}
          >
            i

            {open && (
              <div
                style={{
                  position: "absolute",
                  left: "calc(100% + 12px)",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 320,
                  maxWidth: "min(320px, calc(100vw - 48px))",
                  background: "#1e293b",
                  color: "#fff",
                  borderRadius: 18,
                  padding: "18px 20px",
                  fontSize: 13.5,
                  lineHeight: 1.7,
                  boxShadow: "0 16px 40px rgba(15,23,42,.28)",
                  zIndex: 50,
                  textAlign: "left",
                  fontWeight: 500,
                  pointerEvents: "none",
                }}
              >
                {pos.detail}

                <div
                  style={{
                    position: "absolute",
                    left: -10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 0,
                    height: 0,
                    borderTop: "10px solid transparent",
                    borderBottom: "10px solid transparent",
                    borderRight: "10px solid #1e293b",
                  }}
                />
              </div>
            )}
          </span>
        </div>
      </button>
    </div>
  );
}

function QuizTab({ onComplete, existingProfile, onSeeMatches, resultsExportRef }) {
  const [selections, setSelections] = useState(() => existingProfile?._selections || {});
  const [submitted, setSubmitted] = useState(!!existingProfile);
  const [activePopover, setActivePopover] = useState(null);

  const [positionOrders] = useState(() => {
    const orders = {};
    QUIZ_QUESTIONS.forEach((q) => {
      const arr = [0, 1, 2, 3];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      orders[q.id] = arr;
    });
    return orders;
  });

  const [step, setStep] = useState(
    Object.keys(selections).length >= QUIZ_QUESTIONS.length ? QUIZ_QUESTIONS.length : 0
  );
  const currentQ = step < QUIZ_QUESTIONS.length ? QUIZ_QUESTIONS[step] : null;

  function computeProfileFrom(sels) {
    const targets = {};
    const weights = {};
    DIMENSIONS.forEach((d) => {
      targets[d.id] = 5;
      weights[d.id] = 10;
    });
    QUIZ_QUESTIONS.forEach((q) => {
      if (sels[q.id] != null) targets[q.dim] = sels[q.id];
    });
    return { targets, weights, _selections: sels };
  }

  function handleSelect(qId, score) {
    setActivePopover(null);
    const next = { ...selections, [qId]: score };
    setSelections(next);
    setTimeout(() => {
      if (step + 1 >= QUIZ_QUESTIONS.length) {
        setSubmitted(true);
        onComplete(computeProfileFrom(next));
      } else {
        setStep((s) => s + 1);
      }
    }, 220);
  }

  function restart() {
    setSelections({});
    setStep(0);
    setSubmitted(false);
    setActivePopover(null);
  }

  function goBack() {
    setActivePopover(null);
    if (step > 0) setStep((s) => s - 1);
  }

 if (submitted) {
  const profile = computeProfileFrom(selections);
  const overallAvg = avg(profile.targets);

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

      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: 16,
        }}
      >
        <button
          onClick={restart}
          style={{
            ...btnSt,
            background: "#fff",
            color: "#334155",
            border: "1px solid #e2e8f0",
          }}
        >
          Retake Quiz
        </button>

        <button
          data-export-hide="true"
          onClick={() =>
            exportElementToPNG(resultsExportRef?.current, "my-sg-priorities.png")
          }
          style={{
            ...btnSt,
            background: "#fff",
            color: "#334155",
            border: "1px solid #e2e8f0",
          }}
        >
          Download PNG
        </button>
                  <button
            data-export-hide="true"
            onClick={() =>
              exportElementToPDF(resultsExportRef?.current, "my-sg-priorities.pdf")
            }
            style={{
              ...btnSt,
              background: "#fff",
              color: "#334155",
              border: "1px solid #e2e8f0",
            }}
          >
            Download PDF
          </button>

        <button
          data-export-hide="true"
          onClick={() => onSeeMatches?.()}
          style={{ ...btnSt, background: "#1e293b", color: "#fff" }}
        >
          See My Matches →
        </button>
      </div>
    </div>
  );
}


  if (!currentQ) return null;

  const pillar = PILLARS.find((p) => p.id === currentQ.pillar);
  const order = positionOrders[currentQ.id] || [0, 1, 2, 3];
  const progress = step / QUIZ_QUESTIONS.length;

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "28px 24px 40px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 30 }}>
        <div style={{ flex: 1, height: 10, background: "#e2e8f0", borderRadius: 999, overflow: "hidden" }}>
          <div
            style={{
              height: "100%",
              width: `${progress * 100}%`,
              background: "linear-gradient(to right, #2171D4, #E08B18)",
              borderRadius: 999,
              transition: "width .25s ease",
            }}
          />
        </div>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#475569" }}>
          {step + 1}/{QUIZ_QUESTIONS.length}
        </span>
      </div>

      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 16px",
          borderRadius: 999,
          background: `${pillar.color}12`,
          fontSize: 13,
          fontWeight: 800,
          color: pillar.color,
          marginBottom: 22,
        }}
      >
        <div style={{ width: 11, height: 11, borderRadius: "50%", background: pillar.color }} />
        {pillar.name}
      </div>

      <h3 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", lineHeight: 1.35, margin: "0 0 26px", maxWidth: 920 }}>
        {currentQ.question}
      </h3>

      <div style={{ display: "grid", gap: 16, maxWidth: 1040 }}>
        {order.map((idx) => {
          const pos = currentQ.positions[idx];
          const isSelected = selections[currentQ.id] === pos.score;
          return (
            <QuizPosition
           key={`${currentQ.id}_${idx}`}
            pos={pos}
            value={selections[currentQ.id]}
            pillarColor={pillar.color}
            onSelect={(score) => handleSelect(currentQ.id, score)}
            />
          );
        })}
      </div>

      {step > 0 ? (
        <button
          onClick={goBack}
          style={{
            marginTop: 22,
            padding: "16px 28px",
            borderRadius: 14,
            border: "2px solid #dbe3ea",
            background: "#fff",
            color: "#475569",
            fontSize: 16,
            fontWeight: 800,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          ← Back
        </button>
      ) : null}
    </div>
  );
}

/* =========================================================
   Matches
   ========================================================= */

function ScrollHint({ top, bottom }) {
  return (
    <>
      {top ? (
        <div
          data-export-hide="true"
          style={{
            position: "sticky",
            top: 0,
            height: 28,
            marginBottom: -28,
            background: "linear-gradient(to bottom, rgba(255,255,255,.95), rgba(255,255,255,0))",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          <div style={{ fontSize: 11, color: "#475569", fontWeight: 800 }}>↑</div>
        </div>
      ) : null}

      {bottom ? (
        <div
          data-export-hide="true"
          style={{
            position: "sticky",
            bottom: 0,
            height: 34,
            marginTop: -34,
            background: "linear-gradient(to top, rgba(255,255,255,.96), rgba(255,255,255,0))",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#475569",
              fontWeight: 800,
              paddingBottom: 4,
            }}
          >
            ↓ Scroll for more
          </div>
        </div>
      ) : null}
    </>
  );
}

function MatchBreakdown({ match, isNarrow }) {
  const ref = useRef(null);
  const hint = useScrollableHint(ref);

  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "#0f172a",
          marginBottom: 10,
          textTransform: "uppercase",
          letterSpacing: 0.55,
        }}
      >
        Alignment Breakdown
      </div>

  <div
  ref={ref}
  data-export-scroll="true"
  style={{
    maxHeight: isNarrow ? "none" : 430,
    overflowY: isNarrow ? "visible" : "auto",
    paddingRight: isNarrow ? 0 : 6,
  }}
>
        {!isNarrow ? <ScrollHint top={hint.top} bottom={hint.bottom} /> : null}

        {match.dimDetails.map((d) => {
          const absGap = Math.abs(d.gap);
          const alignColor =
            absGap <= 1 ? "#12A67C" : absGap <= 3 ? "#E08B18" : "#C43990";

          return (
            <div key={d.dim.id} style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 4,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", minWidth: 0 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: PILLAR_COLORS[d.dim.pillar],
                    }}
                  >
                    {d.dim.short}
                  </span>
                  <EvidencePopover indicator={d.dim} candidate={match.candidate} />
                </div>

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: alignColor,
                    whiteSpace: "nowrap",
                  }}
                >
                  {absGap <= 1
                    ? "Strong match"
                    : absGap <= 3
                    ? "Moderate gap"
                    : "Significant gap"}
                </span>
              </div>

              <div
                style={{
                  position: "relative",
                  height: 10,
                  background: "#edf2f7",
                  borderRadius: 999,
                  marginBottom: 4,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: `${d.target * 10}%`,
                    top: -1,
                    width: 3,
                    height: 12,
                    background: "#475569",
                    borderRadius: 3,
                    transform: "translateX(-50%)",
                    zIndex: 2,
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: `${Math.min(d.actual, d.target) * 10}%`,
                    width: `${absGap * 10}%`,
                    height: "100%",
                    background: `${alignColor}25`,
                    borderRadius: 999,
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    left: `${d.actual * 10}%`,
                    top: 1,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: alignColor,
                    transform: "translateX(-50%)",
                    zIndex: 3,
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  fontSize: 10,
                  color: "#475569",
                  lineHeight: 1.35,
                }}
              >
                <span style={{ maxWidth: "45%" }}>{d.dim.low.split(";")[0]}</span>
                <span style={{ maxWidth: "45%", textAlign: "right" }}>{d.dim.high.split(";")[0]}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MatchesTab({ userProfile, candidates, isNarrow, matchExportRefs }) {
  const matches = useMemo(() => computeMatches(userProfile, candidates), [userProfile, candidates]);
  const [expandedMatch, setExpandedMatch] = useState(null);

  if (!userProfile) {
    return (
      <div style={{ textAlign: "center", padding: "60px 24px", color: "#475569" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>↑</div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Take the quiz first</div>
        <div style={{ fontSize: 13, marginBottom: 14 }}>
          Complete the quiz to see how candidates match your priorities.
        </div>
      </div>
    );
  }

  const userCandidate = {
    id: "user",
    name: "Your Priorities",
    color: "#475569",
    scores: userProfile.targets,
  };

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "20px 24px 28px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: "#0f172a", margin: "0 0 6px" }}>
          Your Candidate Matches
        </h2>
        <p style={{ fontSize: 13, color: "#334155", margin: 0 }}>
          Ranked by weighted alignment with your priority profile
        </p>
      </div>

      <div style={{ display: "grid", gap: 14 }}>
        {matches.map((m, rank) => {
          const isExpanded = expandedMatch === m.candidate.id;
          const topStrengths = m.dimDetails.filter((d) => Math.abs(d.gap) <= 2).slice(0, 3);
          const topGaps = m.dimDetails
            .filter((d) => Math.abs(d.gap) > 2)
            .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))
            .slice(0, 3);

          const narrativeGaps = topGaps.map((d) => narrativeGap(d)).filter(Boolean);
          const strongestAlignments = m.dimDetails
            .filter((d) => Math.abs(d.gap) <= 1)
            .slice(0, 3)
            .map((d) => d.dim.label);

          const closestPillars = PILLARS.map((p) => ({
            pillar: p,
            gap:
              m.dimDetails
                .filter((d) => d.dim.pillar === p.id)
                .reduce((sum, d) => sum + Math.abs(d.gap), 0) /
              m.dimDetails.filter((d) => d.dim.pillar === p.id).length,
          }))
            .sort((a, b) => a.gap - b.gap)
            .slice(0, 2);

                  const strength = matchStrengthLabel(m.matchPct);

          const topTakeaway =
            `${strength} — especially aligned on ${closestPillars.slice(0,2).map(p=>p.pillar.name).join(" and ")}.`;

          return (
            <div
              key={m.candidate.id}
              ref={(el) => {
                matchExportRefs.current[m.candidate.id] = el;
              }}
              style={{
                background: "#fff",
                borderRadius: 18,
                border: rank === 0 ? `2px solid ${m.candidate.color}30` : "1px solid #e2e8f0",
                overflow: "visible",
                boxShadow: rank === 0 ? "0 10px 28px rgba(15,23,42,.05)" : "none",
              }}
            >
              <div
                onClick={() => setExpandedMatch(isExpanded ? null : m.candidate.id)}
                style={{
                  padding: "18px 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  cursor: "pointer",
                  borderLeft: `5px solid ${m.candidate.color}`,
                  borderTopLeftRadius: 18,
                  borderBottomLeftRadius: isExpanded ? 0 : 18,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: rank === 0 ? "#12A67C" : "#f1f5f9",
                    color: rank === 0 ? "#fff" : "#334155",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  #{rank + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 900, color: "#0f172a" }}>{m.candidate.name}</div>
                  {topStrengths.length > 0 ? (
                    <div style={{ fontSize: 12, color: "#334155", marginTop: 4 }}>
                      Strong alignment: {topStrengths.map((d) => d.dim.short).join(", ")}
                    </div>
                  ) : null}
                </div>

                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 900,
                    color:
                      m.matchPct >= 75 ? "#12A67C" : m.matchPct >= 50 ? "#E08B18" : "#C43990",
                  }}
                >
                  {m.matchPct.toFixed(1)}%
                </div>

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 16 16"
                  style={{
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  <polyline points="4,6 8,10 12,6" fill="none" stroke="#475569" strokeWidth="2" />
                </svg>
              </div>

              {isExpanded ? (
                  <div
                    style={{
                      padding: "0 18px 18px",
                      borderLeft: `5px solid ${m.candidate.color}`,
                      background: "#fff",
                    }}
                  >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isNarrow ? "1fr" : "520px minmax(0, 1fr)",
                      gap: 28,
                      alignItems: "start",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "flex-start",
                        minHeight: isNarrow ? "auto" : 500,
                        paddingTop: 6,
                      }}
                    >
                     <div
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: 0,
                        marginBottom: 6,
                        overflow: "visible",
                      }}
                    >
                      <div
                        style={{
                          width: 420,
                          height: 420,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          overflow: "visible",
                        }}
                      >
                    <RadarChart candidate={m.candidate} size={320} compares={[userCandidate]} exportMode />                      </div>
                    </div>

                      <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 18,
                            marginTop: -8,
                            marginBottom: -8,
                            flexWrap: "wrap",
                          }}
                        >
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 18, height: 3, background: m.candidate.color, borderRadius: 999 }} />
                          <span style={{ fontSize: 12, fontWeight: 800, color: m.candidate.color }}>
                            {m.candidate.name}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <svg width="18" height="4">
                            <line x1="0" y1="2" x2="18" y2="2" stroke="#475569" strokeWidth="2" strokeDasharray="4 3" />
                          </svg>
                          <span style={{ fontSize: 12, fontWeight: 800, color: "#475569" }}>
                            Your priorities
                          </span>
                        </div>
                      </div>
                    </div>
<MatchBreakdown match={m} isNarrow={isNarrow} />

<div style={{ gridColumn: isNarrow ? "auto" : "1 / -1" }}>
  <div
    style={{
      marginBottom: 12,
      display: "flex",
      alignItems: "center",
      gap: 10,
      flexWrap: "wrap",
    }}
  >
    {m.candidate.visionUrl ? (
      <a
        href={m.candidate.visionUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "#2171D4",
          textDecoration: "none",
        }}
      >
        Read full vision statement →
      </a>
    ) : null}

    <button
      data-export-hide="true"
      onClick={() =>
        exportElementToPNG(
          matchExportRefs.current[m.candidate.id],
          `${m.candidate.name.replace(/\s+/g, "-").toLowerCase()}-match.png`
        )
      }
      style={{
        padding: "7px 12px",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        background: "#fff",
        color: "#334155",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      Download PNG
    </button>

    <button
      data-export-hide="true"
      onClick={() =>
        exportElementToPDF(
          matchExportRefs.current[m.candidate.id],
          `${m.candidate.name.replace(/\s+/g, "-").toLowerCase()}-match.pdf`
        )
      }
      style={{
        padding: "7px 12px",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
        background: "#fff",
        color: "#334155",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      Download PDF
    </button>
  </div>

  <div
  style={{
    marginBottom: 12,
    padding: "12px 14px",
    background: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderLeft: `4px solid ${m.candidate.color}`,
    borderRadius: 14,
  }}
>
  <div
    style={{
      fontSize: 11,
      fontWeight: 900,
      color: m.candidate.color,
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 4,
    }}
  >
    Top takeaway
  </div>
  <div
    style={{
      fontSize: 13,
      color: "#334155",
      lineHeight: 1.6,
      fontWeight: 600,
    }}
  >
    {topTakeaway}
  </div>
</div>

  {narrativeGaps.length > 0 ? (
    <div
      style={{
        padding: "14px 16px",
        background: "#FFF7ED",
        borderRadius: 14,
        fontSize: 13,
        color: "#92400e",
        lineHeight: 1.7,
        border: "1px solid #fed7aa",
      }}
    >
      <strong style={{ display: "block", marginBottom: 6 }}>Key differences:</strong>
      {narrativeGaps.map((text, i) => (
        <div key={i} style={{ marginBottom: i < narrativeGaps.length - 1 ? 8 : 0 }}>
          • {text}
        </div>
      ))}
    </div>
  ) : (
    <div
      style={{
        padding: "14px 16px",
        background: "#f8fafc",
        borderRadius: 14,
        fontSize: 12,
        color: "#334155",
        lineHeight: 1.6,
        border: "1px solid #e2e8f0",
      }}
    >
      No major differences identified.
    </div>
  )}
</div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   Candidate Profiles
   ========================================================= */

function PillarSummaryCard({ pillar, candidate, onOpen }) {
  const dims = DIMENSIONS.filter((d) => d.pillar === pillar.id);
  const pAvg = pillarAvg(candidate.scores, pillar.id);

  return (
    <button
      onClick={() => onOpen(pillar)}
      style={{
        padding: "16px 16px 14px",
        borderRadius: 16,
        background: `${pillar.color}10`,
        border: `1px solid ${pillar.color}28`,
        textAlign: "left",
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 900, color: pillar.color, letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 6 }}>
        {pillar.name}
      </div>
      <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.55, marginBottom: 10 }}>
        {pillarLabel(pAvg)} ({pAvg.toFixed(1)}/10)
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {dims.map((d) => {
          const score = candidate.scores?.[d.id] ?? 5;
          return (
            <div key={d.id}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#334155" }}>{d.short}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#334155" }}>{score}</span>
              </div>
              <div style={{ height: 7, borderRadius: 999, background: "#e2e8f0", overflow: "hidden" }}>
                <div style={{ width: `${score * 10}%`, height: "100%", borderRadius: 999, background: pillar.color }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 11, color: pillar.color, fontWeight: 800, marginTop: 10 }}>
        View detailed pillar analysis →
      </div>
    </button>
  );
}

function PillarDetailDrawer({ open, onClose, pillar, candidate }) {
  if (!open || !pillar || !candidate) return null;
  const dims = DIMENSIONS.filter((d) => d.pillar === pillar.id);
  const pAvg = pillarAvg(candidate.scores, pillar.id);

  return (
    <SideDrawer
      open={open}
      onClose={onClose}
      title={`${pillar.name} — ${pillarLabel(pAvg)} (${pAvg.toFixed(1)}/10)`}
      subtitle={PILLAR_DESCRIPTIONS[pillar.id]}
    >
      <div style={{ display: "grid", gap: 16 }}>
        {dims.map((d) => {
          const score = candidate.scores?.[d.id] ?? 5;
          const ev = candidate.evidence?.[d.id];
          return (
            <div
              key={d.id}
              style={{
                padding: "14px 14px 12px",
                borderRadius: 14,
                background: "#fff",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 900, color: pillar.color }}>
                {d.label}
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, color: "#0f172a" }}>{score}/10</div>
              </div>

              <div style={{ height: 8, borderRadius: 999, background: "#e2e8f0", overflow: "hidden", marginBottom: 8 }}>
                <div style={{ width: `${score * 10}%`, height: "100%", background: pillar.color, borderRadius: 999 }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 11, color: "#475569", lineHeight: 1.4 }}>
                <span style={{ maxWidth: "48%" }}>{d.low}</span>
                <span style={{ maxWidth: "48%", textAlign: "right" }}>{d.high}</span>
              </div>

              {ev ? (
  <div
    style={{
      marginTop: 12,
      padding: "12px 14px",
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: 12,
    }}
  >
    <div
      style={{
        fontSize: 10.5,
        fontWeight: 900,
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: 0.45,
        marginBottom: 8,
      }}
    >
      Evidence
    </div>

    <div
      style={{
        fontSize: 12.5,
        fontStyle: "italic",
        color: "#334155",
        lineHeight: 1.65,
        marginBottom: 10,
      }}
    >
      “{ev.quote}”
    </div>

    <div style={{ fontSize: 11.5, color: "#475569", marginBottom: 5 }}>
      <strong>Page:</strong> {ev.page}
    </div>

    <div style={{ fontSize: 11.5, color: "#475569", lineHeight: 1.6, marginBottom: 6 }}>
      <strong>Context:</strong> {ev.context}
    </div>

    <div style={{ fontSize: 11.5, color: "#475569", lineHeight: 1.6 }}>
      <strong>Why this score:</strong> {ev.explanation}
    </div>
  </div>
) : null}
            </div>
          );
        })}
      </div>
    </SideDrawer>
  );
}

function CandidateCard({
  candidate,
  allCandidates,
  onEdit,
  onDelete,
  forceExpanded,
  onToggle,
  cardRef,
  candidateExportRefs,
  isNarrow,
}) {
  const expanded = forceExpanded;
  const [compareIds, setCompareIds] = useState([]);
  const [activePillar, setActivePillar] = useState(null);

  const compares = compareIds
    .map((id) => allCandidates.find((c) => c.id === id))
    .filter(Boolean);

  const overall = avg(candidate.scores);
  const archetype = archetypeFromScores(candidate.scores);
  const topTakeaway = topTakeawayFromCandidate(candidate);

  function toggleCompare(id) {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
  <>
    <div
      ref={(el) => {
        if (typeof cardRef === "function") {
          cardRef(el);
        }
        if (candidateExportRefs) {
          candidateExportRefs.current[candidate.id] = el;
        }
      }}
      style={{
        background: "#fff",
        borderRadius: 18,
        border: expanded ? `2px solid ${candidate.color}30` : "1px solid #e2e8f0",
        overflow: "visible",
      }}
    >
        <div
          onClick={() => onToggle(candidate.id)}
          style={{
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            cursor: "pointer",
            borderLeft: `5px solid ${candidate.color}`,
            borderTopLeftRadius: 18,
            borderBottomLeftRadius: expanded ? 0 : 18,
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              background: candidate.color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{overall.toFixed(1)}</span>
          </div>

         <div style={{ flex: 1, minWidth: 0 }}>
  <div style={{ fontSize: 17, fontWeight: 900, color: "#0f172a", lineHeight: 1.2 }}>
    {candidate.name}
  </div>

  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
    <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>
      Source: {SOURCE_TYPES.find((s) => s.id === candidate.source)?.label || "Vision Statement"}
    </div>

    <span
      style={{
        fontSize: 11,
        fontWeight: 800,
        color: archetype.color,
        background: archetype.bg,
        border: `1px solid ${archetype.border}`,
        borderRadius: 999,
        padding: "4px 8px",
        lineHeight: 1,
      }}
    >
      {archetype.label}
    </span>
  </div>
</div>

<div
  data-export-hide="true"
  style={{ display: "flex", gap: 10, alignItems: "flex-end", height: 34 }}
>
  <div style={{ display: "flex", gap: 5, alignItems: "flex-end", height: 34 }}>
    {PILLARS.map((p) => {
      const val = pillarAvg(candidate.scores, p.id);
      return (
        <div
          key={p.id}
          title={p.name}
          style={{
            width: 11,
            height: `${(val / 10) * 100}%`,
            minHeight: 4,
            background: p.color,
            borderRadius: 3,
          }}
        />
      );
    })}
  </div>

  <svg
    width="18"
    height="18"
    viewBox="0 0 16 16"
    style={{
      transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
      transition: "transform 0.2s ease",
      flexShrink: 0,
    }}
  >
    <polyline points="4,6 8,10 12,6" fill="none" stroke="#475569" strokeWidth="2" />
  </svg>
</div>
        </div>

        {expanded ? (
              <div
    style={{
      padding: "0 20px 20px",
      borderLeft: `5px solid ${candidate.color}`,
      background: "#fff",
    }}
  >
               {allCandidates.length > 1 ? (
              <div data-export-hide="true" style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#334155", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                  Overlay candidates
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {allCandidates.filter((c) => c.id !== candidate.id).map((c) => {
                    const active = compareIds.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleCompare(c.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          padding: "7px 13px",
                          borderRadius: 999,
                          border: active ? `2px solid ${c.color}` : "2px solid #e2e8f0",
                          background: active ? `${c.color}12` : "#fff",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          fontSize: 12,
                          fontWeight: 700,
                          color: active ? c.color : "#475569",
                        }}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: active ? c.color : "#e2e8f0",
                          }}
                        />
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: isNarrow ? "1fr" : "minmax(380px, 520px) minmax(0, 1fr)",                
                gap: 24,
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", paddingLeft: 12 }}>                
              <RadarChart candidate={candidate} size={350} compares={compares} />
              </div>

              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#334155", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Pillar Overview
                </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isNarrow ? "1fr" : "1fr 1fr",
                      gap: 12,
                    }}
                  >                  {PILLARS.map((p) => (
                    <PillarSummaryCard
                      key={p.id}
                      pillar={p}
                      candidate={candidate}
                      onOpen={setActivePillar}
                    />
                  ))}
                </div>
              </div>
            </div>

           <div
  style={{
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  }}
>
  {candidate.visionUrl ? (
    <a
      href={candidate.visionUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        fontSize: 12,
        fontWeight: 800,
        color: "#2171D4",
        textDecoration: "none",
      }}
    >
      Read full vision statement →
    </a>
  ) : null}

  <button
    data-export-hide="true"
    onClick={() =>
      exportElementToPNG(
        candidateExportRefs.current[candidate.id],
        `${candidate.name.replace(/\s+/g, "-").toLowerCase()}-profile.png`
      )
    }
    style={{
      padding: "7px 12px",
      borderRadius: 8,
      border: "1px solid #e2e8f0",
      background: "#fff",
      color: "#334155",
      fontSize: 12,
      fontWeight: 600,
      cursor: "pointer",
    }}
  >
    Download PNG
  </button>

  <button
    data-export-hide="true"
    onClick={() =>
      exportElementToPDF(
        candidateExportRefs.current[candidate.id],
        `${candidate.name.replace(/\s+/g, "-").toLowerCase()}-profile.pdf`
      )
    }
    style={{
      padding: "7px 12px",
      borderRadius: 8,
      border: "1px solid #e2e8f0",
      background: "#fff",
      color: "#334155",
      fontSize: 12,
      fontWeight: 600,
      cursor: "pointer",
    }}
  >
    Download PDF
  </button>
</div>

            {candidate.notes ? (
              <div
                style={{
                  fontSize: 13,
                  color: "#334155",
                  lineHeight: 1.7,
                  padding: "14px 16px",
                  background: "#f8fafc",
                  borderRadius: 14,
                  border: "1px solid #e2e8f0",
                  marginBottom: 14,
                }}
              >
                {candidate.notes}
              </div>
            ) : null}

<div data-export-hide="true" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>              <button onClick={() => onEdit(candidate)} style={smallBtnSt}>
                Edit
              </button>
              <button
                onClick={() => onDelete(candidate.id)}
                style={{
                  ...smallBtnSt,
                  border: "1px solid #fecaca",
                  background: "#fef2f2",
                  color: "#dc2626",
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <PillarDetailDrawer
        open={!!activePillar}
        onClose={() => setActivePillar(null)}
        pillar={activePillar}
        candidate={candidate}
      />
    </>
  );
}

function EditPanel({ candidate, onSave, onCancel }) {
  const [draft, setDraft] = useState(() => ({
    ...candidate,
    scores: { ...(candidate.scores || {}) },
    evidence: candidate.evidence || {},
  }));

  function setScore(dimId, val) {
    setDraft((d) => ({ ...d, scores: { ...d.scores, [dimId]: val } }));
  }

  return (
    <SideDrawer
      open={true}
      onClose={onCancel}
      title={candidate.id ? "Edit Candidate" : "Add Candidate"}
      subtitle="Adjust the scores directly or create a new candidate profile."
    >
      <label style={labelSt}>Candidate Name</label>
      <input
        value={draft.name}
        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
        style={inputSt}
        placeholder="Full name"
      />

      <label style={labelSt}>Color</label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {CANDIDATE_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setDraft((d) => ({ ...d, color: c }))}
            style={{
              width: 26,
              height: 26,
              borderRadius: 8,
              background: c,
              border: draft.color === c ? "2px solid #0f172a" : "2px solid transparent",
              cursor: "pointer",
            }}
          />
        ))}
      </div>

      <label style={labelSt}>Source Type</label>
      <select
        value={draft.source}
        onChange={(e) => setDraft((d) => ({ ...d, source: e.target.value }))}
        style={{ ...inputSt, marginBottom: 12 }}
      >
        {SOURCE_TYPES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>

      {PILLARS.map((p) => {
        const dims = DIMENSIONS.filter((d) => d.pillar === p.id);
        return (
          <div key={p.id} style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                color: p.color,
                textTransform: "uppercase",
                letterSpacing: 0.6,
                paddingBottom: 8,
                borderBottom: `2px solid ${p.color}20`,
                marginBottom: 10,
              }}
            >
              {p.name}
            </div>

            {dims.map((d) => (
              <div key={d.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#334155" }}>{d.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 900, color: p.color }}>{draft.scores[d.id] ?? 5}</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={draft.scores[d.id] ?? 5}
                  onChange={(e) => setScore(d.id, Number(e.target.value))}
                  style={{ width: "100%", accentColor: p.color }}
                />

                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, fontSize: 10, color: "#475569", lineHeight: 1.35 }}>
                  <span style={{ maxWidth: "46%" }}>{d.low}</span>
                  <span style={{ maxWidth: "46%", textAlign: "right" }}>{d.high}</span>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      <label style={labelSt}>Notes</label>
      <textarea
        value={draft.notes || ""}
        onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
        style={{ ...inputSt, minHeight: 110, resize: "vertical" }}
        placeholder="Assessment notes, source references..."
      />

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 18 }}>
        <button onClick={onCancel} style={smallBtnSt}>
          Cancel
        </button>
        <button
          onClick={() => onSave(draft)}
          disabled={!draft.name?.trim()}
          style={{
            ...smallBtnSt,
            background: draft.name?.trim() ? "#1e293b" : "#cbd5e1",
            color: "#fff",
            border: "1px solid transparent",
            cursor: draft.name?.trim() ? "pointer" : "default",
          }}
        >
          {candidate.id ? "Save" : "Add Candidate"}
        </button>
      </div>
    </SideDrawer>
  );
}

/* =========================================================
   Reference modals
   ========================================================= */

function archetypeFromScores(scores) {
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

   function MethodModal({ onClose }) {
  return (
    <ModalShell onClose={onClose} maxWidth={800}>
      <div style={{ padding: "22px 26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0, color: "#0f172a" }}>Methodology</h2>
          <button onClick={onClose} style={iconBtnSt}>✕</button>
        </div>

        <p style={pSt}>
          This tool analyzes the leadership visions of candidates for Secretary-General of the United Nations. It maps candidates along a strategic continuum ranging from <strong>Traditional Procedural Steward</strong> to <strong>Transformative Institutional Re-Architect</strong>.
        </p>
        <p style={pSt}>
          The framework evaluates candidates across <strong>12 dimensions organized into four pillars</strong>. Rather than ranking candidates in absolute terms, it maps leadership archetypes and the degree to which candidates emphasize stewardship, managerial reform, or systemic transformation.
        </p>

        <h3 style={hdSt}>Leadership Axis</h3>
        <div style={blockSt}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "#2171D4", marginBottom: 4 }}>
              Lower end — Traditional Procedural Steward
            </div>
            <div style={{ fontSize: 11.5, lineHeight: 1.6, color: "#334155" }}>
              Operates primarily within established interpretations of the Charter and institutional practice. Emphasizes consensus-building, incremental adjustment, and careful stewardship.
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 900, color: "#E08B18", marginBottom: 4 }}>
              Higher end — Transformative Institutional Re-Architect
            </div>
            <div style={{ fontSize: 11.5, lineHeight: 1.6, color: "#334155" }}>
              Interprets the Charter as a living mandate capable of supporting institutional innovation. Prioritizes modernization, institutional independence, agenda-setting, and visible normative leadership.
            </div>
          </div>
        </div>

        <h3 style={hdSt}>Pillars & Dimensions</h3>
        {PILLARS.map((p) => {
          const dims = DIMENSIONS.filter((d) => d.pillar === p.id);
          return (
            <div key={p.id} style={{ ...blockSt, borderLeft: `3px solid ${p.color}` }}>
              <div style={{ fontSize: 12, fontWeight: 900, color: p.color, marginBottom: 8 }}>{p.name}</div>
              {dims.map((d) => (
                <div
                  key={d.id}
                  style={{
                    marginBottom: 8,
                    padding: "8px 10px",
                    background: "#fff",
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
                    {d.label}
                  </div>
                  <div style={{ display: "grid", gap: 4 }}>
                    <div style={{ fontSize: 10.5, lineHeight: 1.45, color: "#334155" }}>
                      <strong>Lower end:</strong> {d.low}
                    </div>
                    <div style={{ fontSize: 10.5, lineHeight: 1.45, color: "#334155" }}>
                      <strong>Higher end:</strong> {d.high}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        <h3 style={hdSt}>Scoring</h3>
        <p style={pSt}>
          Each dimension is scored on a 0–10 scale. Anchor points such as 2, 4, 7, and 9 represent distinct leadership interpretations, while intermediate values capture nuance.
        </p>
        <p style={pSt}>
          Where candidate materials do not explicitly address an indicator, scoring remains conservative and reflects the most plausible interpretation supported by available evidence.
        </p>

        <div style={{ padding: "12px 14px", background: "#fffbeb", borderRadius: 10, fontSize: 11.5, lineHeight: 1.6, color: "#92400e", border: "1px solid #fde68a" }}>
          <strong>Note:</strong> This is a prototype analytical framework intended to support reflection among diplomats, researchers, and policy practitioners. It maps how candidates conceptualize the role; it does not provide a total judgment of candidate suitability.
        </div>
      </div>
    </ModalShell>
  );
}

function DimInfoModal({ onClose }) {
  return (
    <ModalShell onClose={onClose} maxWidth={720}>
      <div style={{ padding: "22px 26px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0, color: "#0f172a" }}>Dimension Reference</h2>
          <button onClick={onClose} style={iconBtnSt}>✕</button>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {PILLARS.map((p) => {
            const dims = DIMENSIONS.filter((d) => d.pillar === p.id);
            return (
              <div key={p.id}>
                <div style={{ fontSize: 12, fontWeight: 900, color: p.color, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, paddingBottom: 4, borderBottom: `2px solid ${p.color}20` }}>
                  {p.name}
                </div>
                {dims.map((d) => (
                  <div key={d.id} style={{ padding: "10px 12px", background: "#f8fafc", borderRadius: 10, marginBottom: 5 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>
                      {d.label}
                    </div>
                    <div style={{ display: "flex", gap: 14, fontSize: 10.5, lineHeight: 1.45 }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 900, color: "#475569" }}>0:</span>{" "}
                        <span style={{ color: "#334155" }}>{d.low}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 900, color: "#1e293b" }}>10:</span>{" "}
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
    </ModalShell>
  );
}

/* =========================================================
   Main component
   ========================================================= */

  async function exportElementToPNG(element, fileName = "export.png") {
  if (!element) return;

  const clone = element.cloneNode(true);

  clone.style.position = "fixed";
  clone.style.left = "-99999px";
  clone.style.top = "0";
  clone.style.background = "#ffffff";
  clone.style.boxSizing = "border-box";
  clone.style.width = `${Math.max(element.scrollWidth, element.offsetWidth) + 80}px`;
  clone.style.padding = "24px 28px";
  clone.style.height = "auto";
  clone.style.maxHeight = "none";
  clone.style.overflow = "visible";

  // Hide things that should not appear in export
  clone.querySelectorAll("[data-export-hide='true']").forEach((node) => {
    node.remove();
  });

  // Expand scrollable sections fully for export
  clone.querySelectorAll("[data-export-scroll='true']").forEach((node) => {
    node.style.maxHeight = "none";
    node.style.height = "auto";
    node.style.overflow = "visible";
    node.style.paddingRight = "0";
  });

  // Safety: expand any remaining scroll containers
  clone.querySelectorAll("*").forEach((node) => {
    const style = window.getComputedStyle(node);
    if (
      style.overflow === "auto" ||
      style.overflow === "scroll" ||
      style.overflowY === "auto" ||
      style.overflowY === "scroll"
    ) {
      node.style.maxHeight = "none";
      node.style.height = "auto";
      node.style.overflow = "visible";
      node.style.overflowY = "visible";
    }
  });

  document.body.appendChild(clone);

  const canvas = await html2canvas(clone, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    logging: false,
    windowWidth: clone.scrollWidth,
    windowHeight: clone.scrollHeight,
  });

  document.body.removeChild(clone);

  const link = document.createElement("a");
  link.download = fileName;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

async function exportElementToPDF(element, fileName = "export.pdf") {
  if (!element) return;

  const clone = element.cloneNode(true);

  clone.style.position = "fixed";
  clone.style.left = "-99999px";
  clone.style.top = "0";
  clone.style.background = "#ffffff";
  clone.style.boxSizing = "border-box";
  clone.style.width = `${Math.max(element.scrollWidth, element.offsetWidth) + 80}px`;
  clone.style.padding = "24px 28px";
  clone.style.height = "auto";
  clone.style.maxHeight = "none";
  clone.style.overflow = "visible";

  clone.querySelectorAll("[data-export-hide='true']").forEach((node) => {
    node.remove();
  });

  clone.querySelectorAll("[data-export-scroll='true']").forEach((node) => {
    node.style.maxHeight = "none";
    node.style.height = "auto";
    node.style.overflow = "visible";
    node.style.overflowY = "visible";
    node.style.paddingRight = "0";
  });

  clone.querySelectorAll("*").forEach((node) => {
    const style = window.getComputedStyle(node);
    if (
      style.overflow === "auto" ||
      style.overflow === "scroll" ||
      style.overflowY === "auto" ||
      style.overflowY === "scroll"
    ) {
      node.style.maxHeight = "none";
      node.style.height = "auto";
      node.style.overflow = "visible";
      node.style.overflowY = "visible";
    }
  });

  document.body.appendChild(clone);

  const canvas = await html2canvas(clone, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    logging: false,
    windowWidth: clone.scrollWidth,
    windowHeight: clone.scrollHeight,
  });

  document.body.removeChild(clone);

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? "landscape" : "portrait",
    unit: "px",
    format: [canvas.width, canvas.height],
  });

  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  pdf.save(fileName);
}

export default function SGLeadershipTool() {
  const [activeTab, setActiveTab] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [candidates, setCandidates] = useState(SAMPLE_CANDIDATES);
  const [selectedId, setSelectedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [showMethod, setShowMethod] = useState(false);
  const [showDimRef, setShowDimRef] = useState(false);
  const [toast, setToast] = useState(null);
  const [savedAt, setSavedAt] = useState(null);
  const [hydrated, setHydrated] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);

  const fileRef = useRef(null);
  const cardRefs = useRef({});
  const matchExportRefs = useRef({});
  const candidateExportRefs = useRef({});
  const resultsExportRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 1120);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const saved = loadFromStorage();
    if (saved?.candidates?.length) {
      setCandidates(saved.candidates);
      if (saved.savedAt) setSavedAt(saved.savedAt);
    }
    setHydrated(true);
  }, []);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (!hydrated) return;
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    saveToStorage(candidates);
    setSavedAt(Date.now());
  }, [candidates, hydrated]);

  function showToastMsg(msg) {
    setToast(msg);
    window.clearTimeout(showToastMsg._t);
    showToastMsg._t = window.setTimeout(() => setToast(null), 2600);
  }

  function clearSavedData() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setCandidates(SAMPLE_CANDIDATES);
    setSavedAt(null);
    showToastMsg("Saved data cleared — demo candidates restored");
  }

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

  function handleCardToggle(id) {
    setExpandedId((prev) => (prev === id ? null : id));
    setSelectedId((prev) => (prev === id ? null : id));
  }

  function addCandidate() {
    setEditing({
      id: null,
      name: "",
      color: CANDIDATE_COLORS[candidates.length % CANDIDATE_COLORS.length],
      source: "vision",
      scores: DIMENSIONS.reduce((acc, d) => ({ ...acc, [d.id]: 5 }), {}),
      evidence: {},
      notes: "",
    });
  }

  function handleSave(draft) {
    if (draft.id) {
      setCandidates((cs) => cs.map((c) => (c.id === draft.id ? draft : c)));
      showToastMsg("Candidate updated");
    } else {
      setCandidates((cs) => [...cs, { ...draft, id: `c_${Date.now()}` }]);
      showToastMsg("Candidate added");
    }
    setEditing(null);
  }

  function handleDelete(id) {
    setCandidates((cs) => cs.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId(null);
    if (expandedId === id) setExpandedId(null);
    showToastMsg("Candidate removed");
  }

  function handleCSVUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const imported = parseCSVImport(ev.target.result);
      if (imported?.length) {
        setCandidates((cs) => [...cs, ...imported]);
        showToastMsg(`Imported ${imported.length} candidate${imported.length > 1 ? "s" : ""}`);
      } else {
        showToastMsg("Could not parse CSV. Check format and try again.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const TABS = [
    { id: 0, label: "Your SG Priorities", icon: "?" },
    { id: 1, label: "Your Matches", icon: "♟" },
    { id: 2, label: "Candidate Profiles", icon: "◈" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: "#0f172a",
      }}
    >
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 24px 0" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 20,
              marginBottom: 14,
              flexWrap: "wrap",
            }}
          >
            <div style={{ maxWidth: 720 }}>
              <div style={{ fontSize: 11, fontWeight: 900, color: "#475569", textTransform: "uppercase", letterSpacing: 1.6, marginBottom: 4 }}>
                UNSG Selection 2026
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0, color: "#0f172a", lineHeight: 1.2 }}>
                SG Leadership Navigator
              </h1>
              <p style={{ fontSize: 12, color: "#334155", margin: "8px 0 0", lineHeight: 1.55, maxWidth: 700 }}>
                {TOOL_DESCRIPTION}
              </p>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => setShowMethod(true)} style={topBtnSt}>
                Methodology
              </button>
              <button onClick={() => setShowDimRef(true)} style={topBtnSt}>
                Dimensions
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: "12px 22px",
                  fontSize: 13,
                  fontWeight: 900,
                  color: activeTab === t.id ? "#0f172a" : "#475569",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === t.id ? "3px solid #1e293b" : "3px solid transparent",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 15 }}>{t.icon}</span>
                {t.label}
                {t.id === 1 && userProfile ? (
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#12A67C", display: "inline-block" }} />
                ) : null}
              </button>
            ))}
          </div>

          <div style={{ padding: "10px 0 12px", fontSize: 12.5, color: "#334155", lineHeight: 1.55 }}>
            {activeTab === 0 &&
              "Answer a few questions to define your preferred Secretary-General leadership profile."}
            {activeTab === 1 &&
              "See which candidates align most closely with your priorities and where the biggest differences lie."}
            {activeTab === 2 &&
              "Explore each candidate’s scores, evidence, and overall leadership profile."}
          </div>
        </div>
      </div>

      {activeTab === 0 && (
  <QuizTab
    onComplete={(profile) => {
      setUserProfile(profile);
      setActiveTab(0);
    }}
    onSeeMatches={() => setActiveTab(1)}
    existingProfile={userProfile}
    resultsExportRef={resultsExportRef}
  />
)}

      {activeTab === 1 ? (
        <>
          {candidates.length > 0 ? (
            <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 24px 0" }}>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  padding: "24px 14px 34px",
                  marginBottom: 10,
                  border: "1px solid #e2e8f0",
                }}
              >
                <AxisStrip
                  candidates={candidates}
                  onCandidateClick={() => {}}
                  selectedId={null}
                  userProfile={userProfile}
                  showUserMarker={true}
                />
              </div>
            </div>
          ) : null}

          <MatchesTab userProfile={userProfile} candidates={candidates} isNarrow={isNarrow}  matchExportRefs={matchExportRefs}/>
        </>
      ) : null}

      {activeTab === 2 ? (
        <>
          <div style={{ background: "#fff", borderBottom: "1px solid #f1f5f9", padding: "12px 24px" }}>
            <div
              style={{
                maxWidth: 1180,
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {PILLARS.map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: p.color }} />
                    <span style={{ fontSize: 11.5, fontWeight: 800, color: p.color }}>{p.name}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <button
                  onClick={addCandidate}
                  style={{
                    ...topBtnSt,
                    background: "#1e293b",
                    color: "#fff",
                    border: "1px solid transparent",
                  }}
                >
                  + Add Candidate
                </button>

                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv,.tsv,.txt"
                  style={{ display: "none" }}
                  onChange={handleCSVUpload}
                />
              </div>
            </div>
          </div>

          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px 24px 12px" }}>
            {candidates.length > 0 ? (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 18,
                  padding: "24px 14px 34px",
                  marginBottom: 24,
                  border: "1px solid #e2e8f0",
                }}
              >
                <AxisStrip
                  candidates={candidates}
                  onCandidateClick={handleAxisClick}
                  selectedId={selectedId}
                  userProfile={userProfile}
                  showUserMarker={false}
                />
              </div>
            ) : null}

            {candidates.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "54px 24px",
                  background: "#fff",
                  borderRadius: 18,
                  border: "1px dashed #cbd5e1",
                }}
              >
                <div style={{ fontSize: 14, color: "#475569", marginBottom: 14 }}>No candidates added yet</div>
                <button
                  onClick={addCandidate}
                  style={{
                    padding: "11px 22px",
                    borderRadius: 10,
                    border: "none",
                    background: "#1e293b",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Add First Candidate
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {candidates.map((c) => (
                 <CandidateCard
                  key={c.id}
                  candidate={c}
                  allCandidates={candidates}
                  onEdit={(candidateToEdit) => setEditing(candidateToEdit)}
                  onDelete={handleDelete}
                  forceExpanded={expandedId === c.id}
                  onToggle={handleCardToggle}
                  candidateExportRefs={candidateExportRefs}
                  isNarrow={isNarrow}
                  cardRef={(el) => {
                    cardRefs.current[c.id] = el;
                  }}
                />
                ))}
              </div>
            )}
          </div>

          <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 24px 24px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "14px 0",
                borderTop: "1px solid #e2e8f0",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 12, color: "#475569", fontWeight: 700 }}>Data:</span>
              <button onClick={downloadCSVTemplate} style={footerBtnSt}>↓ Download Template</button>
              <button onClick={() => fileRef.current?.click()} style={footerBtnSt}>↑ Import CSV</button>
              {candidates.length > 0 ? (
                <button onClick={() => exportCandidatesCSV(candidates)} style={footerBtnSt}>
                  ↓ Export Candidates
                </button>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      <div style={{ textAlign: "center", padding: "8px 0 18px", fontSize: 11, color: "#475569" }}>
        {savedAt ? (
          <div style={{ marginBottom: 4 }}>
            <span>Auto-saved locally</span>{" "}
            <button
              onClick={clearSavedData}
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "3px 8px",
                borderRadius: 6,
                border: "1px solid #e2e8f0",
                background: "#fff",
                color: "#475569",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Clear
            </button>
          </div>
        ) : null}
        Created by <span style={{ fontWeight: 900, color: "#334155" }}>Policy Penguin Group</span> · Based on{" "}
        <a
          href="https://1for8billion.org/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#2171D4", fontWeight: 800, textDecoration: "none" }}
        >
          1 for 8 Billion
        </a>
      </div>

      {editing ? (
        <EditPanel
          candidate={editing}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      {showMethod ? <MethodModal onClose={() => setShowMethod(false)} /> : null}
      {showDimRef ? <DimInfoModal onClose={() => setShowDimRef(false)} /> : null}

      {toast ? (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1e293b",
            color: "#fff",
            padding: "11px 18px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 800,
            zIndex: 800,
            boxShadow: "0 12px 30px rgba(15,23,42,.25)",
          }}
        >
          {toast}
        </div>
      ) : null}
    </div>
  );
}

/* =========================================================
   Styles
   ========================================================= */

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

const topBtnSt = {
  padding: "9px 16px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  background: "#fff",
  color: "#334155",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  fontFamily: "inherit",
  whiteSpace: "nowrap",
};

const footerBtnSt = {
  padding: "7px 14px",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
  background: "#fff",
  color: "#334155",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
  fontFamily: "inherit",
  whiteSpace: "nowrap",
};

const smallBtnSt = {
  padding: "8px 14px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  background: "#fff",
  color: "#334155",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
  fontFamily: "inherit",
};

const iconBtnSt = {
  width: 32,
  height: 32,
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  background: "#fff",
  color: "#475569",
  cursor: "pointer",
  fontSize: 16,
  fontWeight: 800,
  lineHeight: 1,
};

const labelSt = {
  display: "block",
  fontSize: 10,
  fontWeight: 900,
  color: "#334155",
  textTransform: "uppercase",
  letterSpacing: 0.7,
  marginBottom: 5,
  marginTop: 10,
};

const inputSt = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  fontSize: 13,
  color: "#0f172a",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  background: "#fff",
};

const pSt = {
  fontSize: 12,
  color: "#334155",
  lineHeight: 1.7,
  margin: "6px 0 10px",
};

const hdSt = {
  fontSize: 13,
  fontWeight: 900,
  color: "#0f172a",
  margin: "18px 0 8px",
  textTransform: "uppercase",
  letterSpacing: 0.55,
  borderTop: "1px solid #e2e8f0",
  paddingTop: 12,
};

const blockSt = {
  padding: "12px 14px",
  background: "#f8fafc",
  borderRadius: 10,
  fontSize: 11.5,
  lineHeight: 1.6,
  color: "#334155",
  marginBottom: 8,
};