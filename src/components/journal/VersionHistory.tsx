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
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
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
                  <span className="rounded bg-gray-200 px-2 py-1 text-xs">
                    {version.change_type}
                  </span>
                </div>

                <button
                  onClick={() => onRestoreVersion(version.id)}
                  className="mt-2 text-sm text-primary-600 hover:underline"
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
