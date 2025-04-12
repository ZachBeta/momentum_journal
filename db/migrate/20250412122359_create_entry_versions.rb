class CreateEntryVersions < ActiveRecord::Migration[8.0]
  def change
    create_table :entry_versions do |t|
      t.references :journal_entry, null: false, foreign_key: true
      t.text :content
      t.string :change_type
      t.text :diff

      t.timestamps
    end
  end
end
