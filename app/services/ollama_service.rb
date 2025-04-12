require "net/http"
require "json"

class OllamaService
  BASE_URL = ENV.fetch("OLLAMA_BASE_URL", "http://localhost:11434")
  MODEL = ENV.fetch("OLLAMA_MODEL", "gemma")

  def initialize(model = MODEL)
    @model = model
  end

  def generate_prompt(content, context = nil)
    response = post_request(
      "/api/generate",
      {
        model: @model,
        prompt: build_prompt(content),
        context: context,
        stream: false
      }
    )

    if response && response["response"]
      response["response"]
    else
      "I'm sorry, I couldn't generate a response at this time."
    end
  end

  private

  def build_prompt(content)
    <<~PROMPT
      As a gentle writing assistant, provide a brief prompt or question to help the user continue their journal entry.#{' '}
      Be supportive, non-judgmental, and focus on maintaining the user's writing momentum.

      Here's what they've written so far:

      #{content}

      Respond with a short, encouraging question or prompt to help them continue writing.
    PROMPT
  end

  def post_request(endpoint, params)
    uri = URI("#{BASE_URL}#{endpoint}")
    http = Net::HTTP.new(uri.host, uri.port)

    request = Net::HTTP::Post.new(uri)
    request["Content-Type"] = "application/json"
    request.body = params.to_json

    begin
      response = http.request(request)
      if response.code == "200"
        JSON.parse(response.body)
      else
        Rails.logger.error("Ollama API error: #{response.code} - #{response.body}")
        nil
      end
    rescue => e
      Rails.logger.error("Ollama API connection error: #{e.message}")
      nil
    end
  end
end
