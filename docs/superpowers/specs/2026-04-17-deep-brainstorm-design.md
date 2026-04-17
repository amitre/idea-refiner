# Deep Brainstorm Mode — Design Spec

**Date:** 2026-04-17  
**Status:** Approved

## Summary

Add a "Deep Brainstorm" mode alongside the existing quick mini-plan flow. The mode opens an inline chat panel where Claude asks up to 5 targeted clarifying questions one at a time, then automatically generates a richer action plan tailored to the dialogue.

## UI Layout & User Flow

- A **"Deep Brainstorm"** button sits to the right of the existing GO button (secondary style)
- Clicking it locks the textarea (idea is fixed) and expands a chat panel below the buttons
- Claude's first question appears as a message bubble
- User replies via a small input at the bottom of the panel (Enter or Send button)
- Up to 5 exchanges; after the 5th answer Claude auto-generates the rich plan
- Plan appears in the same styled feedback box used by the quick flow
- "Start Over" button resets to the empty textarea state

## API

**Route:** `POST /api/brainstorm`

**Request:**
```json
{ "idea": "string", "messages": [{ "role": "user|assistant", "content": "string" }] }
```

**Response:**
```json
{ "reply": "string", "done": boolean }
```

- Conversation history is maintained client-side and sent on every turn
- When `done: true`, `reply` is the final rich plan
- Claude counts questions internally via system prompt; produces the plan automatically after the 5th user answer
- Prompt caching on the stable system prompt

## Final Plan Format

Produced after the 5-question dialogue:

- **Summary** — 2-3 sentences capturing the refined idea
- **Why it's worth doing** — 3-5 bullets
- **5 concrete next steps** — detailed and tailored to the conversation
- **Key risks** — 2-3 honest challenges
- **One success metric** — a concrete, measurable sign of progress

## What Stays Unchanged

- Existing GO button and quick mini-plan flow are untouched
- Same visual styling (feedback box, Tailwind classes)
- No database or server-side session state
