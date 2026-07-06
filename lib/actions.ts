"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { randomMapCode } from "@/lib/map-code";

export type ActionState = { error: string | null };

async function generateUniqueCode(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string> {
  for (let attempt = 0; attempt < 25; attempt++) {
    const code = randomMapCode();
    const { data } = await supabase
      .from("maps")
      .select("id")
      .eq("code", code)
      .maybeSingle();
    if (!data) return code;
  }
  throw new Error("Could not generate a unique map code, please try again.");
}

export async function createMap(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const rootTitle = String(formData.get("rootTitle") ?? "").trim();
  const rootDescription = String(formData.get("rootDescription") ?? "").trim();

  if (!title || !rootTitle) {
    return { error: "Map title and root quest title are required." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create a map." };
  }

  let code: string;
  try {
    code = await generateUniqueCode(supabase);
  } catch {
    return { error: "Could not generate a unique map code, please try again." };
  }

  const { data: map, error: mapError } = await supabase
    .from("maps")
    .insert({ code, owner_id: user.id, title })
    .select("id")
    .single();

  if (mapError || !map) {
    return { error: mapError?.message ?? "Failed to create map." };
  }

  const { error: nodeError } = await supabase.from("nodes").insert({
    map_id: map.id,
    parent_id: null,
    title: rootTitle,
    description: rootDescription,
  });

  if (nodeError) {
    return { error: nodeError.message };
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/${map.id}`);
}

export async function acceptSuggestion(
  suggestionId: string,
  mapId: string,
  parentNodeId: string | null,
  title: string,
  description: string,
) {
  const supabase = await createClient();

  const { error: nodeError } = await supabase.from("nodes").insert({
    map_id: mapId,
    parent_id: parentNodeId,
    title,
    description,
  });

  if (nodeError) throw new Error(nodeError.message);

  const { error: suggestionError } = await supabase
    .from("suggestions")
    .update({ status: "accepted" })
    .eq("id", suggestionId);

  if (suggestionError) throw new Error(suggestionError.message);

  revalidatePath(`/dashboard/${mapId}`);
}

export async function rejectSuggestion(suggestionId: string, mapId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("suggestions")
    .update({ status: "rejected" })
    .eq("id", suggestionId);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/${mapId}`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
