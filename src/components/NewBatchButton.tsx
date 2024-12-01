'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';

export default function NewBatchButton() {
  const router = useRouter();

  return (
    <Button 
      onClick={() => router.push('/batches/new')}
      className="w-full md:w-auto"
    >
      Create New Batch
    </Button>
  );
} 