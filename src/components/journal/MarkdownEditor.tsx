import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownEditorProps {
  content: string;
  onSave: (content: string) => void;
  isLoading?: boolean;
  autoSaveInterval?: number;
}

export default function MarkdownEditor({
  content,
  onSave,
  isLoading = false,
  autoSaveInterval = 5000, // 5 seconds
}: MarkdownEditorProps) {
  const [value, setValue] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [lastSavedContent, setLastSavedContent] = useState(content);

  useEffect(() => {
    setValue(content);
    setLastSavedContent(content);
  }, [content]);

  useEffect(() => {
    // Auto-save logic
    if (value === lastSavedContent) return;

    const timer = setTimeout(() => {
      handleSave();
    }, autoSaveInterval);

    return () => clearTimeout(timer);
  }, [value, lastSavedContent, autoSaveInterval]);

  const handleSave = async () => {
    if (value === lastSavedContent) return;

    setIsSaving(true);
    try {
      await onSave(value);
      setLastSavedContent(value);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-xl font-bold">Editor</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="rounded border px-4 py-2"
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || isSaving || value === lastSavedContent}
            className="rounded bg-primary-500 px-4 py-2 text-white disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex-1 p-4">
        {showPreview ? (
          <div className="prose h-full max-w-none overflow-y-auto rounded border p-4">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isLoading}
            className="h-full w-full resize-none rounded border p-4 font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="# Start writing..."
          />
        )}
      </div>

      <div className="flex justify-between border-t p-2 text-xs text-gray-500">
        <span>
          {value.trim()
            ? `${value.split(/\s+/).length} words`
            : 'Empty document'}
        </span>
        <span>
          {value === lastSavedContent ? 'All changes saved' : 'Unsaved changes'}
        </span>
      </div>
    </div>
  );
}
