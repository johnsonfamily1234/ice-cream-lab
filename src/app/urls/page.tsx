'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Loader2, RefreshCw } from "lucide-react";

interface UrlRecord {
  _id: string;
  url: string;
  lastIndexed?: Date;
}

export default function UrlsPage() {
  const [urls, setUrls] = useState<UrlRecord[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [indexingId, setIndexingId] = useState<string | null>(null);

  const addUrl = async () => {
    if (!newUrl.trim()) return;

    try {
      const response = await fetch('/api/urls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl.trim() })
      });

      if (!response.ok) throw new Error('Failed to add URL');
      
      const data = await response.json();
      setUrls([...urls, data]);
      setNewUrl('');
    } catch (error) {
      console.error('Failed to add URL:', error);
    }
  };

  const indexUrl = async (id: string) => {
    try {
      setIndexingId(id);
      const response = await fetch(`/api/urls/${id}/index`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to index URL');
      
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

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Reference URLs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-8">
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Enter URL"
              onKeyDown={(e) => e.key === 'Enter' && addUrl()}
            />
            <Button onClick={addUrl}>Add URL</Button>
          </div>

          <div className="space-y-4">
            {urls.map((url) => (
              <div key={url._id} className="flex items-center justify-between p-4 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  {url.lastIndexed && <Check className="h-5 w-5 text-green-500" />}
                  <span>{url.url}</span>
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
                      {url.lastIndexed ? 'Re-index' : 'Index'}
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 