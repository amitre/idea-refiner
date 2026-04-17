import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a sharp, honest idea advisor. When given an idea, respond with a structured mini-plan in exactly this format:

**Summary:** One sentence that captures the core of the idea.

**Why it's worth doing:**
- [bullet 1]
- [bullet 2]
- [bullet 3 — optional, only if genuinely distinct]

**3 concrete next steps:**
1. [specific, immediately actionable step]
2. [specific, immediately actionable step]
3. [specific, immediately actionable step]

**One risk to watch out for:** [one honest challenge or pitfall, no sugarcoating]

Keep every section tight. No filler, no hype. Be direct and useful.`;

export async function POST(request: NextRequest) {
  try {
    const { idea } = await request.json();

    if (!idea || typeof idea !== "string" || !idea.trim()) {
      return NextResponse.json(
        { error: "Please provide a valid idea" },
        { status: 400 }
      );
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: idea.trim() }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const feedback = textBlock?.type === "text" ? textBlock.text : "Unable to generate feedback.";

    return NextResponse.json({ feedback });
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `API error: ${error.message}` },
        { status: error.status ?? 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to process your idea" },
      { status: 500 }
    );
  }
}
