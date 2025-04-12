import { Database } from 'better-sqlite3';
import { FileSystemStorage } from './file-system';
import { v4 as uuidv4 } from 'uuid';

export class HybridStorageManager {
  private db: Database;
  private fileSystem: FileSystemStorage;

  constructor(db: Database, fileSystem: FileSystemStorage) {
    this.db = db;
    this.fileSystem = fileSystem;
  }

  async createEntry(content: string): Promise<string> {
    const id = uuidv4();
    const filePath = `entries/${id}.md`;

    try {
      // Start transaction
      const transaction = this.db.transaction(() => {
        // Create database entry
        this.db
          .prepare(
            `
          INSERT INTO journal_entries (id, content, file_path)
          VALUES (?, ?, ?)
        `
          )
          .run(id, content, filePath);

        // Create initial version
        this.db
          .prepare(
            `
          INSERT INTO entry_versions (id, entry_id, content, change_type)
          VALUES (?, ?, ?, 'create')
        `
          )
          .run(uuidv4(), id, content);

        // Create metadata
        this.db
          .prepare(
            `
          INSERT INTO entry_metadata (entry_id, word_count)
          VALUES (?, ?)
        `
          )
          .run(id, content.split(/\s+/).length);
      });

      transaction();

      // Create file
      await this.fileSystem.create(filePath, content);

      return id;
    } catch (error) {
      console.error('Error creating entry:', error);
      throw error;
    }
  }

  async getEntry(id: string): Promise<any> {
    try {
      const entry = this.db
        .prepare(
          `
        SELECT * FROM journal_entries WHERE id = ?
      `
        )
        .get(id);

      if (!entry) {
        throw new Error(`Entry with id ${id} not found`);
      }

      return entry;
    } catch (error) {
      console.error('Error getting entry:', error);
      throw error;
    }
  }

  async updateEntry(id: string, content: string): Promise<void> {
    try {
      const entry = await this.getEntry(id);

      // Start transaction
      const transaction = this.db.transaction(() => {
        // Update database entry
        this.db
          .prepare(
            `
          UPDATE journal_entries 
          SET content = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `
          )
          .run(content, id);

        // Create new version
        this.db
          .prepare(
            `
          INSERT INTO entry_versions (id, entry_id, content, change_type)
          VALUES (?, ?, ?, 'update')
        `
          )
          .run(uuidv4(), id, content);

        // Update metadata
        this.db
          .prepare(
            `
          UPDATE entry_metadata
          SET word_count = ?, last_accessed = CURRENT_TIMESTAMP
          WHERE entry_id = ?
        `
          )
          .run(content.split(/\s+/).length, id);
      });

      transaction();

      // Update file
      await this.fileSystem.update(entry.file_path, content);
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  }

  async deleteEntry(id: string): Promise<void> {
    try {
      const entry = await this.getEntry(id);

      // Start transaction
      const transaction = this.db.transaction(() => {
        // Delete metadata
        this.db
          .prepare(
            `
          DELETE FROM entry_metadata WHERE entry_id = ?
        `
          )
          .run(id);

        // Delete versions
        this.db
          .prepare(
            `
          DELETE FROM entry_versions WHERE entry_id = ?
        `
          )
          .run(id);

        // Delete entry
        this.db
          .prepare(
            `
          DELETE FROM journal_entries WHERE id = ?
        `
          )
          .run(id);
      });

      transaction();

      // Delete file
      await this.fileSystem.delete(entry.file_path);
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  }
}
