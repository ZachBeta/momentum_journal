# Restart Plan: Focus on Core Editor-AI Interaction

## Goal

Quickly achieve a "playable" core loop demonstrating the interaction between a user writing in an editor and receiving AI assistance/prompts. Avoid distractions from non-essential features.

## Core Focus (MVP v2)

1.  **Minimal Editor:** A simple text input area (e.g., `<textarea>`) for writing.
2.  **AI Interaction Trigger:** A basic mechanism to request AI help (e.g., a button, or detecting a pause in typing).
3.  **AI Response Display:** A designated area to show the AI's output.

## Deliberate Simplifications (Defer These)

- **Persistence:** No saving to files or database initially. Content can be held in React component state.
- **Storage Layer:** Remove `hybrid-storage.ts`, `file-system.ts`, and database interactions (`db/`).
- **Versioning:** No version history tracking.
- **Multiple Documents:** Focus on a single, ephemeral document session. No journal list or file management.
- **UI Complexity:** Single page layout. Avoid the three-panel setup for now. Use basic HTML elements or minimal styling.
- **Markdown:** Plain text input is sufficient. No complex rendering needed initially.
- **Metadata:** No word counts, tags, etc.

## Phased Approach

1.  **Build the basic UI:** Editor textarea, AI response display area, trigger button.
2.  **Implement Dummy AI:** Create a simple function `getAISuggestion(text: string): string` that returns hardcoded prompts. Hook this up to the trigger.
3.  **Refine Interaction:** Test and iterate on the feel of the editor-AI loop.
4.  **Integrate Real AI:** _Only after the core loop feels right_, swap the dummy function with calls to Ollama.
5.  **Reintroduce Persistence (Optional):** Decide on the simplest way to save state if needed (e.g., local storage, single file).
