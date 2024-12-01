'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IngredientInput } from "@/components/IngredientInput";
import type { IngredientType } from '@/lib/models/Ingredient';
import type { Batch } from '@/types/batch';
import { Loader2, ChevronLeft, ChevronRight, Bot } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { GenerateVersionDialog } from "@/components/GenerateVersionDialog";
import { BatchGradeDisplay } from "@/components/BatchGrade";

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

export function EditBatchPageContent({ id }: { id: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [ingredients, setIngredients] = useState<BatchIngredients>({
    dry: [],
    wet: [],
    stabilizers: [],
    ice: [],
  });

  const [notes, setNotes] = useState<string[]>([]);
  const [currentNote, setCurrentNote] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [adjacentBatches, setAdjacentBatches] = useState<{
    previousId: string | null;
    nextId: string | null;
  }>({ previousId: null, nextId: null });
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState<Batch['grade']>();

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const response = await fetch(`/api/batches/${id}`);
        if (!response.ok) throw new Error('Failed to fetch batch');
        
        const batch: Batch = await response.json();
        
        setIngredients({
          dry: batch.dryIngredients,
          wet: batch.wetIngredients,
          stabilizers: batch.stabilizers,
          ice: batch.ice,
        });
        
        setNotes(batch.notes.map(note => note.content));
        setIsAiGenerated(batch.isAiGenerated || false);
        setName(batch.name || '');
        setGrade(batch.grade);
      } catch (error) {
        console.error('Failed to fetch batch:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatch();
  }, [id]);

  useEffect(() => {
    const fetchAdjacentBatches = async () => {
      try {
        const response = await fetch(`/api/batches/${id}/adjacent`);
        if (!response.ok) throw new Error('Failed to fetch adjacent batches');
        const data = await response.json();
        setAdjacentBatches(data);
      } catch (error) {
        console.error('Failed to fetch adjacent batches:', error);
      }
    };

    fetchAdjacentBatches();
  }, [id]);

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
      const requestBody = {
        name,
        dryIngredients: ingredients.dry,
        wetIngredients: ingredients.wet,
        stabilizers: ingredients.stabilizers,
        ice: ingredients.ice,
        notes: notes.map(content => ({ content })),
        grade,
      };
      
      console.log('Saving batch with data:', requestBody);

      const response = await fetch(`/api/batches/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error('Failed to save batch');
      
      const savedBatch = await response.json();
      console.log('Saved batch:', savedBatch);
      
      router.push('/');
    } catch (error) {
      console.error('Failed to save batch:', error);
    }
  };

  const generateNewVersion = async (instructions?: string) => {
    try {
      setIsGenerating(true);
      const response = await fetch(`/api/batches/${id}/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ instructions })
      });

      if (!response.ok) throw new Error('Failed to generate suggestion');
      
      const newBatch = await response.json();
      router.push(`/batches/${newBatch._id}`);
    } catch (error) {
      console.error('Failed to generate new version:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const navigateToBatch = (batchId: string) => {
    router.push(`/batches/${batchId}`);
  };

  const deleteBatch = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/batches/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete batch');
      
      router.push('/');
    } catch (error) {
      console.error('Failed to delete batch:', error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const renderNavigationArrows = () => (
    <div className="fixed left-4 right-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
      <Button
        variant="outline"
        size="icon"
        className={`rounded-full w-12 h-12 pointer-events-auto ${!adjacentBatches.previousId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent'}`}
        onClick={() => adjacentBatches.previousId && navigateToBatch(adjacentBatches.previousId)}
        disabled={!adjacentBatches.previousId}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className={`rounded-full w-12 h-12 pointer-events-auto ${!adjacentBatches.nextId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent'}`}
        onClick={() => adjacentBatches.nextId && navigateToBatch(adjacentBatches.nextId)}
        disabled={!adjacentBatches.nextId}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            Loading batch details...
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {renderNavigationArrows()}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Batch Name"
                className="text-xl font-bold"
              />
            </div>
            {isAiGenerated && (
              <div className="flex items-center gap-2 text-blue-500">
                <Bot className="h-5 w-5" />
                <span className="text-sm font-medium">AI Generated Version</span>
              </div>
            )}
          </div>
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

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Grade</h3>
            <BatchGradeDisplay
              grade={grade}
              onChange={setGrade}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Batch
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Batch</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this batch? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-4 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={deleteBatch}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={() => router.push('/')}>
              Cancel
            </Button>
            <GenerateVersionDialog 
              onGenerate={generateNewVersion}
              isGenerating={isGenerating}
            />
            <Button onClick={saveBatch}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 