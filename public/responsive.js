// Add these elements to the chatApp global object
window.chatApp.saveButton = document.querySelector("#save-button");
window.chatApp.sendButton = document.querySelector("#button");

// Function to handle responsive layout
function handleResponsiveLayout() {
  // Get current window width
  const windowWidth = window.innerWidth;
  
  // Check if it's a mobile device (iPhone or similar phone resolution)
  // Common phone widths are typically 480px or less for very small phones,
  // and around 767px or less for larger phones
  const isMobileDevice = windowWidth <= 767;
  
  // Get the button container
  const buttonContainer = document.querySelector(".button-container");
  
  if (isMobileDevice) {
    // REMOVE save button completely on mobile (not just hide)
    if (window.chatApp.saveButton && window.chatApp.saveButton.parentNode) {
      window.chatApp.saveButton.parentNode.removeChild(window.chatApp.saveButton);
    }
    
    // Adjust layout for send and delete buttons
    if (buttonContainer) {
      buttonContainer.style.justifyContent = "flex-end";
      buttonContainer.style.gap = "4px"; // Reduce gap between buttons
    }
    
    // Make input field take more space
    const typingInput = document.querySelector(".typing-input");
    if (typingInput) {
      typingInput.style.flexGrow = "1";
      typingInput.style.width = "calc(100% - 90px)"; // Adjust width for better space utilization
    }
  } else {
    // Check if save button exists - if not, recreate it
    if (!document.querySelector("#save-button") && buttonContainer) {
      // Recreate the save button if we're back on desktop
      const saveButton = document.createElement("button");
      saveButton.id = "save-button";
      saveButton.className = "button";
      saveButton.innerHTML = '<i class="fas fa-save"></i> Save Chat';
      saveButton.addEventListener("click", saveChatContent);
      
      // Insert before the send button if it exists
      if (window.chatApp.sendButton && window.chatApp.sendButton.parentNode) {
        window.chatApp.sendButton.parentNode.insertBefore(saveButton, window.chatApp.sendButton);
      } else {
        // Otherwise just append to the button container
        buttonContainer.appendChild(saveButton);
      }
      
      // Update the reference
      window.chatApp.saveButton = saveButton;
    }
    
    // Reset button container layout
    if (buttonContainer) {
      buttonContainer.style.justifyContent = "";
      buttonContainer.style.gap = "8px"; // Restore default gap
    }
    
    // Reset input field
    const typingInput = document.querySelector(".typing-input");
    if (typingInput) {
      typingInput.style.flexGrow = "1";
      typingInput.style.width = "";
    }
  }
  
  // Ensure container fits well on all screens
  const container = document.querySelector(".container");
  if (container) {
    // Set max width based on screen size
    if (windowWidth <= 340) {
      container.style.maxWidth = "280px";
    } else if (windowWidth <= 480) {
      container.style.maxWidth = "320px";
    } else if (windowWidth <= 767) {
      container.style.maxWidth = "350px";
    } else {
      container.style.maxWidth = "370px"; // Default from CSS
    }
    
    // Adjust height for very small screens
    if (windowWidth <= 480 && window.innerHeight <= 600) {
      container.style.height = "85vh";
    } else {
      container.style.height = "80vh"; // Default from CSS
    }
  }
}

// Function to save chat content to localStorage
function saveChatContent() {
  if (window.chatApp.chatContainer) {
    localStorage.setItem("saved-chats", window.chatApp.chatContainer.innerHTML);
    localStorage.setItem("chat-context", JSON.stringify(window.chatApp.context));
    alert("Chat saved successfully!");
  }
}

// Add the responsive layout handler to the initialize function
function enhancedInitializeApp() {
  // Original initialization
  initializeApp();
  
  // Add save button functionality if it exists
  if (window.chatApp.saveButton) {
    window.chatApp.saveButton.addEventListener("click", saveChatContent);
  }
  
  // Initial check for responsive layout
  handleResponsiveLayout();
  
  // Add event listener for window resize
  window.addEventListener("resize", handleResponsiveLayout);
  
  // Handle orientation change for mobile devices
  window.addEventListener("orientationchange", handleResponsiveLayout);
}

// Replace the original DOMContentLoaded listener with our enhanced version
document.removeEventListener('DOMContentLoaded', initializeApp);
document.addEventListener('DOMContentLoaded', enhancedInitializeApp);
