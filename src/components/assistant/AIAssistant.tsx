import React, { useState } from 'react';

interface AIAssistantProps {
  currentText: string;
}

export default function AIAssistant({ currentText }: AIAssistantProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState('');

  // This is a placeholder for actual AI generation
  const generateSuggestion = async () => {
    if (!currentText.trim()) return;

    setIsGenerating(true);

    try {
      // Simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Placeholder suggestion
      setSuggestion(
        'Perhaps you could expand on your thoughts about the previous topic? What specific aspects stood out to you, and how did it make you feel?'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="text-xl font-bold">AI Assistant</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {suggestion ? (
          <div className="rounded bg-gray-50 p-4">
            <h3 className="mb-2 font-medium">Suggestion</h3>
            <p>{suggestion}</p>
          </div>
        ) : (
          <div className="text-gray-500">
            No suggestions yet. Start writing and ask for help.
          </div>
        )}
      </div>
      <div className="border-t p-4">
        <button
          onClick={generateSuggestion}
          disabled={isGenerating || !currentText.trim()}
          className="w-full rounded bg-primary-500 py-2 text-white disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Get Suggestions'}
        </button>
      </div>
    </div>
  );
}
