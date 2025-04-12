import React, { useState, useEffect } from 'react';

interface JournalEditorProps {
  content: string;
  onSave: (content: string) => void;
  isLoading?: boolean;
}

export default function JournalEditor({
  content,
  onSave,
  isLoading = false,
}: JournalEditorProps) {
  const [value, setValue] = useState(content);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValue(content);
  }, [content]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(value);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-xl font-bold">Editor</h2>
        <button
          onClick={handleSave}
          disabled={isLoading || isSaving}
          className="rounded bg-primary-500 px-4 py-2 text-white disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
      <div className="flex-1 p-4">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isLoading}
          className="h-full w-full resize-none rounded border p-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Start writing..."
        />
      </div>
    </div>
  );
}
