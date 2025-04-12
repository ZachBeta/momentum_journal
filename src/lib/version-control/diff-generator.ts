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
