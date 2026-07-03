const { Ollama } = require("@langchain/ollama"); // 💖 Fixed: Using the modern standalone package integration path
const axios = require("axios");

class CarbonRAGEngine {
  async askChatbot(userQuestion, chatHistory = "") {
    // Structural system prompt template for cohesive AI personality alignment
    const systemPrompt = `You are the EcoChain AI Carbon Coach, an elite sustainability engine. 
    Answer the following question briefly and clearly to help the user reduce their carbon footprint or understand green assets.
    
    Prior Conversation:
    ${chatHistory}
    
    User Question: ${userQuestion}
    
    Provide clear, helpful steps.`;

    // 🌎 CONDITION 1: CLOUD ENVIRONMENT PRODUCTION SYSTEM (Hugging Face)
    if (process.env.NODE_ENV === "production" || !process.env.LOCAL_DEV) {
      console.log("☁️ Production Mode Active: Routing prompt query directly to Hugging Face serverless tier...");
      try {
        const response = await axios.post(
          // Using the highly optimized, fast Meta Llama 3 8B Instruct model hosted on Hugging Face
          "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct",
          { 
            inputs: systemPrompt,
            parameters: { max_new_tokens: 250, temperature: 0.3 }
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.HF_TOKEN}`,
              "Content-Type": "application/json",
            },
            timeout: 10000 // 10 second network boundary guard
          }
        );

        // Hugging Face inference returns an array containing generated text fields
        let aiOutputText = response.data[0]?.generated_text || "";
        
        // Clean up the output string if the model repeats the prompt framework
        if (aiOutputText.includes("User Question:")) {
          aiOutputText = aiOutputText.split("Provide clear, helpful steps.").pop().trim();
        }
        
        return aiOutputText || "Cloud inference returned an empty payload processing frame.";
      } catch (error) {
        console.error("🚨 Hugging Face API Gateway Fault:", error.response?.data || error.message);
        return "My cloud communications network is experiencing high latency traffic load. Please try again shortly!";
      }
    }

    // 🦙 CONDITION 2: LOCAL DEVELOPMENT SUITE SYSTEM (Ollama)
    console.log("💻 Local Development Mode Active: Routing request directly down to Ollama service pipeline...");
    try {
      const model = new Ollama({
        model: "llama3",
        baseUrl: "http://localhost:11434",
        temperature: 0.3,
      });

      return await model.invoke(systemPrompt);
    } catch (error) {
      console.error("🚨 Local Ollama Pipeline Fault:", error.message);
      return "My offline processing pipeline timed out. Make sure your local terminal is running 'ollama run llama3'!";
    }
  }
}

const ecochainRAG = new CarbonRAGEngine();
module.exports = ecochainRAG;