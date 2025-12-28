"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StoryStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { toggleStoryStatus } from "./actions";

interface ToggleStatusButtonProps {
  storyId: string;
  currentStatus: StoryStatus;
}

export function ToggleStatusButton({
  storyId,
  currentStatus,
}: ToggleStatusButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    setLoading(true);
    try {
      await toggleStoryStatus(storyId);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
    >
      {loading
        ? "..."
        : currentStatus === "PUBLISHED"
          ? "Despublicar"
          : "Publicar"}
    </Button>
  );
}
