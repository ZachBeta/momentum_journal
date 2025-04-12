require "test_helper"

class AiAssistantControllerTest < ActionDispatch::IntegrationTest
  test "should get prompt" do
    get ai_assistant_prompt_url
    assert_response :success
  end
end
