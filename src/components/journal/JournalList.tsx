import React from 'react';

interface JournalEntry {
  id: string;
  title: string;
  updated_at: string;
}

interface JournalListProps {
  entries: JournalEntry[];
  onSelectEntry: (id: string) => void;
  selectedEntryId?: string;
}

export default function JournalList({
  entries,
  onSelectEntry,
  selectedEntryId,
}: JournalListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <h2 className="text-xl font-bold">Journal Entries</h2>
        <button className="mt-2 rounded bg-primary-500 px-4 py-2 text-white">
          New Entry
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="p-4 text-gray-500">No entries yet</div>
        ) : (
          <ul>
            {entries.map((entry) => (
              <li
                key={entry.id}
                className={`cursor-pointer border-b p-4 hover:bg-gray-50 ${
                  selectedEntryId === entry.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => onSelectEntry(entry.id)}
              >
                <h3 className="font-medium">{entry.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(entry.updated_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
