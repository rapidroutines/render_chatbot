// Enhanced typing effect that handles formatting in real-time
function showEnhancedTypingEffect(text, textElement, incomingMessageDiv, speed = 5) {
  // Parse the formatting first
  const segments = window.messageUtils.parseFormattingElements(text);

  // Convert segments to a flat array of characters with formatting info
  const characters = [];
  
  segments.forEach(segment => {
    if (segment.lineBreak) {
      characters.push({ 
        char: '<br>', 
        bold: false, 
        lineBreak: true 
      });
    } else {
      for (const char of segment.text) {
        characters.push({ 
          char, 
          bold: segment.bold 
        });
      }
    }
  });

  // Clear the text element
  textElement.innerHTML = '';

  // Set up variables for the typing effect
  let currentCharIndex = 0;
  let currentHTML = '';
  let inBoldSegment = false;

  // Typing effect - uses speed parameter to control chars per interval
  const typingInterval = setInterval(() => {
    // Process multiple characters per interval for a faster effect
    for (let i = 0; i < speed; i++) { // Typing speed characters at once
      if (currentCharIndex >= characters.length) {
        clearInterval(typingInterval);
        window.chatApp.isResponseGenerating = false;

        const icon = incomingMessageDiv.querySelector(".icon");
        if (icon) icon.classList.remove("hide");

        // Save to local storage
        localStorage.setItem("saved-chats", window.chatApp.chatContainer.innerHTML);
        localStorage.setItem("chat-context", JSON.stringify(window.chatApp.context));
        break;
      }

      const charInfo = characters[currentCharIndex];

      // Handle bold text formatting
      if (charInfo.bold && !inBoldSegment) {
        currentHTML += '<strong>';
        inBoldSegment = true;
      } else if (!charInfo.bold && inBoldSegment) {
        currentHTML += '</strong>';
        inBoldSegment = false;
      }

      // Handle line breaks
      if (charInfo.lineBreak) {
        currentHTML += '<br>';
      } else {
        currentHTML += charInfo.char;
      }

      currentCharIndex++;
    }

    // Close any open bold tag at the end
    if (inBoldSegment && currentCharIndex >= characters.length) {
      currentHTML += '</strong>';
    }

    // Update the text element with the current HTML
    textElement.innerHTML = currentHTML;

    // Hide the typing indicator
    const icon = incomingMessageDiv.querySelector(".icon");
    if (icon) icon.classList.add("hide");

    // Scroll to keep the latest text visible
    window.chatApp.chatContainer.scrollTo(0, window.chatApp.chatContainer.scrollHeight);
  }, 20); // Fast interval (20ms) for a smooth effect
}

// Make functions available to other files
window.typingEffects = {
  showEnhancedTypingEffect,
  // Use the same function for welcome messages now
  showSlowerTypingEffect: function(text, textElement, incomingMessageDiv) {
    // Use the same function but with a slightly faster speed
    showEnhancedTypingEffect(text, textElement, incomingMessageDiv, 3);
  }
};
