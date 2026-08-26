"""
EcoChain AI Carbon Coach — HuggingFace Spaces App
RAG-powered sustainability assistant with carbon footprint calculator
"""
import json
import os
from pathlib import Path

import gradio as gr
import requests

# =========================================================================
# KNOWLEDGE BASE & DATA
# =========================================================================

def load_carbon_data():
    """Load carbon emission factors and tips."""
    data_path = Path(__file__).parent / "carbon_data.json"
    if data_path.exists():
        with open(data_path, "r") as f:
            return json.load(f)
    return {
        "commute_factors": {"car": 0.17, "bus": 0.09, "metro": 0.05, "bike": 0, "walk": 0},
        "diet_factors": {"meat": 1.5, "vegetarian": 1.0, "vegan": 0.8},
        "electricity_factor": 0.5,
        "tips": {
            "car": "Switch to metro or bus to save 0.12 kg CO2/km",
            "bus": "Consider metro for even lower emissions",
            "metro": "Great choice! You're already low-emission",
            "bike": "Perfect! Zero emissions",
            "walk": "Perfect! Zero emissions",
            "meat": "Try vegetarian for 0.5 kg CO2/day savings",
            "vegetarian": "Try vegan for 0.2 kg CO2/day savings",
            "vegan": "Excellent! You're already low-emission",
        },
    }


CARBON_DATA = load_carbon_data()


# =========================================================================
# AI CHAT (HuggingFace Inference API)
# =========================================================================

SYSTEM_PROMPT = """You are the EcoChain AI Carbon Coach — a friendly, knowledgeable sustainability assistant.

KEY FACTS:
- Car commute: 0.17 kg CO2/km | Bus: 0.09 kg CO2/km | Metro: 0.05 kg CO2/km
- Meat diet: ~1.5 kg CO2/day | Vegetarian: ~1.0 kg/day | Vegan: ~0.8 kg/day
- Electricity: ~0.5 kg CO2/kWh | 1 tree absorbs ~22 kg CO2/year
- Average person: 4-8 tons CO2/year

INSTRUCTIONS:
- Answer in 2-4 concise sentences
- Provide specific numbers when possible
- Suggest actionable steps
- Be encouraging about eco efforts
"""


def smart_fallback(question: str) -> str:
    """Knowledge-base fallback when HF API is unavailable."""
    q = question.lower()
    tips = CARBON_DATA.get("tips", {})

    for key, tip in tips.items():
        if key in q:
            return f"{tip}. Track your carbon footprint with EcoChain! 🌱"

    if any(w in q for w in ["carbon", "footprint", "emission"]):
        return "The average person produces 4-8 tons of CO2/year. Reduce by using public transit (saves ~2.5 tons/year), eating less meat (saves ~0.5 tons/year), and cutting electricity waste. 📊"
    if any(w in q for w in ["tree", "plant", "offset"]):
        return "One tree absorbs ~22 kg CO2/year. Carbon offsets let you fund reforestation or renewable energy projects to compensate for your emissions. 🌳"
    if any(w in q for w in ["diet", "food", "meat", "vegan"]):
        return "Meat diets produce ~1.5 kg CO2/day, vegetarian ~1.0 kg/day, vegan ~0.8 kg/day. Even one meatless day/week saves ~0.5 tons CO2/year. 🥗"
    if any(w in q for w in ["transport", "car", "bus", "commute"]):
        return "Cars emit 0.17 kg CO2/km, buses 0.09 kg/km, metro 0.05 kg/km. Switching from car to metro for 20km/day saves ~880 kg CO2/year. 🚇"

    return "I'm the EcoChain AI Carbon Coach! Ask me about:\n• Carbon footprint reduction\n• Offset strategies\n• Low-emission transport\n• Sustainable diet tips\n• Renewable energy 🌱"


def chat_with_ai(message: str, history: list) -> str:
    """Send message to HuggingFace Inference API with fallback."""
    hf_token = os.environ.get("HF_TOKEN", "")

    # Build context from history
    context = ""
    if history:
        context = "\n".join(
            [f"User: {h[0]}\nAssistant: {h[1]}" for h in history[-5:] if len(h) == 2]
        )

    prompt = f"{SYSTEM_PROMPT}\n\n{f'Conversation:{chr(10)}{context}{chr(10)}{chr(10)}' if context else ''}User: {message}\nAssistant:"

    if not hf_token:
        return smart_fallback(message)

    models = [
        "mistralai/Mistral-7B-Instruct-v0.3",
        "HuggingFaceH4/zephyr-7b-beta",
    ]

    for model in models:
        try:
            resp = requests.post(
                f"https://api-inference.huggingface.co/models/{model}",
                json={
                    "inputs": prompt,
                    "parameters": {
                        "max_new_tokens": 300,
                        "temperature": 0.4,
                        "return_full_text": False,
                    },
                },
                headers={
                    "Authorization": f"Bearer {hf_token}",
                    "Content-Type": "application/json",
                },
                timeout=30,
            )

            if resp.status_code == 200:
                data = resp.json()
                text = ""
                if isinstance(data, list) and data:
                    text = data[0].get("generated_text", "")
                elif isinstance(data, dict):
                    text = data.get("generated_text", "")

                text = text.strip()
                if len(text) > 15:
                    return text

            # 503 = model loading, try next
            if resp.status_code == 503:
                continue

        except Exception:
            continue

    return smart_fallback(message)


# =========================================================================
# CARBON CALCULATOR
# =========================================================================

def calculate_footprint(
    commute_km: float,
    commute_mode: str,
    diet_type: str,
    electricity_kwh: float,
) -> str:
    """Calculate carbon footprint and return formatted results."""
    commute_factor = CARBON_DATA["commute_factors"].get(commute_mode, 0.17)
    diet_factor = CARBON_DATA["diet_factors"].get(diet_type, 1.5)
    elec_factor = CARBON_DATA["electricity_factor"]

    daily_commute = commute_km * commute_factor
    daily_diet = diet_factor
    daily_elec = electricity_kwh * elec_factor

    daily_total = daily_commute + daily_diet + daily_elec
    annual_total = daily_total * 365
    annual_tons = annual_total / 1000

    # Get tips
    commute_tip = CARBON_DATA["tips"].get(commute_mode, "")
    diet_tip = CARBON_DATA["tips"].get(diet_type, "")

    result = f"""## 📊 Your Carbon Footprint Results

| Category | Daily (kg CO2) | Annual (kg CO2) |
|----------|---------------|-----------------|
| 🚗 Commute ({commute_mode}) | {daily_commute:.2f} | {daily_commute*365:.1f} |
| 🍽️ Diet ({diet_type}) | {daily_diet:.2f} | {daily_diet*365:.1f} |
| ⚡ Electricity | {daily_elec:.2f} | {daily_elec*365:.1f} |
| **TOTAL** | **{daily_total:.2f}** | **{annual_total:.1f}** |

### 🌍 Annual Total: **{annual_tons:.2f} tons CO2**

{"🟢 Below average! Great job!" if annual_tons < 4 else "🟡 Around average." if annual_tons < 8 else "🔴 Above average — let's work on reducing this!"}

### 💡 Personalized Tips
- 🚗 {commute_tip}
- 🍽️ {diet_tip}
{"- ⚡ Consider LED bulbs and smart power strips to reduce electricity usage" if electricity_kwh > 10 else "- ⚡ Great electricity usage! Keep it up!"}

### 🌳 To offset {annual_tons:.1f} tons/year:
- Plant approximately **{int(annual_total / 22)} trees**
- Or purchase **${annual_tons * 10:.0f}** in verified carbon credits on EcoChain
"""
    return result


# =========================================================================
# GRADIO UI
# =========================================================================

with gr.Blocks(
    title="EcoChain AI Carbon Coach",
    theme=gr.themes.Soft(
        primary_hue="emerald",
        secondary_hue="blue",
    ),
    css="""
    .gradio-container { max-width: 900px !important; }
    footer { display: none !important; }
    """,
) as demo:
    gr.Markdown(
        """
    # 🌱 EcoChain AI Carbon Coach
    *Your AI-powered sustainability assistant — ask questions or calculate your carbon footprint.*
    """
    )

    with gr.Tab("💬 AI Chat"):
        chatbot = gr.ChatInterface(
            fn=chat_with_ai,
            title="",
            description="Ask me anything about carbon emissions, sustainability, or eco-friendly living!",
            examples=[
                "How can I reduce my carbon footprint?",
                "What are carbon offsets and how do they work?",
                "Best low-emission transport options?",
                "How does diet affect climate change?",
                "What is the greenhouse effect?",
            ],
            retry_btn=None,
            undo_btn=None,
        )

    with gr.Tab("📊 Carbon Calculator"):
        gr.Markdown("### Enter your daily habits to estimate your carbon footprint")

        with gr.Row():
            commute_km = gr.Number(label="Daily Commute (km)", value=20, minimum=0)
            commute_mode = gr.Dropdown(
                label="Commute Mode",
                choices=["car", "bus", "metro", "bike", "walk"],
                value="car",
            )

        with gr.Row():
            diet_type = gr.Dropdown(
                label="Diet Type",
                choices=["meat", "vegetarian", "vegan"],
                value="meat",
            )
            electricity_kwh = gr.Number(
                label="Daily Electricity (kWh)", value=15, minimum=0
            )

        calc_btn = gr.Button("🌍 Calculate My Footprint", variant="primary")
        result_output = gr.Markdown()

        calc_btn.click(
            fn=calculate_footprint,
            inputs=[commute_km, commute_mode, diet_type, electricity_kwh],
            outputs=result_output,
        )

    gr.Markdown(
        """
    ---
    *Built by [EcoChain](https://github.com/hritikadas) • Powered by HuggingFace Inference API • Carbon data sourced from EPA*
    """
    )

# Launch for HuggingFace Spaces
if __name__ == "__main__":
    demo.launch(server_name="0.0.0.0", server_port=7860)
