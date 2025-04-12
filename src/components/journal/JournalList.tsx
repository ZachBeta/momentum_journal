import React, { useState } from 'react';

interface JournalEntry {
  id: string;
  title: string;
  content_preview: string;
  updated_at: string;
  created_at?: string;
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
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>(
    'updated'
  );

  const filteredEntries = entries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.content_preview &&
        entry.content_preview.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sortBy === 'updated') {
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    } else if (sortBy === 'created') {
      return (
        new Date(b.created_at || b.updated_at).getTime() -
        new Date(a.created_at || a.updated_at).getTime()
      );
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="text-xl font-bold">Journal Entries</h2>
        <button
          onClick={onCreateEntry}
          className="mt-2 w-full rounded bg-primary-500 px-4 py-2 text-white"
        >
          New Entry
        </button>

        <div className="mt-4">
          <input
            type="text"
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border p-2"
          />

          <div className="mt-2 flex text-sm">
            <span className="mr-2">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded border px-1"
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
                className={`cursor-pointer border-b p-4 hover:bg-gray-50 ${
                  selectedEntryId === entry.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => onSelectEntry(entry.id)}
              >
                <h3 className="font-medium">{entry.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                  {entry.content_preview}
                </p>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
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
