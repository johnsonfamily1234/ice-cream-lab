import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BatchGradeDisplay } from "@/components/BatchGrade";
import type { Batch } from "@/types/batch";
import { Bot } from "lucide-react";

export function BatchCard({ batch }: { batch: Batch }) {
    console.log(batch);
    
  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <div className="flex flex-col items-between justify-center">
          <div>
            <CardTitle>{batch.name || 'Unnamed Batch'}</CardTitle>
          </div>
        </div>
      </CardHeader>
      {/* Rest of card content */}
			<CardFooter>
				<div className="flex gap-2 justify-between items-end w-full">
					<div>
						{batch.isAiGenerated && (
							<div className="flex items-center gap-2 text-blue-500">
								<Bot className="h-5 w-5" />
								<span className="text-sm font-medium">AI Generated</span>
							</div>
						)}
					</div>
					<div>
						{batch.grade && (
							<div>
								<BatchGradeDisplay
								grade={batch.grade}
								readonly
								compact
								/>
							</div>
						)}						
					</div>
				</div>
			</CardFooter>
    </Card>
  );
} 