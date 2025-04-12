# Momentum Journal Rails Tutorial Plan

## Overview
This tutorial outlines how to implement the Momentum Journal application using Ruby on Rails. We'll leverage Rails' scaffold generators to quickly set up the core functionality while maintaining the specifications outlined in SPEC.md.

## Phase 1: Initial Setup and Core Models

### Step 1: Create a new Rails application
```bash
rails new momentum_journal --database=sqlite3 --javascript=esbuild --css=tailwind
cd momentum_journal
```

### Step 2: Generate the Journal Entry scaffold
```bash
rails g scaffold JournalEntry title:string content:text file_path:string --no-jbuilder
```

### Step 3: Generate EntryVersion model for version history
```bash
rails g model EntryVersion journal_entry:references content:text change_type:string diff:text
```

### Step 4: Migration for database setup
```bash
rails db:migrate
```

## Phase 2: UI Framework

### Step 1: Generate the Home controller
```bash
rails g controller Home index
```

### Step 2: Set up the three-panel layout
- Create the layout partials for:
  - Left Rail (Journal list)
  - Main Area (Writing space)
  - Right Rail (AI Assistant)

### Step 3: Set up routes
```ruby
# config/routes.rb
root 'home#index'
resources :journal_entries
```

## Phase 3: File System Integration

### Step 1: Create a service for file operations
```bash
mkdir -p app/services
touch app/services/file_storage_service.rb
```

### Step 2: Implement file system methods in the service
- Method to save entry content to markdown files
- Method to read markdown files into entries
- Method to handle synchronization between DB and files

## Phase 4: Markdown Support

### Step 1: Add the required gems
```bash
bundle add redcarpet
```

### Step 2: Create a markdown helper
```bash
rails g helper Markdown
```

### Step 3: Implement the markdown preview functionality
- Create JavaScript for live preview
- Set up the markdown editor interface

## Phase 5: AI Integration with Ollama

### Step 1: Generate the AI assistant controller
```bash
rails g controller AiAssistant prompt --no-jbuilder
```

### Step 2: Create Ollama API service
```bash
touch app/services/ollama_service.rb
```

### Step 3: Set up real-time updates with Action Cable
```bash
rails g channel AiAssistant
```

## Phase 6: Enhanced Features

### Step 1: Generate controller for entry statistics
```bash
rails g controller EntryStats show
```

### Step 2: Add search functionality
```bash
rails g controller Search index
```

### Step 3: Implement tagging system
```bash
rails g model Tag name:string
rails g model EntryTag journal_entry:references tag:references
```

## Phase 7: Polish and Testing

### Step 1: Generate system tests
```bash
rails g system_test journal_workflow
```

### Step 2: Generate controller tests
```bash
rails g test_unit:controller journal_entries
rails g test_unit:controller ai_assistant
```

### Step 3: Create model tests
```bash
rails g test_unit:model journal_entry
rails g test_unit:model entry_version
```

## Database Schema

```ruby
# journal_entries table
create_table "journal_entries", force: :cascade do |t|
  t.string "title"
  t.text "content"
  t.string "file_path"
  t.datetime "created_at", null: false
  t.datetime "updated_at", null: false
end

# entry_versions table
create_table "entry_versions", force: :cascade do |t|
  t.references "journal_entry", null: false, foreign_key: true
  t.text "content"
  t.string "change_type"
  t.text "diff"
  t.datetime "created_at", null: false
  t.datetime "updated_at", null: false
end

# tags table
create_table "tags", force: :cascade do |t|
  t.string "name"
  t.datetime "created_at", null: false
  t.datetime "updated_at", null: false
  t.index ["name"], name: "index_tags_on_name", unique: true
end

# entry_tags table
create_table "entry_tags", force: :cascade do |t|
  t.references "journal_entry", null: false, foreign_key: true
  t.references "tag", null: false, foreign_key: true
  t.datetime "created_at", null: false
  t.datetime "updated_at", null: false
  t.index ["journal_entry_id", "tag_id"], name: "index_entry_tags_on_journal_entry_id_and_tag_id", unique: true
end
```

## Implementation Notes

1. The application will maintain the three-panel layout specified in SPEC.md
2. We'll use a hybrid storage approach with SQLite for metadata and filesystem for content
3. Real-time AI interactions will be handled through Action Cable
4. All markdown files will be stored in a designated directory within the app
5. Auto-save functionality will be implemented using JavaScript with AJAX calls

## Next Steps After Setup

1. Implement the file synchronization logic
2. Set up the Ollama API integration
3. Enhance the UI with Tailwind CSS
4. Add keyboard shortcuts for improved UX
5. Implement the version history viewer 