function createMessageElement(content, ...classes) {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
  }
  
  function parseFormattingElements(text) {
    const segments = [];
    let currentIndex = 0;
  
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
  
    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > currentIndex) {
        segments.push({
          text: text.substring(currentIndex, match.index),
          bold: false
        });
      }
  
      segments.push({
        text: match[1],
        bold: true
      });
  
      currentIndex = match.index + match[0].length;
    }
  
    if (currentIndex < text.length) {
      segments.push({
        text: text.substring(currentIndex),
        bold: false
      });
    }
  
    const processedSegments = [];
    
    segments.forEach(segment => {
      if (segment.text.includes('\n')) {
        const lines = segment.text.split('\n');
        
        lines.forEach((line, i) => {
          processedSegments.push({
            text: line,
            bold: segment.bold
          });
  
          if (i < lines.length - 1) {
            processedSegments.push({
              text: '\n',
              bold: false,
              lineBreak: true
            });
          }
        });
      } else {
        processedSegments.push(segment);
      }
    });
  
    return processedSegments;
  }
  
  function getRandomWelcomeMessage() {
    const welcomeMessages = [
      "Hi! Welcome to RapidRoutines AI. How can I help you today?",
      "Yo! RapidRoutines AI. How can I help?",
      "Yo what's up! This is RapidRoutines AI. Need some help creating a workout routine?",
      "Hey RapidRoutines AI here! How can I help you today?",
      "Hi there! Got any fitness questions?",
      "Welcome to RapidRoutines AI! What can I do for you today?",
      "Yo! RapidRoutines AI. Need a hand with something?",
      "Hey! What’s on your mind?",
      "Hi! Looking for some fitness advice?",
      "What’s up? I’m here if you need anything.",
      "Hi! Let me know how I can help.",

    ];
    
    return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  }
  
  window.messageUtils = {
    createMessageElement,
    parseFormattingElements,
    getRandomWelcomeMessage
  };
