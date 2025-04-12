module MarkdownHelper
  def markdown(text)
    return "" if text.blank?

    renderer = Redcarpet::Render::HTML.new(
      filter_html: false,
      hard_wrap: true,
      link_attributes: { target: "_blank" }
    )

    markdown = Redcarpet::Markdown.new(
      renderer,
      autolink: true,
      tables: true,
      fenced_code_blocks: true,
      strikethrough: true,
      highlight: true,
      quote: true
    )

    content_tag(:div, markdown.render(text).html_safe, class: "prose")
  end
end
