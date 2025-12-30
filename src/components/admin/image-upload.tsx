"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImageUploadProps {
  label: string;
  name: string;
  defaultValue?: string;
  folder?: string;
  required?: boolean;
}

export function ImageUpload({
  label,
  name,
  defaultValue = "",
  folder = "covers",
  required = false,
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setImageUrl(data.url);
      } else {
        setError(data.error || "Error al subir la imagen");
      }
    } catch {
      setError("Error de conexión al subir la imagen");
    } finally {
      setUploading(false);
    }
  }

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    setImageUrl(e.target.value);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={name}>{label}</Label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`text-xs px-2 py-1 rounded ${
              mode === "upload"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            Subir archivo
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`text-xs px-2 py-1 rounded ${
              mode === "url"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            URL
          </button>
        </div>
      </div>

      {mode === "upload" ? (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? "Subiendo..." : "Seleccionar imagen"}
          </Button>
          <p className="text-xs text-muted-foreground">
            JPG, PNG o WebP. Máximo 5MB.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="https://ejemplo.com/imagen.jpg"
            value={imageUrl}
            onChange={handleUrlChange}
          />
          <p className="text-xs text-muted-foreground">
            O ingresa la URL de una imagen externa
          </p>
        </div>
      )}

      {/* Hidden input to submit the final URL value */}
      <input type="hidden" name={name} value={imageUrl} required={required} />

      {/* Preview */}
      {imageUrl && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted border">
          <Image
            src={imageUrl}
            alt="Preview"
            fill
            className="object-cover"
            onError={() => setError("Error al cargar la imagen")}
          />
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
