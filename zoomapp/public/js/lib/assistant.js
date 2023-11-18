import OpenAI from "openai";

const openai = new OpenAI({apiKey: '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', dangerouslyAllowBrowser: true});

async function fetchAssistantResponse() {
    try {
        
        const assistants = await openai.beta.assistants.list();
        console.log(assistants);
        const assistant = assistants.data[0];

        const thread = await openai.beta.threads.create();

        const message = await openai.beta.threads.messages.create(
            thread.id,
            {
              role: "user",
              content: "Tell me about your hackathon project!"
            }
          );
        
        const run = await openai.beta.threads.runs.create(
            thread.id,
            { 
              assistant_id: assistant.id,
              instructions: "If asked about hackathon project, act on behalf of hackathon team that built MindShare, decentralized marketplace for professionals to sell their time and expertise. Limit each message to 100 words maximum."
            }
          );

          //periodically retrieve the run to check if it's completed
            let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
            while (runStatus.status != "completed") {
                await new Promise(r => setTimeout(r, 3000));
                runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
                //sleep for 3 seconds
                //show loading indicator
                updateUIData("Loading...");
            }

            console.log("Run completed!");
            
            //retrieve the messages from the run
            const messages = await openai.beta.threads.messages.list(
                thread.id
              );

        console.log(messages);

        //construct the messages into a single string with newlines, the message order is backwards, append role
        const messagesText = messages.data.map((message) => "<b>"+message.role + "</b>" + ": " + message.content[0].text.value).reverse().join("<br/><br/>");
        // Update the UI with this data
        updateUIData(messagesText);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function updateUIData(data) {
    const assistantData = document.getElementById('assistantData');
    assistantData.innerHTML = `<p>${data}</p>`; // Replace with how you want to format the data
}

// Call the function to fetch and update data
console.log('Fetching assistant response...');
fetchAssistantResponse();
