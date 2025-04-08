// Initialize the chatApp global object to share state between files
window.chatApp = {};

// DOM Elements
window.chatApp.typingForm = document.querySelector(".typing-form");
window.chatApp.chatContainer = document.querySelector(".chat-list");
window.chatApp.deleteChatButton = document.querySelector("#delete-chat-button");

// State variables
window.chatApp.isResponseGenerating = false;
window.chatApp.userMessage = null;
window.chatApp.context = []; // Store conversation context

// Function to generate response using fetch to Python backend
async function generateAPIResponse(incomingMessageDiv) {
  const textElement = incomingMessageDiv.querySelector(".text");

  try {
    // Build payload with the query and conversation context
    const payload = {
      query: window.chatApp.userMessage,
      context: window.chatApp.context // Include conversation history
    };

    // Send request to Python backend
    const response = await fetch("https://render-chatbot-2.onrender.com/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // Extract the response text from the Gemini response
    const apiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                       "Sorry, I couldn't generate a response.";

    // Update conversation context
    window.chatApp.context.push({ role: "user", content: window.chatApp.userMessage });
    window.chatApp.context.push({ role: "assistant", content: apiResponse });

    // Display response with enhanced typing effect
    window.typingEffects.showEnhancedTypingEffect(apiResponse, textElement, incomingMessageDiv);
  } catch (error) {
    console.error("API response error:", error);
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

// Show a placeholder message while waiting for the API response
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
    // Start API response generation immediately for faster response
    generateAPIResponse(incomingMessageDiv);
  } else {
    console.error("Chat container not found");
  }
}

// Handle sending outgoing chat messages
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
  
  if (window.chatApp.chatContainer) {
    window.chatApp.chatContainer.appendChild(outgoingMessageDiv);
    window.chatApp.typingForm.reset(); // Clear input field
    document.body.classList.add("hide-header");
    window.chatApp.chatContainer.scrollTo(0, window.chatApp.chatContainer.scrollHeight);

    // Generate response immediately for faster perception
    showPlaceholderMessage();
  } else {
    console.error("Chat container not found");
  }
}

// Display a welcome message with a SLOWER typing effect
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
    // Use the slower typing effect specifically for welcome message
    window.typingEffects.showSlowerTypingEffect(welcomeMessage, textElement, welcomeMessageDiv);
    window.chatApp.chatContainer.scrollTo(0, window.chatApp.chatContainer.scrollHeight);
  } else {
    console.error("Chat container not found");
  }
}

// Load theme and chat data from local storage on page load
function loadDataFromLocalstorage() {
  const savedChats = localStorage.getItem("saved-chats");
  const savedContext = localStorage.getItem("chat-context");

  // Restore conversation context if available
  if (savedContext) {
    try {
      window.chatApp.context = JSON.parse(savedContext);
    } catch (e) {
      console.error("Error parsing saved context:", e);
      window.chatApp.context = [];
    }
  }

  // Restore saved chats or show a welcome message
  if (window.chatApp.chatContainer) {
    window.chatApp.chatContainer.innerHTML = savedChats || '';
    document.body.classList.toggle("hide-header", savedChats);
    window.chatApp.chatContainer.scrollTo(0, window.chatApp.chatContainer.scrollHeight); // Scroll to the bottom

    // Display a welcome message if no chats are found
    if (!savedChats) {
      displayWelcomeMessage();
    }
  } else {
    console.error("Chat container not found");
  }
}

// Initialize event listeners and application
function initializeApp() {
  // Delete all chats from local storage when button is clicked
  if (window.chatApp.deleteChatButton) {
    window.chatApp.deleteChatButton.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("saved-chats");
        localStorage.removeItem("chat-context");
        window.chatApp.context = [];
        loadDataFromLocalstorage();
      }
    });
  } else {
    console.warn("Delete chat button not found");
  }

  // Prevent default form submission and handle outgoing chat
  if (window.chatApp.typingForm) {
    window.chatApp.typingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleOutgoingChat();
    });
  } else {
    console.error("Typing form not found");
  }

  // Load data from local storage
  loadDataFromLocalstorage();
}

// Initialize the application when DOM content is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
