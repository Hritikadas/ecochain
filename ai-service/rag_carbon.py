import json
import requests

def load_carbon_data():
    with open('carbon_data.json', 'r') as f:
        return json.load(f)

def calculate_with_rag(user_input):
    data = load_carbon_data()
    
    # Calculate CO2
    commute_co2 = user_input['commute_km'] * data['commute_factors'][user_input['commute_mode']]
    diet_co2 = data['diet_factors'][user_input['diet_type']] * 365
    electricity_co2 = user_input['electricity_kwh'] * data['electricity_factor']
    
    total_kg = commute_co2 + diet_co2 + electricity_co2
    total_tons = total_kg / 1000
    
    # Generate suggestions using RAG
    tips = []
    tips.append(data['tips'][user_input['commute_mode']])
    tips.append(data['tips'][user_input['diet_type']])
    
    if user_input['electricity_kwh'] > 300:
        tips.append("Reduce electricity by using LED bulbs and turning off unused devices")
    
    suggestions = " ".join(tips)
    
    return {
        'total_co2_tons': total_tons,
        'suggestions': suggestions
    }

def call_ollama(prompt):
    """Call local Ollama with Llama3"""
    response = requests.post(
        'http://localhost:11434/api/generate',
        json={
            'model': 'llama3',
            'prompt': prompt,
            'stream': False
        }
    )
    return response.json()['response']