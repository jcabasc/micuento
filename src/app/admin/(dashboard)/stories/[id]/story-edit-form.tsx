"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Story } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateStory } from "../actions";

interface Props {
  story: Story;
}

export function StoryEditForm({ story }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      await updateStory(story.id, formData);
      router.push("/admin/stories");
    } catch {
      setError("Error al actualizar la historia");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la Historia</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              defaultValue={story.title}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              name="description"
              className="w-full min-h-[100px] px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              defaultValue={story.description}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio (COP)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              defaultValue={story.price / 100}
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">URL de la Portada</Label>
            <Input
              id="coverImage"
              name="coverImage"
              defaultValue={story.coverImage}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
            <Link href={`/admin/stories/${story.id}/pages`}>
              <Button type="button" variant="secondary">
                Editar Páginas
              </Button>
            </Link>
            <Link href="/admin/stories">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
