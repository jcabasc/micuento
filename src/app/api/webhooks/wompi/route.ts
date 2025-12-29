import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  WompiWebhookEvent,
  verifyWebhookSignature,
  mapWompiStatus,
} from "@/services/wompi";
import {
  sendOrderConfirmationEmail,
  sendPaymentFailedEmail,
} from "@/services/email";
import { env } from "@/lib/env";

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
      include: {
        story: {
          select: { title: true, slug: true },
        },
      },
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

    // Send emails based on status
    if (paymentStatus === "APPROVED") {
      await sendOrderConfirmationEmail({
        to: order.userEmail,
        childName: order.childName,
        storyTitle: order.story.title,
        orderId: order.id,
        totalAmount: order.totalAmount,
        orderStatusUrl: `${env.appUrl}/orders/${order.id}/status`,
      });
    } else if (paymentStatus === "DECLINED" || paymentStatus === "ERROR") {
      await sendPaymentFailedEmail({
        to: order.userEmail,
        childName: order.childName,
        storyTitle: order.story.title,
        orderId: order.id,
        retryUrl: `${env.appUrl}/stories/${order.story.slug}/personalize`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
