# Momentum Journal - Core Interaction Tutorial

This tutorial guides you through building the absolute core "playable" loop of Momentum Journal: writing in an editor and getting a response from a (dummy) AI. We will follow the principles outlined in `RESTART_PLAN.md`, deliberately deferring features like persistence, versioning, and complex UI.

## Prerequisites

*   Deno installed (https://deno.land/).
*   A running Deno-based web project setup (e.g., using Fresh, Aleph.js, or potentially Next.js adapted for Deno). The examples below use React/JSX syntax common in these frameworks, but specific setup/commands might vary.
*   Basic understanding of React/JSX and TypeScript.

## Steps

### 1. Set Up the Basic UI Components

We need three essential parts: an input area for writing, a display area for the AI response, and a trigger mechanism (we'll start with a button).

**File:** `routes/index.tsx` (Example path for a Deno framework like Fresh)

```tsx
/** @jsx h */
// Imports from a Deno-compatible source like esm.sh
import { h } from "https://esm.sh/preact@10.19.6";
import { useState } from "https://esm.sh/preact@10.19.6/hooks";

// Note: If using Fresh, you might wrap this in a component and export it.
// Consult your specific Deno framework's documentation.

export default function HomePage() {
  const [editorContent, setEditorContent] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEditorChange = (
    event: h.JSX.TargetedEvent<HTMLTextAreaElement, Event>
  ) => {
    setEditorContent((event.target as HTMLTextAreaElement)?.value || '');
  };

  const handleTriggerAi = async () => {
    console.log('Triggering AI with content:', editorContent);
    setIsLoading(true);
    // Simulate AI response for now (using dummy logic from Step 2)
    // We will call getDummyAISuggestion here once it's created
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Fake delay
    setAiResponse(`Dummy response for: "${editorContent.slice(-20)}"`);
    setIsLoading(false);
  };

  // Basic styling using Tailwind assumes it's configured in your Deno project
  return (
    <main class="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <h1 class="text-4xl font-bold mb-8 text-gray-800">Momentum Journal (Core)</h1>
      <div class="w-full max-w-4xl space-y-6">
        {/* Editor Area */}
        <div>
          <label htmlFor="editor" class="block text-sm font-medium text-gray-700 mb-1">
            Start writing...
          </label>
          <textarea
            id="editor"
            value={editorContent}
            onInput={handleEditorChange} // Use onInput with Preact/Fresh
            placeholder="Your thoughts here..."
            rows={10}
            class="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
          />
        </div>

        {/* Trigger Button */}
        <button
          onClick={handleTriggerAi}
          disabled={isLoading || !editorContent}
          class={`px-4 py-2 rounded-md text-white font-semibold transition-colors ${
            isLoading || !editorContent
              ? 'bg-indigo-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isLoading ? 'Thinking...' : 'Get AI Suggestion'}
        </button>

        {/* AI Response Area */}
        {aiResponse && (
          <div class="mt-6 p-4 border border-blue-200 bg-blue-50 rounded-md">
            <h2 class="text-lg font-semibold mb-2 text-blue-800">AI Assistant:</h2>
            <p class="text-blue-700 whitespace-pre-wrap">{aiResponse}</p>
          </div>
        )}
      </div>
    </main>
  );
}

```

**Explanation:**

*   Imports for `h` (JSX factory, common in Fresh/Preact) and `useState` now use URLs (e.g., from `esm.sh`). Adapt the URLs/versions as needed.
*   The component structure remains similar, using `useState` for managing state.
*   Event handlers (`handleEditorChange`, `handleTriggerAi`) are defined.
*   **Note:** Event handling might use `onInput` instead of `onChange` for textareas in Preact/Fresh.
*   Basic Tailwind classes are used (assuming Tailwind is set up in your Deno project - e.g., via `twind`). `className` is often replaced by `class` in JSX when not using React directly.
*   The dummy AI logic is kept simple inline for now, anticipating the `getDummyAISuggestion` function from Step 2.

**Run the app (e.g., `deno task start`) and test:**

*   Ensure your Deno development server is running.
*   Visit the appropriate page in your browser.
*   Verify that typing in the textarea works and clicking the button shows the (temporary inline) dummy response after a delay.

### 2. Implement Dummy AI Function

Let's extract the AI logic into a separate (dummy) function to make it cleaner.

**Create File:** `utils/ai.ts` (or `lib/ai.ts` - choose a convention for your Deno project)

```typescript
// This is a placeholder for the real AI interaction.
// It simulates fetching a suggestion based on the input text.

export async function getDummyAISuggestion(text: string): Promise<string> {
  console.log('Dummy AI received:', text);

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Simple deterministic "AI" logic
  if (text.trim().length === 0) {
    return "Feeling stuck? Try writing about what's on your mind right now.";
  }

  const lastWord = text.trim().split(/\s+/).pop()?.toLowerCase() || '';

  if (lastWord.includes('?')) {
      return "That's a great question to explore further.";
  }
  if (lastWord === 'think') {
      return "What are the different angles to consider about that?";
  }
  if (lastWord.length > 7) {
      return `"${lastWord}" is an interesting word choice. Can you expand on that?`;
  }

  // Default suggestion
  return `Keep going! What comes next after "${text.slice(-30).replace(/\n/g, ' ')}..."?`;
}
```

**Modify `routes/index.tsx`:**

Import the new function and use it in `handleTriggerAi`.

```diff
--- a/routes/index.tsx
+++ b/routes/index.tsx
@@ -3,6 +3,7 @@
 // Imports from a Deno-compatible source like esm.sh
 import { h } from "https://esm.sh/preact@10.19.6";
 import { useState } from "https://esm.sh/preact@10.19.6/hooks";
+import { getDummyAISuggestion } from "../utils/ai.ts"; // Adjust path as needed

 // Note: If using Fresh, you might wrap this in a component and export it.
 // Consult your specific Deno framework's documentation.
@@ -23,9 +24,8 @@
   const handleTriggerAi = async () => {
     console.log('Triggering AI with content:', editorContent);
     setIsLoading(true);
-    // Simulate AI response for now (using dummy logic from Step 2)
-    // We will call getDummyAISuggestion here once it's created
-    await new Promise((resolve) => setTimeout(resolve, 1000)); // Fake delay
-    setAiResponse(`Dummy response for: "${editorContent.slice(-20)}"`);
+    // Call the actual dummy function
+    const suggestion = await getDummyAISuggestion(editorContent);
+    setAiResponse(suggestion);
     setIsLoading(false);
   };


```

**Test again:**

*   Run your Deno development server.
*   The interaction should still work, but the AI responses should now come from your `getDummyAISuggestion` function (imported from `utils/ai.ts` or similar) based on the simple logic defined there. Try ending sentences with different words to see the varied (but still basic) responses.

### 3. Refine Interaction (Placeholder)

At this stage, you would test the "feel" of the interaction.

*   Is the button the right trigger?
*   Should it trigger automatically after a pause in typing? (We'll defer implementing this complexity for now).
*   Is the loading state clear?
*   Is the response display effective?

Make minor UI tweaks or adjustments to the dummy AI logic as needed until the core loop feels somewhat useful.

### 4. Integrate Real AI (Next Major Step)

Once the dummy interaction feels right, the next step (covered in a subsequent tutorial or phase) would be:

1.  Set up Ollama locally (if not already done).
2.  Use Deno's native `fetch` API for making HTTP requests. No separate library installation is typically needed.
3.  Create an API route handler (e.g., `routes/api/ai/suggest.ts` in a framework like Fresh) that:
    *   Receives the editor content (usually from a POST request body).
    *   Constructs the appropriate request payload for your Ollama API endpoint (e.g., `http://localhost:11434/api/generate` for Gemma).
    *   Uses `fetch` to send the request to Ollama.
    *   Parses the response from Ollama.
    *   Sends the generated suggestion back as the API response.
4.  Modify `utils/ai.ts` (or create a new function, e.g., `getRealAISuggestion`) to make a `fetch` call to your new backend API route (`/api/ai/suggest`) instead of returning dummy data.
5.  Update `routes/index.tsx` to call the *new* AI fetching function (e.g., `getRealAISuggestion`) in `handleTriggerAi`.
6.  Implement robust error handling for the `fetch` call and the API route itself (e.g., what happens if Ollama is down or the request fails?).

### 5. Reintroduce Persistence (Future Step)

After the real AI integration works, you might consider the simplest way to save content, perhaps using browser `localStorage` initially before tackling file system or database storage.

---

This completes the setup for the very basic core loop. The next focus should be step 4: Integrating with Ollama via a backend API route. 