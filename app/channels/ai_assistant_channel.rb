class AiAssistantChannel < ApplicationCable::Channel
  def subscribed
    stream_from "ai_assistant_channel_#{params[:entry_id]}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def request_prompt(data)
    content = data["content"]
    entry_id = data["entry_id"]

    # Generate AI prompt asynchronously
    Thread.new do
      begin
        prompt = OllamaService.new.generate_prompt(content)

        # Broadcast the prompt back to the client
        ActionCable.server.broadcast(
          "ai_assistant_channel_#{entry_id}",
          { prompt: prompt, status: "success" }
        )
      rescue => e
        ActionCable.server.broadcast(
          "ai_assistant_channel_#{entry_id}",
          { status: "error", message: e.message }
        )
      end
    end
  end
end
