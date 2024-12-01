'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Bot } from "lucide-react";
import type { Batch } from '@/types/batch';

export default function BatchList() {
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    const fetchBatches = async () => {
      const response = await fetch('/api/batches');
      const data = await response.json();
      setBatches(data);
    };

    fetchBatches();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {batches.map((batch) => (
        <Card 
          key={batch._id} 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push(`/batches/${batch._id}`)}
        >
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {batch.isAiGenerated && <Bot className="h-5 w-5 text-blue-500" />}
                  <h3 className="text-lg font-semibold">{batch.name}</h3>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(batch.createdAt).toLocaleDateString()}
                </p>
              </div>
              {batch.rating && (
                <p className="text-lg font-semibold">
                  Rating: {batch.rating}/10
                </p>
              )}
              <div className="text-sm">
                <p>{batch.dryIngredients.length} dry ingredients</p>
                <p>{batch.wetIngredients.length} wet ingredients</p>
                <p>{batch.notes.length} notes</p>
                {batch.parentBatchId && (
                  <p className="text-blue-500 mt-2">
                    AI variation of another batch
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 