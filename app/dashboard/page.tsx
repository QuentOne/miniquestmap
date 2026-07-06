import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateMapDialog } from "@/components/create-map-dialog";
import { SignOutButton } from "@/components/sign-out-button";
import { Card } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: maps } = await supabase
    .from("maps")
    .select("id, title, code, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Quest Map
          </Link>
          <h1 className="mt-1 text-2xl font-medium tracking-tight">Your maps</h1>
        </div>
        <div className="flex items-center gap-2">
          <CreateMapDialog />
          <SignOutButton />
        </div>
      </header>

      {!maps || maps.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-24 text-center">
          <p className="text-muted-foreground">You haven&apos;t created a map yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create one to get a shareable 4-letter code.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {maps.map((map) => (
            <Link key={map.id} href={`/dashboard/${map.id}`}>
              <Card className="h-full border-white/10 bg-card/60 p-5 transition-colors hover:border-white/25">
                <div className="flex items-start justify-between">
                  <h2 className="text-base font-medium text-foreground">{map.title}</h2>
                  <span className="rounded-full bg-white/5 px-2.5 py-1 font-mono text-xs tracking-[0.2em] text-muted-foreground">
                    {map.code}
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Share link: yourapp.com/m/{map.code}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
