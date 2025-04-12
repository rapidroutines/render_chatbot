window.chatApp = {};

window.chatApp.typingForm = document.querySelector(".typing-form");
window.chatApp.chatContainer = document.querySelector(".chat-list");
window.chatApp.deleteChatButton = document.querySelector("#delete-chat-button");

window.chatApp.isResponseGenerating = false;
window.chatApp.userMessage = null;
window.chatApp.context = []; 
window.chatApp.loadedMessages = new Set(); // Track loaded messages to prevent duplicates

function notifyParentWindow(role, content) {
  try {
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

function notifyChatEnd() {
  try {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: "chatEnded"
      }, "*");
    }
  } catch (e) {
    console.error("Error sending chat end notification:", e);
  }
}

// New function to handle message loading from parent
function loadMessage(role, content) {
  try {
    if (!content) return;
    
    // Create a unique message ID to prevent duplicates
    const messageId = `${role}-${content.substring(0, 20)}`;
    
    // Skip if already loaded
    if (window.chatApp.loadedMessages.has(messageId)) {
      console.log("Skipping duplicate message:", messageId);
      return;
    }
    
    // Mark as loaded
    window.chatApp.loadedMessages.add(messageId);
    
    if (role === "user") {
      // Create outgoing message element
      const html = `
        <div class="message-content">
          <p class="text"></p>
        </div>
      `;
      
      const outgoingMessageDiv = window.messageUtils.createMessageElement(html, "outgoing");
      outgoingMessageDiv.querySelector(".text").innerText = content;
      
      if (window.chatApp.chatContainer) {
        window.chatApp.chatContainer.appendChild(outgoingMessageDiv);
      }
      
      // Add to context
      window.chatApp.context.push({ role: "user", content: content });
    } else if (role === "assistant") {
      // Create incoming message element
      const html = `
        <div class="message-content">
          <img class="avatar" src="logo.jpg" alt="">
          <p class="text"></p>
        </div>
      `;
      
      const incomingMessageDiv = window.messageUtils.createMessageElement(html, "incoming");
      
      if (window.chatApp.chatContainer) {
        window.chatApp.chatContainer.appendChild(incomingMessageDiv);
        const textElement = incomingMessageDiv.querySelector(".text");
        
        // Add text immediately to improve loading speed
        textElement.innerText = content;
      }
      
      // Add to context
      window.chatApp.context.push({ role: "assistant", content: content });
    }
    
    // Hide header and scroll to bottom
    document.body.classList.add("hide-header");
    if (window.chatApp.chatContainer) {
      window.chatApp.chatContainer.scrollTo(0, window.chatApp.chatContainer.scrollHeight);
    }
    
    // Save to localStorage
    localStorage.setItem("saved-chats", window.chatApp.chatContainer.innerHTML);
    localStorage.setItem("chat-context", JSON.stringify(window.chatApp.context));
    
  } catch (e) {
    console.error("Error loading message:", e);
  }
}

window.addEventListener('beforeunload', function() {
  notifyChatEnd();
});

// Listen for messages from parent window
window.addEventListener('message', function(event) {
  try {
    // Accept messages from any origin
    if (event.data && event.data.type === "loadMessage" && event.data.role && event.data.content) {
      console.log("Received load message request:", event.data);
      loadMessage(event.data.role, event.data.content);
    }
  } catch (e) {
    console.error("Error handling message from parent:", e);
  }
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
        window.chatApp.loadedMessages.clear();
        
        notifyChatEnd();
        
        if (window.chatApp.chatContainer) {
          window.chatApp.chatContainer.innerHTML = '';
        }
        
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
  
  // Signal to parent that the iframe is ready
  if (window.parent && window.parent !== window) {
    setTimeout(() => {
      try {
        window.parent.postMessage({
          type: "iframeReady"
        }, "*");
      } catch (e) {
        console.error("Error sending ready signal to parent:", e);
      }
    }, 500);
  }
}

document.addEventListener('DOMContentLoaded', initializeApp);
