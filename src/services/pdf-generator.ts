import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
  renderToBuffer,
} from "@react-pdf/renderer";

// Register fonts (optional - using default for now)
// Font.register({ family: 'Custom', src: '/path/to/font.ttf' });

// Styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 0,
  },
  coverPage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF7ED", // Warm background
    padding: 40,
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#EA580C", // Primary orange
    textAlign: "center",
    marginBottom: 20,
  },
  coverSubtitle: {
    fontSize: 18,
    color: "#78716C",
    textAlign: "center",
    marginBottom: 40,
  },
  coverImage: {
    width: 300,
    height: 300,
    objectFit: "contain",
    marginBottom: 30,
  },
  coverChildName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#292524",
    textAlign: "center",
  },
  storyPage: {
    flex: 1,
    position: "relative",
  },
  storyImage: {
    width: "100%",
    height: "70%",
    objectFit: "contain",
  },
  storyTextContainer: {
    padding: 30,
    flex: 1,
    justifyContent: "center",
  },
  storyText: {
    fontSize: 16,
    lineHeight: 1.6,
    color: "#292524",
    textAlign: "center",
  },
  pageNumber: {
    position: "absolute",
    bottom: 20,
    right: 30,
    fontSize: 12,
    color: "#A8A29E",
  },
  backCover: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    padding: 40,
  },
  backCoverText: {
    fontSize: 14,
    color: "#78716C",
    textAlign: "center",
    marginBottom: 20,
  },
  backCoverLogo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#EA580C",
  },
  dedication: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#78716C",
    textAlign: "center",
    marginTop: 20,
    padding: 20,
  },
});

// Types
export interface StoryPageData {
  pageNumber: number;
  imageBase64: string; // Processed image with face-swap
  text: string; // Text with {child_name} already replaced
}

export interface PDFGenerationOptions {
  storyTitle: string;
  childName: string;
  childAge: number;
  coverImageBase64?: string;
  pages: StoryPageData[];
  dedication?: string;
}

// Cover Page Component
function CoverPage({
  title,
  childName,
  coverImage,
}: {
  title: string;
  childName: string;
  coverImage?: string;
}) {
  return React.createElement(
    Page,
    { size: "A4", style: styles.page },
    React.createElement(
      View,
      { style: styles.coverPage },
      React.createElement(Text, { style: styles.coverTitle }, title),
      React.createElement(
        Text,
        { style: styles.coverSubtitle },
        "Un cuento personalizado para"
      ),
      coverImage &&
        React.createElement(Image, {
          style: styles.coverImage,
          src: `data:image/jpeg;base64,${coverImage}`,
        }),
      React.createElement(Text, { style: styles.coverChildName }, childName)
    )
  );
}

// Story Page Component
function StoryPage({
  pageData,
  totalPages,
}: {
  pageData: StoryPageData;
  totalPages: number;
}) {
  return React.createElement(
    Page,
    { size: "A4", style: styles.page },
    React.createElement(
      View,
      { style: styles.storyPage },
      React.createElement(Image, {
        style: styles.storyImage,
        src: `data:image/jpeg;base64,${pageData.imageBase64}`,
      }),
      React.createElement(
        View,
        { style: styles.storyTextContainer },
        React.createElement(Text, { style: styles.storyText }, pageData.text)
      ),
      React.createElement(
        Text,
        { style: styles.pageNumber },
        `${pageData.pageNumber} / ${totalPages}`
      )
    )
  );
}

// Back Cover Component
function BackCover({ dedication }: { dedication?: string }) {
  return React.createElement(
    Page,
    { size: "A4", style: styles.page },
    React.createElement(
      View,
      { style: styles.backCover },
      React.createElement(
        Text,
        { style: styles.backCoverText },
        "Este libro fue creado con amor especialmente para ti."
      ),
      dedication &&
        React.createElement(Text, { style: styles.dedication }, dedication),
      React.createElement(
        Text,
        { style: styles.backCoverText },
        "Gracias por ser parte de esta aventura."
      ),
      React.createElement(Text, { style: styles.backCoverLogo }, "MiCuento")
    )
  );
}

// Main Document Component
function StoryBookDocument(options: PDFGenerationOptions) {
  const children = [
    // Cover
    React.createElement(CoverPage, {
      key: "cover",
      title: options.storyTitle,
      childName: options.childName,
      coverImage: options.coverImageBase64,
    }),
    // Story Pages
    ...options.pages.map((pageData) =>
      React.createElement(StoryPage, {
        key: `page-${pageData.pageNumber}`,
        pageData,
        totalPages: options.pages.length,
      })
    ),
    // Back Cover
    React.createElement(BackCover, { key: "back", dedication: options.dedication }),
  ];

  return React.createElement(
    Document,
    {
      title: options.storyTitle,
      author: "MiCuento",
      subject: `Cuento personalizado para ${options.childName}`,
    },
    ...children
  );
}

/**
 * Replace {child_name} tokens in text with actual child name
 */
export function personalizeText(text: string, childName: string): string {
  return text.replace(/\{child_name\}/gi, childName);
}

/**
 * Generate PDF buffer from story data
 */
export async function generateStoryPDF(
  options: PDFGenerationOptions
): Promise<Buffer> {
  const doc = StoryBookDocument(options);
  const buffer = await renderToBuffer(doc as React.ReactElement);
  return buffer;
}

/**
 * Generate PDF and return as base64 string
 */
export async function generateStoryPDFBase64(
  options: PDFGenerationOptions
): Promise<string> {
  const buffer = await generateStoryPDF(options);
  return buffer.toString("base64");
}
