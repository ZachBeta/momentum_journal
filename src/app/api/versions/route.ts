import { NextResponse } from 'next/server';
import { getStorageManager } from '@/lib/storage';

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const entryId = searchParams.get('entryId');
    const versionId = searchParams.get('versionId');

    if (!entryId && !versionId) {
      return NextResponse.json(
        { error: 'Entry ID or Version ID is required' },
        { status: 400 }
      );
    }

    const storageManager = await getStorageManager();

    if (versionId) {
      // Get a specific version
      const version = await storageManager.getVersion(versionId);
      return NextResponse.json(version);
    } else {
      // Get versions for an entry
      const versions = await storageManager.getVersions(entryId!);
      return NextResponse.json(versions);
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { versionId } = await request.json();

    if (!versionId) {
      return NextResponse.json(
        { error: 'Version ID is required' },
        { status: 400 }
      );
    }

    const storageManager = await getStorageManager();
    await storageManager.restoreVersion(versionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to restore version' },
      { status: 500 }
    );
  }
}
