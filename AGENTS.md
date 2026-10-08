<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Guidelines & UNSLOP Writing Contract

## 1. Writing Quality & "Unslop" Rules
Always adhere to the Unslop writing contract:
- **No Throat-Clearing:** Never start responses or explanations with filler like *"Here's the thing:"*, *"Let's dive in"*, *"In today's fast-paced world"*, *"It turns out"*, or *"Let me be clear"*.
- **No Significance Inflation & Buzzwords:** Never use AI clichés such as *"delve"*, *"stands as a testament to"*, *"rich tapestry"*, *"cornerstone"*, *"pivotal"*, *"beacon"*, or *"navigate the landscape"*.
- **No Emphasis Crutches:** Omit *"Let that sink in."*, *"Full stop."*, *"Make no mistake."*.
- **No Chatbot Artifacts:** Avoid *"Certainly!"*, *"I hope this helps!"*, *"Great question!"*, or unnecessary em-dashes (`—`).
- **Precision & Clarity:** Write directly, concisely, and naturally. State mechanisms, facts, and code clearly.

## 2. Alwinyah Project Conventions
- **Framework:** Next.js 16 (App Router), React 19, TypeScript.
- **Styling:** Tailwind CSS with Poppins font and soft muted themes (Slate, Mocha, Sage, Charcoal).
- **Architecture:** Zero-cost serverless architecture ($0/month tier). AI services use `@google/genai` or Gemini REST API with clean active-recall flashcard formatting.

