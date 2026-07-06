import Link from "next/link";

export default function MapNotFound() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">404</p>
      <h1 className="text-2xl font-medium tracking-tight text-foreground">
        No map with that code
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Double-check the 4-letter code and try again.
      </p>
      <Link
        href="/"
        className="mt-4 text-sm font-medium text-foreground underline underline-offset-4"
      >
        Back home
      </Link>
    </div>
  );
}
