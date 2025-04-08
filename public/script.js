// Select DOM elements from the HTML
const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");

// State variables to track the conversation and prevent duplicate requests
let isResponseGenerating = false;
let context = []; // This will store conversation history if needed

// Function to handle sending user messages
async function handleOutgoingChat() {
    const inputField = typingForm.querySelector(".typing-input");
    const userMessage = inputField.value.trim();
    if (!userMessage || isResponseGenerating) return;
    isResponseGenerating = true;

    // Append user's message to the chat container
    const outgoingMessageDiv = document.createElement("div");
    outgoingMessageDiv.className = "message outgoing";
    outgoingMessageDiv.innerText = userMessage;
    chatContainer.appendChild(outgoingMessageDiv);

    // Build payload with the query and conversation context
    const payload = {
        query: userMessage,
        context: context // optional; include if you want to send conversation history
    };

    try {
        const response = await fetch("https://render-chatbot-2.onrender.com/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        console.log("test")
        console.log(data)

        // Extract the response text from the Gemini response
        const apiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, no response.";

        // Append the API response to the chat container
        const incomingMessageDiv = document.createElement("div");
        incomingMessageDiv.className = "message incoming";
        incomingMessageDiv.innerText = apiResponse;
        chatContainer.appendChild(incomingMessageDiv);

        // Update conversation context
        context.push({ role: "user", content: userMessage });
        context.push({ role: "assistant", content: apiResponse });
    } catch (error) {
        console.error("Error: ", error);
        const errorDiv = document.createElement("div");
        errorDiv.className = "message incoming error";
        errorDiv.innerText = "Sorry, I encountered an error.";
        chatContainer.appendChild(errorDiv);
    } finally {
        isResponseGenerating = false;
        inputField.value = "";
    }
}

// Attach the form submit event listener
typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
});
