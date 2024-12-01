'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface URLEntry {
  _id: string;
  url: string;
  hasContent?: boolean;
  content?: string;
  lastIndexed?: Date;
}

export default function URLsPage() {
  const [urls, setUrls] = useState<URLEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [indexingId, setIndexingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await fetch('/api/urls');
      if (!response.ok) {
        throw new Error('Failed to fetch URLs');
      }
      const data = await response.json();
      setUrls(data);
    } catch (error) {
      console.error('Error fetching URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  const indexUrl = async (id: string) => {
    try {
      setIndexingId(id);
      const response = await fetch(`/api/urls/${id}/index`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to index URL');
      }

      const updatedUrl = await response.json();
      setUrls(urls.map(url => 
        url._id === id ? updatedUrl : url
      ));
    } catch (error) {
      console.error('Failed to index URL:', error);
    } finally {
      setIndexingId(null);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Reference URLs</h2>
      {urls.length === 0 ? (
        <p>No URLs found</p>
      ) : (
        <ul className="space-y-4">
          {urls.map((url) => (
            <li key={url._id} className="flex items-center justify-between border p-4 rounded-lg">
              <div className="flex items-center gap-2">
                {indexingId === url._id ? (
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                ) : (
                  (url.hasContent || url.content) && <Check className="h-5 w-5 text-green-500" />
                )}
                <a 
                  href={url.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {url.url}
                </a>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => indexUrl(url._id)}
                disabled={indexingId === url._id}
              >
                {indexingId === url._id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Indexing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {(url.hasContent || url.content) ? 'Re-index' : 'Index'}
                  </>
                )}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 