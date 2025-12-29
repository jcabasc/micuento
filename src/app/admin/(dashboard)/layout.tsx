import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "./logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-bold text-xl text-primary">
              MiCuento Admin
            </Link>
            <nav className="flex gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  Dashboard
                </Button>
              </Link>
              <Link href="/admin/stories">
                <Button variant="ghost" size="sm">
                  Historias
                </Button>
              </Link>
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm">
                  Pedidos
                </Button>
              </Link>
              <Link href="/admin/faceswap-test">
                <Button variant="ghost" size="sm">
                  Face-Swap Test
                </Button>
              </Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
