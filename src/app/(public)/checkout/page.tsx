"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CheckoutData {
  orderId: string;
  wompiReference: string;
  amountInCents: number;
  currency: string;
  publicKey: string;
  integritySignature: string;
  redirectUrl: string;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [widgetReady, setWidgetReady] = useState(false);

  // Get order data from URL params (passed from personalization flow)
  const storyId = searchParams.get("storyId");
  const childName = searchParams.get("childName");
  const childAge = searchParams.get("childAge");
  const email = searchParams.get("email");

  useEffect(() => {
    // Get photo from sessionStorage (stored during personalization)
    const photoBase64 = sessionStorage.getItem("childPhotoBase64");

    if (!storyId || !childName || !childAge || !email || !photoBase64) {
      setError("Faltan datos del pedido. Por favor vuelve a personalizar tu cuento.");
      setLoading(false);
      return;
    }

    // Create order
    async function createOrder() {
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            storyId,
            childName,
            childAge,
            childPhotoBase64: photoBase64,
            userEmail: email,
          }),
        });

        if (!response.ok) {
          throw new Error("Error al crear el pedido");
        }

        const data = await response.json();
        setCheckoutData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }

    createOrder();
  }, [storyId, childName, childAge, email]);

  // Open Wompi widget when ready
  function openWompiWidget() {
    if (!checkoutData || !widgetReady) return;

    // @ts-expect-error - Wompi widget is loaded via script
    const checkout = new WidgetCheckout({
      currency: checkoutData.currency,
      amountInCents: checkoutData.amountInCents,
      reference: checkoutData.wompiReference,
      publicKey: checkoutData.publicKey,
      redirectUrl: checkoutData.redirectUrl,
      "signature:integrity": checkoutData.integritySignature,
    });

    checkout.open((result: { transaction?: { status: string } }) => {
      const transaction = result.transaction;
      if (transaction?.status === "APPROVED") {
        window.location.href = checkoutData.redirectUrl;
      }
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Preparando tu pedido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-md">
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-4xl mb-4">😢</div>
              <p className="text-destructive mb-4">{error}</p>
              <Button asChild>
                <Link href="/">Volver al inicio</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Wompi Widget Script */}
      <Script
        src="https://checkout.wompi.co/widget.js"
        onLoad={() => setWidgetReady(true)}
      />

      <div className="min-h-screen py-12 px-4">
        <div className="container mx-auto max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Completa tu pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Summary */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cuento para:</span>
                  <span className="font-medium">{childName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-bold text-lg">
                    ${((checkoutData?.amountInCents || 0) / 100).toLocaleString("es-CO")} COP
                  </span>
                </div>
              </div>

              {/* Payment Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={openWompiWidget}
                disabled={!widgetReady}
              >
                {widgetReady ? "Pagar ahora" : "Cargando..."}
              </Button>

              {/* Payment Methods Info */}
              <div className="text-center text-sm text-muted-foreground">
                <p>Pago seguro con Wompi</p>
                <p className="mt-1">Tarjetas de crédito/débito, PSE, Nequi</p>
              </div>

              {/* Reference */}
              {checkoutData && (
                <p className="text-xs text-center text-muted-foreground">
                  Referencia: {checkoutData.wompiReference}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
