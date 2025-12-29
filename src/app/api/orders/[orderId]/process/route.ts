import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { processStoryPages, formatErrorsForStorage } from "@/services/face-swap-processor";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    // Fetch order with story pages
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        story: {
          include: {
            pages: {
              orderBy: { pageNumber: "asc" },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Order already processed" },
        { status: 400 }
      );
    }

    if (!order.childPhotoUrl) {
      return NextResponse.json(
        { error: "No child photo found for this order" },
        { status: 400 }
      );
    }

    // Update order status to processing
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PROCESSING" },
    });

    // Convert child photo URL to base64
    let childPhotoBase64: string;
    if (order.childPhotoUrl.startsWith("data:")) {
      // Already base64
      childPhotoBase64 = order.childPhotoUrl.split(",")[1];
    } else {
      // Fetch from URL
      const response = await fetch(order.childPhotoUrl);
      const arrayBuffer = await response.arrayBuffer();
      childPhotoBase64 = Buffer.from(arrayBuffer).toString("base64");
    }

    // Process all story pages
    const result = await processStoryPages(
      orderId,
      order.story.pages,
      childPhotoBase64
    );

    // Extract successful processed images
    const previewImages = result.results
      .filter((r) => r.success && r.processedImage)
      .map((r) => r.processedImage as string);

    // Format errors for storage
    const processingErrors = formatErrorsForStorage(result.errors);
    const lastError = result.errors.length > 0
      ? result.errors[result.errors.length - 1].userMessage
      : null;

    // Create or update generated book with error tracking
    await prisma.generatedBook.upsert({
      where: { orderId },
      create: {
        orderId,
        previewImages,
        processingErrors: processingErrors.length > 0 ? processingErrors : undefined,
        lastError,
      },
      update: {
        previewImages,
        processingErrors: processingErrors.length > 0 ? processingErrors : undefined,
        lastError,
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: result.success ? "COMPLETED" : "FAILED",
      },
    });

    return NextResponse.json({
      success: result.success,
      orderId,
      totalPages: result.totalPages,
      processedPages: result.processedPages,
      failedPages: result.failedPages,
      processingTime: result.totalProcessingTime,
      errors: result.errors.map((e) => ({
        pageNumber: e.pageNumber,
        code: e.code,
        message: e.userMessage,
      })),
    });
  } catch (error) {
    console.error("Order processing error:", error);

    // Try to update order status to failed
    try {
      const { orderId } = await params;
      await prisma.order.update({
        where: { id: orderId },
        data: { status: "FAILED" },
      });
    } catch {
      // Ignore update error
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Processing failed" },
      { status: 500 }
    );
  }
}
