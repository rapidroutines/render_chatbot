const typingForm = document.querySelector(".typing-form");
const chatContainer = document.querySelector(".chat-list");

let isResponseGenerating = false;
let context = []; 

async function handleOutgoingChat() {
    const inputField = typingForm.querySelector(".typing-input");
    const userMessage = inputField.value.trim();
    if (!userMessage || isResponseGenerating) return;
    isResponseGenerating = true;

    const outgoingMessageDiv = document.createElement("div");
    outgoingMessageDiv.className = "message outgoing";
    outgoingMessageDiv.innerText = userMessage;
    chatContainer.appendChild(outgoingMessageDiv);

    const payload = {
        query: userMessage,
        context: context 
    };

    try {
        const response = await fetch("https://render-chatbot-di08.onrender.com/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await response.json();

        console.log("test")
        console.log(data)

        const apiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, no response.";

        const incomingMessageDiv = document.createElement("div");
        incomingMessageDiv.className = "message incoming";
        incomingMessageDiv.innerText = apiResponse;
        chatContainer.appendChild(incomingMessageDiv);

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

typingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    handleOutgoingChat();
});
