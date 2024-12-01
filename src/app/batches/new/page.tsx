'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IngredientInput } from "@/components/IngredientInput";
import type { IngredientType } from '@/lib/models/Ingredient';

interface Ingredient {
  name: string;
  grams: number;
  cups: number;
  liters: number;
}

interface BatchIngredients {
  dry: Ingredient[];
  wet: Ingredient[];
  stabilizers: Ingredient[];
  ice: Ingredient[];
}

export default function NewBatchPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState<BatchIngredients>({
    dry: [],
    wet: [],
    stabilizers: [],
    ice: [],
  });
  const [notes, setNotes] = useState<string[]>([]);
  const [currentNote, setCurrentNote] = useState('');

  const addIngredient = (type: keyof BatchIngredients) => {
    setIngredients(prev => ({
      ...prev,
      [type]: [...prev[type], { name: '', grams: 0, cups: 0, liters: 0 }]
    }));
  };

  const updateIngredient = (
    type: keyof BatchIngredients,
    index: number,
    newValues: Ingredient
  ) => {
    const newIngredients = { ...ingredients };
    newIngredients[type][index] = newValues;
    setIngredients(newIngredients);
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setCurrentNote(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNote();
    }
  };

  const addNote = () => {
    if (currentNote.trim()) {
      setNotes([...notes, currentNote.trim()]);
      setCurrentNote('');
    }
  };

  const saveBatch = async () => {
    try {
      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          dryIngredients: ingredients.dry,
          wetIngredients: ingredients.wet,
          stabilizers: ingredients.stabilizers,
          ice: ingredients.ice,
          notes: notes.map(content => ({ content })),
        }),
      });

      if (!response.ok) throw new Error('Failed to save batch');
      
      const batch = await response.json();
      router.push(`/batches/${batch._id}`);
    } catch (error) {
      console.error('Failed to save batch:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Batch Name"
              className="text-xl font-bold"
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(Object.entries(ingredients) as [keyof BatchIngredients, Ingredient[]][]).map(([type, items]) => (
            <div key={type} className="mb-8">
              <h3 className="text-lg font-semibold mb-4 capitalize">
                {type} Ingredients
              </h3>
              {items.map((item: Ingredient, index: number) => (
                <IngredientInput
                  key={index}
                  type={type as IngredientType}
                  value={item}
                  onChange={(newValues) => updateIngredient(type, index, newValues)}
                />
              ))}
              <Button
                onClick={() => addIngredient(type)}
                variant="outline"
                className="mt-2"
              >
                Add {type} Ingredient
              </Button>
            </div>
          ))}

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Notes</h3>
            <div className="flex gap-2 mb-4">
              <Input
                value={currentNote}
                onChange={handleNoteChange}
                onKeyDown={handleKeyDown}
                placeholder="Add a note"
              />
              <Button onClick={addNote}>Add Note</Button>
            </div>
            {notes.map((note, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded mb-2">
                {note}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.push('/')}>
              Cancel
            </Button>
            <Button onClick={saveBatch}>Save Batch</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 