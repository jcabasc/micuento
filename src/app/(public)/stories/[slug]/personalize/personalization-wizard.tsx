"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChildInfoStep } from "./steps/child-info-step";
import { PhotoUploadStep } from "./steps/photo-upload-step";
import { PreviewStep } from "./steps/preview-step";
import { formatPrice } from "@/lib/utils";

interface Story {
  id: string;
  title: string;
  slug: string;
  coverImage: string;
  price: number;
  pageCount: number;
}

interface PersonalizationData {
  childName: string;
  childAge: number;
  photoFile: File | null;
  photoPreview: string | null;
}

const STEPS = [
  { id: 1, title: "Información", description: "Nombre y edad" },
  { id: 2, title: "Foto", description: "Sube una foto" },
  { id: 3, title: "Confirmar", description: "Revisa y paga" },
];

interface Props {
  story: Story;
}

export function PersonalizationWizard({ story }: Props) {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<PersonalizationData>({
    childName: "",
    childAge: 0,
    photoFile: null,
    photoPreview: null,
  });

  function updateData(updates: Partial<PersonalizationData>) {
    setData((prev) => ({ ...prev, ...updates }));
  }

  function nextStep() {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <div className="flex justify-between mb-8">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex-1 flex items-center">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step.id ? "✓" : step.id}
              </div>
              <div className="mt-2 text-center">
                <p className="text-sm font-medium">{step.title}</p>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`h-1 flex-1 mx-2 ${
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <ChildInfoStep
              data={data}
              updateData={updateData}
              onNext={nextStep}
            />
          )}
          {currentStep === 2 && (
            <PhotoUploadStep
              data={data}
              updateData={updateData}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}
          {currentStep === 3 && (
            <PreviewStep
              story={story}
              data={data}
              onBack={prevStep}
            />
          )}
        </CardContent>
      </Card>

      {/* Price Summary */}
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Total: <span className="font-semibold text-foreground">{formatPrice(story.price)}</span>
        </p>
      </div>
    </div>
  );
}
