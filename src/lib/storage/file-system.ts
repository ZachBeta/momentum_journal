import fs from 'fs';
import path from 'path';

export class FileSystemStorage {
  private baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  async initialize() {
    await fs.promises.mkdir(this.baseDir, { recursive: true });
  }

  async create(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.baseDir, filePath);
    await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.promises.writeFile(fullPath, content);
  }

  async read(filePath: string): Promise<string> {
    const fullPath = path.join(this.baseDir, filePath);
    return fs.promises.readFile(fullPath, 'utf-8');
  }

  async update(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.baseDir, filePath);
    await fs.promises.writeFile(fullPath, content);
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, filePath);
    await fs.promises.unlink(fullPath);
  }
}
