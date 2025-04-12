class AiAssistantController < ApplicationController
  def prompt
    return render json: { error: "No content provided" }, status: :bad_request if params[:content].blank?

    prompt = ollama_service.generate_prompt(params[:content])

    respond_to do |format|
      format.json { render json: { prompt: prompt } }
      format.html { render :prompt, locals: { prompt: prompt } }
    end
  end

  private

  def ollama_service
    @ollama_service ||= OllamaService.new
  end
end
