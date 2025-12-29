import { env } from "@/lib/env";

const SEGMIND_V3_URL = "https://api.segmind.com/v1/faceswap-v3";
const SEGMIND_V4_URL = "https://api.segmind.com/v1/faceswap-v4";

// ============ Common Types ============

export interface FaceSwapResult {
  image: string; // base64 encoded result
  version: "v3" | "v4";
  processingTime?: number;
}

// ============ V3 Types ============

export interface FaceSwapV3Options {
  sourceImage: string; // base64 or URL
  targetImage: string; // base64 or URL
  inputFacesIndex?: string; // default "0"
  sourceFacesIndex?: string; // default "0"
  faceRestore?: "codeformer-v0.1.0.pth" | "GFPGANv1.4.pth" | "GFPGANv1.3.pth";
  faceRestoreWeight?: number; // 0-1, default 0.75
  detectionFaceOrder?: "large-small" | "small-large" | "top-bottom" | "bottom-top" | "left-right" | "right-left";
  faceDetectionModel?: "retinaface_resnet50" | "retinaface_mobile0.25" | "YOLOv5l" | "YOLOv5n";
  imageFormat?: "jpeg" | "png" | "webp";
  imageQuality?: number; // 10-100
}

// ============ V4 Types ============

export interface FaceSwapV4Options {
  sourceImage: string; // base64 or URL
  targetImage: string; // base64 or URL
  modelType?: "speed" | "quality";
  swapType?: "head" | "face";
  styleType?: "normal" | "style";
  seed?: number;
  imageFormat?: "jpeg" | "png" | "webp";
  imageQuality?: number; // 10-100
}

// ============ V3 Implementation ============

export async function faceSwapV3(
  options: FaceSwapV3Options
): Promise<FaceSwapResult> {
  const startTime = Date.now();

  const response = await fetch(SEGMIND_V3_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.segmindApiKey,
    },
    body: JSON.stringify({
      source_img: options.sourceImage,
      target_img: options.targetImage,
      input_faces_index: options.inputFacesIndex ?? "0",
      source_faces_index: options.sourceFacesIndex ?? "0",
      face_restore: options.faceRestore ?? "codeformer-v0.1.0.pth",
      face_restore_weight: options.faceRestoreWeight ?? 0.75,
      detection_face_order: options.detectionFaceOrder ?? "large-small",
      facedetection: options.faceDetectionModel ?? "retinaface_resnet50",
      image_format: options.imageFormat ?? "jpeg",
      image_quality: options.imageQuality ?? 95,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Segmind V3 failed: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const processingTime = Date.now() - startTime;

  return {
    image: data.image,
    version: "v3",
    processingTime,
  };
}

// ============ V4 Implementation ============

export async function faceSwapV4(
  options: FaceSwapV4Options
): Promise<FaceSwapResult> {
  const startTime = Date.now();

  const response = await fetch(SEGMIND_V4_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.segmindApiKey,
    },
    body: JSON.stringify({
      source_image: options.sourceImage,
      target_image: options.targetImage,
      model_type: options.modelType ?? "speed",
      swap_type: options.swapType ?? "face",
      style_type: options.styleType ?? "normal",
      seed: options.seed ?? 42,
      image_format: options.imageFormat ?? "jpeg",
      image_quality: options.imageQuality ?? 90,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Segmind V4 failed: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const processingTime = Date.now() - startTime;

  return {
    image: data.image,
    version: "v4",
    processingTime,
  };
}

// ============ Compare Both Versions ============

export interface CompareResult {
  v3: FaceSwapResult | { error: string };
  v4: FaceSwapResult | { error: string };
}

export async function compareFaceSwap(
  sourceImage: string,
  targetImage: string
): Promise<CompareResult> {
  const [v3Result, v4Result] = await Promise.allSettled([
    faceSwapV3({ sourceImage, targetImage }),
    faceSwapV4({ sourceImage, targetImage }),
  ]);

  return {
    v3:
      v3Result.status === "fulfilled"
        ? v3Result.value
        : { error: v3Result.reason?.message || "V3 failed" },
    v4:
      v4Result.status === "fulfilled"
        ? v4Result.value
        : { error: v4Result.reason?.message || "V4 failed" },
  };
}
