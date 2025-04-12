# Rails Tutorial Plan for Momentum Journal

## Overview
This document outlines the Rails-specific implementation plan for Momentum Journal, focusing on Rails generators and scaffolding to build the application structure. The plan follows the same phased approach as the main development plan but with Rails-specific implementation details.

## Phase 1: Project Setup and Core Infrastructure

### Initial Setup
```bash
# Create new Rails application with PostgreSQL
rails new momentum_journal --database=postgresql --css=tailwind

# Add necessary gems to Gemfile
# - devise (authentication)
# - markdown (content formatting)
# - sqlite3 (for version history)
# - websocket-rails (real-time features)
```

### Database Setup
```bash
# Generate initial migrations
rails generate migration CreateJournalEntries title:string content:text file_path:string
rails generate migration CreateEntryVersions entry:references content:text change_type:string diff:text
rails generate migration CreateEntryMetadata entry:references tags:jsonb word_count:integer read_time:integer
```

### Model Generation
```bash
# Generate models with associations
rails generate model JournalEntry title:string content:text file_path:string
rails generate model EntryVersion entry:references content:text change_type:string diff:text
rails generate model EntryMetadata entry:references tags:jsonb word_count:integer read_time:integer
```

## Phase 2: Controller and View Scaffolding

### Journal Management
```bash
# Generate controllers with full CRUD
rails generate scaffold_controller JournalEntries index show new edit create update destroy
rails generate scaffold_controller EntryVersions index show create
rails generate scaffold_controller EntryMetadata index show update
```

### Authentication Setup
```bash
# Set up Devise for authentication
rails generate devise:install
rails generate devise User
```

## Phase 3: AI Integration Components

### AI Service Setup
```bash
# Generate service objects for AI integration
rails generate service OllamaService
rails generate service AIPromptService
```

### AI Controller and Views
```bash
# Generate AI interaction controllers
rails generate controller AIPrompts index create
rails generate controller AIResponses show
```

## Phase 4: Real-time Features

### WebSocket Setup
```bash
# Generate WebSocket channels
rails generate channel JournalUpdates
rails generate channel AIInteractions
```

### Background Jobs
```bash
# Generate background job processors
rails generate job VersionHistoryProcessor
rails generate job AIPromptProcessor
```

## Phase 5: API Endpoints

### API Controllers
```bash
# Generate API controllers
rails generate controller Api::V1::JournalEntries index show create update destroy
rails generate controller Api::V1::EntryVersions index show create
rails generate controller Api::V1::AIPrompts create
```

## Implementation Notes

### Model Relationships
```ruby
# app/models/journal_entry.rb
class JournalEntry < ApplicationRecord
  has_many :entry_versions
  has_one :entry_metadata
  validates :title, presence: true
  validates :file_path, presence: true, uniqueness: true
end

# app/models/entry_version.rb
class EntryVersion < ApplicationRecord
  belongs_to :journal_entry
  validates :change_type, presence: true
end

# app/models/entry_metadata.rb
class EntryMetadata < ApplicationRecord
  belongs_to :journal_entry
  validates :word_count, numericality: { greater_than_or_equal_to: 0 }
end
```

### Controller Organization
- Place API controllers in `app/controllers/api/v1/`
- Place service objects in `app/services/`
- Place background jobs in `app/jobs/`
- Place WebSocket channels in `app/channels/`

### View Organization
- Use partials for reusable components
- Implement Turbo Streams for real-time updates
- Use Stimulus controllers for interactive features

## Development Workflow

1. Run migrations:
```bash
rails db:migrate
```

2. Seed initial data:
```bash
rails db:seed
```

3. Start development server:
```bash
rails server
```

4. Run tests:
```bash
rails test
```

## Next Steps

1. Implement model validations and callbacks
2. Set up authentication and authorization
3. Configure WebSocket connections
4. Implement file system storage
5. Set up AI service integration
6. Add background job processing
7. Implement real-time updates
8. Add test coverage
9. Set up CI/CD pipeline 