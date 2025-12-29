import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateReference,
  createIntegritySignature,
} from "@/services/wompi";
import { env } from "@/lib/env";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storyId,
      childName,
      childAge,
      childPhotoBase64,
      userEmail,
    } = body;

    // Validate required fields
    if (!storyId || !childName || !childAge || !childPhotoBase64 || !userEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get story details
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { id: true, price: true, title: true, slug: true },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    // Generate Wompi reference
    const wompiReference = generateReference();

    // Create order
    const order = await prisma.order.create({
      data: {
        storyId,
        childName,
        childAge: parseInt(childAge, 10),
        childPhotoUrl: `data:image/jpeg;base64,${childPhotoBase64}`,
        userEmail,
        totalAmount: story.price,
        wompiReference,
        status: "PENDING",
        paymentStatus: "PENDING",
      },
    });

    // Generate integrity signature for Wompi widget
    const integritySignature = createIntegritySignature(
      wompiReference,
      story.price,
      "COP"
    );

    return NextResponse.json({
      orderId: order.id,
      wompiReference,
      amountInCents: story.price,
      currency: "COP",
      publicKey: env.wompiPublicKey,
      integritySignature,
      redirectUrl: `${env.appUrl}/orders/${order.id}/confirmation`,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create order" },
      { status: 500 }
    );
  }
}
