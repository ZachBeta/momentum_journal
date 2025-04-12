import path from 'path';
import { getDatabase } from '@/lib/db';
import { FileSystemStorage } from './file-system';
import { HybridStorageManager } from './hybrid-storage';

let storageManager: HybridStorageManager | null = null;

export async function getStorageManager() {
  if (storageManager) return storageManager;

  const db = getDatabase();
  const storageDir = path.join(process.cwd(), 'data', 'storage');
  const fileStorage = new FileSystemStorage(storageDir);

  // Initialize file storage
  await fileStorage.initialize();

  storageManager = new HybridStorageManager(db, fileStorage);

  return storageManager;
}

export async function closeStorage() {
  storageManager = null;
}
