"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  orderId: string;
  orderStatus: string;
  paymentStatus: string;
  hasProcessedImages: boolean;
}

export function OrderActions({
  orderId,
  orderStatus,
  paymentStatus,
  hasProcessedImages,
}: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleProcess() {
    setLoading("process");
    setMessage(null);

    try {
      const response = await fetch(`/api/orders/${orderId}/process`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: `Procesado: ${data.processedPages}/${data.totalPages} páginas`,
        });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ type: "error", text: data.error || "Error al procesar" });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setLoading(null);
    }
  }

  async function handleGeneratePdf() {
    setLoading("pdf");
    setMessage(null);

    try {
      const response = await fetch(`/api/orders/${orderId}/generate-pdf`, {
        method: "POST",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `order-${orderId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        setMessage({ type: "success", text: "PDF descargado" });
      } else {
        const data = await response.json();
        setMessage({ type: "error", text: data.error || "Error al generar PDF" });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setLoading(null);
    }
  }

  async function handleUpdateStatus(newStatus: string) {
    setLoading(newStatus);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setMessage({ type: "success", text: `Estado actualizado a ${newStatus}` });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const data = await response.json();
        setMessage({ type: "error", text: data.error || "Error al actualizar" });
      }
    } catch {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      {/* Process Button */}
      {paymentStatus === "APPROVED" && orderStatus !== "COMPLETED" && (
        <Button
          className="w-full"
          onClick={handleProcess}
          disabled={loading === "process"}
        >
          {loading === "process" ? "Procesando..." : "Procesar Face-Swap"}
        </Button>
      )}

      {/* Generate PDF */}
      {hasProcessedImages && (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGeneratePdf}
          disabled={loading === "pdf"}
        >
          {loading === "pdf" ? "Generando..." : "Descargar PDF"}
        </Button>
      )}

      {/* Status Updates */}
      <div className="pt-3 border-t space-y-2">
        <p className="text-sm text-muted-foreground">Cambiar estado:</p>
        <div className="grid grid-cols-2 gap-2">
          {orderStatus !== "COMPLETED" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUpdateStatus("COMPLETED")}
              disabled={loading === "COMPLETED"}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              Completar
            </Button>
          )}
          {orderStatus !== "CANCELLED" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUpdateStatus("CANCELLED")}
              disabled={loading === "CANCELLED"}
              className="text-gray-600 border-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </Button>
          )}
          {orderStatus === "FAILED" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleUpdateStatus("PENDING")}
              disabled={loading === "PENDING"}
            >
              Reintentar
            </Button>
          )}
        </div>
      </div>

      {/* View Customer Page */}
      <div className="pt-3 border-t">
        <a
          href={`/orders/${orderId}/status`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          Ver página del cliente →
        </a>
      </div>

      {/* Message */}
      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
