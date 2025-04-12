# Phase 1 Tutorial: Building the Core Infrastructure

This tutorial will guide you through implementing Phase 1 of the Momentum Journal project, following the checklist in `PHASE1_CHECKLIST.md`.

## Project Setup

### 1. Initialize Next.js Project

```bash
# Create a new Next.js project with TypeScript
npx create-next-app@latest momentum-journal --typescript --tailwind --eslint --app --src-dir

# Navigate to the project directory
cd momentum-journal

# Install additional dependencies
npm install prettier prettier-plugin-tailwindcss
```

Create a `.prettierrc` file:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 2. Configure Tailwind CSS

Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '65ch',
            color: 'inherit',
            a: {
              color: 'inherit',
              textDecoration: 'none',
              fontWeight: '500',
            },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
```

### 3. Project Structure

Create the directory structure:
```bash
mkdir -p src/{components,lib/{db,storage,utils},types,styles}
```

Create a `tsconfig.json` with path aliases:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@lib/*": ["./src/lib/*"],
      "@types/*": ["./src/types/*"],
      "@styles/*": ["./src/styles/*"]
    }
  }
}
```

### 4. Development Environment

Create `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

Create `.gitignore`:
```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# SQLite
*.db
*.db-journal
```

## Storage Layer

### 1. SQLite Setup

Install SQLite dependencies:
```bash
npm install better-sqlite3
npm install -D @types/better-sqlite3
```

Create `src/lib/db/schema.ts`:
```typescript
export const schema = `
CREATE TABLE IF NOT EXISTS journal_entries (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  file_path TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS entry_versions (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL,
  content TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  change_type TEXT NOT NULL,
  diff TEXT,
  FOREIGN KEY (entry_id) REFERENCES journal_entries(id)
);

CREATE TABLE IF NOT EXISTS entry_metadata (
  entry_id TEXT PRIMARY KEY,
  tags TEXT,
  word_count INTEGER DEFAULT 0,
  read_time INTEGER DEFAULT 0,
  last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entry_id) REFERENCES journal_entries(id)
);
`;
```

### 2. File System Storage

Create `src/lib/storage/file-system.ts`:
```typescript
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
```

### 3. Hybrid Storage Manager

Create `src/lib/storage/hybrid-storage.ts`:
```typescript
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

    // Start transaction
    const transaction = this.db.transaction(() => {
      // Create file
      this.fileSystem.create(filePath, content);

      // Create database entry
      this.db.prepare(`
        INSERT INTO journal_entries (id, content, file_path)
        VALUES (?, ?, ?)
      `).run(id, content, filePath);

      // Create initial version
      this.db.prepare(`
        INSERT INTO entry_versions (id, entry_id, content, change_type)
        VALUES (?, ?, ?, 'create')
      `).run(uuidv4(), id, content);

      // Create metadata
      this.db.prepare(`
        INSERT INTO entry_metadata (entry_id, word_count)
        VALUES (?, ?)
      `).run(id, content.split(/\s+/).length);
    });

    transaction();
    return id;
  }

  // Add other CRUD operations...
}
```

## Basic UI Framework

### 1. Three-Panel Layout

Create `src/components/layout/ThreePanelLayout.tsx`:
```tsx
import React from 'react';

interface ThreePanelLayoutProps {
  leftPanel: React.ReactNode;
  mainPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

export function ThreePanelLayout({
  leftPanel,
  mainPanel,
  rightPanel,
}: ThreePanelLayoutProps) {
  return (
    <div className="flex h-screen">
      <div className="w-64 border-r border-gray-200">{leftPanel}</div>
      <div className="flex-1">{mainPanel}</div>
      <div className="w-80 border-l border-gray-200">{rightPanel}</div>
    </div>
  );
}
```

### 2. Theme Setup

Create `src/styles/theme.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 0 0% 100%;
  }
}

@layer base {
  body {
    @apply bg-background text-foreground;
  }
}
```

## Testing & Documentation

### 1. Unit Tests

Install testing dependencies:
```bash
npm install -D jest @testing-library/react @testing-library/jest-dom
```

Create `jest.config.js`:
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

Create `jest.setup.js`:
```javascript
import '@testing-library/jest-dom';
```

## Next Steps

1. Complete the implementation of the Hybrid Storage Manager
2. Add more UI components
3. Implement the remaining CRUD operations
4. Add error handling and validation
5. Write tests for all components
6. Add documentation

Remember to:
- Commit your changes regularly
- Write tests as you develop
- Document your code
- Follow TypeScript best practices
- Keep performance in mind 