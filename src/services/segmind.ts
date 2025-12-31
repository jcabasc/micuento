import { env } from "@/lib/env";

const SEGMIND_V3_URL = "https://api.segmind.com/v1/faceswap-v3";
const SEGMIND_V4_URL = "https://api.segmind.com/v1/faceswap-v4";
const SEGMIND_COMIC_URL = "https://api.segmind.com/v1/faceswap-comic";
const SEGMIND_CONSISTENT_CHARACTER_URL = "https://api.segmind.com/v1/consistent-character";

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

  // Segmind returns the image as binary data
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = buffer.toString("base64");

  const processingTime = Date.now() - startTime;

  return {
    image: base64Image,
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
      swap_type: options.swapType ?? "head", // Changed from "face" to "head" for better neck/body blending
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

  // Segmind returns the image as binary data
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = buffer.toString("base64");

  const processingTime = Date.now() - startTime;

  return {
    image: base64Image,
    version: "v4",
    processingTime,
  };
}

// ============ Comic Types ============

export interface FaceSwapComicOptions {
  sourceImage: string; // base64 or URL
  targetImage: string; // base64 or URL
  prompt?: string; // Guide facial expressions/moods
  seed?: number; // Default 63255
  maskImage?: string; // Controls face swap region
  faceStrength?: number; // 0-1, default 0.8
  styleStrength?: number; // 0-2, default 0.8
  steps?: number; // 1-50, default 10
  cfg?: number; // 0.1-10, default 1.6
  outputFormat?: "jpeg" | "png" | "webp";
  outputQuality?: number; // 1-100
}

// ============ Comic Implementation ============

export async function faceSwapComic(
  options: FaceSwapComicOptions
): Promise<FaceSwapResult> {
  const startTime = Date.now();

  // Build request body, only include mask_image if provided
  const requestBody: Record<string, unknown> = {
    source_image: options.sourceImage,
    target_image: options.targetImage,
    prompt: options.prompt ?? "",
    seed: options.seed ?? 63255,
    face_strength: options.faceStrength ?? 0.8,
    style_strength: options.styleStrength ?? 0.8,
    steps: options.steps ?? 10,
    cfg: options.cfg ?? 1.6,
    output_format: options.outputFormat ?? "jpeg",
    output_quality: options.outputQuality ?? 95,
    base64: false,
  };

  // Only include mask_image if it's actually provided
  if (options.maskImage && options.maskImage.trim() !== "") {
    requestBody.mask_image = options.maskImage;
  }

  const response = await fetch(SEGMIND_COMIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.segmindApiKey,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Segmind Comic failed: ${response.status} - ${error}`);
  }

  // Segmind returns the image as binary data
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = buffer.toString("base64");

  const processingTime = Date.now() - startTime;

  return {
    image: base64Image,
    version: "v4", // Using v4 for consistency in result type
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

// ============ Consistent Character Types ============

export interface ConsistentCharacterOptions {
  subject: string; // base64 or URL of reference character
  prompt: string; // Scene description
  negativePrompt?: string; // What to avoid
  seed?: number;
  outputFormat?: "webp" | "jpg" | "png";
  outputQuality?: number; // 1-100
  randomisePoses?: boolean;
  numberOfOutputs?: number;
  numberOfImagesPerPose?: number;
}

export interface ConsistentCharacterResult {
  images: string[]; // Array of base64 encoded images
  processingTime?: number;
}

// ============ Consistent Character Implementation ============

export async function generateConsistentCharacter(
  options: ConsistentCharacterOptions
): Promise<ConsistentCharacterResult> {
  const startTime = Date.now();

  // Convert base64 to data URI if not already a URL
  let subjectUri = options.subject;
  if (!options.subject.startsWith("http") && !options.subject.startsWith("data:")) {
    subjectUri = `data:image/jpeg;base64,${options.subject}`;
  }

  const response = await fetch(SEGMIND_CONSISTENT_CHARACTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.segmindApiKey,
    },
    body: JSON.stringify({
      subject: subjectUri,
      prompt: options.prompt,
      negative_prompt: options.negativePrompt ?? "blurry, low quality, distorted face, multiple people",
      seed: options.seed,
      output_format: options.outputFormat ?? "jpg",
      output_quality: options.outputQuality ?? 90,
      randomise_poses: options.randomisePoses ?? false,
      number_of_outputs: options.numberOfOutputs ?? 1,
      number_of_images_per_pose: options.numberOfImagesPerPose ?? 1,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Segmind Consistent Character failed: ${response.status} - ${error}`);
  }

  // The API may return multiple images
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    // JSON response with image URLs or base64
    const data = await response.json();
    const processingTime = Date.now() - startTime;

    // Handle various response formats
    if (data.images) {
      return { images: data.images, processingTime };
    } else if (data.image) {
      return { images: [data.image], processingTime };
    } else if (Array.isArray(data)) {
      return { images: data, processingTime };
    }

    throw new Error("Unexpected response format from Consistent Character API");
  } else {
    // Binary response (single image)
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const processingTime = Date.now() - startTime;

    return {
      images: [base64Image],
      processingTime,
    };
  }
}
