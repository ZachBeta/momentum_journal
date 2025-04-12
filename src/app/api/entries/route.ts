import { NextResponse } from 'next/server';
import { getStorageManager } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const id = searchParams.get('id');
    const query = searchParams.get('query');

    const storageManager = await getStorageManager();

    if (id) {
      // Get a specific entry
      const entry = await storageManager.getEntry(id);
      return NextResponse.json(entry);
    } else if (query) {
      // Search entries
      const entries = await storageManager.searchEntries(query);
      return NextResponse.json(entries);
    } else {
      // List all entries
      const entries = await storageManager.listEntries();
      // Format entries with titles
      const formattedEntries = entries.map((entry) => ({
        ...entry,
        title: entry.content_preview
          ? storageManager.extractTitle(entry.content_preview)
          : 'Untitled',
      }));
      return NextResponse.json(formattedEntries);
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    const storageManager = await getStorageManager();
    const id = await storageManager.createEntry(content);
    return NextResponse.json({ id });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, content } = await request.json();
    const storageManager = await getStorageManager();
    await storageManager.updateEntry(id, content);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      );
    }

    const storageManager = await getStorageManager();
    await storageManager.deleteEntry(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    );
  }
}
