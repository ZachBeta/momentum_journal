import consumer from "./consumer"

document.addEventListener('DOMContentLoaded', function() {
  const journalEntryElement = document.querySelector('[data-entry-id]');
  
  if (journalEntryElement) {
    const entryId = journalEntryElement.getAttribute('data-entry-id');
    
    consumer.subscriptions.create({ channel: "AiAssistantChannel", entry_id: entryId }, {
      connected() {
        // Called when the subscription is ready for use on the server
        console.log('Connected to AI Assistant channel for entry', entryId);
      },

      disconnected() {
        // Called when the subscription has been terminated by the server
      },

      received(data) {
        // Called when there's incoming data on the websocket for this channel
        const aiResponseDiv = document.getElementById('ai-response');
        
        if (data.status === 'success' && data.prompt) {
          aiResponseDiv.innerHTML = `<p class="italic text-gray-600">${data.prompt}</p>`;
        } else if (data.status === 'error') {
          aiResponseDiv.innerHTML = `<p class="italic text-red-600">Error: ${data.message}</p>`;
        }
      },
      
      requestPrompt(content) {
        this.perform('request_prompt', { content: content, entry_id: entryId });
      }
    });
  }
});
