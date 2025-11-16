import json
import dotenv
from sentence_transformers import SentenceTransformer
from pinecone import Pinecone, ServerlessSpec
import os
from groq import Groq
from datetime import datetime
import sys
import codecs
import time

# Reconfigure stdout to use UTF-8 encoding
sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())

# Import functions from other local scripts
from searchurl import search_serper
from webscrap import scrape_webpage
from comprehensive_evaluate import comprehensive_evaluation
from rl_agent import RLAgent # Import the RLAgent

def main():
    start_time = time.time()
    print(f"[{datetime.now()}] Starting rag_query_compare.py", file=sys.stderr)

    # ======== STEP 1: PARSE ARGUMENTS AND SETUP ========
    if len(sys.argv) > 1:
        query = sys.argv[1]
    else:
        query = sys.stdin.read().strip()
    print(f"[{datetime.now()}] Query received: '{query}'", file=sys.stderr)

    dotenv.load_dotenv()
    PINECONE_API_KEY = dotenv.get_key(dotenv.find_dotenv(), "PINECONE_API_KEY")
    GROQ_API_KEY = dotenv.get_key(dotenv.find_dotenv(), "GROQ_API_KEY")

    pc = Pinecone(api_key=PINECONE_API_KEY)
    index_name = "rag-knowledge-384"

    if index_name not in [i.name for i in pc.list_indexes()]:
        pc.create_index(
            name=index_name,
            dimension=384,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
    index = pc.Index(index_name)

    embedder = SentenceTransformer("all-MiniLM-L6-v2")
    groq_client = Groq(api_key=GROQ_API_KEY)

    # Initialize RL Agent and choose top_k
    rl_agent = RLAgent()
    available_top_ks = [3, 5, 7] # Define possible actions for top_k
    chosen_top_k = rl_agent.choose_action(available_top_ks)
    print(f"[{datetime.now()}] RL Agent chose top_k: {chosen_top_k}", file=sys.stderr)

    # ======== STEP 2: DYNAMIC DATA INGESTION ========
    ingestion_start_time = time.time()
    search_results = search_serper(query, num_results=5)
    
    dynamic_vectors = []
    if search_results:
        for result in search_results:
            url = result.get('link')
            title = result.get('title')
            content = scrape_webpage(url)
            if len(content) < 200:
                continue
            
            text_to_embed = content[:4000]
            emb = embedder.encode(text_to_embed).tolist()
            
            dynamic_vectors.append({
                "id": f"dynamic-{datetime.now().timestamp()}",
                "values": emb,
                "metadata": {
                    "title": title,
                    "url": url,
                    "snippet": result.get('snippet', ''),
                    "query": query
                }
            })
        
        if dynamic_vectors:
            index.upsert(vectors=dynamic_vectors)
    ingestion_end_time = time.time()
    print(f"[{datetime.now()}] Dynamic Data Ingestion took {ingestion_end_time - ingestion_start_time:.2f} seconds", file=sys.stderr)

    # ======== STEP 3: EMBED & RETRIEVE ========
    embed_retrieve_start_time = time.time()
    query_emb = embedder.encode(query).tolist()
    results = index.query(vector=query_emb, top_k=chosen_top_k, include_metadata=True) # Use chosen_top_k
    
    context_texts = [match["metadata"].get("snippet", "") for match in results["matches"]]
    context = "\n\n".join(context_texts)
    embed_retrieve_end_time = time.time()
    print(f"[{datetime.now()}] Embed & Retrieve took {embed_retrieve_end_time - embed_retrieve_start_time:.2f} seconds", file=sys.stderr)

    # ======== STEP 4: GENERATE RAG ANSWER ========
    rag_start_time = time.time()
    rag_answer = None
    try:
        prompt = f"Based on the following context, generate a comprehensive answer to the question.\\n\\nContext:\\n{context}\\n\\nQuestion: {query}"
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}]
        )
        rag_answer = response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[{datetime.now()}] Error generating RAG answer: {e}", file=sys.stderr)
        rag_answer = "Error generating RAG answer."
    rag_end_time = time.time()
    print(f"[{datetime.now()}] RAG Answer Generation took {rag_end_time - rag_start_time:.2f} seconds", file=sys.stderr)

    # ======== STEP 5: GENERATE LLM ANSWER (NO RAG) ========
    llm_start_time = time.time()
    llm_answer = None
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": query}]
        )
        llm_answer = response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[{datetime.now()}] Error generating LLM answer: {e}", file=sys.stderr)
        llm_answer = "Error generating LLM answer."
    llm_end_time = time.time()
    print(f"[{datetime.now()}] LLM Answer Generation took {llm_end_time - llm_start_time:.2f} seconds", file=sys.stderr)

    # ======== STEP 6: EVALUATE ANSWERS ========
    evaluation_start_time = time.time()
    evaluation = None
    if rag_answer and llm_answer and "Error" not in rag_answer and "Error" not in llm_answer:
        evaluation = comprehensive_evaluation(query, rag_answer, llm_answer)
    evaluation_end_time = time.time()
    print(f"[{datetime.now()}] Evaluation took {evaluation_end_time - evaluation_start_time:.2f} seconds", file=sys.stderr)

    # Learn from the reward
    if evaluation and "rag_reward" in evaluation:
        rl_agent.learn(chosen_top_k, evaluation["rag_reward"])
        print(f"[{datetime.now()}] RL Agent learned: top_k={chosen_top_k}, reward={evaluation['rag_reward']}", file=sys.stderr)

    # ======== STEP 7: FINAL OUTPUT ========
    final_output = {
        "rag_answer": rag_answer,
        "llm_answer": llm_answer,
        "evaluation": evaluation
    }
    print(json.dumps(final_output), flush=True)
    
    end_time = time.time()
    print(f"[{datetime.now()}] Total execution time: {end_time - start_time:.2f} seconds", file=sys.stderr)

if __name__ == "__main__":
    main()