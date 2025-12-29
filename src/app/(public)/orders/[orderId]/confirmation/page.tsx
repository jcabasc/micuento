import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTransactionByReference } from "@/services/wompi";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ orderId: string }>;
}

export default async function ConfirmationPage({ params }: Props) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      story: {
        select: { title: true, slug: true },
      },
    },
  });

  if (!order) {
    notFound();
  }

  // Check payment status with Wompi if we have a reference
  if (order.wompiReference && order.paymentStatus === "PENDING") {
    const transaction = await getTransactionByReference(order.wompiReference);

    if (transaction && transaction.status !== "PENDING") {
      // Update order with transaction info
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: transaction.status,
          wompiTransactionId: transaction.id,
        },
      });

      // Refresh order data
      order.paymentStatus = transaction.status;
      order.wompiTransactionId = transaction.id;
    }
  }

  // Redirect to status page for tracking
  if (order.paymentStatus === "APPROVED") {
    redirect(`/orders/${orderId}/status`);
  }

  const statusConfig: Record<string, { icon: string; title: string; message: string }> = {
    PENDING: {
      icon: "⏳",
      title: "Pago pendiente",
      message: "Tu pago está siendo procesado. Te notificaremos cuando se confirme.",
    },
    APPROVED: {
      icon: "✅",
      title: "¡Pago confirmado!",
      message: "Tu pedido está siendo procesado.",
    },
    DECLINED: {
      icon: "❌",
      title: "Pago rechazado",
      message: "Tu pago fue rechazado. Por favor intenta con otro método de pago.",
    },
    VOIDED: {
      icon: "🚫",
      title: "Pago anulado",
      message: "El pago fue anulado.",
    },
    ERROR: {
      icon: "⚠️",
      title: "Error en el pago",
      message: "Hubo un error procesando tu pago. Por favor intenta de nuevo.",
    },
  };

  const config = statusConfig[order.paymentStatus] || statusConfig.ERROR;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="text-6xl mb-4">{config.icon}</div>
            <CardTitle>{config.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">{config.message}</p>

            {/* Order Details */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cuento:</span>
                <span className="font-medium">{order.story.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Para:</span>
                <span className="font-medium">{order.childName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{order.userEmail}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold">
                  ${(order.totalAmount / 100).toLocaleString("es-CO")} COP
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {(order.paymentStatus === "DECLINED" || order.paymentStatus === "ERROR") && (
                <Button className="w-full" asChild>
                  <Link href={`/stories/${order.story.slug}/personalize`}>
                    Intentar de nuevo
                  </Link>
                </Button>
              )}

              <Button variant="outline" className="w-full" asChild>
                <Link href="/">Volver al inicio</Link>
              </Button>
            </div>

            {/* Reference */}
            <p className="text-xs text-center text-muted-foreground">
              ID del pedido: {orderId}
              {order.wompiReference && (
                <>
                  <br />
                  Referencia: {order.wompiReference}
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
