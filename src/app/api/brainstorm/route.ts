import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a collaborative idea brainstormer. Your job is to ask focused clarifying questions to understand an idea deeply, then produce a rich action plan.

Ask ONE short, focused question per message. Explore: purpose, who benefits, constraints, alternatives considered, and success criteria. Be direct and conversational — no preamble, just the question.

When asked to produce the final plan, use exactly this format:

**Summary:** 2-3 sentences capturing the refined idea based on the conversation.

**Why it's worth doing:**
- [bullet grounded in what you learned]
- [bullet]
- [bullet]
- [additional bullets if genuinely distinct, up to 5 total]

**5 concrete next steps:**
1. [specific, tailored to the discussion]
2. [specific]
3. [specific]
4. [specific]
5. [specific]

**Key risks:**
- [risk specific to this idea]
- [risk]
- [optional third risk]

**One success metric:** [concrete, measurable sign of progress]

Be honest and specific. No fluff. Ground everything in what was actually discussed.`;

type Message = { role: "user" | "assistant"; content: string };

export async function POST(request: NextRequest) {
  try {
    const client = new Anthropic();
    const { messages } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Please provide a valid conversation" },
        { status: 400 }
      );
    }

    const assistantCount = (messages as Message[]).filter(
      (m) => m.role === "assistant"
    ).length;
    const done = assistantCount >= 5;

    const apiMessages = done
      ? [
          ...messages,
          {
            role: "user",
            content:
              "You've asked 5 questions. Now produce the full action plan.",
          },
        ]
      : messages;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: done ? 2048 : 256,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: apiMessages,
    });

    const textBlock = response.content.find((b) => b.type === "text");
    const reply =
      textBlock?.type === "text" ? textBlock.text : "Unable to continue.";

    return NextResponse.json({ reply, done });
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `API error: ${error.message}` },
        { status: error.status ?? 500 }
      );
    }
    const message =
      error instanceof Error ? error.message : "Failed to process";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
