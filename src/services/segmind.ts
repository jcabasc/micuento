import { env } from "@/lib/env";

const SEGMIND_API_URL = "https://api.segmind.com/v1/faceswap-v3";

interface FaceSwapParams {
  sourceImage: string; // base64 or URL
  targetImage: string; // base64 or URL
}

interface FaceSwapResponse {
  image: string; // base64 encoded result
}

export async function swapFace(
  params: FaceSwapParams
): Promise<FaceSwapResponse> {
  const response = await fetch(SEGMIND_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.segmindApiKey,
    },
    body: JSON.stringify({
      source_img: params.sourceImage,
      target_img: params.targetImage,
    }),
  });

  if (!response.ok) {
    throw new Error(`Face swap failed: ${response.statusText}`);
  }

  return response.json();
}
