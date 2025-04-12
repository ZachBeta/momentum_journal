'use client';

import { useState, useEffect } from 'react';
import ThreePanelLayout from '@/components/layout/ThreePanelLayout';
import JournalList from '@/components/journal/JournalList';
import MarkdownEditor from '@/components/journal/MarkdownEditor';
import AIAssistant from '@/components/assistant/AIAssistant';
import VersionHistory from '@/components/journal/VersionHistory';

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
      const response = await fetch('/api/entries');

      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }

      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEntry = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/entries?id=${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch entry');
      }

      const entry = await response.json();
      setEditorContent(entry.content);
    } catch (error) {
      console.error('Error loading entry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadVersions = async (id: string) => {
    try {
      const response = await fetch(`/api/versions?entryId=${id}`);

      if (!response.ok) {
        throw new Error('Failed to fetch versions');
      }

      const data = await response.json();
      setVersions(data);
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  const handleSaveContent = async (content: string) => {
    try {
      setIsLoading(true);

      if (selectedEntryId) {
        // Update existing entry
        const response = await fetch('/api/entries', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: selectedEntryId, content }),
        });

        if (!response.ok) {
          throw new Error('Failed to update entry');
        }
      } else {
        // Create new entry
        const response = await fetch('/api/entries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        });

        if (!response.ok) {
          throw new Error('Failed to create entry');
        }

        const data = await response.json();
        setSelectedEntryId(data.id);
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

      const response = await fetch('/api/versions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ versionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to restore version');
      }

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
          <div className="flex h-full flex-col">
            <div className="flex-1">
              <MarkdownEditor
                content={editorContent}
                onSave={handleSaveContent}
                isLoading={isLoading}
              />
            </div>

            {selectedEntryId && (
              <div className="flex justify-end gap-2 border-t p-2">
                <button
                  onClick={() => setShowVersions(!showVersions)}
                  className="text-sm text-primary-600"
                >
                  {showVersions
                    ? 'Hide version history'
                    : 'Show version history'}
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
