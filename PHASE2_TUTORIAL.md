# Phase 2 Tutorial: Journal Management

This tutorial will guide you through implementing Phase 2 of the Momentum Journal project, building on the core infrastructure established in Phase 1.

## Entry Management

### 1. Enhanced Entry Operations

First, let's enhance our storage manager to support more robust entry operations:

```typescript
// src/lib/storage/hybrid-storage.ts

// Add these methods to the HybridStorageManager class

async listEntries(): Promise<any[]> {
  try {
    const entries = this.db.prepare(`
      SELECT
        je.id,
        je.file_path,
        je.created_at,
        je.updated_at,
        SUBSTR(je.content, 1, 100) as content_preview,
        em.word_count,
        em.tags
      FROM journal_entries je
      LEFT JOIN entry_metadata em ON je.id = em.entry_id
      ORDER BY je.updated_at DESC
    `).all();

    return entries;
  } catch (error) {
    console.error('Error listing entries:', error);
    throw error;
  }
}

async searchEntries(query: string): Promise<any[]> {
  try {
    const searchTerm = `%${query}%`;
    const entries = this.db.prepare(`
      SELECT
        je.id,
        je.file_path,
        je.created_at,
        je.updated_at,
        SUBSTR(je.content, 1, 100) as content_preview,
        em.word_count,
        em.tags
      FROM journal_entries je
      LEFT JOIN entry_metadata em ON je.id = em.entry_id
      WHERE je.content LIKE ?
      ORDER BY je.updated_at DESC
    `).all(searchTerm);

    return entries;
  } catch (error) {
    console.error('Error searching entries:', error);
    throw error;
  }
}

extractTitle(content: string): string {
  // Extract the first line as title, or use "Untitled" if empty
  const firstLine = content.split('\n')[0].trim();
  if (!firstLine) return 'Untitled';

  // Remove markdown heading syntax
  const title = firstLine.replace(/^#{1,6}\s+/, '');

  // Limit to 50 characters
  return title.length > 50 ? title.substring(0, 47) + '...' : title;
}
```

### 2. Building the Entry Editor

Let's enhance our Journal Editor component to support markdown:

```bash
# Install markdown support
npm install react-markdown remark-gfm
```

```typescript
// src/components/journal/MarkdownEditor.tsx
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
      <div className="flex justify-between items-center border-b p-4">
        <h2 className="text-xl font-bold">Editor</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 border rounded"
          >
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || isSaving || value === lastSavedContent}
            className="bg-primary-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex-1 p-4">
        {showPreview ? (
          <div className="prose max-w-none h-full overflow-y-auto p-4 border rounded">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isLoading}
            className="w-full h-full p-4 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
            placeholder="# Start writing..."
          />
        )}
      </div>

      <div className="flex justify-between text-xs text-gray-500 p-2 border-t">
        <span>
          {value.trim() ? `${value.split(/\s+/).length} words` : 'Empty document'}
        </span>
        <span>
          {value === lastSavedContent
            ? 'All changes saved'
            : 'Unsaved changes'}
        </span>
      </div>
    </div>
  );
}
```

### 3. Update JournalList with Enhanced Features

Let's improve our JournalList component with sorting and filtering:

```typescript
// src/components/journal/JournalList.tsx
import React, { useState } from 'react';

interface JournalEntry {
  id: string;
  title: string;
  content_preview: string;
  updated_at: string;
  word_count?: number;
  tags?: string;
}

interface JournalListProps {
  entries: JournalEntry[];
  onSelectEntry: (id: string) => void;
  onCreateEntry: () => void;
  selectedEntryId?: string;
}

export default function JournalList({
  entries,
  onSelectEntry,
  onCreateEntry,
  selectedEntryId,
}: JournalListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content_preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sortBy === 'updated') {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    } else if (sortBy === 'created') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  return (
    <div className="flex h-full flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">Journal Entries</h2>
        <button
          onClick={onCreateEntry}
          className="mt-2 w-full bg-primary-500 text-white px-4 py-2 rounded"
        >
          New Entry
        </button>

        <div className="mt-4">
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded"
          />

          <div className="mt-2 flex text-sm">
            <span className="mr-2">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border rounded px-1"
            >
              <option value="updated">Last updated</option>
              <option value="created">Created</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sortedEntries.length === 0 ? (
          <div className="p-4 text-gray-500">
            {searchTerm ? 'No matching entries found' : 'No entries yet'}
          </div>
        ) : (
          <ul>
            {sortedEntries.map((entry) => (
              <li
                key={entry.id}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedEntryId === entry.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => onSelectEntry(entry.id)}
              >
                <h3 className="font-medium">{entry.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {entry.content_preview}
                </p>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>{new Date(entry.updated_at).toLocaleDateString()}</span>
                  {entry.word_count && <span>{entry.word_count} words</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

## Version Control System

### 1. Enhancing the Database Schema for Versioning

Let's update our database schema to track changes better:

```typescript
// src/lib/db/schema.ts
// Add this to the schema string

CREATE TABLE IF NOT EXISTS entry_diffs (
  id TEXT PRIMARY KEY,
  version_id TEXT NOT NULL,
  operation TEXT NOT NULL,
  position INTEGER NOT NULL,
  content TEXT,
  FOREIGN KEY (version_id) REFERENCES entry_versions(id)
);

// Add an index for performance
CREATE INDEX IF NOT EXISTS idx_entry_versions_entry_id ON entry_versions(entry_id);
```

### 2. Implement Version Control Manager

Create a new file for version control functionality:

```typescript
// src/lib/version-control/diff-generator.ts
export interface TextChange {
  operation: 'insert' | 'delete' | 'replace';
  position: number;
  content?: string;
  length?: number;
}

export function generateDiff(oldText: string, newText: string): TextChange[] {
  const changes: TextChange[] = [];

  // This is a simple implementation. In a real app, you'd use a more
  // sophisticated algorithm like Myers diff algorithm or a library.

  if (oldText === newText) {
    return changes;
  }

  // For this tutorial, we'll use a simple replacement diff
  changes.push({
    operation: 'replace',
    position: 0,
    content: newText,
    length: oldText.length,
  });

  return changes;
}

export function applyDiff(text: string, changes: TextChange[]): string {
  let result = text;

  // Apply changes in reverse order to maintain position accuracy
  for (const change of changes.slice().reverse()) {
    if (change.operation === 'insert') {
      result =
        result.substring(0, change.position) +
        change.content +
        result.substring(change.position);
    } else if (change.operation === 'delete' && change.length) {
      result =
        result.substring(0, change.position) +
        result.substring(change.position + change.length);
    } else if (change.operation === 'replace' && change.length) {
      result =
        result.substring(0, change.position) +
        change.content +
        result.substring(change.position + change.length);
    }
  }

  return result;
}
```

### 3. Implement Version History Component

```typescript
// src/components/journal/VersionHistory.tsx
import React from 'react';

interface Version {
  id: string;
  timestamp: string;
  change_type: string;
}

interface VersionHistoryProps {
  versions: Version[];
  onRestoreVersion: (id: string) => void;
  currentVersionId?: string;
}

export default function VersionHistory({
  versions,
  onRestoreVersion,
  currentVersionId,
}: VersionHistoryProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-bold">Version History</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {versions.length === 0 ? (
          <div className="p-4 text-gray-500">No versions available</div>
        ) : (
          <ul className="divide-y">
            {versions.map((version) => (
              <li
                key={version.id}
                className={`p-4 hover:bg-gray-50 ${
                  version.id === currentVersionId ? 'bg-gray-100' : ''
                }`}
              >
                <div className="flex justify-between">
                  <span className="text-sm">
                    {new Date(version.timestamp).toLocaleString()}
                  </span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                    {version.change_type}
                  </span>
                </div>

                <button
                  onClick={() => onRestoreVersion(version.id)}
                  className="mt-2 text-primary-600 text-sm hover:underline"
                  disabled={version.id === currentVersionId}
                >
                  Restore this version
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

### 4. Update Hybrid Storage Manager for Version Control

Add version control methods to our hybrid storage manager:

```typescript
// src/lib/storage/hybrid-storage.ts

// Add these methods to the HybridStorageManager class

async getVersions(entryId: string): Promise<any[]> {
  try {
    const versions = this.db.prepare(`
      SELECT * FROM entry_versions
      WHERE entry_id = ?
      ORDER BY timestamp DESC
    `).all(entryId);

    return versions;
  } catch (error) {
    console.error('Error getting versions:', error);
    throw error;
  }
}

async getVersion(versionId: string): Promise<any> {
  try {
    const version = this.db.prepare(`
      SELECT * FROM entry_versions WHERE id = ?
    `).get(versionId);

    if (!version) {
      throw new Error(`Version with id ${versionId} not found`);
    }

    return version;
  } catch (error) {
    console.error('Error getting version:', error);
    throw error;
  }
}

async restoreVersion(versionId: string): Promise<void> {
  try {
    const version = await this.getVersion(versionId);
    await this.updateEntry(version.entry_id, version.content);
  } catch (error) {
    console.error('Error restoring version:', error);
    throw error;
  }
}
```

## Journal List View

### 1. Update the Main Page Component

Let's update our page component to integrate all these new features:

```typescript
// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import ThreePanelLayout from '@/components/layout/ThreePanelLayout';
import JournalList from '@/components/journal/JournalList';
import MarkdownEditor from '@/components/journal/MarkdownEditor';
import AIAssistant from '@/components/assistant/AIAssistant';
import VersionHistory from '@/components/journal/VersionHistory';
import { getStorageManager } from '@/lib/storage';

export default function Home() {
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [showVersions, setShowVersions] = useState(false);

  // Load entries
  useEffect(() => {
    loadEntries();
  }, []);

  // Load selected entry
  useEffect(() => {
    if (selectedEntryId) {
      loadEntry(selectedEntryId);
      loadVersions(selectedEntryId);
    } else {
      setEditorContent('');
      setVersions([]);
    }
  }, [selectedEntryId]);

  const loadEntries = async () => {
    try {
      setIsLoading(true);
      const storageManager = await getStorageManager();
      const entryList = await storageManager.listEntries();

      // Transform entries for display
      const formattedEntries = entryList.map(entry => ({
        ...entry,
        title: entry.content_preview
          ? storageManager.extractTitle(entry.content_preview)
          : 'Untitled',
      }));

      setEntries(formattedEntries);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEntry = async (id: string) => {
    try {
      setIsLoading(true);
      const storageManager = await getStorageManager();
      const entry = await storageManager.getEntry(id);
      setEditorContent(entry.content);
    } catch (error) {
      console.error('Error loading entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVersions = async (id: string) => {
    try {
      const storageManager = await getStorageManager();
      const versionList = await storageManager.getVersions(id);
      setVersions(versionList);
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  const handleSaveContent = async (content: string) => {
    try {
      setIsLoading(true);
      const storageManager = await getStorageManager();

      if (selectedEntryId) {
        await storageManager.updateEntry(selectedEntryId, content);
      } else {
        const newEntryId = await storageManager.createEntry(content);
        setSelectedEntryId(newEntryId);
      }

      // Refresh entries and versions
      await loadEntries();
      if (selectedEntryId) {
        await loadVersions(selectedEntryId);
      }
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEntry = async () => {
    setSelectedEntryId(null);
    setEditorContent('# New Entry\n\nStart writing here...');
  };

  const handleRestoreVersion = async (versionId: string) => {
    try {
      setIsLoading(true);
      const storageManager = await getStorageManager();
      await storageManager.restoreVersion(versionId);

      // Reload entry and versions
      if (selectedEntryId) {
        await loadEntry(selectedEntryId);
        await loadVersions(selectedEntryId);
      }
    } catch (error) {
      console.error('Error restoring version:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen">
      <ThreePanelLayout
        leftPanel={
          <JournalList
            entries={entries}
            onSelectEntry={setSelectedEntryId}
            onCreateEntry={handleCreateEntry}
            selectedEntryId={selectedEntryId || undefined}
          />
        }
        mainPanel={
          <div className="h-full flex flex-col">
            <div className="flex-1">
              <MarkdownEditor
                content={editorContent}
                onSave={handleSaveContent}
                isLoading={isLoading}
              />
            </div>

            {selectedEntryId && (
              <div className="p-2 border-t flex justify-end gap-2">
                <button
                  onClick={() => setShowVersions(!showVersions)}
                  className="text-sm text-primary-600"
                >
                  {showVersions ? 'Hide version history' : 'Show version history'}
                </button>
              </div>
            )}

            {showVersions && selectedEntryId && (
              <div className="h-64 border-t">
                <VersionHistory
                  versions={versions}
                  onRestoreVersion={handleRestoreVersion}
                />
              </div>
            )}
          </div>
        }
        rightPanel={<AIAssistant currentText={editorContent} />}
      />
    </main>
  );
}
```

### 2. Tailwind Configuration for Markdown

Update the tailwind.config.js to add the typography plugin:

```bash
# Install the tailwind typography plugin
npm install -D @tailwindcss/typography
```

```javascript
// tailwind.config.js
const config = {
  // ... existing config
  plugins: [require('@tailwindcss/typography')],
};
```

## Next Steps

After implementing these features, you'll have a functional journal management system with:

1. A markdown editor with preview mode
2. Auto-save functionality
3. Version history tracking
4. Entry listing with search and sorting

In Phase 3, we'll integrate the AI capabilities using Ollama, which will add intelligence to the journaling experience.
