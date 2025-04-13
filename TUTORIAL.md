# Momentum Journal - Core Interaction Tutorial

This tutorial guides you through building the absolute core "playable" loop of Momentum Journal: writing in an editor and getting a response from a (dummy) AI. We will follow the principles outlined in `RESTART_PLAN.md`, deliberately deferring features like persistence, versioning, and complex UI.

## Prerequisites

*   Node.js and npm/yarn installed.
*   A running Next.js project (we'll assume you've initialized one with TypeScript and Tailwind CSS, e.g., using `create-next-app`).
*   Basic understanding of React and TypeScript.

## Steps

### 1. Set Up the Basic UI Components

We need three essential parts: an input area for writing, a display area for the AI response, and a trigger mechanism (we'll start with a button).

**File:** `app/page.tsx` (or your main page component)

```tsx
'use client'; // Required for using React hooks like useState

import { useState } from 'react';

export default function HomePage() {
  const [editorContent, setEditorContent] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Optional: for feedback

  const handleEditorChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEditorContent(event.target.value);
  };

  const handleTriggerAi = async () => {
    // We'll implement the AI call here in the next step
    console.log('Triggering AI with content:', editorContent);
    setIsLoading(true); // Optional: Show loading state
    // Simulate AI response for now
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Fake delay
    setAiResponse(`This is a dummy response based on: "${editorContent.slice(-20)}"`);
    setIsLoading(false); // Optional: Hide loading state
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Momentum Journal (Core)</h1>
      <div className="w-full max-w-4xl space-y-6">
        {/* Editor Area */}
        <div>
          <label htmlFor="editor" className="block text-sm font-medium text-gray-700 mb-1">
            Start writing...
          </label>
          <textarea
            id="editor"
            value={editorContent}
            onChange={handleEditorChange}
            placeholder="Your thoughts here..."
            rows={10}
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 bg-white"
          />
        </div>

        {/* Trigger Button */}
        <button
          onClick={handleTriggerAi}
          disabled={isLoading || !editorContent} // Disable if loading or no content
          className={`px-4 py-2 rounded-md text-white font-semibold transition-colors ${
            isLoading || !editorContent
              ? 'bg-indigo-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isLoading ? 'Thinking...' : 'Get AI Suggestion'}
        </button>

        {/* AI Response Area */}
        {aiResponse && ( // Only show if there's a response
          <div className="mt-6 p-4 border border-blue-200 bg-blue-50 rounded-md">
            <h2 className="text-lg font-semibold mb-2 text-blue-800">AI Assistant:</h2>
            <p className="text-blue-700 whitespace-pre-wrap">{aiResponse}</p>
          </div>
        )}
      </div>
    </main>
  );
}

```

**Explanation:**

*   We use `useState` to manage the editor's text (`editorContent`), the AI's response (`aiResponse`), and an optional loading state (`isLoading`).
*   A simple `<textarea>` serves as our editor.
*   A `<button>` triggers the `handleTriggerAi` function.
*   A `<div>` conditionally displays the `aiResponse`.
*   Basic Tailwind CSS classes are used for styling.

**Run the app (`npm run dev` or `yarn dev`) and test:**

*   You should see a textarea, a button, and initially no AI response area.
*   Typing in the textarea should update the content.
*   Clicking the button should (after a 1-second fake delay) show a dummy response in the blue box, including the last part of your typed text.

### 2. Implement Dummy AI Function

Let's extract the AI logic into a separate (dummy) function to make it cleaner.

**Create File:** `lib/ai.ts` (create the `lib` directory if it doesn't exist)

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

**Modify `app/page.tsx`:**

Import the new function and use it in `handleTriggerAi`.

```diff
--- a/app/page.tsx
+++ b/app/page.tsx
@@ -2,6 +2,7 @@
 'use client'; // Required for using React hooks like useState

 import { useState } from 'react';
+import { getDummyAISuggestion } from '@/lib/ai'; // Adjust path if needed

 export default function HomePage() {
   const [editorContent, setEditorContent] = useState('');
@@ -18,9 +19,8 @@
     // We'll implement the AI call here in the next step
     console.log('Triggering AI with content:', editorContent);
     setIsLoading(true); // Optional: Show loading state
-    // Simulate AI response for now
-    await new Promise((resolve) => setTimeout(resolve, 1000)); // Fake delay
-    setAiResponse(`This is a dummy response based on: "${editorContent.slice(-20)}"`);
+    const suggestion = await getDummyAISuggestion(editorContent);
+    setAiResponse(suggestion);
     setIsLoading(false); // Optional: Hide loading state
   };


```

**Test again:**

*   The interaction should still work, but the AI responses should now come from your `getDummyAISuggestion` function based on the simple logic defined there. Try ending sentences with different words to see the varied (but still basic) responses.

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
2.  Install an HTTP client library (e.g., `axios` or use native `fetch`).
3.  Create a Next.js API route (e.g., `app/api/ai/suggest/route.ts`) that takes the editor content, sends it to the Ollama API (e.g., `/api/generate` endpoint for Gemma), and returns the response.
4.  Modify `lib/ai.ts` (or create a new function) to call this backend API route instead of returning dummy data.
5.  Update `app/page.tsx` to call the new function in `handleTriggerAi`.
6.  Handle potential errors from the API call.

### 5. Reintroduce Persistence (Future Step)

After the real AI integration works, you might consider the simplest way to save content, perhaps using browser `localStorage` initially before tackling file system or database storage.

---

This completes the setup for the very basic core loop. The next focus should be step 4: Integrating with Ollama via a backend API route. 