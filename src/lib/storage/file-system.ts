import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);

export class FileSystemStorage {
  private baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  async initialize() {
    await mkdir(this.baseDir, { recursive: true });
  }

  async create(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.baseDir, filePath);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, content);
  }

  async read(filePath: string): Promise<string> {
    const fullPath = path.join(this.baseDir, filePath);
    return readFile(fullPath, 'utf-8');
  }

  async update(filePath: string, content: string): Promise<void> {
    const fullPath = path.join(this.baseDir, filePath);
    await writeFile(fullPath, content);
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(this.baseDir, filePath);
    await unlink(fullPath);
  }
}
