"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  orderId: string;
  orderStatus: string;
}

export function ProcessButton({ orderId, orderStatus }: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Don't show button if already completed
  if (orderStatus === "COMPLETED") {
    return null;
  }

  async function handleProcess() {
    setLoading(true);
    setResult(null);

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
        window.location.reload();
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
  );
}
