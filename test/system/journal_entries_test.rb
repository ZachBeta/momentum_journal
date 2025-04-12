require "application_system_test_case"

class JournalEntriesTest < ApplicationSystemTestCase
  setup do
    @journal_entry = journal_entries(:one)
  end

  test "visiting the index" do
    visit journal_entries_url
    assert_selector "h1", text: "Journal entries"
  end

  test "should create journal entry" do
    visit journal_entries_url
    click_on "New journal entry"

    fill_in "Content", with: @journal_entry.content
    fill_in "File path", with: @journal_entry.file_path
    fill_in "Title", with: @journal_entry.title
    click_on "Create Journal entry"

    assert_text "Journal entry was successfully created"
    click_on "Back"
  end

  test "should update Journal entry" do
    visit journal_entry_url(@journal_entry)
    click_on "Edit this journal entry", match: :first

    fill_in "Content", with: @journal_entry.content
    fill_in "File path", with: @journal_entry.file_path
    fill_in "Title", with: @journal_entry.title
    click_on "Update Journal entry"

    assert_text "Journal entry was successfully updated"
    click_on "Back"
  end

  test "should destroy Journal entry" do
    visit journal_entry_url(@journal_entry)
    accept_confirm { click_on "Destroy this journal entry", match: :first }

    assert_text "Journal entry was successfully destroyed"
  end
end
