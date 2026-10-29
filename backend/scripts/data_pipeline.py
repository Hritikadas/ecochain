import os
import requests
from bs4 import BeautifulSoup
import pandas as pd
from langchain_chroma import Chroma
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
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    raw_file_path = os.path.join(BRONZE_DIR, "raw_epa_page.html")
    
    try:
        response = requests.get(target_url, headers=headers, timeout=20)
        if response.status_code == 200:
            with open(raw_file_path, "w", encoding="utf-8") as f:
                f.write(response.text)
            print(f"✅ Raw source captured securely in Bronze Layer: {raw_file_path}")
        else:
            print(f"⚠️ Web server responded with status code: {response.status_code}")
    except Exception as e:
        print(f"⚠️ Web scraping network error: {e}")

    # Fallback to local knowledge base if remote fetch was unavailable
    if not os.path.exists(raw_file_path) or os.path.getsize(raw_file_path) == 0:
        kb_path = os.path.join(BASE_DIR, "knowledge_base", "epa_climate_basics.txt")
        if os.path.exists(kb_path):
            print(f"ℹ️ Populating Bronze Layer from cached knowledge base: {kb_path}")
            with open(kb_path, "r", encoding="utf-8") as f:
                kb_text = f.read()
            html_chunks = "".join([f"<p>{p.strip()}</p>" for p in kb_text.split("\n\n") if p.strip()])
            with open(raw_file_path, "w", encoding="utf-8") as f:
                f.write(f"<html><body><main>{html_chunks}</main></body></html>")
            print(f"✅ Raw source created from fallback: {raw_file_path}")
        else:
            print("❌ Ingestion aborted. Web server unreachable and no fallback found.")
            return

    # ==========================================
    # 🥈 STAGE 2: SILVER ZONE (Clean / Structure)
    # ==========================================
    print(f"\n🥈 [SILVER] Cleaning structural noise and extracting semantic text...")
    
    # Read straight out of our Bronze storage asset
    with open(raw_file_path, "r", encoding="utf-8") as f:
        bronze_html = f.read()
        
    soup = BeautifulSoup(bronze_html, 'html.parser')
    main_content = soup.find('main') or soup.find('article') or soup.body
    paragraphs = main_content.find_all(['p', 'h2', 'h3']) if main_content else []
    
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
    text_chunks = df_silver["text_chunk"].dropna().tolist()
    
    if not text_chunks:
        print("⚠️ No valid text chunks found in Silver Layer to vectorize.")
        return

    # Set up our free local vectorizer weights
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    # Build or update our VectorDB data store inside Gold
    gold_db_path = os.path.join(GOLD_DIR, "chroma_rag_index")
    vector_store = Chroma.from_texts(texts=text_chunks, embedding=embeddings, persist_directory=gold_db_path)
    
    print(f"✅ Gold RAG Index successfully compiled! Ready for high-speed vector lookup query scanning.")
    print(f"📊 Total Production-Ready Rows Processed: {len(text_chunks)}")

if __name__ == "__main__":
    run_medallion_pipeline()
