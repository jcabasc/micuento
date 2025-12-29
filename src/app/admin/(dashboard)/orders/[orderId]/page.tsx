import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { OrderActions } from "./order-actions";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ orderId: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      story: {
        select: { id: true, title: true, slug: true, pageCount: true },
      },
      generatedBook: {
        select: {
          id: true,
          previewImages: true,
          pdfUrl: true,
          processingErrors: true,
          lastError: true,
          retryCount: true,
          createdAt: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-100 text-gray-800",
  };

  const paymentColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    DECLINED: "bg-red-100 text-red-800",
    VOIDED: "bg-gray-100 text-gray-800",
    ERROR: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="text-sm text-muted-foreground hover:text-foreground mb-2 inline-block"
          >
            ← Volver a pedidos
          </Link>
          <h1 className="text-2xl font-bold">Pedido #{orderId.slice(-8)}</h1>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColors[order.status]}`}>
            {order.status}
          </span>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${paymentColors[order.paymentStatus]}`}>
            {order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Información del cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre del niño</p>
                  <p className="font-medium">{order.childName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Edad</p>
                  <p className="font-medium">{order.childAge} años</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{order.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cuento</p>
                  <p className="font-medium">{order.story.title}</p>
                </div>
              </div>

              {/* Child Photo */}
              {order.childPhotoUrl && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Foto del niño</p>
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={order.childPhotoUrl}
                      alt={order.childName}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processed Images */}
          {order.generatedBook && order.generatedBook.previewImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Imágenes procesadas ({order.generatedBook.previewImages.length}/{order.story.pageCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {order.generatedBook.previewImages.slice(0, 6).map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={`data:image/jpeg;base64,${img}`}
                        alt={`Page ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                {order.generatedBook.previewImages.length > 6 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    +{order.generatedBook.previewImages.length - 6} más
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Errors */}
          {order.generatedBook?.lastError && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Errores de procesamiento</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.generatedBook.lastError}</p>
                {order.generatedBook.retryCount > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Intentos: {order.generatedBook.retryCount}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-bold">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Referencia Wompi</span>
                <span className="font-mono">{order.wompiReference || "N/A"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Creado</span>
                <span>{new Date(order.createdAt).toLocaleString("es-CO")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Actualizado</span>
                <span>{new Date(order.updatedAt).toLocaleString("es-CO")}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderActions
                orderId={order.id}
                orderStatus={order.status}
                paymentStatus={order.paymentStatus}
                hasProcessedImages={(order.generatedBook?.previewImages?.length ?? 0) > 0}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
