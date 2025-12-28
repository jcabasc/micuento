import { StoryStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface StoryStatusBadgeProps {
  status: StoryStatus;
}

export function StoryStatusBadge({ status }: StoryStatusBadgeProps) {
  return (
    <span
      className={cn(
        "px-2 py-1 text-xs font-medium rounded-full",
        status === "PUBLISHED"
          ? "bg-green-100 text-green-800"
          : "bg-yellow-100 text-yellow-800"
      )}
    >
      {status === "PUBLISHED" ? "Publicado" : "Borrador"}
    </span>
  );
}
