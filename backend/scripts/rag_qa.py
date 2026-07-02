import os
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.prompts import PromptTemplate
import requests

# 1. Initialize Free Embeddings Engine running locally on your CPU
print("🧠 Initializing Local Embeddings Model (all-MiniLM-L6-v2)...")
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# 2. Load the Scraped Web Data
kb_file = os.path.join(os.path.dirname(__file__), "..", "knowledge_base", "epa_climate_basics.txt")
if not os.path.exists(kb_file):
    raise FileNotFoundError("❌ Knowledge base text file missing! Run web_scraper.py first.")

with open(kb_file, "r", encoding="utf-8") as f:
    knowledge_text = f.read()

# Split text into neat semantic chunks
chunks = [chunk.strip() for chunk in knowledge_text.split("\n\n") if chunk.strip()]

# 3. Spin up Vector DB Store
print("💾 Indexing data into local Vector Database (Chroma)...")
vector_store = Chroma.from_texts(chunks, embeddings)
retriever = vector_store.as_retriever(search_kwargs={"k": 2}) # Get top 2 matching context blocks

# 4. RAG Execution Function
def ask_eco_coach(question: str):
    print(f"\n🙋 User Question: {question}")
    
    # Retrieve matching text snippets from our scraped data store
    docs = retriever.invoke(question)
    context = "\n\n".join([doc.page_content for doc in docs])
    
    # Construct a tight system prompt template
    prompt_template = f"""You are the EcoChain Sustainability Coach. Answer the question using ONLY the verified context provided below.
    If you do not know the answer based on the context, say you don't know.

    Context:
    {context}

    Question: {question}
    Answer:"""

    # Hit Hugging Face Serverless API completely free
    hf_token = os.getenv("HF_TOKEN")
    if not hf_token:
        return "⚠️ Error: HF_TOKEN missing from environment variables."

    api_url = "https://api-inference.huggingface.co/models/Meta-Llama-3-8B-Instruct"
    headers = {"Authorization": f"Bearer {hf_token}"}
    payload = {
        "inputs": prompt_template,
        "parameters": {"max_new_tokens": 250, "temperature": 0.3}
    }
    
    response = requests.post(api_url, headers=headers, json=payload)
    
    if response.status_code == 200:
        result = response.json()
        return result[0]['generated_text'].split("Answer:")[-1].strip()
    else:
        return f"❌ API Error: {response.text}"

if __name__ == "__main__":
    # Test Question targeting information directly inside the scraped EPA page
    ans = ask_eco_coach("What are the primary drivers or factors causing climate change?")
    print(f"\n🤖 AI Coach Response:\n{ans}")