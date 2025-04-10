window.chatApp.saveButton = document.querySelector("#save-button");
window.chatApp.sendButton = document.querySelector("#button");

function handleResponsiveLayout() {
  const windowWidth = window.innerWidth;
  

  
  const buttonContainer = document.querySelector(".button-container");
  
  
    
   
    
    const typingInput = document.querySelector(".typing-input");
    if (typingInput) {
      typingInput.style.flexGrow = "1";
      typingInput.style.width = "calc(100% - 90px)"; // Adjust width for better space utilization
    }
  } else {
    if (!document.querySelector("#save-button") && buttonContainer) {
      const saveButton = document.createElement("button");
      saveButton.id = "save-button";
      saveButton.className = "button";
      saveButton.innerHTML = '<i class="fas fa-save"></i>';
      saveButton.addEventListener("click", saveChatContent);
      
      if (window.chatApp.sendButton && window.chatApp.sendButton.parentNode) {
        window.chatApp.sendButton.parentNode.insertBefore(saveButton, window.chatApp.sendButton);
      } else {
        buttonContainer.appendChild(saveButton);
      }
      
      window.chatApp.saveButton = saveButton;
    }
    
    if (buttonContainer) {
      buttonContainer.style.justifyContent = "";
      buttonContainer.style.gap = "8px"; 
    }
    
    const typingInput = document.querySelector(".typing-input");
    if (typingInput) {
      typingInput.style.flexGrow = "1";
      typingInput.style.width = "";
    }
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

function saveChatContent() {
  if (window.chatApp.chatContainer) {
    localStorage.setItem("saved-chats", window.chatApp.chatContainer.innerHTML);
    localStorage.setItem("chat-context", JSON.stringify(window.chatApp.context));
    alert("Chat saved successfully!");
  }
}

function enhancedInitializeApp() {
  initializeApp();
  
  if (window.chatApp.saveButton) {
    window.chatApp.saveButton.addEventListener("click", saveChatContent);
  }
  
  handleResponsiveLayout();
  
  window.addEventListener("resize", handleResponsiveLayout);
  
  window.addEventListener("orientationchange", handleResponsiveLayout);
}

document.removeEventListener('DOMContentLoaded', initializeApp);
document.addEventListener('DOMContentLoaded', enhancedInitializeApp);
