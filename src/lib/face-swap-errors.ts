/**
 * Face-swap error types and handling utilities
 */

export enum FaceSwapErrorCode {
  NO_FACE_DETECTED = "NO_FACE_DETECTED",
  MULTIPLE_FACES = "MULTIPLE_FACES",
  IMAGE_TOO_SMALL = "IMAGE_TOO_SMALL",
  IMAGE_TOO_LARGE = "IMAGE_TOO_LARGE",
  INVALID_IMAGE_FORMAT = "INVALID_IMAGE_FORMAT",
  API_RATE_LIMIT = "API_RATE_LIMIT",
  API_QUOTA_EXCEEDED = "API_QUOTA_EXCEEDED",
  API_TIMEOUT = "API_TIMEOUT",
  API_SERVER_ERROR = "API_SERVER_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface FaceSwapError {
  code: FaceSwapErrorCode;
  message: string;
  userMessage: string;
  retryable: boolean;
  pageNumber?: number;
  timestamp: string;
  originalError?: string;
}

/**
 * Parse Segmind API error response and return structured error
 */
export function parseSegmindError(
  error: unknown,
  pageNumber?: number
): FaceSwapError {
  const timestamp = new Date().toISOString();
  const originalError = error instanceof Error ? error.message : String(error);

  // Check for common error patterns
  if (originalError.includes("No face detected") || originalError.includes("no face")) {
    return {
      code: FaceSwapErrorCode.NO_FACE_DETECTED,
      message: "No face detected in the image",
      userMessage: "No pudimos detectar un rostro en la imagen. Por favor usa una foto con el rostro claramente visible.",
      retryable: false,
      pageNumber,
      timestamp,
      originalError,
    };
  }

  if (originalError.includes("multiple faces") || originalError.includes("More than one face")) {
    return {
      code: FaceSwapErrorCode.MULTIPLE_FACES,
      message: "Multiple faces detected",
      userMessage: "Se detectaron múltiples rostros. Por favor usa una foto con solo un rostro.",
      retryable: false,
      pageNumber,
      timestamp,
      originalError,
    };
  }

  if (originalError.includes("too small") || originalError.includes("resolution")) {
    return {
      code: FaceSwapErrorCode.IMAGE_TOO_SMALL,
      message: "Image resolution too small",
      userMessage: "La imagen es muy pequeña. Por favor usa una foto de mayor resolución.",
      retryable: false,
      pageNumber,
      timestamp,
      originalError,
    };
  }

  if (originalError.includes("too large") || originalError.includes("size limit")) {
    return {
      code: FaceSwapErrorCode.IMAGE_TOO_LARGE,
      message: "Image too large",
      userMessage: "La imagen es muy grande. Por favor usa una imagen más pequeña.",
      retryable: false,
      pageNumber,
      timestamp,
      originalError,
    };
  }

  if (originalError.includes("rate limit") || originalError.includes("429")) {
    return {
      code: FaceSwapErrorCode.API_RATE_LIMIT,
      message: "API rate limit exceeded",
      userMessage: "Demasiadas solicitudes. Intentando de nuevo en unos segundos...",
      retryable: true,
      pageNumber,
      timestamp,
      originalError,
    };
  }

  if (originalError.includes("quota") || originalError.includes("credit")) {
    return {
      code: FaceSwapErrorCode.API_QUOTA_EXCEEDED,
      message: "API quota exceeded",
      userMessage: "Servicio temporalmente no disponible. Por favor intenta más tarde.",
      retryable: false,
      pageNumber,
      timestamp,
      originalError,
    };
  }

  if (originalError.includes("timeout") || originalError.includes("ETIMEDOUT")) {
    return {
      code: FaceSwapErrorCode.API_TIMEOUT,
      message: "Request timeout",
      userMessage: "La solicitud tardó demasiado. Reintentando...",
      retryable: true,
      pageNumber,
      timestamp,
      originalError,
    };
  }

  if (originalError.includes("500") || originalError.includes("502") || originalError.includes("503")) {
    return {
      code: FaceSwapErrorCode.API_SERVER_ERROR,
      message: "API server error",
      userMessage: "Error del servidor. Reintentando...",
      retryable: true,
      pageNumber,
      timestamp,
      originalError,
    };
  }

  if (originalError.includes("fetch") || originalError.includes("network") || originalError.includes("ECONNREFUSED")) {
    return {
      code: FaceSwapErrorCode.NETWORK_ERROR,
      message: "Network error",
      userMessage: "Error de conexión. Reintentando...",
      retryable: true,
      pageNumber,
      timestamp,
      originalError,
    };
  }

  // Unknown error
  return {
    code: FaceSwapErrorCode.UNKNOWN_ERROR,
    message: "Unknown error occurred",
    userMessage: "Ocurrió un error inesperado. Nuestro equipo ha sido notificado.",
    retryable: true,
    pageNumber,
    timestamp,
    originalError,
  };
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: FaceSwapError): boolean {
  return error.retryable;
}

/**
 * Get delay for retry based on error type
 */
export function getRetryDelay(error: FaceSwapError, attempt: number): number {
  const baseDelay = 1000; // 1 second

  switch (error.code) {
    case FaceSwapErrorCode.API_RATE_LIMIT:
      // Exponential backoff for rate limits
      return Math.min(baseDelay * Math.pow(2, attempt), 30000);
    case FaceSwapErrorCode.API_TIMEOUT:
    case FaceSwapErrorCode.NETWORK_ERROR:
      // Linear backoff for timeouts
      return baseDelay * (attempt + 1);
    case FaceSwapErrorCode.API_SERVER_ERROR:
      // Longer delay for server errors
      return baseDelay * 2 * (attempt + 1);
    default:
      return baseDelay;
  }
}

/**
 * Format errors for storage in database
 */
export function formatErrorsForStorage(errors: FaceSwapError[]): object[] {
  return errors.map((e) => ({
    code: e.code,
    message: e.message,
    pageNumber: e.pageNumber,
    timestamp: e.timestamp,
  }));
}
