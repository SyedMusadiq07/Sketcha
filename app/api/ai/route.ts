import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env["OPENROUTER_API_KEY"],
  defaultHeaders: {
    "HTTP-Referer": process.env["NEXT_PUBLIC_APP_URL"] || "http://localhost:3000",
    "X-Title": "Sketcha AI Whiteboard",
  },
});

export async function POST(req: NextRequest) {
  const { userPrompt, type, systemPrompt } = await req.json();

  const finalSystemPrompt = `${systemPrompt}

============================
CANVAS GENERATION RULES — READ CAREFULLY
============================
You are generating a visually stunning, production-quality ${type} for a professional AI whiteboard app.

--- MANDATORY VISUAL RULES (DO NOT SKIP) ---
1. roughness: ALWAYS 0. Never use 1 or 2. Roughness 1+ creates ugly hand-drawn artifacts.
2. fillStyle: ALWAYS "solid". Never use "hachure" or "cross-hatch". Hachure looks broken.
3. Every shape element MUST have a vibrant, dark, or colorful backgroundColor. NO transparent or white shapes.
4. strokeColor: Use "#ffffff" (white) on dark-background shapes. Use a dark shade on light shapes.
5. strokeWidth: Between 1.5 and 2.5. Never 0.
6. opacity: Between 85 and 100 for shapes. For container/group backgrounds use 15-30.
7. roundness: Use 8-16 for rounded rectangles, 0 for sharp corners. Always provide this field.

--- COLOR PALETTE STRATEGY ---
Pick ONE cohesive theme. Use this palette as inspiration:
  Dark modern: #1e1b4b (indigo-dark), #312e81 (indigo), #4f46e5 (indigo-mid), #818cf8 (indigo-light), #ffffff (text)
  Emerald tech: #064e3b (dark), #059669 (mid), #34d399 (light), #f0fdf4 (bg), #1f2937 (text)
  Amber warm: #78350f (dark), #d97706 (mid), #fbbf24 (light), #fffbeb (bg), #1c1917 (text)
  Ocean blue: #0c4a6e (dark), #0284c7 (mid), #38bdf8 (light), #f0f9ff (bg), #ffffff (text)

Assign DIFFERENT colors to different logical groups/sections for clear visual separation.

--- LAYOUT RULES ---
- Minimum 60px gap between sibling elements.
- Minimum element width: 160px, height: 60px for nodes.
- Container/group rectangles: large, semi-transparent (opacity 15-25), with a colored stroke, no label.
- Arrange: left-to-right OR top-to-bottom. Pick whichever makes the concept clearest.
- Canvas: fit everything within 1800 x 1200 pixels starting at x:40, y:40.
- Max 22 elements total (shapes + text + containers). Quality > quantity.

--- TEXT RULES ---
- Shape labels: use the "label" field with fontSize 14-16 and "text" containing a SHORT label (3-5 words max).
- Standalone titles: use type "text" with fontSize 22-28, strokeColor "transparent", backgroundColor "transparent".
- Connection labels: 1-3 words only (e.g. "REST", "sends data", "validates").

OUTPUT: Return ONLY valid JSON. No markdown fences. No explanation. Just the JSON object.`;

  const schemaInstructions = `
Return a JSON object with this EXACT structure (all fields shown are supported):
{
  "title": "string",
  "elements": [
    {
      "id": "unique-string",
      "type": "rectangle|ellipse|diamond|text",
      "x": number,
      "y": number,
      "width": number,
      "height": number,
      "strokeColor": "#hexcolor",
      "backgroundColor": "#hexcolor",
      "strokeWidth": number,
      "strokeStyle": "solid|dashed|dotted",
      "fillStyle": "solid",
      "roughness": 0,
      "roundness": number,
      "opacity": number,
      "text": "string (for text-type elements only)",
      "fontSize": number,
      "fontFamily": 1,
      "textAlign": "center|left|right",
      "verticalAlign": "middle|top|bottom",
      "label": { "text": "string", "fontSize": number }
    }
  ],
  "connections": [
    {
      "id": "unique-string",
      "from": "element-id",
      "to": "element-id",
      "label": "string",
      "strokeColor": "#hexcolor",
      "strokeWidth": number,
      "strokeStyle": "solid|dashed|dotted",
      "startArrowhead": "none|arrow",
      "endArrowhead": "arrow|none"
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "google/gemini-3.7-flash",
      messages: [
        {
          role: "system",
          content: finalSystemPrompt + "\n\n" + schemaInstructions,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 8000,
    });

    const rawContent = response.choices[0]?.message?.content || "{}";

    // Strip markdown code blocks if the model wrapped output
    const cleaned = rawContent
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const diagramResult = JSON.parse(cleaned);
    return NextResponse.json({ success: true, diagramResult });
  } catch (error: any) {
    console.error("OpenRouter API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Something went wrong with the AI generation.",
      },
      { status: 500 }
    );
  }
}