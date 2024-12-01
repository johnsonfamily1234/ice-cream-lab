'use client';

import { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import type { IngredientType } from '@/lib/models/Ingredient';

interface IngredientInputProps {
  type: IngredientType;
  value: {
    name: string;
    grams: number;
    cups: number;
    liters: number;
  };
  onChange: (value: { name: string; grams: number; cups: number; liters: number }) => void;
}

const CONVERSIONS = {
  grams: {
    toCups: (grams: number) => Number((grams * 0.00422675).toFixed(3)),
    toLiters: (grams: number) => Number((grams * 0.001).toFixed(3)),
  },
  cups: {
    toGrams: (cups: number) => Number((cups * 236.588).toFixed(3)),
    toLiters: (cups: number) => Number((cups * 0.236588).toFixed(3)),
  },
  liters: {
    toGrams: (liters: number) => Number((liters * 1000).toFixed(3)),
    toCups: (liters: number) => Number((liters * 4.22675).toFixed(3)),
  },
};

export function IngredientInput({ type, value, onChange }: IngredientInputProps) {
  const [suggestions, setSuggestions] = useState<Array<{ value: string; label: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isIce = type === 'ice';

  const loadSuggestions = useCallback(async (search?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams({ type });
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/ingredients?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ingredients');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setSuggestions(data.map((ing: { name: string }) => ({
          value: ing.name,
          label: ing.name,
        })));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
      setError(error instanceof Error ? error.message : 'Failed to load suggestions');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSuggestions(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, loadSuggestions]);

  const handleMeasurementChange = (
    field: 'grams' | 'cups' | 'liters',
    newValue: number
  ) => {
    if (isIce) {
      // For ice, only update the specified field and liters (if cups were changed)
      const updatedValues = { ...value, [field]: newValue };
      if (field === 'cups') {
        updatedValues.liters = CONVERSIONS.cups.toLiters(newValue);
      }
      onChange(updatedValues);
      return;
    }

    // For non-ice ingredients, update all measurements
    const updatedValues = { ...value, [field]: newValue };

    switch (field) {
      case 'grams':
        updatedValues.cups = CONVERSIONS.grams.toCups(newValue);
        updatedValues.liters = CONVERSIONS.grams.toLiters(newValue);
        break;
      case 'cups':
        updatedValues.grams = CONVERSIONS.cups.toGrams(newValue);
        updatedValues.liters = CONVERSIONS.cups.toLiters(newValue);
        break;
      case 'liters':
        updatedValues.grams = CONVERSIONS.liters.toGrams(newValue);
        updatedValues.cups = CONVERSIONS.liters.toCups(newValue);
        break;
    }

    onChange(updatedValues);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div className="col-span-2 md:col-span-1">
        <Label>Name</Label>
        <Combobox
          options={suggestions}
          value={value.name}
          onSelect={(name) => onChange({ ...value, name })}
          onCreateNew={(name) => onChange({ ...value, name })}
          placeholder={isLoading ? "Loading..." : error ? "Error loading ingredients" : "Select or type..."}
          emptyText={error || "No ingredients found"}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>
      {!isIce && (
        <div>
          <Label>Grams</Label>
          <Input
            type="number"
            value={value.grams || ''}
            onChange={(e) => handleMeasurementChange('grams', Number(e.target.value))}
            placeholder="0"
            step="0.001"
          />
        </div>
      )}
      <div>
        <Label>{isIce ? "Cups (volume)" : "Cups"}</Label>
        <Input
          type="number"
          value={value.cups || ''}
          onChange={(e) => handleMeasurementChange('cups', Number(e.target.value))}
          placeholder="0"
          step="0.001"
        />
      </div>
      <div>
        <Label>{isIce ? "Liters (auto)" : "Liters"}</Label>
        <Input
          type="number"
          value={value.liters || ''}
          onChange={(e) => handleMeasurementChange('liters', Number(e.target.value))}
          placeholder="0"
          step="0.001"
          readOnly={isIce}
          className={isIce ? "bg-gray-50" : ""}
        />
      </div>
    </div>
  );
} 