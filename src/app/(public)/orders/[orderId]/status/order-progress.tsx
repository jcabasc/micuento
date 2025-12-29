"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  orderId: string;
  initialStatus: string;
  childName: string;
  storyTitle: string;
  totalPages: number;
}

interface StatusData {
  status: string;
  progress: {
    processedPages: number;
    totalPages: number;
    percentage: number;
  };
  pdfUrl: string | null;
}

export function OrderProgress({
  orderId,
  initialStatus,
  childName,
  storyTitle,
  totalPages,
}: Props) {
  const [status, setStatus] = useState<StatusData>({
    status: initialStatus,
    progress: {
      processedPages: 0,
      totalPages,
      percentage: 0,
    },
    pdfUrl: null,
  });
  const [polling, setPolling] = useState(
    initialStatus === "PROCESSING" || initialStatus === "PENDING"
  );

  useEffect(() => {
    if (!polling) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}/status`);
        if (response.ok) {
          const data = await response.json();
          setStatus(data);

          // Stop polling when completed or failed
          if (data.status === "COMPLETED" || data.status === "FAILED") {
            setPolling(false);
          }
        }
      } catch {
        // Ignore errors, keep polling
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [orderId, polling]);

  const statusConfig: Record<
    string,
    { icon: string; title: string; description: string; color: string }
  > = {
    PENDING: {
      icon: "⏳",
      title: "Esperando pago",
      description: "Tu pedido está pendiente de pago",
      color: "text-yellow-600",
    },
    PROCESSING: {
      icon: "✨",
      title: "Creando tu cuento mágico",
      description: `Estamos personalizando las ilustraciones con el rostro de ${childName}`,
      color: "text-blue-600",
    },
    COMPLETED: {
      icon: "🎉",
      title: "¡Tu cuento está listo!",
      description: "Ya puedes descargar tu cuento personalizado",
      color: "text-green-600",
    },
    FAILED: {
      icon: "😢",
      title: "Hubo un problema",
      description: "No pudimos procesar tu pedido. Nuestro equipo lo revisará.",
      color: "text-red-600",
    },
  };

  const currentConfig = statusConfig[status.status] || statusConfig.PENDING;

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="text-6xl mb-4">{currentConfig.icon}</div>
        <CardTitle className={`text-2xl ${currentConfig.color}`}>
          {currentConfig.title}
        </CardTitle>
        <p className="text-muted-foreground">{currentConfig.description}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order Info */}
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="font-medium">{storyTitle}</p>
          <p className="text-sm text-muted-foreground">
            Personalizado para {childName}
          </p>
        </div>

        {/* Progress Bar */}
        {status.status === "PROCESSING" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Procesando ilustraciones</span>
              <span>
                {status.progress.processedPages}/{status.progress.totalPages}
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                style={{ width: `${status.progress.percentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {status.progress.percentage}% completado
            </p>

            {/* Processing Animation */}
            <div className="flex justify-center gap-1 py-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-3 h-3 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Actions */}
        {status.status === "COMPLETED" && (
          <div className="space-y-3">
            {status.pdfUrl && (
              <Button className="w-full" asChild>
                <a href={status.pdfUrl} download>
                  Descargar PDF
                </a>
              </Button>
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">Crear otro cuento</Link>
            </Button>
          </div>
        )}

        {/* Failed Actions */}
        {status.status === "FAILED" && (
          <div className="space-y-3">
            <p className="text-sm text-center text-muted-foreground">
              Nos contactaremos contigo por email para resolver el problema.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/">Volver al inicio</Link>
            </Button>
          </div>
        )}

        {/* Order ID */}
        <p className="text-xs text-center text-muted-foreground">
          ID del pedido: {orderId}
        </p>
      </CardContent>
    </Card>
  );
}
