import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { ProcessButton } from "./process-button";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      story: {
        select: { title: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground">
          Gestiona los pedidos de los clientes
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No hay pedidos aún</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {order.childName} ({order.childAge} años)
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {order.story.title}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <StatusBadge status={order.status} />
                    <PaymentBadge status={order.paymentStatus} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">{order.userEmail}</p>
                    <p className="text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                  <p className="font-medium">{formatPrice(order.totalAmount)}</p>
                </div>
                <ProcessButton orderId={order.id} orderStatus={order.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-100 text-gray-800",
  };

  const labels: Record<string, string> = {
    PENDING: "Pendiente",
    PROCESSING: "Procesando",
    COMPLETED: "Completado",
    FAILED: "Fallido",
    CANCELLED: "Cancelado",
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    DECLINED: "bg-red-100 text-red-800",
    VOIDED: "bg-gray-100 text-gray-800",
    ERROR: "bg-red-100 text-red-800",
  };

  const labels: Record<string, string> = {
    PENDING: "Pago pendiente",
    APPROVED: "Pagado",
    DECLINED: "Rechazado",
    VOIDED: "Anulado",
    ERROR: "Error",
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}
