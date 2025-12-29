"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/utils";

interface Story {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  price: number;
  pageCount: number;
}

interface PersonalizationData {
  childName: string;
  childAge: number;
  photoFile: File | null;
  photoPreview: string | null;
}

interface Props {
  story: Story;
  data: PersonalizationData;
  onBack: () => void;
}

export function PreviewStep({ story, data, onBack }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleCheckout() {
    if (!validateEmail(email)) {
      setError("Por favor ingresa un email válido");
      return;
    }

    if (!data.photoPreview) {
      setError("No se encontró la foto. Por favor vuelve al paso anterior.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Store photo in sessionStorage for checkout page
      const photoBase64 = data.photoPreview.split(",")[1]; // Remove data URL prefix
      sessionStorage.setItem("childPhotoBase64", photoBase64);

      // Redirect to checkout with order data
      const params = new URLSearchParams({
        storyId: story.id,
        childName: data.childName,
        childAge: data.childAge.toString(),
        email: email,
      });

      router.push(`/checkout?${params.toString()}`);
    } catch {
      setError("Error al procesar. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">Revisa tu pedido</h2>
        <p className="text-muted-foreground">
          Confirma los detalles antes de continuar
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <div className="flex gap-4">
          {/* Story Cover */}
          <div className="w-20 h-28 relative bg-muted rounded overflow-hidden flex-shrink-0">
            {story.coverImage && story.coverImage !== "/placeholder-cover.jpg" ? (
              <Image
                src={story.coverImage}
                alt={story.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">📖</span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1">
            <h3 className="font-semibold">{story.title}</h3>
            <p className="text-sm text-muted-foreground">
              {story.pageCount} páginas
            </p>
            <p className="text-lg font-bold text-primary mt-2">
              {formatPrice(story.price)}
            </p>
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Nombre del niño:</span>
            <span className="font-medium">{data.childName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Edad:</span>
            <span className="font-medium">{data.childAge} años</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <span className="text-muted-foreground">Foto:</span>
            {data.photoPreview && (
              <div className="w-10 h-10 relative rounded-full overflow-hidden">
                <Image
                  src={data.photoPreview}
                  alt="Foto del niño"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Input */}
      <div className="space-y-2">
        <Label htmlFor="email">Email para recibir tu libro</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
        />
        <p className="text-xs text-muted-foreground">
          Recibirás el libro digital y confirmación del pedido en este email
        </p>
      </div>

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Atrás
        </Button>
        <Button
          onClick={handleCheckout}
          className="flex-1"
          disabled={loading}
        >
          {loading ? "Procesando..." : `Pagar ${formatPrice(story.price)}`}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Al continuar aceptas nuestros términos y condiciones
      </p>
    </div>
  );
}
