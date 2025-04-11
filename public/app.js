window.chatApp = {};

window.chatApp.typingForm = document.querySelector(".typing-form");
window.chatApp.chatContainer = document.querySelector(".chat-list");
window.chatApp.deleteChatButton = document.querySelector("#delete-chat-button");

window.chatApp.isResponseGenerating = false;
window.chatApp.userMessage = null;
window.chatApp.context = []; 

// Function to notify parent window about chat messages
function notifyParentWindow(role, content) {
  try {
    // Check if we're in an iframe
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: "chatMessage",
        role: role,
        content: content
      }, "*");
    }
  } catch (e) {
    console.error("Error sending message to parent window:", e);
  }
}

// Function to notify parent when chat is ended
function notifyChatEnd() {
  try {
    // Check if we're in an iframe
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: "chatEnded"
      }, "*");
    }
  } catch (e) {
    console.error("Error sending chat end notification:", e);
  }
}

// Listen for beforeunload event to notify parent when closing chat
window.addEventListener('beforeunload', function() {
  notifyChatEnd();
});

async function generateAPIResponse(incomingMessageDiv) {
  const textElement = incomingMessageDiv.querySelector(".text");

  try {
    const payload = {
      query: window.chatApp.userMessage,
      context: window.chatApp.context 
    };

    const response = await fetch("https://render-chatbot-di08.onrender.com/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    const apiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                       "Sorry, I couldn't generate a response.";

    window.chatApp.context.push({ role: "user", content: window.chatApp.userMessage });
    window.chatApp.context.push({ role: "assistant", content: apiResponse });
    
    // Notify parent window about assistant response
    notifyParentWindow("assistant", apiResponse);

    window.typingEffects.showEnhancedTypingEffect(apiResponse, textElement, incomingMessageDiv);
  } catch (error) {
    window.chatApp.isResponseGenerating = false;
    
    if (textElement) {
      textElement.innerText = "Sorry, I encountered an error. Please try again later.";
      textElement.parentElement.closest(".message").classList.add("error");
    }
  } finally {
    if (incomingMessageDiv) {
      incomingMessageDiv.classList.remove("loading");
    }
  }
}

function showPlaceholderMessage() {
  const html = `
    <div class="message-content">
      <img class="avatar" src="logo.jpg" alt="">
      <p class="text"></p>
    </div>
  `;

  const incomingMessageDiv = window.messageUtils.createMessageElement(html, "incoming", "loading");
  
  if (window.chatApp.chatContainer) {
    window.chatApp.chatContainer.appendChild(incomingMessageDiv);
    window.chatApp.chatContainer.scrollTo(0, window.chatApp.chatContainer.scrollHeight);
    generateAPIResponse(incomingMessageDiv);
  } else {
    console.error("Chat container not found");
  }
}

function handleOutgoingChat() {
  window.chatApp.userMessage = window.chatApp.typingForm.querySelector(".typing-input").value.trim();
  
  if (!window.chatApp.userMessage || window.chatApp.isResponseGenerating) return;

  window.chatApp.isResponseGenerating = true;

  const html = `
    <div class="message-content">
      <p class="text"></p>
    </div>
  `;

  const outgoingMessageDiv = window.messageUtils.createMessageElement(html, "outgoing");
  outgoingMessageDiv.querySelector(".text").innerText = window.chatApp.userMessage;
  
  // Notify parent window about user message
  notifyParentWindow("user", window.chatApp.userMessage);
  
  if (window.chatApp.chatContainer) {
    window.chatApp.chatContainer.appendChild(outgoingMessageDiv);
    window.chatApp.typingForm.reset(); 
    document.body.classList.add("hide-header");
    window.chatApp.chatContainer.scrollTo(0, window.chatApp.chatContainer.scrollHeight);

    showPlaceholderMessage();
  } else {
    console.error("Chat container not found");
  }
}

function displayWelcomeMessage() {
  const welcomeMessage = window.messageUtils.getRandomWelcomeMessage();
  
  const html = `
    <div class="message-content">
      <img class="avatar" src="logo.jpg" alt="">
      <p class="text"></p>
    </div>
  `;

  const welcomeMessageDiv = window.messageUtils.createMessageElement(html, "incoming");
  
  if (window.chatApp.chatContainer) {
    window.chatApp.chatContainer.appendChild(welcomeMessageDiv);
    const textElement = welcomeMessageDiv.querySelector(".text");
    window.typingEffects.showSlowerTypingEffect(welcomeMessage, textElement, welcomeMessageDiv);
    window.chatApp.chatContainer.scrollTo(0, window.chatApp.chatContainer.scrollHeight);
    
    // Notify parent window about assistant welcome message
    notifyParentWindow("assistant", welcomeMessage);
  } else {
    console.error("Chat container not found");
  }
}

function loadDataFromLocalstorage() {
  const savedChats = localStorage.getItem("saved-chats");
  const savedContext = localStorage.getItem("chat-context");

  if (savedContext) {
    try {
      window.chatApp.context = JSON.parse(savedContext);
    } catch (e) {
      window.chatApp.context = [];
    }
  }

  if (window.chatApp.chatContainer) {
    window.chatApp.chatContainer.innerHTML = savedChats || '';
    document.body.classList.toggle("hide-header", savedChats);
    window.chatApp.chatContainer.scrollTo(0, window.chatApp.chatContainer.scrollHeight); 

    if (!savedChats) {
      displayWelcomeMessage();
    } else {
      // Send existing messages to parent window for history tracking
      try {
        const messages = document.querySelectorAll('.message');
        messages.forEach(message => {
          const isOutgoing = message.classList.contains('outgoing');
          const textElement = message.querySelector('.text');
          if (textElement && textElement.innerText) {
            notifyParentWindow(
              isOutgoing ? "user" : "assistant", 
              textElement.innerText
            );
          }
        });
      } catch (e) {
        console.error("Error sending existing messages to parent:", e);
      }
    }
  } else {
    console.error("Chat container not found");
  }
}

function initializeApp() {
  if (window.chatApp.deleteChatButton) {
    window.chatApp.deleteChatButton.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("saved-chats");
        localStorage.removeItem("chat-context");
        window.chatApp.context = [];
        
        // Notify parent that chat has ended (for saving purposes)
        notifyChatEnd();
        
        loadDataFromLocalstorage();
      }
    });
  } 

  if (window.chatApp.typingForm) {
    window.chatApp.typingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleOutgoingChat();
    });
  } 

  loadDataFromLocalstorage();
}

document.addEventListener('DOMContentLoaded', initializeApp);
