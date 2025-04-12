import { FileSystemStorage } from '../file-system';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs and path modules
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
    unlink: jest.fn(),
  },
}));

describe('FileSystemStorage', () => {
  let storage: FileSystemStorage;
  const baseDir = '/test/dir';

  beforeEach(() => {
    jest.clearAllMocks();
    storage = new FileSystemStorage(baseDir);
  });

  describe('initialize', () => {
    it('creates the base directory', async () => {
      await storage.initialize();
      expect(fs.promises.mkdir).toHaveBeenCalledWith(baseDir, {
        recursive: true,
      });
    });
  });

  describe('create', () => {
    it('creates a file with content', async () => {
      const filePath = 'test.txt';
      const content = 'test content';
      const fullPath = path.join(baseDir, filePath);

      await storage.create(filePath, content);

      expect(fs.promises.mkdir).toHaveBeenCalledWith(path.dirname(fullPath), {
        recursive: true,
      });
      expect(fs.promises.writeFile).toHaveBeenCalledWith(fullPath, content);
    });
  });

  describe('read', () => {
    it('reads a file content', async () => {
      const filePath = 'test.txt';
      const content = 'test content';
      const fullPath = path.join(baseDir, filePath);

      (fs.promises.readFile as jest.Mock).mockResolvedValue(content);

      const result = await storage.read(filePath);

      expect(fs.promises.readFile).toHaveBeenCalledWith(fullPath, 'utf-8');
      expect(result).toBe(content);
    });
  });

  describe('update', () => {
    it('updates a file with new content', async () => {
      const filePath = 'test.txt';
      const content = 'updated content';
      const fullPath = path.join(baseDir, filePath);

      await storage.update(filePath, content);

      expect(fs.promises.writeFile).toHaveBeenCalledWith(fullPath, content);
    });
  });

  describe('delete', () => {
    it('deletes a file', async () => {
      const filePath = 'test.txt';
      const fullPath = path.join(baseDir, filePath);

      await storage.delete(filePath);

      expect(fs.promises.unlink).toHaveBeenCalledWith(fullPath);
    });
  });
});
