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
          67
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
        <h1 className="max-w-2xl text-balance text-4xl font-medium leading-tight tracking-tight text-foreground sm:text-6xl">
          A map for your goals
        </h1>

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
        Built by Big Quentin
      </footer>
    </div>
  );
}
