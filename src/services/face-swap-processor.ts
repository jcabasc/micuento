import { faceSwapV4 } from "./segmind";

export interface PageProcessingResult {
  pageNumber: number;
  success: boolean;
  processedImage?: string; // base64 encoded
  error?: string;
  processingTime?: number;
}

export interface StoryProcessingResult {
  orderId: string;
  success: boolean;
  totalPages: number;
  processedPages: number;
  failedPages: number;
  results: PageProcessingResult[];
  totalProcessingTime: number;
}

export interface StoryPage {
  id: string;
  pageNumber: number;
  imageTemplate: string;
  textTemplate: string;
}

export type ProgressCallback = (
  currentPage: number,
  totalPages: number,
  status: "processing" | "completed" | "failed"
) => void;

/**
 * Convert image URL to base64
 */
async function imageUrlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return base64;
}

/**
 * Process a single story page with face-swap
 */
async function processPage(
  page: StoryPage,
  childPhotoBase64: string
): Promise<PageProcessingResult> {
  const startTime = Date.now();

  try {
    // Convert template image URL to base64 if it's a URL
    let targetImage = page.imageTemplate;
    if (page.imageTemplate.startsWith("http")) {
      targetImage = await imageUrlToBase64(page.imageTemplate);
    }

    // Perform face-swap using V4 (better for illustrations)
    const result = await faceSwapV4({
      sourceImage: childPhotoBase64,
      targetImage: targetImage,
      modelType: "quality", // Use quality mode for final output
      swapType: "face",
      styleType: "style", // Better for cartoon/illustration style
    });

    return {
      pageNumber: page.pageNumber,
      success: true,
      processedImage: result.image,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      pageNumber: page.pageNumber,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      processingTime: Date.now() - startTime,
    };
  }
}

/**
 * Process all pages of a story with the child's face
 */
export async function processStoryPages(
  orderId: string,
  pages: StoryPage[],
  childPhotoBase64: string,
  onProgress?: ProgressCallback
): Promise<StoryProcessingResult> {
  const startTime = Date.now();
  const results: PageProcessingResult[] = [];

  // Sort pages by page number
  const sortedPages = [...pages].sort((a, b) => a.pageNumber - b.pageNumber);

  for (let i = 0; i < sortedPages.length; i++) {
    const page = sortedPages[i];

    // Notify progress
    onProgress?.(i + 1, sortedPages.length, "processing");

    // Process the page
    const result = await processPage(page, childPhotoBase64);
    results.push(result);

    // Notify completion of this page
    onProgress?.(
      i + 1,
      sortedPages.length,
      result.success ? "completed" : "failed"
    );
  }

  const processedPages = results.filter((r) => r.success).length;
  const failedPages = results.filter((r) => !r.success).length;

  return {
    orderId,
    success: failedPages === 0,
    totalPages: sortedPages.length,
    processedPages,
    failedPages,
    results,
    totalProcessingTime: Date.now() - startTime,
  };
}

/**
 * Process pages in parallel (faster but uses more API quota)
 */
export async function processStoryPagesParallel(
  orderId: string,
  pages: StoryPage[],
  childPhotoBase64: string,
  maxConcurrent: number = 3
): Promise<StoryProcessingResult> {
  const startTime = Date.now();
  const sortedPages = [...pages].sort((a, b) => a.pageNumber - b.pageNumber);

  // Process in batches
  const results: PageProcessingResult[] = [];

  for (let i = 0; i < sortedPages.length; i += maxConcurrent) {
    const batch = sortedPages.slice(i, i + maxConcurrent);
    const batchResults = await Promise.all(
      batch.map((page) => processPage(page, childPhotoBase64))
    );
    results.push(...batchResults);
  }

  // Sort results by page number
  results.sort((a, b) => a.pageNumber - b.pageNumber);

  const processedPages = results.filter((r) => r.success).length;
  const failedPages = results.filter((r) => !r.success).length;

  return {
    orderId,
    success: failedPages === 0,
    totalPages: sortedPages.length,
    processedPages,
    failedPages,
    results,
    totalProcessingTime: Date.now() - startTime,
  };
}
