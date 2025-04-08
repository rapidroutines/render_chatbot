
window.chatApp = window.chatApp || {};


window.chatApp.inactivityTracker = {

  inactivityTimeout: 180000, // 3 minutes 
  redirectUrl: "https://render-chatbot-di08.onrender.com",
  inactivityTimer: null,
  lastActivityTime: Date.now(),
  
  // Initialize the inactivity tracker
  initialize: function() {
    console.log("Initializing inactivity tracker...");
    
    // Bind activity reset events
    const resetActivity = this.resetInactivityTimer.bind(this);
    document.addEventListener('mousemove', resetActivity);
    document.addEventListener('keydown', resetActivity);
    document.addEventListener('click', resetActivity);
    document.addEventListener('touchstart', resetActivity);
    document.addEventListener('input', resetActivity);
    
    // Specific event for chat input
    const typingInput = document.querySelector(".typing-input");
    if (typingInput) {
      typingInput.addEventListener('input', resetActivity);
    }
    
    // Start the inactivity timer
    this.startInactivityTimer();
  },
  
  // Start the inactivity timer
  startInactivityTimer: function() {
    this.resetInactivityTimer();
    console.log("Inactivity timer started");
  },
  
  // Reset the inactivity timer
  resetInactivityTimer: function() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
    
    this.lastActivityTime = Date.now();
    
    this.inactivityTimer = setTimeout(() => {
      this.checkInactivity();
    }, this.inactivityTimeout);
  },
  
  // Check if the user is inactive
  checkInactivity: function() {
    const inactiveTime = Date.now() - this.lastActivityTime;
    
    if (inactiveTime >= this.inactivityTimeout) {
      console.log("User inactive, redirecting to home page...");
      this.showRedirectNotice();
    }
  },
  
  // Show a notice before redirecting
  showRedirectNotice: function() {
    const noticeElement = document.createElement('div');
    noticeElement.className = 'redirect-notice';
    noticeElement.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
                  background: rgba(0, 0, 0, 0.7); z-index: 1000; display: flex; 
                  flex-direction: column; justify-content: center; align-items: center; color: white;">
        <h2>No activity detected</h2>
        <p>Redirecting to home page in <span id="countdown">5</span> seconds...</p>
        <button id="stay-button" style="padding: 10px 20px; margin-top: 20px; 
                                       background: #1e628c; border: none; color: white; 
                                       border-radius: 5px; cursor: pointer;">
          Stay on this page
        </button>
      </div>
    `;
    
    document.body.appendChild(noticeElement);
    
    document.getElementById('stay-button').addEventListener('click', () => {
      if (noticeElement.parentNode) {
        noticeElement.parentNode.removeChild(noticeElement);
      }
      this.resetInactivityTimer();
    });
    
    let secondsLeft = 5;
    const countdownElement = document.getElementById('countdown');
    
    const countdownInterval = setInterval(() => {
      secondsLeft--;
      if (countdownElement) {
        countdownElement.textContent = secondsLeft;
      }
      
      if (secondsLeft <= 0) {
        clearInterval(countdownInterval);
        window.location.href = this.redirectUrl;
      }
    }, 1000);
  }
};

// Initialize the inactivity tracker when the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.chatApp.inactivityTracker.initialize();
});
