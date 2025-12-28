import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido al panel de administración de MiCuento
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Historias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Gestiona las historias disponibles para personalización
            </p>
            <Link href="/admin/stories">
              <Button className="w-full">Ver Historias</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pedidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Revisa y gestiona los pedidos de los clientes
            </p>
            <Link href="/admin/orders">
              <Button className="w-full" variant="secondary">
                Ver Pedidos
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nueva Historia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Crea una nueva historia personalizable
            </p>
            <Link href="/admin/stories/new">
              <Button className="w-full" variant="outline">
                Crear Historia
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
