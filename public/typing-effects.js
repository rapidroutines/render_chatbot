function showEnhancedTypingEffect(text, textElement, incomingMessageDiv, speed = 5) {
  const segments = window.messageUtils.parseFormattingElements(text);

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

  textElement.innerHTML = '';

  let currentCharIndex = 0;
  let currentHTML = '';
  let inBoldSegment = false;

  const typingInterval = setInterval(() => {
    for (let i = 0; i < speed; i++) { 
      if (currentCharIndex >= characters.length) {
        clearInterval(typingInterval);
        window.chatApp.isResponseGenerating = false;

        const icon = incomingMessageDiv.querySelector(".icon");
        if (icon) icon.classList.remove("hide");

        localStorage.setItem("saved-chats", window.chatApp.chatContainer.innerHTML);
        localStorage.setItem("chat-context", JSON.stringify(window.chatApp.context));
        break;
      }

      const charInfo = characters[currentCharIndex];

      if (charInfo.bold && !inBoldSegment) {
        currentHTML += '<strong>';
        inBoldSegment = true;
      } else if (!charInfo.bold && inBoldSegment) {
        currentHTML += '</strong>';
        inBoldSegment = false;
      }

      if (charInfo.lineBreak) {
        currentHTML += '<br>';
      } else {
        currentHTML += charInfo.char;
      }

      currentCharIndex++;
    }

    if (inBoldSegment && currentCharIndex >= characters.length) {
      currentHTML += '</strong>';
    }

    textElement.innerHTML = currentHTML;

    const icon = incomingMessageDiv.querySelector(".icon");
    if (icon) icon.classList.add("hide");

    window.chatApp.chatContainer.scrollTo(0, window.chatApp.chatContainer.scrollHeight);
  }, 20); 

window.typingEffects = {
  showEnhancedTypingEffect,
  showSlowerTypingEffect: function(text, textElement, incomingMessageDiv) {
    showEnhancedTypingEffect(text, textElement, incomingMessageDiv, 3);
  }
};
