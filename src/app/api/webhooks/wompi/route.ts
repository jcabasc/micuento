import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  WompiWebhookEvent,
  verifyWebhookSignature,
  mapWompiStatus,
} from "@/services/wompi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = body as WompiWebhookEvent;

    // Verify webhook signature
    if (!verifyWebhookSignature(event)) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Only process transaction events
    if (event.event !== "transaction.updated") {
      return NextResponse.json({ message: "Event ignored" });
    }

    const transaction = event.data.transaction;
    const reference = transaction.reference;

    // Find the order by Wompi reference
    const order = await prisma.order.findUnique({
      where: { wompiReference: reference },
    });

    if (!order) {
      console.error(`Order not found for reference: ${reference}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Map Wompi status to our payment status
    const paymentStatus = mapWompiStatus(transaction.status);

    // Update order payment status
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus,
        wompiTransactionId: transaction.id,
      },
    });

    console.log(
      `Order ${order.id} payment status updated to ${paymentStatus}`
    );

    // If payment approved, trigger processing (optional - can be manual)
    // This could also be done asynchronously via a queue

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
