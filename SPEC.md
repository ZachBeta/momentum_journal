# Momentum Journal Specification

## Overview
Momentum Journal is a local-first journaling application that combines distraction-free writing with gentle AI assistance to help maintain writing flow and momentum.

## Core Features
- Local-first architecture using file-based storage
- Integration with Ollama's Gemma 3B-4B model for AI assistance
- Markdown support for basic text formatting
- Auto-saving functionality
- Real-time AI interaction

## User Interface Layout
```
+-----------------+------------------+------------------+
| Journal List    |  Writing Space  |   AI Assistant   |
| (Left Rail)     |  (Main Area)    |   (Right Rail)   |
|                 |                 |                  |
| - Entry dates   | - MD Editor     | - Gentle prompts |
| - Preview text  | - Clean UI      | - Status        |
| - New entry btn | - Auto-save     | - Response area |
+-----------------+------------------+------------------+
```

### Left Rail - Journal List
- Displays list of journal entries by date
- Shows preview of entry content
- New entry creation button
- Clean, minimal design

### Main Area - Writing Space
- Continuous writing space for uninterrupted flow
- Markdown editor with preview capabilities
- Clean, distraction-free interface
- Automatic saving of content
- Plain text with attractive styling

### Right Rail - AI Assistant
- Gentle writing prompts when user pauses
- Non-intrusive interaction model
- Clear indication of AI status
- Maintains context of current writing session

## Technical Stack
- Next.js (App Router) for full-stack TypeScript application
- Tailwind CSS for styling
- MDX/Markdown support
- File system-based storage (.md files)
- WebSocket/SSE for real-time AI interactions
- Ollama integration via REST API

## AI Integration
- Uses Gemma 3B-4B model via Ollama
- Focus on gentle, momentum-maintaining prompts
- Non-judgmental, supportive interaction style
- Real-time response capabilities

## Data Storage
- File-based storage using Markdown files
- Each entry stored as separate .md file
- Future extensibility for database migration

## Future Considerations
- Rich text editing capabilities
- Database storage option
- Search functionality
- Tags and categorization
- Entry analysis and insights
- Testing with Gemma 12B model 