import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
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
        generatedBook: {
          select: {
            previewImages: true,
            pdfUrl: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const processedPages = order.generatedBook?.previewImages?.length ?? 0;
    const totalPages = order.story.pageCount;

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      childName: order.childName,
      storyTitle: order.story.title,
      progress: {
        processedPages,
        totalPages,
        percentage: totalPages > 0 ? Math.round((processedPages / totalPages) * 100) : 0,
      },
      hasPreview: processedPages > 0,
      pdfUrl: order.generatedBook?.pdfUrl ?? null,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: "Failed to get status" },
      { status: 500 }
    );
  }
}
