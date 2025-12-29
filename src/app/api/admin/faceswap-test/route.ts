import { NextRequest, NextResponse } from "next/server";
import { faceSwapV3, faceSwapV4 } from "@/services/segmind";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceImage, targetImage, version } = body;

    if (!sourceImage || !targetImage) {
      return NextResponse.json(
        { error: "Source and target images are required" },
        { status: 400 }
      );
    }

    if (version === "v3") {
      const result = await faceSwapV3({ sourceImage, targetImage });
      return NextResponse.json(result);
    } else if (version === "v4") {
      const result = await faceSwapV4({ sourceImage, targetImage });
      return NextResponse.json(result);
    } else if (version === "both") {
      const [v3Result, v4Result] = await Promise.allSettled([
        faceSwapV3({ sourceImage, targetImage }),
        faceSwapV4({ sourceImage, targetImage }),
      ]);

      return NextResponse.json({
        v3:
          v3Result.status === "fulfilled"
            ? v3Result.value
            : { error: v3Result.reason?.message || "V3 failed" },
        v4:
          v4Result.status === "fulfilled"
            ? v4Result.value
            : { error: v4Result.reason?.message || "V4 failed" },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid version. Use 'v3', 'v4', or 'both'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Face-swap test error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
