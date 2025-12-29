"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalizationData {
  childName: string;
  childAge: number;
  photoFile: File | null;
  photoPreview: string | null;
}

interface Props {
  data: PersonalizationData;
  updateData: (updates: Partial<PersonalizationData>) => void;
  onNext: () => void;
}

export function ChildInfoStep({ data, updateData, onNext }: Props) {
  const [errors, setErrors] = useState<{ name?: string; age?: string }>({});

  function validate(): boolean {
    const newErrors: { name?: string; age?: string } = {};

    if (!data.childName.trim()) {
      newErrors.name = "El nombre es requerido";
    } else if (data.childName.trim().length < 2) {
      newErrors.name = "El nombre debe tener al menos 2 caracteres";
    }

    if (!data.childAge || data.childAge < 1) {
      newErrors.age = "Selecciona una edad válida";
    } else if (data.childAge > 12) {
      newErrors.age = "La edad debe ser entre 1 y 12 años";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      onNext();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold">¿Cómo se llama el héroe?</h2>
        <p className="text-muted-foreground">
          Este nombre aparecerá en todo el cuento
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="childName">Nombre del niño/a</Label>
          <Input
            id="childName"
            value={data.childName}
            onChange={(e) => updateData({ childName: e.target.value })}
            placeholder="Ej: Sofía"
            className="text-lg"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="childAge">Edad</Label>
          <select
            id="childAge"
            value={data.childAge || ""}
            onChange={(e) => updateData({ childAge: parseInt(e.target.value) })}
            className="w-full h-10 px-3 border rounded-md bg-background"
          >
            <option value="">Selecciona la edad</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((age) => (
              <option key={age} value={age}>
                {age} {age === 1 ? "año" : "años"}
              </option>
            ))}
          </select>
          {errors.age && (
            <p className="text-sm text-destructive">{errors.age}</p>
          )}
        </div>
      </div>

      <Button type="submit" className="w-full">
        Continuar
      </Button>
    </form>
  );
}
