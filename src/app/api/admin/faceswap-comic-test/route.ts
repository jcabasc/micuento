import { NextRequest, NextResponse } from "next/server";
import { faceSwapComic } from "@/services/segmind";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sourceImage,
      targetImage,
      prompt,
      faceStrength,
      styleStrength,
      steps,
      cfg,
    } = body;

    if (!sourceImage || !targetImage) {
      return NextResponse.json(
        { error: "Source and target images are required" },
        { status: 400 }
      );
    }

    const result = await faceSwapComic({
      sourceImage,
      targetImage,
      prompt,
      faceStrength,
      styleStrength,
      steps,
      cfg,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Face-swap comic test error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
