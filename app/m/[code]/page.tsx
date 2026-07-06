import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MapView } from "@/components/map-view";
import type { FireCounts } from "@/lib/types";

export default async function PublicMapPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: map } = await supabase
    .from("maps")
    .select("*")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (!map) {
    notFound();
  }

  const [{ data: nodes }, { data: fireRows }, userResult] = await Promise.all([
    supabase.from("nodes").select("*").eq("map_id", map.id).order("created_at"),
    supabase.from("node_fire_counts").select("*"),
    supabase.auth.getUser(),
  ]);

  const nodeIds = new Set((nodes ?? []).map((n) => n.id));
  const fireCounts: FireCounts = {};
  for (const row of fireRows ?? []) {
    if (row.node_id && nodeIds.has(row.node_id)) {
      fireCounts[row.node_id] = row.fire_count ?? 0;
    }
  }

  const isOwner = userResult.data.user?.id === map.owner_id;

  return (
    <MapView
      map={map}
      initialNodes={nodes ?? []}
      initialFireCounts={fireCounts}
      isOwner={isOwner}
    />
  );
}
