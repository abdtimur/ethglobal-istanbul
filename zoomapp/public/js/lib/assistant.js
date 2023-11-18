import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: 'OPENAI_API_KEY',
    dangerouslyAllowBrowser: true
});


const thread = await openai.beta.threads.create();

async function sendMessageToAI(userMessage) {
    try {
        // Assuming you have already initialized the thread and assistant as in your original code
       
        

        await openai.beta.threads.messages.create(
            thread.id,
            { role: "user", content: userMessage }
        );

        const run = await openai.beta.threads.runs.create(
            thread.id,
            {
                assistant_id: "asst_cqT82U1jf7m2OyUdomeb7n58",
                instructions: "Respond to the user's message. You should act on behalf of the ETHGlobal Istanbul hackathon team that build MindShare, a decentralized marketplsace for professionals to sell their time and expertise. Use no more than 50 words."
            }
        );

        let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        while (runStatus.status != "completed") {
            await new Promise(r => setTimeout(r, 3000));
            runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        }

        const messages = await openai.beta.threads.messages.list(thread.id);
        const aiMessage = messages.data.find(m => m.role === "assistant");
        return aiMessage.content[0].text.value;
    } catch (error) {
        console.error('Error sending message to AI:', error);
        throw error;
    }
}

async function sendUserMessage() {
    const userInput = document.getElementById('userInput').value;
    document.getElementById('userInput').value = ''; // Clear the input box

    if (!userInput.trim()) return; // Don't send empty messages

    // Display the user's message in the chat
    addToChat("user", userInput);
    showLoadingIndicator(true);

    try {
        const response = await sendMessageToAI(userInput);
        addToChat("ai", response);
    } catch (error) {
        addToChat("system", "Error getting response from AI.");
    }finally{
        showLoadingIndicator(false);
    }
}

function addToChat(role, message) {
    const chatDiv = document.getElementById('assistantData');
    chatDiv.innerHTML += `<p><b>${role}:</b> ${message}</p>`;
    chatDiv.scrollTop = chatDiv.scrollHeight; // Scroll to the bottom
}

function showLoadingIndicator(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (show) {
        loadingIndicator.style.display = 'block';
    } else {
        loadingIndicator.style.display = 'none';
    }
}

async function init() {
// Initialize the chat interface
    document.getElementById('sendButton').addEventListener('click', sendUserMessage);
    document.getElementById('userInput').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') sendUserMessage();
    });
}

console.log("Initializing assistant.js...");
init();
