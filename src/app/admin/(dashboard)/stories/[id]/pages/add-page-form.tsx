"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addPage } from "./actions";

interface Props {
  storyId: string;
  nextPageNumber: number;
}

export function AddPageForm({ storyId, nextPageNumber }: Props) {
  const [loading, setLoading] = useState(false);
  const [imageTemplate, setImageTemplate] = useState("");
  const [textTemplate, setTextTemplate] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await addPage(storyId, {
        pageNumber: nextPageNumber,
        imageTemplate,
        textTemplate,
      });
      setImageTemplate("");
      setTextTemplate("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Número de Página</Label>
        <Input value={nextPageNumber} disabled />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageTemplate">URL de Imagen</Label>
        <Input
          id="imageTemplate"
          value={imageTemplate}
          onChange={(e) => setImageTemplate(e.target.value)}
          placeholder="/stories/historia/page1.jpg"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="textTemplate">Texto de la Página</Label>
        <textarea
          id="textTemplate"
          className="w-full min-h-[100px] px-3 py-2 border rounded-md resize-none text-sm"
          value={textTemplate}
          onChange={(e) => setTextTemplate(e.target.value)}
          placeholder="Había una vez un niño llamado {child_name}..."
          required
        />
        <p className="text-xs text-muted-foreground">
          Usa {"{child_name}"} donde quieras insertar el nombre del niño
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Agregando..." : "Agregar Página"}
      </Button>
    </form>
  );
}
