'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Batch } from '@/types/batch';
import { BatchCard } from '@/components/BatchCard';

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
        <div 
          key={batch._id}
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => router.push(`/batches/${batch._id}`)}
        >
          <BatchCard batch={batch} />
        </div>
      ))}
    </div>
  );
} 