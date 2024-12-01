import type { BatchGrade } from "@/components/BatchGrade";

export interface Note {
  content: string;
  createdAt: Date;
}

export interface Batch {
  _id: string;
  name?: string;
  createdAt: Date;
  dryIngredients: Array<{
    name: string;
    grams: number;
    cups: number;
    liters: number;
  }>;
  wetIngredients: Array<{
    name: string;
    grams: number;
    cups: number;
    liters: number;
  }>;
  stabilizers: Array<{
    name: string;
    grams: number;
    cups: number;
    liters: number;
  }>;
  ice: Array<{
    name: string;
    grams: number;
    cups: number;
    liters: number;
  }>;
  notes: Note[];
  isAiGenerated?: boolean;
  parentBatchId?: string;
  rating?: number;
  grade?: BatchGrade;
} 