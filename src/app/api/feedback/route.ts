import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { idea } = await request.json();

    if (!idea || typeof idea !== "string" || !idea.trim()) {
      return NextResponse.json(
        { error: "Please provide a valid idea" },
        { status: 400 }
      );
    }

    // Placeholder feedback logic
    // This can be replaced with actual AI feedback generation
    const feedback = generateFeedback(idea.trim());

    return NextResponse.json({ feedback });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process your idea" },
      { status: 500 }
    );
  }
}

function generateFeedback(idea: string): string {
  const feedbackPoints = [
    "✓ Clarity: Consider breaking down complex concepts into simpler steps.",
    "✓ Impact: Think about who would benefit from this idea and how.",
    "✓ Feasibility: What resources or skills would be needed?",
    "✓ Differentiation: What makes this idea unique?",
  ];

  return `Here's some feedback on your idea:\n\n${feedbackPoints.join(
    "\n"
  )}\n\nFeel free to refine your idea based on these points and submit again!`;
}
