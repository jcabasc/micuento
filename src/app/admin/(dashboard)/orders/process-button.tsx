"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  orderId: string;
  orderStatus: string;
}

interface ProgressData {
  processedPages: number;
  totalPages: number;
  percentage: number;
}

export function ProcessButton({ orderId, orderStatus }: Props) {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Poll for progress while processing
  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}/status`);
        if (response.ok) {
          const data = await response.json();
          setProgress(data.progress);
        }
      } catch {
        // Ignore errors
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [orderId, loading]);

  // Don't show button if already completed
  if (orderStatus === "COMPLETED") {
    return (
      <Link
        href={`/orders/${orderId}/status`}
        className="text-sm text-primary hover:underline"
      >
        Ver resultado
      </Link>
    );
  }

  async function handleProcess() {
    setLoading(true);
    setResult(null);
    setProgress({ processedPages: 0, totalPages: 0, percentage: 0 });

    try {
      const response = await fetch(`/api/orders/${orderId}/process`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: `Procesado: ${data.processedPages}/${data.totalPages} páginas en ${(data.processingTime / 1000).toFixed(1)}s`,
        });
        // Reload page to update status
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setResult({
          success: false,
          message: data.error || "Error al procesar",
        });
      }
    } catch {
      setResult({
        success: false,
        message: "Error de conexión",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handleProcess}
          disabled={loading || orderStatus === "PROCESSING"}
        >
          {loading ? "Procesando..." : "Procesar Face-Swap"}
        </Button>
        {result && (
          <span
            className={`text-xs ${result.success ? "text-green-600" : "text-red-600"}`}
          >
            {result.message}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {loading && progress && progress.totalPages > 0 && (
        <div className="space-y-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {progress.processedPages}/{progress.totalPages} páginas ({progress.percentage}%)
          </p>
        </div>
      )}
    </div>
  );
}
