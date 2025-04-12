window.chatApp.sendButton = document.querySelector("#button");

function handleResponsiveLayout() {
  const windowWidth = window.innerWidth;
  
  const buttonContainer = document.querySelector(".button-container");
  
  const typingInput = document.querySelector(".typing-input");
  if (typingInput) {
    typingInput.style.flexGrow = "1";
    typingInput.style.width = "calc(100% - 90px)"; // Adjust width for better space utilization
  }
  
  if (buttonContainer) {
    buttonContainer.style.justifyContent = "";
    buttonContainer.style.gap = "8px"; 
  }
  
  const container = document.querySelector(".container");
  if (container) {
    if (windowWidth <= 340) {
      container.style.maxWidth = "280px";
    } else if (windowWidth <= 480) {
      container.style.maxWidth = "320px";
    } else if (windowWidth <= 767) {
      container.style.maxWidth = "350px";
    } else {
      container.style.maxWidth = "370px"; 
    }
    
    if (windowWidth <= 480 && window.innerHeight <= 600) {
      container.style.height = "85vh";
    } else {
      container.style.height = "80vh";
    }
  }
}

function enhancedInitializeApp() {
  initializeApp();
  
  handleResponsiveLayout();
  
  window.addEventListener("resize", handleResponsiveLayout);
  
  window.addEventListener("orientationchange", handleResponsiveLayout);
}

document.removeEventListener('DOMContentLoaded', initializeApp);
document.addEventListener('DOMContentLoaded', enhancedInitializeApp);
