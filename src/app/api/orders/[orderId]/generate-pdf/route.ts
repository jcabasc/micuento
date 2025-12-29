import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateStoryPDF,
  personalizeText,
  StoryPageData,
} from "@/services/pdf-generator";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    // Fetch order with story pages and generated book
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
        generatedBook: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.generatedBook) {
      return NextResponse.json(
        { error: "Order has not been processed yet" },
        { status: 400 }
      );
    }

    const previewImages = order.generatedBook.previewImages;

    if (previewImages.length === 0) {
      return NextResponse.json(
        { error: "No processed images found" },
        { status: 400 }
      );
    }

    // Build page data with personalized text
    const pages: StoryPageData[] = order.story.pages.map((page, index) => ({
      pageNumber: page.pageNumber,
      imageBase64: previewImages[index] || previewImages[0], // Fallback to first image if missing
      text: personalizeText(page.textTemplate, order.childName),
    }));

    // Generate PDF
    const pdfBuffer = await generateStoryPDF({
      storyTitle: order.story.title,
      childName: order.childName,
      childAge: order.childAge,
      coverImageBase64: previewImages[0], // Use first processed image as cover
      pages,
      dedication: `Con amor para ${order.childName}, ${order.childAge} años.`,
    });

    // Return PDF as download
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${order.story.slug}-${order.childName}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "PDF generation failed" },
      { status: 500 }
    );
  }
}

// GET endpoint to check if PDF is available
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        status: true,
        generatedBook: {
          select: {
            pdfUrl: true,
            previewImages: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      canGenerate: order.status === "COMPLETED" && (order.generatedBook?.previewImages?.length ?? 0) > 0,
      hasPdf: !!order.generatedBook?.pdfUrl,
      pdfUrl: order.generatedBook?.pdfUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to check PDF status" },
      { status: 500 }
    );
  }
}
