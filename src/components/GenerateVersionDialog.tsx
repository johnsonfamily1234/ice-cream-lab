'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface GenerateVersionDialogProps {
  onGenerate: (instructions?: string) => Promise<void>;
  isGenerating: boolean;
}

export function GenerateVersionDialog({ onGenerate, isGenerating }: GenerateVersionDialogProps) {
  const [open, setOpen] = useState(false);
  const [instructions, setInstructions] = useState('');

  const handleGenerate = async () => {
    await onGenerate(instructions);
    setOpen(false);
    setInstructions('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          Generate New Version
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate New Version</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Textarea
            placeholder="Optional: Add specific instructions for this version..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={4}
          />
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 