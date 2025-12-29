"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface FaceSwapResult {
  image: string;
  version: "v3" | "v4";
  processingTime?: number;
}

interface CompareResult {
  v3: FaceSwapResult | { error: string };
  v4: FaceSwapResult | { error: string };
}

function isError(result: FaceSwapResult | { error: string }): result is { error: string } {
  return "error" in result;
}

export default function FaceSwapTestPage() {
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [targetPreview, setTargetPreview] = useState<string | null>(null);
  const [sourceBase64, setSourceBase64] = useState<string | null>(null);
  const [targetBase64, setTargetBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CompareResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sourceInputRef = useRef<HTMLInputElement>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 string
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSourceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setSourcePreview(preview);

    const base64 = await fileToBase64(file);
    setSourceBase64(base64);
    setResults(null);
    setError(null);
  }

  async function handleTargetChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setTargetPreview(preview);

    const base64 = await fileToBase64(file);
    setTargetBase64(base64);
    setResults(null);
    setError(null);
  }

  async function runComparison() {
    if (!sourceBase64 || !targetBase64) {
      setError("Please upload both images");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("/api/admin/faceswap-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceImage: sourceBase64,
          targetImage: targetBase64,
          version: "both",
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Request failed");
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function resetAll() {
    setSourcePreview(null);
    setTargetPreview(null);
    setSourceBase64(null);
    setTargetBase64(null);
    setResults(null);
    setError(null);
    if (sourceInputRef.current) sourceInputRef.current.value = "";
    if (targetInputRef.current) targetInputRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Face-Swap Test</h1>
        <p className="text-muted-foreground">
          Compare Segmind v3 vs v4 face-swap results
        </p>
      </div>

      {/* Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Source Face</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="source">Upload face photo</Label>
              <input
                ref={sourceInputRef}
                id="source"
                type="file"
                accept="image/*"
                onChange={handleSourceChange}
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90"
              />
            </div>
            {sourcePreview && (
              <div className="relative aspect-square w-full max-w-[200px] mx-auto rounded-lg overflow-hidden bg-muted">
                <Image
                  src={sourcePreview}
                  alt="Source face"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Target Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target">Upload target illustration</Label>
              <input
                ref={targetInputRef}
                id="target"
                type="file"
                accept="image/*"
                onChange={handleTargetChange}
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90"
              />
            </div>
            {targetPreview && (
              <div className="relative aspect-square w-full max-w-[200px] mx-auto rounded-lg overflow-hidden bg-muted">
                <Image
                  src={targetPreview}
                  alt="Target image"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={runComparison}
          disabled={!sourceBase64 || !targetBase64 || loading}
          className="flex-1"
        >
          {loading ? "Processing..." : "Run Comparison"}
        </Button>
        <Button variant="outline" onClick={resetAll}>
          Reset
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {/* Results Section */}
      {results && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* V3 Result */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>V3 Result</span>
                  {!isError(results.v3) && results.v3.processingTime && (
                    <span className="text-sm font-normal text-muted-foreground">
                      {(results.v3.processingTime / 1000).toFixed(2)}s
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isError(results.v3) ? (
                  <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                    {results.v3.error}
                  </div>
                ) : (
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={`data:image/jpeg;base64,${results.v3.image}`}
                      alt="V3 result"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* V4 Result */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>V4 Result</span>
                  {!isError(results.v4) && results.v4.processingTime && (
                    <span className="text-sm font-normal text-muted-foreground">
                      {(results.v4.processingTime / 1000).toFixed(2)}s
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isError(results.v4) ? (
                  <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
                    {results.v4.error}
                  </div>
                ) : (
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={`data:image/jpeg;base64,${results.v4.image}`}
                      alt="V4 result"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Comparison Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comparison Notes</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p><strong>V3:</strong> Uses face detection models (RetinaFace, YOLO) with face restoration (CodeFormer, GFPGAN). Better for realistic photos.</p>
              <p><strong>V4:</strong> Offers speed vs quality modes and head vs face swap options. Better for illustrations/cartoons with style matching.</p>
              <p>Test with different types of target images to determine which works best for your story illustrations.</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
