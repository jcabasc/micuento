export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

export function generateMetadata() {
  return {
    title: "Admin - MiCuento",
  };
}
