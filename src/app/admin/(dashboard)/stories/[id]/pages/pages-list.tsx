"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StoryPage } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deletePage, updatePage } from "./actions";

interface Props {
  storyId: string;
  pages: StoryPage[];
}

export function PagesList({ storyId, pages }: Props) {
  if (pages.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No hay páginas aún. Agrega la primera página usando el formulario.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {pages.map((page) => (
        <PageItem key={page.id} page={page} storyId={storyId} />
      ))}
    </div>
  );
}

function PageItem({ page, storyId }: { page: StoryPage; storyId: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageTemplate, setImageTemplate] = useState(page.imageTemplate);
  const [textTemplate, setTextTemplate] = useState(page.textTemplate);
  const router = useRouter();

  async function handleSave() {
    setLoading(true);
    try {
      await updatePage(page.id, { imageTemplate, textTemplate });
      setIsEditing(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("¿Estás seguro de eliminar esta página?")) return;
    setLoading(true);
    try {
      await deletePage(page.id, storyId);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-medium">Página {page.pageNumber}</span>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button size="sm" onClick={handleSave} disabled={loading}>
                {loading ? "..." : "Guardar"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(false)}
              >
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                Editar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                Eliminar
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">
              URL de Imagen
            </label>
            <Input
              value={imageTemplate}
              onChange={(e) => setImageTemplate(e.target.value)}
              placeholder="/stories/historia/page1.jpg"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">
              Texto (usa {"{child_name}"} para el nombre)
            </label>
            <textarea
              className="w-full min-h-[80px] px-3 py-2 border rounded-md resize-none text-sm"
              value={textTemplate}
              onChange={(e) => setTextTemplate(e.target.value)}
              placeholder="Había una vez un niño llamado {child_name}..."
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground truncate">
            <span className="font-medium">Imagen:</span> {page.imageTemplate}
          </p>
          <p className="text-muted-foreground">
            <span className="font-medium">Texto:</span> {page.textTemplate}
          </p>
        </div>
      )}
    </div>
  );
}
