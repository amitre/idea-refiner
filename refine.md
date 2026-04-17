# Idea Refiner - Skill Documentation

## /refine Command

Refine and structure any idea or document with structured planning guidance.

### How It Works

1. Read the file the user specifies (or ask which file to use if none given)
2. Analyze the idea and produce a structured mini-plan with:
   - **One-line summary** of the idea
   - **Why it's worth doing** (2-3 bullet points)
   - **3 concrete next steps** to get started
   - **One risk or challenge** to watch out for

### Output Format

All output is kept short, honest, and actionable—no fluff.

### Example Usage

```
/refine src/components/Button.tsx
```

or

```
/refine
# (asks which file to refine)
```

### Design Principles

- **Concise**: One-liners and short bullets only
- **Actionable**: Next steps should be immediately doable
- **Honest**: Acknowledge real trade-offs and challenges
- **Focused**: One risk per plan, not a laundry list
