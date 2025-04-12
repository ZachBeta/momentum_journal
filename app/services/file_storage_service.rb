class FileStorageService
  def initialize(storage_dir = Rails.root.join("storage", "journal_entries"))
    @storage_dir = storage_dir
    ensure_storage_directory_exists
  end

  def save_to_file(entry)
    file_path = get_file_path(entry)
    ensure_directory_exists(File.dirname(file_path))

    File.open(file_path, "w") do |file|
      file.write(format_content(entry))
    end

    # Update the file_path in the entry if it's not already set
    unless entry.file_path == relative_path(file_path)
      entry.update(file_path: relative_path(file_path))
    end

    file_path
  end

  def read_from_file(file_path)
    full_path = File.join(@storage_dir, file_path)
    if File.exist?(full_path)
      File.read(full_path)
    else
      nil
    end
  end

  def delete_file(file_path)
    full_path = File.join(@storage_dir, file_path)
    File.delete(full_path) if File.exist?(full_path)
  end

  private

  def ensure_storage_directory_exists
    FileUtils.mkdir_p(@storage_dir) unless Dir.exist?(@storage_dir)
  end

  def ensure_directory_exists(directory)
    FileUtils.mkdir_p(directory) unless Dir.exist?(directory)
  end

  def get_file_path(entry)
    if entry.file_path.present?
      File.join(@storage_dir, entry.file_path)
    else
      # Generate a new file path based on the entry's title and id
      date_str = entry.created_at.strftime("%Y-%m-%d")
      file_name = "#{date_str}-#{entry.title.parameterize}.md"
      File.join(@storage_dir, date_str, file_name)
    end
  end

  def relative_path(file_path)
    file_path.sub("#{@storage_dir}/", "")
  end

  def format_content(entry)
    <<~MARKDOWN
    # #{entry.title}

    #{entry.content}
    MARKDOWN
  end
end
