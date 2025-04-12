class JournalEntry < ApplicationRecord
  has_many :entry_versions, dependent: :destroy

  validates :title, presence: true

  after_save :save_to_file
  after_save :create_version
  before_destroy :remove_file

  def file_content
    @file_content ||= begin
      if file_path.present?
        storage_service.read_from_file(file_path) || content
      else
        content
      end
    end
  end

  private

  def storage_service
    @storage_service ||= FileStorageService.new
  end

  def save_to_file
    storage_service.save_to_file(self)
  end

  def remove_file
    storage_service.delete_file(file_path) if file_path.present?
  end

  def create_version
    entry_versions.create(
      content: content,
      change_type: versions_count.zero? ? "create" : "update",
      diff: generate_diff
    )
  end

  def versions_count
    entry_versions.count
  end

  def generate_diff
    previous_version = entry_versions.order(created_at: :desc).first
    return nil if previous_version.nil?

    # A simple diff implementation - in a real app you might use a proper diff gem
    "Changes between versions"
  end
end
