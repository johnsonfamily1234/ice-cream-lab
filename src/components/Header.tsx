'use client';

import { useRouter } from 'next/navigation';
import { Link2 } from "lucide-react";

export function Header() {
  const router = useRouter();

  return (
    <header className="w-full bg-white border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <h1 
          className="text-2xl font-bold cursor-pointer hover:text-primary transition-colors"
          onClick={() => router.push('/')}
        >
          A.I.ce Cream
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/urls')}
            className="flex items-center gap-2 hover:text-primary transition-colors"
          >
            <Link2 className="h-5 w-5" />
            <span>Reference URLs</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-gray-100"></div>
        </div>
      </div>
    </header>
  );
} 