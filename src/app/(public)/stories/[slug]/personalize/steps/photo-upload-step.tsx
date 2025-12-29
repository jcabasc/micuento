"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface PersonalizationData {
  childName: string;
  childAge: number;
  photoFile: File | null;
  photoPreview: string | null;
}

interface Props {
  data: PersonalizationData;
  updateData: (updates: Partial<PersonalizationData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PhotoUploadStep({ data, updateData, onNext, onBack }: Props) {
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona una imagen válida");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("La imagen debe ser menor a 10MB");
      return;
    }

    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      updateData({
        photoFile: file,
        photoPreview: event.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    updateData({ photoFile: null, photoPreview: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit() {
    if (!data.photoFile) {
      setError("Por favor sube una foto");
      return;
    }
    onNext();
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Sube una foto de {data.childName}</h2>
        <p className="text-muted-foreground">
          Esta foto se usará para personalizar las ilustraciones
        </p>
      </div>

      {/* Photo Guidelines */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <p className="font-medium mb-2">Para mejores resultados:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Foto frontal del rostro</li>
          <li>Buena iluminación (luz natural preferible)</li>
          <li>Fondo simple o claro</li>
          <li>Sin gafas de sol, gorras o máscaras</li>
          <li>Expresión neutral o sonriente</li>
        </ul>
      </div>

      {/* Upload Area */}
      {data.photoPreview ? (
        <div className="space-y-4">
          <div className="relative aspect-square max-w-[200px] mx-auto rounded-lg overflow-hidden border-2 border-primary">
            <Image
              src={data.photoPreview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" onClick={handleRemovePhoto}>
              Cambiar foto
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
        >
          <div className="text-4xl mb-4">📷</div>
          <p className="font-medium">Haz clic para subir una foto</p>
          <p className="text-sm text-muted-foreground mt-1">
            JPG, PNG o WEBP (máx. 10MB)
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Atrás
        </Button>
        <Button onClick={handleSubmit} className="flex-1">
          Continuar
        </Button>
      </div>
    </div>
  );
}
