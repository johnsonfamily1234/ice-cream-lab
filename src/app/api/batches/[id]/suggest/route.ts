import { NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import connectDB from '@/lib/db/mongodb';
import { Batch } from '@/lib/models/Batch';
import type { Note } from '@/types/batch';
import { Url } from '@/lib/models/Url';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Add this interface near the top with other interfaces
interface ToolResponse {
  name: string;
  dryIngredients: Array<{
    name: string;
    grams: number;
    cups: number;
    liters: number;
  }>;
  wetIngredients: Array<{
    name: string;
    grams: number;
    cups: number;
    liters: number;
  }>;
  stabilizers: Array<{
    name: string;
    grams: number;
    cups: number;
    liters: number;
  }>;
  ice: Array<{
    name: string;
    cups: number;
    liters: number;
  }>;
  explanation: string;
}

// Add this interface near the top with other interfaces
interface RawToolResponse {
  properties?: ToolResponse;
  name?: string;
  dryIngredients?: Array<{
    name: string;
    grams: number;
    cups: number;
    liters: number;
  }>;
  wetIngredients?: Array<{
    name: string;
    grams: number;
    cups: number;
    liters: number;
  }>;
  stabilizers?: Array<{
    name: string;
    grams: number;
    cups: number;
    liters: number;
  }>;
  ice?: Array<{
    name: string;
    cups: number;
    liters: number;
  }>;
  explanation?: string;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // Get custom instructions if any
    const { instructions } = await request.json();

    const [batch, urls] = await Promise.all([
      Batch.findById(params.id),
      Url.find({ content: { $exists: true } }) // Only get indexed URLs
    ]);

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Prepare reference content from URLs
    const referenceContent = urls.map(url => 
      `Content from ${url.url}:\n${url.content}\n`
    ).join('\n');

    const tools = [{
      name: "modify_ingredients",
      description: "Modify ice cream ingredients based on analysis.",
      input_schema: {
        type: "object" as const,
        properties: {
          name: { type: "string" as const },
          dryIngredients: {
            type: "array" as const,
            items: {
              type: "object" as const,
              properties: {
                name: { type: "string" as const },
                grams: { type: "number" as const },
                cups: { type: "number" as const },
                liters: { type: "number" as const }
              },
              required: ["name", "grams", "cups", "liters"]
            }
          },
          wetIngredients: {
            type: "array" as const,
            items: {
              type: "object" as const,
              properties: {
                name: { type: "string" as const },
                grams: { type: "number" as const },
                cups: { type: "number" as const },
                liters: { type: "number" as const }
              },
              required: ["name", "grams", "cups", "liters"]
            }
          },
          stabilizers: {
            type: "array" as const,
            items: {
              type: "object" as const,
              properties: {
                name: { type: "string" as const },
                grams: { type: "number" as const },
                cups: { type: "number" as const },
                liters: { type: "number" as const }
              },
              required: ["name", "grams", "cups", "liters"]
            }
          },
          ice: {
            type: "array" as const,
            items: {
              type: "object" as const,
              properties: {
                name: { type: "string" as const },
                cups: { type: "number" as const },
                liters: { type: "number" as const }
              },
              required: ["name", "cups", "liters"]
            }
          },
          explanation: { type: "string" as const }
        },
        required: ["name", "dryIngredients", "wetIngredients", "stabilizers", "ice", "explanation"]
      }
    }];

    const systemPrompt = `You are an expert ice cream maker. Analyze the ingredients and notes from an ice cream batch and suggest improvements. Focus on:
1. Ingredient ratios and proportions
2. Addressing issues mentioned in notes
3. Maintaining or improving texture and flavor
4. Scientific explanations for changes

Please generate a creative and descriptive name for the new batch that reflects its key characteristics or improvements.

${referenceContent ? 'Use this reference information when making suggestions:\n' + referenceContent : ''}
${instructions ? '\nSpecific instructions for this version:\n' + instructions : ''}

Use the modify_ingredients tool to implement your suggested changes.`;

    const batchDescription = `
Current Batch:
Dry Ingredients: ${JSON.stringify(batch.dryIngredients)}
Wet Ingredients: ${JSON.stringify(batch.wetIngredients)}
Stabilizers: ${JSON.stringify(batch.stabilizers)}
Ice: ${JSON.stringify(batch.ice)}
Notes: ${batch.notes.map((note: Note) => note.content).join('\n')}
`;

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1500,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: batchDescription + '\nPlease analyze this batch and suggest improvements by modifying the ingredients.'
      }],
      tools
    });

    console.log('AI Response:', JSON.stringify(message.content, null, 2));

    // Find the tool use response
    const toolUseContent = message.content.find(c => c.type === 'tool_use');
    if (!toolUseContent || toolUseContent.type !== 'tool_use') {
      console.error('Invalid AI response - no tool use found:', message.content);
      throw new Error('No tool use found in response');
    }

    // Extract modifications from the input, handling the nested properties structure
    const rawModifications = toolUseContent.input as RawToolResponse;
    const modifications: ToolResponse = rawModifications.properties || rawModifications;
    
    // Validate the modifications
    if (!modifications.name || !modifications.dryIngredients || !modifications.wetIngredients || 
        !modifications.stabilizers || !modifications.ice) {
      console.error('Invalid modifications from AI:', modifications);
      throw new Error('Invalid or missing data in AI response');
    }

    // Create a new batch with the modified ingredients
    const newBatchData = {
      ...batch.toObject(),
      _id: undefined,
      name: modifications.name,
      createdAt: new Date(),
      isAiGenerated: true,
      parentBatchId: batch._id,
      dryIngredients: modifications.dryIngredients,
      wetIngredients: modifications.wetIngredients,
      stabilizers: modifications.stabilizers,
      ice: modifications.ice,
      grade: undefined,
      notes: [
        {
          content: `🤖 AI Suggestion: ${modifications.explanation}`,
          createdAt: new Date()
        }
      ]
    };

    const newBatch = await Batch.create(newBatchData);
    return NextResponse.json(newBatch);

  } catch (error: unknown) {
    console.error('Failed to generate batch suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to generate batch suggestion' },
      { status: 500 }
    );
  }
} 