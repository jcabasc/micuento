"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createStory } from "../actions";

export default function NewStoryPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);
      const result = await createStory(formData);
      router.push(`/admin/stories/${result.id}/pages`);
    } catch {
      setError("Error al crear la historia");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/stories">
          <Button variant="ghost" size="sm">
            ← Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Nueva Historia</h1>
      </div>

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
                placeholder="Ej: La Gran Aventura"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                name="description"
                className="w-full min-h-[100px] px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Una breve descripción de la historia..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio (COP)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="89000"
                min="0"
                required
              />
              <p className="text-xs text-muted-foreground">
                Ingresa el precio en pesos colombianos (sin centavos)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">URL de la Portada</Label>
              <Input
                id="coverImage"
                name="coverImage"
                placeholder="/stories/mi-historia/cover.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Opcional. Puedes agregar la imagen después.
              </p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Creando..." : "Crear Historia"}
              </Button>
              <Link href="/admin/stories">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
