import { Skeleton } from "@/components/ui/skeleton";

export default function MapLoading() {
  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="flex flex-col items-center gap-8">
        <Skeleton className="size-40 rounded-full" />
        <div className="flex gap-10">
          <Skeleton className="size-28 rounded-full" />
          <Skeleton className="size-28 rounded-full" />
          <Skeleton className="size-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}
