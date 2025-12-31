import { NextRequest, NextResponse } from "next/server";
import { generateConsistentCharacter } from "@/services/segmind";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      subject,
      prompt,
      negativePrompt,
      seed,
      randomisePoses,
      numberOfOutputs,
    } = body;

    if (!subject || !prompt) {
      return NextResponse.json(
        { error: "Subject image and prompt are required" },
        { status: 400 }
      );
    }

    const result = await generateConsistentCharacter({
      subject,
      prompt,
      negativePrompt,
      seed,
      randomisePoses,
      numberOfOutputs,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Character generator error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
