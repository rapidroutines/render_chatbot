// DOM Elements
const saveButton = document.querySelector('#save-button');

// Function to save chat history
function saveChatHistory() {
  const chatMessages = document.querySelectorAll('.message');

  let htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat History</title>
    <style>
      body {
        font-family: 'Poppins', sans-serif;
        background: #f4f4f9;
        color: #333;
        padding: 20px;
        max-width: 800px;
        margin: auto;
      }
      
      .container {
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        background: #fff;
      }
      
      .chat {
        padding: 20px;
        border-bottom: 1px solid #ddd;
      }
      
      .message {
        display: flex;
        align-items: center;
        padding: 10px;
        margin-bottom: 10px;
        border-radius: 8px;
      }
      
      .message.user {
        justify-content: flex-end;
        background-color: #eef2f7;
      }
      
      .message.bot {
        justify-content: flex-start;
        background-color: #e1ecf4;
      }
      
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-size: cover;
        margin: 0 10px;
      }
      
      .user .avatar {
        order: 2;
        background-image: url('avatar.jpg');
      }
      
      .bot .avatar {
        order: 1;
        background-image: url('bot.jpg');
      }
      
      .text {
        max-width: 80%;
        padding: 10px;
        font-size: 16px;
        line-height: 1.5;
      }
      
      .user .text {
        background: #040137;
        color: #fff;
        border-radius: 15px 15px 0 15px;
      }
      
      .bot .text {
        background: #1e1e1e;
        color: #fff;
        border-radius: 15px 15px 15px 0;
      }
      
      h2 {
        text-align: center;
        color: #333;
      }
      
      strong {
        font-weight: bold;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Chat History</h2>
      <div class="chat">
  `;

  // Loop through chat messages and append to HTML content
  chatMessages.forEach(message => {
    const messageContent = message.innerHTML;
    const classes = message.classList.contains('outgoing') ? 'user' : 'bot';
    
    htmlContent += `
      <div class="message ${classes}">
        <div class="avatar"></div>
        <div class="text">${messageContent}</div>
      </div>
    `;
  });

  htmlContent += `
      </div>
    </div>
  </body>
  </html>
  `;

  // Create a Blob from the HTML content
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  // Create a link element and trigger a download
  const a = document.createElement('a');
  a.href = url;
  a.download = 'chat_history.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Event listener for the Save button
if (saveButton) {
  saveButton.addEventListener('click', (e) => {
    e.preventDefault();
    saveChatHistory();
  });
} else {
  console.warn("Save button not found");
}
