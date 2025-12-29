/**
 * Client-side face detection utility
 * Uses browser's FaceDetector API where available
 */

interface FaceDetectionResult {
  hasFace: boolean;
  faceCount: number;
  confidence: "high" | "medium" | "low";
  message: string;
}

/**
 * Check if browser supports Face Detection API
 */
export function isFaceDetectionSupported(): boolean {
  return typeof window !== "undefined" && "FaceDetector" in window;
}

/**
 * Detect faces in an image using browser's FaceDetector API
 */
export async function detectFaces(
  imageSource: HTMLImageElement | ImageBitmap | HTMLCanvasElement
): Promise<FaceDetectionResult> {
  // Check browser support
  if (!isFaceDetectionSupported()) {
    return {
      hasFace: true, // Assume true if API not supported
      faceCount: 0,
      confidence: "low",
      message: "Face detection not supported in this browser",
    };
  }

  try {
    // @ts-expect-error - FaceDetector is experimental
    const detector = new FaceDetector({
      fastMode: true,
      maxDetectedFaces: 5,
    });

    const faces = await detector.detect(imageSource);

    if (faces.length === 0) {
      return {
        hasFace: false,
        faceCount: 0,
        confidence: "high",
        message: "No se detectó ningún rostro en la imagen",
      };
    }

    if (faces.length > 1) {
      return {
        hasFace: true,
        faceCount: faces.length,
        confidence: "medium",
        message: `Se detectaron ${faces.length} rostros. Usa una foto con solo el rostro del niño.`,
      };
    }

    return {
      hasFace: true,
      faceCount: 1,
      confidence: "high",
      message: "Rostro detectado correctamente",
    };
  } catch {
    return {
      hasFace: true, // Assume true on error
      faceCount: 0,
      confidence: "low",
      message: "No se pudo validar la imagen",
    };
  }
}

/**
 * Load an image from a data URL and detect faces
 */
export async function detectFacesFromDataUrl(
  dataUrl: string
): Promise<FaceDetectionResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = async () => {
      const result = await detectFaces(img);
      resolve(result);
    };
    img.onerror = () => {
      resolve({
        hasFace: true,
        faceCount: 0,
        confidence: "low",
        message: "Error al cargar la imagen",
      });
    };
    img.src = dataUrl;
  });
}

/**
 * Validate image dimensions for face swap
 */
export function validateImageDimensions(
  width: number,
  height: number
): { valid: boolean; message: string } {
  const minSize = 200;
  const maxSize = 4096;

  if (width < minSize || height < minSize) {
    return {
      valid: false,
      message: `La imagen es muy pequeña. Mínimo ${minSize}x${minSize} píxeles.`,
    };
  }

  if (width > maxSize || height > maxSize) {
    return {
      valid: false,
      message: `La imagen es muy grande. Máximo ${maxSize}x${maxSize} píxeles.`,
    };
  }

  return { valid: true, message: "Dimensiones válidas" };
}
