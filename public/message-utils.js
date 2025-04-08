// Create a new message element and return it
function createMessageElement(content, ...classes) {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
  }
  
  // Format text with bold markers (**text**) into HTML with <strong> tags
  function parseFormattingElements(text) {
    // Create an array of segments with formatting information
    const segments = [];
    let currentIndex = 0;
  
    // Parse bold text marked with asterisks
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
  
    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        segments.push({
          text: text.substring(currentIndex, match.index),
          bold: false
        });
      }
  
      // Add the bold text (without the ** markers)
      segments.push({
        text: match[1],
        bold: true
      });
  
      currentIndex = match.index + match[0].length;
    }
  
    // Add any remaining text
    if (currentIndex < text.length) {
      segments.push({
        text: text.substring(currentIndex),
        bold: false
      });
    }
  
    // Handle line breaks
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
  
  // Get a random welcome message
  function getRandomWelcomeMessage() {
    const welcomeMessages = [
      "Hi! Welcome to RapidRoutines AI. How can I help you today?",
      "Yo yo! RapidRoutines AI. How can I help?",
      "Yo what's up! This is RapidRoutines AI. Need some help creating a workout routine?",
    ];
    
    return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  }
  
  // Make functions available to other files
  window.messageUtils = {
    createMessageElement,
    parseFormattingElements,
    getRandomWelcomeMessage
  };
