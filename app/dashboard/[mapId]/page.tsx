import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SuggestionsInbox } from "@/components/suggestions-inbox";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default async function MapDashboardPage({
  params,
}: {
  params: Promise<{ mapId: string }>;
}) {
  const { mapId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: map } = await supabase
    .from("maps")
    .select("id, title, code, owner_id")
    .eq("id", mapId)
    .maybeSingle();

  if (!map || map.owner_id !== user.id) {
    notFound();
  }

  const [{ data: nodes }, { data: suggestions }] = await Promise.all([
    supabase.from("nodes").select("*").eq("map_id", mapId),
    supabase
      .from("suggestions")
      .select("*")
      .eq("map_id", mapId)
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-12">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        All maps
      </Link>

      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">{map.title}</h1>
          <p className="mt-1 font-mono text-xs tracking-[0.2em] text-muted-foreground">
            CODE: {map.code}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          render={<Link href={`/m/${map.code}`} target="_blank" />}
        >
          View map
          <ExternalLink className="size-3.5" />
        </Button>
      </header>

      <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-muted-foreground">
        Suggestions inbox
      </h2>
      <SuggestionsInbox
        mapId={map.id}
        initialSuggestions={suggestions ?? []}
        nodes={nodes ?? []}
      />
    </div>
  );
}
