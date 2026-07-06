import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { JoinMapForm } from "@/components/join-map-form";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_50%_-10%,rgba(255,255,255,0.08),transparent_60%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-white/[0.03] blur-3xl"
      />

      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <span className="text-sm font-medium tracking-wide text-foreground">
          Quest Map
        </span>
        <nav className="flex items-center gap-3">
          {user ? (
            <Button size="sm" render={<Link href="/dashboard" />}>
              Dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" render={<Link href="/login" />}>
                Log in
              </Button>
              <Button size="sm" render={<Link href="/signup" />}>
                Sign up
              </Button>
            </>
          )}
        </nav>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          A living map for anything you&apos;re working toward
        </p>
        <h1 className="max-w-2xl text-balance text-4xl font-medium leading-tight tracking-tight text-foreground sm:text-6xl">
          Turn any goal into a quest tree
        </h1>
        <p className="mt-6 max-w-md text-balance text-base leading-relaxed text-muted-foreground">
          Build a branching map of objectives, share it with a 4-letter code,
          and let others fire-up nodes and suggest new quests. No login
          required to explore.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="rounded-full px-8"
            render={<Link href={user ? "/dashboard" : "/signup"} />}
          >
            {user ? "Go to your maps" : "Create your map"}
          </Button>
        </div>

        <div className="mt-14 w-full max-w-xs">
          <JoinMapForm />
        </div>
      </main>

      <footer className="relative z-10 px-8 py-6 text-center text-xs text-muted-foreground">
        Built with Next.js, Supabase &amp; React Flow.
      </footer>
    </div>
  );
}
