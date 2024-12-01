'use client';

import { useState } from 'react';
import { Star, IceCream2, Sandwich } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export interface BatchGrade {
  flavor: number;
  texture: number;
  overall: number;
  notes?: string;
}

interface BatchGradeProps {
  grade?: BatchGrade;
  onChange?: (grade: BatchGrade) => void;
  readonly?: boolean;
  compact?: boolean;
}

export function BatchGradeDisplay({ grade, onChange, readonly = false, compact = false }: BatchGradeProps) {
  const [localGrade, setLocalGrade] = useState<BatchGrade>(grade || {
    flavor: 0,
    texture: 0,
    overall: 0
  });

  const handleChange = (field: keyof BatchGrade, value: number) => {
    const newGrade = { ...localGrade, [field]: value };
    setLocalGrade(newGrade);
    onChange?.(newGrade);
  };

  const renderScore = (score: number) => {
    if (score === 0) return '-';
    return score.toFixed(1);
  };

  const getScoreColor = (score: number) => {
    if (score === 0) return 'text-gray-400';
    if (score >= 8) return 'text-green-500';
    if (score >= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const renderGradeItem = (
    icon: React.ReactNode,
    label: string,
    score: number
  ) => (
    <TooltipProvider key={label}>
      <Tooltip>
        <TooltipTrigger className="flex items-center gap-2">
          <div className={`${getScoreColor(score)} ${compact ? 'text-sm' : 'text-base'}`}>
            {icon}
          </div>
          {!compact && (
            <span className={`font-medium ${getScoreColor(score)}`}>
              {renderScore(score)}
            </span>
          )}
        </TooltipTrigger>
        <TooltipContent>
          <p>{label}: {renderScore(score)}/10</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  if (readonly || compact) {
    return (
      <div className={`flex ${compact ? 'gap-1' : 'gap-4'}`}>
        {renderGradeItem(<IceCream2 className="h-4 w-4" />, "Flavor", localGrade.flavor)}
        {renderGradeItem(<Sandwich className="h-4 w-4" />, "Texture", localGrade.texture)}
        {renderGradeItem(<Star className="h-4 w-4" />, "Overall", localGrade.overall)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <IceCream2 className="h-4 w-4" /> Flavor
        </Label>
        <Slider
          value={[localGrade.flavor]}
          min={0}
          max={10}
          step={0.5}
          onValueChange={(value: number[]) => handleChange('flavor', value[0])}
        />
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Sandwich className="h-4 w-4" /> Texture
        </Label>
        <Slider
          value={[localGrade.texture]}
          min={0}
          max={10}
          step={0.5}
          onValueChange={(value: number[]) => handleChange('texture', value[0])}
        />
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Star className="h-4 w-4" /> Overall
        </Label>
        <Slider
          value={[localGrade.overall]}
          min={0}
          max={10}
          step={0.5}
          onValueChange={(value: number[]) => handleChange('overall', value[0])}
        />
      </div>
    </div>
  );
} 