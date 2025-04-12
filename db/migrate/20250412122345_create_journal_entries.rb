class CreateJournalEntries < ActiveRecord::Migration[8.0]
  def change
    create_table :journal_entries do |t|
      t.string :title
      t.text :content
      t.string :file_path

      t.timestamps
    end
  end
end
