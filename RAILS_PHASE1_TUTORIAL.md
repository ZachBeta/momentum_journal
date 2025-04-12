# Rails Phase 1 Tutorial: Building the Core Infrastructure

This tutorial will guide you through implementing Phase 1 of the Momentum Journal project using Ruby on Rails with Hotwire.

## Project Setup

### 1. Initialize Rails Project

```bash
# Create a new Rails project with PostgreSQL
rails new momentum_journal --database=postgresql --css=tailwind --javascript=esbuild

# Navigate to the project directory
cd momentum_journal

# Add additional gems to Gemfile
```

Update your `Gemfile`:
```ruby
source "https://rubygems.org"

# ... existing gems ...

# For local-first storage
gem 'sqlite3'
gem 'fileutils'

# For markdown support
gem 'redcarpet'

# For versioning
gem 'paper_trail'

# For real-time features
gem 'redis'
gem 'hiredis-client'

# For development
group :development do
  gem 'debug'
  gem 'rspec-rails'
  gem 'factory_bot_rails'
  gem 'faker'
end
```

### 2. Configure Tailwind CSS

The `--css=tailwind` flag already set up Tailwind, but let's customize it:

Update `config/tailwind.config.js`:
```javascript
module.exports = {
  content: [
    './app/views/**/*.erb',
    './app/helpers/**/*.rb',
    './app/javascript/**/*.js',
    './app/components/**/*.{erb,rb}',
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
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}
```

### 3. Project Structure

Rails provides a conventional structure, but let's organize our code:

```bash
mkdir -p app/{components,services,models/concerns}
```

Create initial models:
```bash
rails generate model JournalEntry content:text file_path:string
rails generate model EntryVersion entry:references content:text change_type:string diff:text
rails generate model EntryMetadata entry:references tags:text word_count:integer read_time:integer
```

### 4. Storage Layer

Create `app/services/storage/hybrid_storage.rb`:
```ruby
module Storage
  class HybridStorage
    def initialize(base_dir = Rails.root.join('storage', 'entries'))
      @base_dir = base_dir
      FileUtils.mkdir_p(@base_dir)
    end

    def create_entry(content)
      ActiveRecord::Base.transaction do
        # Create file
        entry = JournalEntry.create!(
          content: content,
          file_path: generate_file_path
        )
        
        save_to_file(entry)
        create_version(entry, 'create')
        create_metadata(entry)
        
        entry
      end
    end

    private

    def generate_file_path
      "entries/#{SecureRandom.uuid}.md"
    end

    def save_to_file(entry)
      full_path = @base_dir.join(entry.file_path)
      FileUtils.mkdir_p(File.dirname(full_path))
      File.write(full_path, entry.content)
    end

    def create_version(entry, change_type)
      EntryVersion.create!(
        entry: entry,
        content: entry.content,
        change_type: change_type
      )
    end

    def create_metadata(entry)
      EntryMetadata.create!(
        entry: entry,
        word_count: entry.content.split(/\s+/).length
      )
    end
  end
end
```

### 5. Basic UI Framework

Create the three-panel layout using Hotwire:

Create `app/views/layouts/application.html.erb`:
```erb
<!DOCTYPE html>
<html>
  <head>
    <title>Momentum Journal</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <%= csrf_meta_tags %>
    <%= csp_meta_tag %>
    <%= stylesheet_link_tag "tailwind", "inter-font", "data-turbo-track": "reload" %>
    <%= stylesheet_link_tag "application", "data-turbo-track": "reload" %>
    <%= javascript_importmap_tags %>
  </head>

  <body class="h-screen flex">
    <%= render "shared/sidebar" %>
    <main class="flex-1">
      <%= yield %>
    </main>
    <%= render "shared/ai_assistant" %>
  </body>
</html>
```

Create `app/views/shared/_sidebar.html.erb`:
```erb
<aside class="w-64 border-r border-gray-200 bg-white">
  <div class="p-4">
    <h1 class="text-xl font-bold">Momentum Journal</h1>
    <%= link_to "New Entry", new_journal_entry_path, 
        class: "mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700" %>
  </div>
  
  <%= turbo_frame_tag "journal_list" do %>
    <%= render "journal_entries/list" %>
  <% end %>
</aside>
```

Create `app/views/shared/_ai_assistant.html.erb`:
```erb
<aside class="w-80 border-l border-gray-200 bg-white">
  <div class="p-4">
    <h2 class="text-lg font-semibold">AI Assistant</h2>
    <%= turbo_frame_tag "ai_assistant" do %>
      <div class="mt-4">
        <!-- AI content will be streamed here -->
      </div>
    <% end %>
  </div>
</aside>
```

### 6. Controllers and Routes

Update `config/routes.rb`:
```ruby
Rails.application.routes.draw do
  root "journal_entries#index"
  
  resources :journal_entries do
    member do
      post :auto_save
      get :versions
    end
  end
end
```

Create `app/controllers/journal_entries_controller.rb`:
```ruby
class JournalEntriesController < ApplicationController
  def index
    @entries = JournalEntry.order(created_at: :desc)
  end

  def show
    @entry = JournalEntry.find(params[:id])
  end

  def new
    @entry = JournalEntry.new
  end

  def create
    @entry = Storage::HybridStorage.new.create_entry(entry_params[:content])
    redirect_to @entry, notice: 'Entry created successfully.'
  end

  def auto_save
    @entry = JournalEntry.find(params[:id])
    @entry.update(content: params[:content])
    head :ok
  end

  private

  def entry_params
    params.require(:journal_entry).permit(:content)
  end
end
```

### 7. Testing Setup

Initialize RSpec:
```bash
rails generate rspec:install
```

Create `spec/models/journal_entry_spec.rb`:
```ruby
require 'rails_helper'

RSpec.describe JournalEntry, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:content) }
    it { should validate_presence_of(:file_path) }
  end

  describe 'associations' do
    it { should have_many(:versions) }
    it { should have_one(:metadata) }
  end
end
```

## Next Steps

1. Complete the implementation of the Hybrid Storage service
2. Add more UI components using Hotwire
3. Implement the remaining CRUD operations
4. Add error handling and validation
5. Write tests for all components
6. Add documentation

Remember to:
- Follow Rails conventions
- Write tests as you develop
- Document your code
- Keep performance in mind
- Use Hotwire for real-time updates 