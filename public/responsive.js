// Create or use the existing chatApp global object
window.chatApp = window.chatApp || {};

// DOM Elements
window.chatApp.saveButton = document.querySelector("#save-button");
window.chatApp.sendButton = document.querySelector("#button");
window.chatApp.deleteButton = document.querySelector("#delete-chat-button");
window.chatApp.typingForm = document.querySelector(".typing-form");
window.chatApp.chatContainer = document.querySelector(".chat-list");
window.chatApp.container = document.querySelector(".container");
window.chatApp.buttonGroup = document.querySelector(".button-group");

// Handle responsive layout based on screen size
function handleResponsiveLayout() {
  // Get current window dimensions
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // Define breakpoints to match CSS
  const isMobile = windowWidth <= 575;
  const isSmallTablet = windowWidth > 575 && windowWidth <= 767;
  const isTablet = windowWidth > 767 && windowWidth <= 991;
  const isSmallDesktop = windowWidth > 991 && windowWidth <= 1199;
  const isLargeDesktop = windowWidth > 1199;
  
  // Handle container sizing for best user experience
  if (window.chatApp.container) {
    // Set max-width based on screen size - allowing it to scale up on larger screens
    if (isMobile) {
      // On mobile, use full width of device
      window.chatApp.container.style.maxWidth = "100%";
      window.chatApp.container.style.borderRadius = "0";
      window.chatApp.container.style.height = "90vh";
    } else if (isSmallTablet) {
      window.chatApp.container.style.maxWidth = "500px";
      window.chatApp.container.style.borderRadius = "12px";
      window.chatApp.container.style.height = "80vh";
    } else if (isTablet) {
      window.chatApp.container.style.maxWidth = "700px";
      window.chatApp.container.style.borderRadius = "12px";
      window.chatApp.container.style.height = "80vh";
    } else if (isSmallDesktop) {
      window.chatApp.container.style.maxWidth = "800px";
      window.chatApp.container.style.borderRadius = "12px";
      window.chatApp.container.style.height = "85vh";
    } else if (isLargeDesktop) {
      window.chatApp.container.style.maxWidth = "1000px";
      window.chatApp.container.style.borderRadius = "12px";
      window.chatApp.container.style.height = "85vh";
    }
    
    // Adjust for landscape orientation on small height screens
    if (windowHeight <= 500 && windowWidth > windowHeight) {
      window.chatApp.container.style.height = "90vh";
    }
  }
  
  // Make sure title bar has matching border radius
  const titleElement = document.querySelector(".title");
  if (titleElement) {
    titleElement.style.borderRadius = isMobile ? "0" : "12px 12px 0 0";
  }
  
  // Make sure typing form has matching border radius
  if (window.chatApp.typingForm) {
    window.chatApp.typingForm.style.borderRadius = isMobile ? "0" : "0 0 12px 12px";
    
    // Adjust padding for different screen sizes
    if (isMobile) {
      window.chatApp.typingForm.style.padding = windowWidth <= 360 ? "8px 8px" : "8px 10px";
    } else if (isSmallTablet) {
      window.chatApp.typingForm.style.padding = "10px 12px";
    } else {
      window.chatApp.typingForm.style.padding = "12px 15px";
    }
  }
  
  // Adjust button sizes based on screen width
  if (window.chatApp.buttonGroup) {
    // Set button sizes based on screen size
    const buttonSize = windowWidth <= 360 ? "34px" : 
                       windowWidth <= 480 ? "36px" : 
                       windowWidth <= 767 ? "38px" : "40px";
    
    // Set gap between buttons
    window.chatApp.buttonGroup.style.gap = windowWidth <= 400 ? "6px" : "10px";
    
    // Apply sizes to all buttons
    const buttons = window.chatApp.buttonGroup.querySelectorAll(".button");
    buttons.forEach(button => {
      button.style.width = buttonSize;
      button.style.height = buttonSize;
    });
  }
  
  // Adjust text bubble max-width for readability on different screen sizes
  const textElements = document.querySelectorAll(".text");
  textElements.forEach(element => {
    if (isLargeDesktop) {
      element.style.maxWidth = "70%";
    } else if (isSmallDesktop || isTablet) {
      element.style.maxWidth = "70%";
    } else if (isSmallTablet) {
      element.style.maxWidth = "75%";
    } else if (isMobile) {
      element.style.maxWidth = "80%";
    }
  });
}

// Function to save chat content to localStorage
function saveChatContent() {
  if (window.chatApp.chatContainer) {
    localStorage.setItem("saved-chats", window.chatApp.chatContainer.innerHTML);
    localStorage.setItem("chat-context", JSON.stringify(window.chatApp.context || []));
    alert("Chat saved successfully!");
  }
}

// Initialize the responsive layout
function initializeResponsiveLayout() {
  // Set up event listeners
  if (window.chatApp.saveButton) {
    window.chatApp.saveButton.addEventListener("click", saveChatContent);
  }
  
  // Run initial layout adjustment
  handleResponsiveLayout();
  
  // Set up event listeners for screen changes
  window.addEventListener("resize", handleResponsiveLayout);
  window.addEventListener("orientationchange", () => {
    // Small delay to ensure orientation change is complete
    setTimeout(handleResponsiveLayout, 100);
  });
  
  // Handle keyboard appearance on mobile
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    const typingInput = document.querySelector('.typing-input');
    if (typingInput) {
      typingInput.addEventListener('focus', () => {
        // Delay scrolling to ensure keyboard is fully open
        setTimeout(() => {
          if (window.chatApp.chatContainer) {
            window.chatApp.chatContainer.scrollTo(0, window.chatApp.chatContainer.scrollHeight);
          }
        }, 300);
      });
    }
  }
}

// Initialize immediately if DOM is already loaded
if (document.readyState === "complete" || document.readyState === "interactive") {
  initializeResponsiveLayout();
} else {
  // Otherwise wait for DOMContentLoaded
  document.addEventListener('DOMContentLoaded', initializeResponsiveLayout);
}
