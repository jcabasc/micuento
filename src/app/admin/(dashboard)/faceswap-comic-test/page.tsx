"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface ComicResult {
  image: string;
  processingTime?: number;
}

export default function FaceSwapComicTestPage() {
  const [sourcePreview, setSourcePreview] = useState<string | null>(null);
  const [targetPreview, setTargetPreview] = useState<string | null>(null);
  const [sourceBase64, setSourceBase64] = useState<string | null>(null);
  const [targetBase64, setTargetBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComicResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Comic-specific parameters
  const [prompt, setPrompt] = useState("");
  const [faceStrength, setFaceStrength] = useState(0.8);
  const [styleStrength, setStyleStrength] = useState(0.8);
  const [steps, setSteps] = useState(10);
  const [cfg, setCfg] = useState(1.6);

  const sourceInputRef = useRef<HTMLInputElement>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
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
    setResult(null);
    setError(null);
  }

  async function handleTargetChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setTargetPreview(preview);

    const base64 = await fileToBase64(file);
    setTargetBase64(base64);
    setResult(null);
    setError(null);
  }

  async function runComicSwap() {
    if (!sourceBase64 || !targetBase64) {
      setError("Please upload both images");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/admin/faceswap-comic-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceImage: sourceBase64,
          targetImage: targetBase64,
          prompt,
          faceStrength,
          styleStrength,
          steps,
          cfg,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Request failed");
      }

      const data = await response.json();
      setResult(data);
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
    setResult(null);
    setError(null);
    setPrompt("");
    setFaceStrength(0.8);
    setStyleStrength(0.8);
    setSteps(10);
    setCfg(1.6);
    if (sourceInputRef.current) sourceInputRef.current.value = "";
    if (targetInputRef.current) targetInputRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Comic Face-Swap Test</h1>
        <p className="text-muted-foreground">
          Test Segmind Comic face-swap for illustration/cartoon style images
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
            <CardTitle className="text-lg">Target Comic/Illustration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target">Upload comic/illustration</Label>
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

      {/* Parameters Section */}
      <Card>
        <CardHeader>
          <CardTitle>Comic Swap Parameters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt (Optional)</Label>
            <Input
              id="prompt"
              type="text"
              placeholder='e.g., "happy", "smiling", "closed eyes"'
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Guide facial expressions or moods
            </p>
          </div>

          {/* Face Strength */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Face Strength: {faceStrength.toFixed(2)}</Label>
            </div>
            <Slider
              value={[faceStrength]}
              onValueChange={(value) => setFaceStrength(value[0])}
              min={0}
              max={1}
              step={0.05}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              How strongly source face characteristics are retained (0-1)
            </p>
          </div>

          {/* Style Strength */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Style Strength: {styleStrength.toFixed(2)}</Label>
            </div>
            <Slider
              value={[styleStrength]}
              onValueChange={(value) => setStyleStrength(value[0])}
              min={0}
              max={2}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Adaptation to target artistic style (0-2)
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Steps: {steps}</Label>
            </div>
            <Slider
              value={[steps]}
              onValueChange={(value) => setSteps(value[0])}
              min={1}
              max={50}
              step={1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Inference iterations for detail enhancement (1-50)
            </p>
          </div>

          {/* CFG */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>CFG: {cfg.toFixed(1)}</Label>
            </div>
            <Slider
              value={[cfg]}
              onValueChange={(value) => setCfg(value[0])}
              min={0.1}
              max={10}
              step={0.1}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Classifier-free guidance for style adherence (0.1-10)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={runComicSwap}
          disabled={!sourceBase64 || !targetBase64 || loading}
          className="w-full"
        >
          {loading ? "Processing..." : "Generate Comic Face-Swap"}
        </Button>
        <Button variant="outline" onClick={resetAll} className="w-full">
          Reset All
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {/* Result Section */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Result</span>
              {result.processingTime && (
                <span className="text-sm font-normal text-muted-foreground">
                  {(result.processingTime / 1000).toFixed(2)}s
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-square w-full max-w-md mx-auto rounded-lg overflow-hidden bg-muted">
              <Image
                src={`data:image/jpeg;base64,${result.image}`}
                alt="Comic swap result"
                fill
                className="object-contain"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About Comic Face-Swap</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Best for:</strong> Comic books, cartoons, illustrations, and
            stylized artwork
          </p>
          <p>
            <strong>Face Strength:</strong> Higher values preserve more of the
            source face features
          </p>
          <p>
            <strong>Style Strength:</strong> Higher values adapt better to the
            target artistic style
          </p>
          <p>
            <strong>Steps:</strong> More steps = higher quality but slower processing
          </p>
          <p>
            <strong>CFG:</strong> Controls how closely the result follows the style
            logic
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
