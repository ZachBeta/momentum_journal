# Momentum Journal

A journaling app that helps you keep writing using AI assistance.

## Features

- Modern, responsive three-panel layout
- Local-first storage using SQLite and the file system
- Built with Next.js, React, TypeScript, and Tailwind CSS

## Project Structure

```
src/
├── app/
├── components/
├── lib/
│   ├── db/
│   ├── storage/
│   └── utils/
├── types/
└── styles/
```

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/momentum-journal.git
   cd momentum-journal
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the development server

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

### Database

The app uses SQLite for storing structured data and the file system for storing the actual journal entries.

### Storage Layer

The storage layer is implemented using a hybrid approach:

- SQLite for metadata, versioning, and indexing
- File system for storing the actual content

### UI Framework

The UI is built around a three-panel layout:

- Left panel: Journal list
- Middle panel: Editor
- Right panel: AI assistant

## License

ISC
