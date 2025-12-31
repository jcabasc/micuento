"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface GeneratedResult {
  images: string[];
  processingTime?: number;
}

export default function CharacterGeneratorPage() {
  const [subjectPreview, setSubjectPreview] = useState<string | null>(null);
  const [subjectBase64, setSubjectBase64] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState(
    "blurry, low quality, distorted face, multiple people, adults"
  );
  const [numberOfOutputs, setNumberOfOutputs] = useState(1);
  const [randomisePoses, setRandomisePoses] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GeneratedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Scene prompts for batch generation
  const [scenePrompts, setScenePrompts] = useState<string[]>([""]);
  const [batchResults, setBatchResults] = useState<GeneratedResult[]>([]);
  const [batchMode, setBatchMode] = useState(false);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);

  const subjectInputRef = useRef<HTMLInputElement>(null);

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

  async function handleSubjectChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setSubjectPreview(preview);

    const base64 = await fileToBase64(file);
    setSubjectBase64(base64);
    setResults(null);
    setBatchResults([]);
    setError(null);
  }

  async function generateSingle() {
    if (!subjectBase64 || !prompt.trim()) {
      setError("Please upload a reference image and enter a prompt");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch("/api/admin/character-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subjectBase64,
          prompt: prompt.trim(),
          negativePrompt,
          numberOfOutputs,
          randomisePoses,
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

  async function generateBatch() {
    if (!subjectBase64) {
      setError("Please upload a reference image");
      return;
    }

    const validPrompts = scenePrompts.filter((p) => p.trim());
    if (validPrompts.length === 0) {
      setError("Please add at least one scene prompt");
      return;
    }

    setLoading(true);
    setError(null);
    setBatchResults([]);
    setCurrentBatchIndex(0);

    const newResults: GeneratedResult[] = [];

    for (let i = 0; i < validPrompts.length; i++) {
      setCurrentBatchIndex(i + 1);

      try {
        const response = await fetch("/api/admin/character-generator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject: subjectBase64,
            prompt: validPrompts[i].trim(),
            negativePrompt,
            numberOfOutputs: 1,
            randomisePoses,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          newResults.push({
            images: [],
            processingTime: 0,
          });
          continue;
        }

        const data = await response.json();
        newResults.push(data);
      } catch {
        newResults.push({
          images: [],
          processingTime: 0,
        });
      }
    }

    setBatchResults(newResults);
    setLoading(false);
  }

  function addScenePrompt() {
    setScenePrompts([...scenePrompts, ""]);
  }

  function updateScenePrompt(index: number, value: string) {
    const updated = [...scenePrompts];
    updated[index] = value;
    setScenePrompts(updated);
  }

  function removeScenePrompt(index: number) {
    if (scenePrompts.length > 1) {
      setScenePrompts(scenePrompts.filter((_, i) => i !== index));
    }
  }

  function resetAll() {
    setSubjectPreview(null);
    setSubjectBase64(null);
    setPrompt("");
    setResults(null);
    setBatchResults([]);
    setError(null);
    setScenePrompts([""]);
    if (subjectInputRef.current) subjectInputRef.current.value = "";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Character Generator</h1>
        <p className="text-muted-foreground">
          Generate story pages with consistent character using Segmind
        </p>
      </div>

      {/* Reference Character Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reference Character</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Upload your character reference image</Label>
            <input
              ref={subjectInputRef}
              id="subject"
              type="file"
              accept="image/*"
              onChange={handleSubjectChange}
              className="block w-full text-sm text-muted-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90"
            />
            <p className="text-xs text-muted-foreground">
              Upload a clear image of your character that will be used as reference
            </p>
          </div>
          {subjectPreview && (
            <div className="relative w-48 h-48 mx-auto rounded-lg overflow-hidden bg-muted">
              <Image
                src={subjectPreview}
                alt="Reference character"
                fill
                className="object-cover"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mode Toggle */}
      <div className="flex gap-4">
        <Button
          variant={!batchMode ? "default" : "outline"}
          onClick={() => setBatchMode(false)}
        >
          Single Generation
        </Button>
        <Button
          variant={batchMode ? "default" : "outline"}
          onClick={() => setBatchMode(true)}
        >
          Batch Generation (Story Pages)
        </Button>
      </div>

      {/* Single Mode */}
      {!batchMode && (
        <Card>
          <CardHeader>
            <CardTitle>Scene Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Describe the scene</Label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., child standing in magical forest, looking at glowing butterfly, children's book illustration style"
                className="w-full min-h-[100px] px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="negative">Negative Prompt</Label>
              <Input
                id="negative"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="What to avoid..."
              />
            </div>

            <div className="space-y-2">
              <Label>Number of Variations: {numberOfOutputs}</Label>
              <Slider
                value={[numberOfOutputs]}
                onValueChange={(value) => setNumberOfOutputs(value[0])}
                min={1}
                max={4}
                step={1}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="randomPoses"
                checked={randomisePoses}
                onChange={(e) => setRandomisePoses(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="randomPoses">Randomize poses</Label>
            </div>

            <Button
              onClick={generateSingle}
              disabled={!subjectBase64 || !prompt.trim() || loading}
              className="w-full"
            >
              {loading ? "Generating..." : "Generate Scene"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Batch Mode */}
      {batchMode && (
        <Card>
          <CardHeader>
            <CardTitle>Story Scene Prompts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add prompts for each page of your story. The same character will appear in all scenes.
            </p>

            {scenePrompts.map((scenePrompt, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">Page {index + 1}</Label>
                  <textarea
                    value={scenePrompt}
                    onChange={(e) => updateScenePrompt(index, e.target.value)}
                    placeholder={`Scene ${index + 1} description...`}
                    className="w-full min-h-[80px] px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
                {scenePrompts.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeScenePrompt(index)}
                    className="mt-6"
                  >
                    ✕
                  </Button>
                )}
              </div>
            ))}

            <Button variant="outline" onClick={addScenePrompt} className="w-full">
              + Add Another Page
            </Button>

            <div className="space-y-2">
              <Label htmlFor="batchNegative">Negative Prompt (applies to all)</Label>
              <Input
                id="batchNegative"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
              />
            </div>

            <Button
              onClick={generateBatch}
              disabled={!subjectBase64 || loading}
              className="w-full"
            >
              {loading
                ? `Generating Page ${currentBatchIndex}/${scenePrompts.filter((p) => p.trim()).length}...`
                : `Generate All Pages (${scenePrompts.filter((p) => p.trim()).length})`}
            </Button>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {/* Single Results */}
      {results && results.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Images ({results.images.length})</span>
              {results.processingTime && (
                <span className="text-sm font-normal text-muted-foreground">
                  {(results.processingTime / 1000).toFixed(2)}s
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {results.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                >
                  <Image
                    src={`data:image/jpeg;base64,${img}`}
                    alt={`Generated ${idx + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Batch Results */}
      {batchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Story Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {batchResults.map((result, idx) => (
                <div key={idx} className="space-y-2">
                  <p className="text-sm font-medium">Page {idx + 1}</p>
                  {result.images.length > 0 ? (
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={`data:image/jpeg;base64,${result.images[0]}`}
                        alt={`Page ${idx + 1}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[3/4] rounded-lg bg-destructive/10 flex items-center justify-center">
                      <span className="text-xs text-destructive">Failed</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reset Button */}
      <Button variant="outline" onClick={resetAll} className="w-full">
        Reset All
      </Button>

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How to Use</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>1. Upload Reference:</strong> Upload a clear image of your character
            (can be AI-generated or illustrated)
          </p>
          <p>
            <strong>2. Single Mode:</strong> Test individual scene generations to fine-tune prompts
          </p>
          <p>
            <strong>3. Batch Mode:</strong> Generate all pages of a story at once with the same character
          </p>
          <p>
            <strong>Tips:</strong>
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Use clear, front-facing reference images for best results</li>
            <li>Include style keywords in prompts (e.g., &quot;children&apos;s book illustration&quot;)</li>
            <li>Generated images can be used as face-swap templates</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
