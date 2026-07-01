import os
import requests
from bs4 import BeautifulSoup
import pandas as pd
from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# Setup our local Medallion Directory paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BRONZE_DIR = os.path.join(BASE_DIR, "lakehouse", "bronze")
SILVER_DIR = os.path.join(BASE_DIR, "lakehouse", "silver")
GOLD_DIR = os.path.join(BASE_DIR, "lakehouse", "gold")

# Create all folders automatically
for folder in [BRONZE_DIR, SILVER_DIR, GOLD_DIR]:
    os.makedirs(folder, exist_ok=True)

def run_medallion_pipeline():
    print("🚀 Initiating EcoChain Medallion Lakehouse Pipeline...")

    # ==========================================
    # 🟫 STAGE 1: BRONZE ZONE (Raw Ingestion)
    # ==========================================
    target_url = "https://www.epa.gov/climatechange-science/basics-climate-change"
    print(f"\n🟫 [BRONZE] Scraping raw page source from: {target_url}")
    
    headers = {'User-Agent': 'Mozilla/5.0'}
    response = requests.get(target_url, headers=headers)
    
    if response.status_code != 200:
        print("❌ Ingestion aborted. Web server unreachable.")
        return
        
    # Save the RAW HTML code directly to the Bronze landing zone
    raw_file_path = os.path.join(BRONZE_DIR, "raw_epa_page.html")
    with open(raw_file_path, "w", encoding="utf-8") as f:
        f.write(response.text)
    print(f"✅ Raw source captured securely in Bronze Layer: {raw_file_path}")

    # ==========================================
    # 🥈 STAGE 2: SILVER ZONE (Clean / Structure)
    # ==========================================
    print(f"\n🥈 [SILVER] Cleaning structural noise and extracting semantic text...")
    
    # Read straight out of our Bronze storage asset
    with open(raw_file_path, "r", encoding="utf-8") as f:
        bronze_html = f.read()
        
    soup = BeautifulSoup(bronze_html, 'html.parser')
    main_content = soup.find('main') or soup.body
    paragraphs = main_content.find_all(['p', 'h2', 'h3'])
    
    clean_records = []
    for element in paragraphs:
        text_content = element.get_text().strip()
        # Drop navigation elements, short footnotes, or empty breaks
        if len(text_content) > 40:
            clean_records.append({"source": target_url, "text_chunk": text_content})
            
    # Save as a clean structured data frame table (CSV format) inside Silver
    silver_df = pd.DataFrame(clean_records)
    silver_file_path = os.path.join(SILVER_DIR, "clean_climate_data.csv")
    silver_df.to_csv(silver_file_path, index=False)
    print(f"✅ Clean structural rows cached in Silver Layer: {silver_file_path}")

    # ==========================================
    # 🥇 STAGE 3: GOLD ZONE (Vector Optimization for RAG)
    # ==========================================
    print(f"\n🥇 [GOLD] Converting Silver records into optimized Vector Embeddings...")
    
    # Load structured rows directly out of Silver
    df_silver = pd.read_csv(silver_file_path)
    text_chunks = df_silver["text_chunk"].tolist()
    
    # Set up our free local vectorizer weights
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    # Build or update our VectorDB data store inside Gold
    gold_db_path = os.path.join(GOLD_DIR, "chroma_rag_index")
    vector_store = Chroma.from_texts(text_chunks, embeddings, persist_directory=gold_db_path)
    
    print(f"✅ Gold RAG Index successfully compiled! Ready for high-speed vector lookup query scanning.")
    print(f"📊 Total Production-Ready Rows Processed: {len(text_chunks)}")

if __name__ == "__main__":
    run_medallion_pipeline()