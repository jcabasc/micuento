import { env } from "@/lib/env";

const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";

// Face swap model on Replicate (lucataco/faceswap)
const FACE_SWAP_MODEL = "lucataco/faceswap:9a4298548422074c3f57258c5d544497314ae4112df80d116f0d2109e843d20d";

export interface ReplicateFaceSwapOptions {
  sourceImage: string; // base64 or URL
  targetImage: string; // base64 or URL
}

export interface ReplicateFaceSwapResult {
  image: string; // URL to result image
  processingTime?: number;
}

/**
 * Check if Replicate is configured
 */
export function isReplicateConfigured(): boolean {
  return !!env.replicateApiKey;
}

/**
 * Convert base64 to data URL if needed
 */
function toDataUrl(image: string): string {
  if (image.startsWith("data:") || image.startsWith("http")) {
    return image;
  }
  // Assume it's base64, add data URL prefix
  return `data:image/jpeg;base64,${image}`;
}

/**
 * Perform face swap using Replicate API
 */
export async function replicateFaceSwap(
  options: ReplicateFaceSwapOptions
): Promise<ReplicateFaceSwapResult> {
  if (!isReplicateConfigured()) {
    throw new Error("Replicate API key not configured");
  }

  const startTime = Date.now();

  // Create prediction
  const createResponse = await fetch(REPLICATE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.replicateApiKey}`,
    },
    body: JSON.stringify({
      version: FACE_SWAP_MODEL.split(":")[1],
      input: {
        swap_image: toDataUrl(options.sourceImage),
        target_image: toDataUrl(options.targetImage),
      },
    }),
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    throw new Error(`Replicate create failed: ${createResponse.status} - ${error}`);
  }

  const prediction = await createResponse.json();
  const predictionId = prediction.id;

  // Poll for completion
  const maxAttempts = 60; // 60 attempts * 2 seconds = 2 minutes max
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

    const statusResponse = await fetch(`${REPLICATE_API_URL}/${predictionId}`, {
      headers: {
        Authorization: `Bearer ${env.replicateApiKey}`,
      },
    });

    if (!statusResponse.ok) {
      throw new Error(`Replicate status check failed: ${statusResponse.status}`);
    }

    const status = await statusResponse.json();

    if (status.status === "succeeded") {
      const outputUrl = Array.isArray(status.output) ? status.output[0] : status.output;

      return {
        image: outputUrl,
        processingTime: Date.now() - startTime,
      };
    }

    if (status.status === "failed") {
      throw new Error(`Replicate processing failed: ${status.error || "Unknown error"}`);
    }

    if (status.status === "canceled") {
      throw new Error("Replicate processing was canceled");
    }

    // Continue polling if status is "starting" or "processing"
  }

  throw new Error("Replicate processing timed out");
}

/**
 * Download image from URL and convert to base64
 */
export async function downloadImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}
