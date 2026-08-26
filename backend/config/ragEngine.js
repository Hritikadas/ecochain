const axios = require("axios");
const fs = require("fs");
const path = require("path");

class CarbonRAGEngine {
  constructor() {
    // Load knowledge base at startup for RAG context
    this.knowledgeBase = this._loadKnowledgeBase();
    this.carbonData = this._loadCarbonData();
    console.log(`🤖 AI RAG Engine loaded: ${this.knowledgeBase.length} chars of knowledge base`);
  }

  _loadKnowledgeBase() {
    try {
      const filePath = path.join(__dirname, "../knowledge_base/epa_climate_basics.txt");
      return fs.readFileSync(filePath, "utf-8").trim();
    } catch (err) {
      console.warn("⚠️ Knowledge base file not found, using built-in knowledge.");
      return "";
    }
  }

  _loadCarbonData() {
    try {
      // Try ai-service data first, then fall back
      const locations = [
        path.join(__dirname, "../../ai-service/carbon_data.json"),
        path.join(__dirname, "../carbon_data.json"),
      ];
      for (const loc of locations) {
        if (fs.existsSync(loc)) {
          return JSON.parse(fs.readFileSync(loc, "utf-8"));
        }
      }
    } catch (err) {
      console.warn("⚠️ Carbon data file not found.");
    }
    return {
      commute_factors: { car: 0.17, bus: 0.09, metro: 0.05, bike: 0, walk: 0 },
      diet_factors: { meat: 1.5, vegetarian: 1.0, vegan: 0.8 },
      electricity_factor: 0.5,
      tips: {
        car: "Switch to metro or bus to save 0.12 kg CO2/km",
        bus: "Consider metro for even lower emissions",
        metro: "Great choice! You're already low-emission",
        meat: "Try vegetarian meals to save 0.5 kg CO2/day",
        vegetarian: "Try vegan meals to save 0.2 kg CO2/day",
        vegan: "Excellent! You're already low-emission"
      }
    };
  }

  _buildSystemPrompt(userQuestion, chatHistory) {
    // Extract relevant knowledge snippets (simple keyword matching for RAG)
    const relevantContext = this._retrieveContext(userQuestion);

    return `You are the EcoChain AI Carbon Coach — a friendly, knowledgeable sustainability assistant.

KNOWLEDGE BASE (use this to answer accurately):
${relevantContext}

CARBON EMISSION FACTORS:
- Car commute: 0.17 kg CO2/km | Bus: 0.09 kg CO2/km | Metro: 0.05 kg CO2/km
- Meat diet: ~1.5 kg CO2/day | Vegetarian: ~1.0 kg CO2/day | Vegan: ~0.8 kg CO2/day  
- Electricity: ~0.5 kg CO2/kWh
- 1 tree absorbs ~22 kg CO2/year

${chatHistory ? `CONVERSATION HISTORY:\n${chatHistory}\n` : ""}
USER QUESTION: ${userQuestion}

INSTRUCTIONS:
- Answer in 2-4 concise sentences
- Provide specific numbers when possible
- Suggest actionable steps the user can take
- Be encouraging and positive about their eco efforts
- If asked about EcoChain features, mention carbon tracking, blockchain offsets, eco map, and badges`;
  }

  _retrieveContext(question) {
    if (!this.knowledgeBase) return "No additional context available.";

    // Simple keyword-based retrieval: find paragraphs that match query keywords
    const keywords = question.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const paragraphs = this.knowledgeBase.split("\n\n").filter(p => p.trim().length > 50);

    const scored = paragraphs.map(para => {
      const lower = para.toLowerCase();
      const matches = keywords.filter(kw => lower.includes(kw)).length;
      return { text: para, score: matches };
    });

    // Return top 3 most relevant paragraphs
    const top = scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.text);

    return top.length > 0 ? top.join("\n\n") : paragraphs.slice(0, 2).join("\n\n");
  }

  async askChatbot(userQuestion, chatHistory = "") {
    const systemPrompt = this._buildSystemPrompt(userQuestion, chatHistory);

    // STRATEGY 1: HuggingFace Inference API (cloud, free)
    if (process.env.HF_TOKEN) {
      try {
        const response = await this._callHuggingFace(systemPrompt);
        if (response) return response;
      } catch (err) {
        console.warn("⚠️ HuggingFace API failed:", err.message);
      }
    }

    // STRATEGY 2: Local Ollama (development only — set LOCAL_DEV=true in .env)
    if (process.env.LOCAL_DEV === "true" && await this._isOllamaRunning()) {
      try {
        const response = await this._callOllama(systemPrompt);
        if (response) return response;
      } catch (err) {
        console.warn("⚠️ Ollama not available:", err.message);
      }
    }

    // STRATEGY 3: Smart knowledge-base fallback (always works)
    return this._smartFallback(userQuestion);
  }

  async _callHuggingFace(prompt) {
    // Use a FREE, non-gated model
    const models = [
      "mistralai/Mistral-7B-Instruct-v0.3",
      "HuggingFaceH4/zephyr-7b-beta",
      "microsoft/Phi-3-mini-4k-instruct",
    ];

    for (const model of models) {
      try {
        console.log(`☁️ Trying HuggingFace model: ${model}`);
        const response = await axios.post(
          `https://api-inference.huggingface.co/models/${model}`,
          {
            inputs: prompt,
            parameters: {
              max_new_tokens: 300,
              temperature: 0.4,
              return_full_text: false,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.HF_TOKEN}`,
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );

        let text = "";
        if (Array.isArray(response.data)) {
          text = response.data[0]?.generated_text || "";
        } else if (response.data?.generated_text) {
          text = response.data.generated_text;
        }

        // Clean up: remove any repeated prompt text
        if (text.includes("USER QUESTION:")) {
          text = text.split("USER QUESTION:").pop();
          const lines = text.split("\n").filter(l => l.trim());
          text = lines.slice(1).join("\n").trim() || lines[0] || "";
        }

        text = text.trim();
        if (text.length > 20) {
          console.log(`✅ HuggingFace response received (${text.length} chars)`);
          return text;
        }
      } catch (err) {
        // 503 = model loading, try next model
        if (err.response?.status === 503) {
          console.warn(`⏳ Model ${model} is loading, trying next...`);
          continue;
        }
        // Network error (DNS, connection refused) — stop trying, all models will fail
        throw err;
      }
    }

    return null;
  }

  async _isOllamaRunning() {
    // Quick TCP check before even trying the langchain call
    return new Promise((resolve) => {
      const net = require("net");
      const socket = new net.Socket();
      socket.setTimeout(500);
      socket.on("connect", () => { socket.destroy(); resolve(true); });
      socket.on("timeout", () => { socket.destroy(); resolve(false); });
      socket.on("error", () => { socket.destroy(); resolve(false); });
      socket.connect(11434, "127.0.0.1");
    });
  }

  async _callOllama(prompt) {
    const { Ollama } = require("@langchain/ollama");
    const model = new Ollama({
      model: "llama3",
      baseUrl: "http://localhost:11434",
      temperature: 0.3,
    });

    // Race against a 5-second timeout
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Ollama timeout (5s)")), 5000)
    );
    const result = await Promise.race([model.invoke(prompt), timeout]);
    return typeof result === "string" ? result : result?.content || null;
  }

  _smartFallback(question) {
    const q = question.toLowerCase();

    // Match against carbon data tips
    const tips = this.carbonData?.tips || {};
    for (const [key, tip] of Object.entries(tips)) {
      if (q.includes(key)) {
        return `${tip}. You can track your carbon footprint in the EcoChain Carbon Analyzer and offset your emissions through our Stellar blockchain marketplace! 🌱`;
      }
    }

    // Keyword-based smart responses
    if (q.includes("carbon") || q.includes("footprint") || q.includes("emission")) {
      return "The average person produces about 4-8 tons of CO2 per year. You can reduce this by switching to public transit (saves ~2.5 tons/year), eating less meat (saves ~0.5 tons/year), and reducing electricity usage. Track your progress with EcoChain's Carbon Analyzer! 📊";
    }
    if (q.includes("tree") || q.includes("plant") || q.includes("offset")) {
      return "One tree absorbs approximately 22 kg of CO2 per year. Through EcoChain's Carbon Offset marketplace, you can purchase verified carbon credits at $1 = 0.5 trees planted. All transactions are recorded on the Stellar blockchain for transparency! 🌳";
    }
    if (q.includes("electric") || q.includes("energy") || q.includes("power")) {
      return "Electricity generates about 0.5 kg CO2 per kWh. Switch to LED bulbs (saves 75% energy), use smart power strips, and consider renewable energy sources. EcoChain helps you track your electricity emissions over time! ⚡";
    }
    if (q.includes("diet") || q.includes("food") || q.includes("meat") || q.includes("vegan")) {
      return "Diet has a big impact! Meat-based diets produce ~1.5 kg CO2/day, vegetarian ~1.0 kg/day, and vegan ~0.8 kg/day. Even one meatless day per week can save ~0.5 tons CO2/year. Log your dietary choices in the Carbon Analyzer! 🥗";
    }
    if (q.includes("transport") || q.includes("commute") || q.includes("car") || q.includes("bus")) {
      return "Transportation is a major carbon source! Cars emit 0.17 kg CO2/km, buses 0.09 kg/km, and metro only 0.05 kg/km. Switching from car to metro for a 20km daily commute saves ~880 kg CO2/year. Check our Eco Map for nearby transit options! 🚇";
    }
    if (q.includes("blockchain") || q.includes("stellar") || q.includes("certificate")) {
      return "EcoChain uses the Stellar blockchain to create tamper-proof records of your carbon offsets and sustainability certificates. Every offset purchase generates a verifiable transaction hash that anyone can audit on the Stellar testnet explorer! 🔗";
    }
    if (q.includes("badge") || q.includes("achievement") || q.includes("leaderboard")) {
      return "EcoChain's gamification system rewards your eco-actions with blockchain-minted badges! Earn badges like 'Tree Champion' (100 trees) and 'Carbon Warrior' (50 trees). Check the Achievements page to see your rank on the leaderboard! 🏆";
    }

    // Generic helpful response
    return "I'm your EcoChain AI Carbon Coach! I can help you with:\n• 📊 Understanding your carbon footprint\n• 🌳 Carbon offset strategies\n• 🚇 Low-emission transport options\n• 🥗 Diet and sustainability tips\n• 🔗 Blockchain verification\n\nAsk me anything about reducing your environmental impact!";
  }

  // Health check for the AI service
  getStatus() {
    return {
      status: "active",
      knowledgeBase: this.knowledgeBase.length > 0 ? "loaded" : "empty",
      knowledgeBaseSize: `${this.knowledgeBase.length} chars`,
      carbonDataLoaded: !!this.carbonData,
      hfTokenConfigured: !!process.env.HF_TOKEN,
      models: ["mistralai/Mistral-7B-Instruct-v0.3", "HuggingFaceH4/zephyr-7b-beta", "microsoft/Phi-3-mini-4k-instruct"],
      fallback: "smart-knowledge-base"
    };
  }
}

const ecochainRAG = new CarbonRAGEngine();
module.exports = ecochainRAG;