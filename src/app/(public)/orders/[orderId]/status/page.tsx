import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { OrderProgress } from "./order-progress";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ orderId: string }>;
}

export default async function OrderStatusPage({ params }: Props) {
  const { orderId } = await params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      status: true,
      childName: true,
      story: {
        select: {
          title: true,
          pageCount: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-lg">
        <OrderProgress
          orderId={order.id}
          initialStatus={order.status}
          childName={order.childName}
          storyTitle={order.story.title}
          totalPages={order.story.pageCount}
        />
      </div>
    </div>
  );
}
