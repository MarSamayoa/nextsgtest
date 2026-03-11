import { supabase } from "./client";

export async function saveQuizResult({
  archetype,
  targets,
  weights,
  selections,
  topMatchCandidateId,
}) {
  const { data, error } = await supabase
    .from("quiz_results")
    .insert({
      archetype,
      targets,
      weights,
      selections,
      top_match_candidate_id: topMatchCandidateId ?? null,
      is_public: true,
    })
    .select("id")
    .single();

  if (error) throw error;

  return data.id;
}