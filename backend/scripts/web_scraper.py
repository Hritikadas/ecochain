import os
import requests
from bs4 import BeautifulSoup

def scrape_eco_knowledge():
    # Target a real, open informational article on sustainability/climate
    url = "https://www.epa.gov/climatechange-science/basics-climate-change"
    print(f"🕷️ Scraping live environmental data from: {url}")
    
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Failed to access site. Status code: {response.status_code}")
        return
        
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Target the primary content container block of the webpage
    main_content = soup.find('main') or soup.find('article') or soup.body
    
    # Extract structural text sections
    paragraphs = main_content.find_all(['p', 'h2', 'h3'])
    
    cleaned_chunks = []
    for p in paragraphs:
        text = p.get_text().strip()
        if len(text) > 40:  # Skip empty or short navigation fragments
            cleaned_chunks.append(text)
            
    # Save raw text data locally for our RAG index pipeline
    data_dir = os.path.join(os.path.dirname(__file__), "..", "knowledge_base")
    os.makedirs(data_dir, exist_ok=True)
    
    output_path = os.path.join(data_dir, "epa_climate_basics.txt")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n\n".join(cleaned_chunks))
        
    print(f"✅ Scraping Complete! {len(cleaned_chunks)} knowledge chunks saved to {output_path}")

if __name__ == "__main__":
    scrape_eco_knowledge()