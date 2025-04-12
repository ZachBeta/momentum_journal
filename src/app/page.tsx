'use client';

import { useState } from 'react';
import ThreePanelLayout from '@/components/layout/ThreePanelLayout';
import JournalList from '@/components/journal/JournalList';
import JournalEditor from '@/components/journal/JournalEditor';
import AIAssistant from '@/components/assistant/AIAssistant';

// Sample data with static dates to prevent hydration errors
const sampleEntries = [
  {
    id: '1',
    title: 'My First Entry',
    updated_at: '2023-04-15T10:30:00.000Z',
  },
  {
    id: '2',
    title: 'Ideas for the Weekend',
    updated_at: '2023-04-14T08:45:00.000Z',
  },
];

export default function Home() {
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');

  const handleSelectEntry = (id: string) => {
    setSelectedEntryId(id);
    // In a real app, we would fetch the content from the database
    setEditorContent(`This is the content for entry ${id}`);
  };

  const handleSaveContent = async (content: string) => {
    // In a real app, we would save to the database
    console.log('Saving content:', content);
    setEditorContent(content);
  };

  return (
    <main className="h-screen">
      <ThreePanelLayout
        leftPanel={
          <JournalList
            entries={sampleEntries}
            onSelectEntry={handleSelectEntry}
            selectedEntryId={selectedEntryId || undefined}
          />
        }
        mainPanel={
          <JournalEditor
            content={editorContent}
            onSave={handleSaveContent}
            isLoading={false}
          />
        }
        rightPanel={<AIAssistant currentText={editorContent} />}
      />
    </main>
  );
}
