"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  detectFacesFromDataUrl,
  validateImageDimensions,
  isFaceDetectionSupported,
} from "@/lib/face-detection";

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
  const [warning, setWarning] = useState("");
  const [validating, setValidating] = useState(false);
  const [faceStatus, setFaceStatus] = useState<"none" | "valid" | "warning" | "error">("none");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
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
    setWarning("");
    setValidating(true);
    setFaceStatus("none");

    // Create preview
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;

      updateData({
        photoFile: file,
        photoPreview: dataUrl,
      });

      // Validate image dimensions
      const img = new window.Image();
      img.onload = async () => {
        const dimResult = validateImageDimensions(img.width, img.height);
        if (!dimResult.valid) {
          setError(dimResult.message);
          setFaceStatus("error");
          setValidating(false);
          return;
        }

        // Run face detection if supported
        if (isFaceDetectionSupported()) {
          const faceResult = await detectFacesFromDataUrl(dataUrl);

          if (!faceResult.hasFace) {
            setError(faceResult.message);
            setFaceStatus("error");
          } else if (faceResult.faceCount > 1) {
            setWarning(faceResult.message);
            setFaceStatus("warning");
          } else if (faceResult.confidence === "high") {
            setFaceStatus("valid");
          } else {
            setFaceStatus("warning");
          }
        } else {
          // Browser doesn't support face detection, allow to proceed
          setFaceStatus("valid");
        }

        setValidating(false);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function handleRemovePhoto() {
    updateData({ photoFile: null, photoPreview: null });
    setFaceStatus("none");
    setError("");
    setWarning("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit() {
    if (!data.photoFile) {
      setError("Por favor sube una foto");
      return;
    }
    if (validating) {
      return;
    }
    if (faceStatus === "error") {
      setError("Por favor sube una foto con un rostro visible");
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
          <div className={`relative aspect-square max-w-[200px] mx-auto rounded-lg overflow-hidden border-2 ${
            faceStatus === "valid" ? "border-green-500" :
            faceStatus === "warning" ? "border-yellow-500" :
            faceStatus === "error" ? "border-destructive" :
            "border-primary"
          }`}>
            <Image
              src={data.photoPreview}
              alt="Preview"
              fill
              className="object-cover"
            />
            {validating && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm">Validando...</p>
                </div>
              </div>
            )}
          </div>

          {/* Face Detection Status */}
          {!validating && faceStatus !== "none" && (
            <div className={`text-center text-sm ${
              faceStatus === "valid" ? "text-green-600" :
              faceStatus === "warning" ? "text-yellow-600" :
              "text-destructive"
            }`}>
              {faceStatus === "valid" && "Rostro detectado correctamente"}
              {faceStatus === "warning" && warning}
              {faceStatus === "error" && error}
            </div>
          )}

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

      {error && faceStatus !== "error" && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Atrás
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1"
          disabled={validating || faceStatus === "error"}
        >
          {validating ? "Validando..." : "Continuar"}
        </Button>
      </div>
    </div>
  );
}
