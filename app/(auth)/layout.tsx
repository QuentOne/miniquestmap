import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center px-6 py-16">
      <Link
        href="/"
        className="mb-10 text-sm font-medium tracking-wide text-muted-foreground transition-colors hover:text-foreground"
      >
        Quest Map
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-card/60 p-8 shadow-[0_0_60px_-15px_rgba(255,255,255,0.08)] backdrop-blur">
        {children}
      </div>
    </div>
  );
}
