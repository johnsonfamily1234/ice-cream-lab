import { Suspense } from 'react';
import BatchList from '@/components/BatchList';
import NewBatchButton from '@/components/NewBatchButton';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Ice Cream Batches</h1>
      <div className="mb-6">
        <NewBatchButton />
      </div>
      <Suspense fallback={<div>Loading batches...</div>}>
        <BatchList />
      </Suspense>
    </main>
  );
}
