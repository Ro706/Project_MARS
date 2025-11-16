import json
import sys
from sentence_transformers import SentenceTransformer, util
from bert_score import score as bert_scorer
from transformers import pipeline
from groq import Groq
import dotenv
import torch
import time
from datetime import datetime

print(f"[{datetime.now()}] comprehensive_evaluate.py: Script version check - Function 'check_factual_accuracy' should be defined.", file=sys.stderr)

# ======== LOAD ENVIRONMENT VARIABLES ========
dotenv.load_dotenv()
GROQ_API_KEY = dotenv.get_key(dotenv.find_dotenv(), "GROQ_API_KEY")

# ======== INITIALIZE MODELS ========
semantic_model = SentenceTransformer("all-MiniLM-L6-v2")
qa_pipeline = pipeline("question-answering", model="deepset/roberta-base-squad2")
groq_client = Groq(api_key=GROQ_API_KEY)

def calculate_semantic_similarity_between_answers(answer1, answer2):
    """Calculates semantic similarity between two answers."""
    if not answer1 or not answer2:
        return 0.0
    emb1 = semantic_model.encode(answer1, convert_to_tensor=True)
    emb2 = semantic_model.encode(answer2, convert_to_tensor=True)
    similarity = util.pytorch_cos_sim(emb1, emb2).item()
    return round(float(similarity), 3)

def calculate_semantic_similarity_to_query(answer, query):
    """Calculates semantic similarity between an answer and the original query."""
    if not answer or not query:
        return 0.0
    emb_answer = semantic_model.encode(answer, convert_to_tensor=True)
    emb_query = semantic_model.encode(query, convert_to_tensor=True)
    similarity = util.pytorch_cos_sim(emb_answer, emb_query).item()
    return round(float(similarity), 3)

def calculate_bert_score(candidate, reference):
    """Calculates BERTScore between a candidate and reference answer."""
    if not candidate or not reference:
        return {"precision": 0.0, "recall": 0.0, "f1": 0.0}
    P, R, F1 = bert_scorer([candidate], [reference], lang="en", rescale_with_baseline=True)
    return {"precision": round(P.item(), 3), "recall": round(R.item(), 3), "f1": round(F1.item(), 3)}

def check_factual_accuracy(query, answer):
    """
    Checks factual accuracy by treating the answer as context and the query as a question.
    """
    if not query or not answer:
        return 0.0
    result = qa_pipeline(question=query, context=answer)
    return round(result['score'], 3)

def get_judge_evaluation(query, rag_answer, llm_answer):
    """Uses a powerful LLM to act as a judge and provide detailed scores."""
    prompt = f"""
You are an expert judge. Your task is to compare two answers based on a user's query.
For each answer, provide a score from 0 to 10 for:
- Faithfulness (to the query/context)
- Completeness (how well it answers the query)
- Clarity (how easy it is to understand)

Then, declare a winner ("RAG", "LLM", or "Tie") and provide a brief justification.

**User Query:** "{query}"

**Answer 1 (RAG):** "{rag_answer}"

**Answer 2 (LLM):** "{llm_answer}"

**Evaluation Output (JSON format):**
{{
  "rag_scores": {{
    "faithfulness": <score>,
    "completeness": <score>,
    "clarity": <score>
  }},
  "llm_scores": {{
    "faithfulness": <score>,
    "completeness": <score>,
    "clarity": <score>
  }},
  "winner": "RAG" or "LLM" or "Tie",
  "justification": "<Your justification here>"
}}
"""
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            response_format={"type": "json_object"}
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        return {"rag_scores": {}, "llm_scores": {}, "winner": "Error", "justification": str(e)}

def calculate_reward(evaluation_results):
    """Calculates a scalar reward for the RAG answer based on evaluation metrics."""
    rag_scores = evaluation_results["judge"]["rag_scores"]
    factual_accuracy_rag = evaluation_results["factual_accuracy"]["rag"]
    semantic_similarity_rag_query = evaluation_results["semantic_similarity_rag_query"]

    # Weights based on user's previous formula: 0.40*faithfulness + 0.30*factual + 0.15*completeness + 0.10*clarity + 0.05*similarity
    reward = (
        0.40 * rag_scores.get("faithfulness", 0) +
        0.30 * factual_accuracy_rag +
        0.15 * rag_scores.get("completeness", 0) +
        0.10 * rag_scores.get("clarity", 0) +
        0.05 * semantic_similarity_rag_query
    )
    return round(reward, 3)

def comprehensive_evaluation(query, rag_answer, llm_answer):
    """Performs a comprehensive evaluation of two answers."""
    print(f"[{datetime.now()}] Starting comprehensive_evaluation", file=sys.stderr)
    
    # Semantic Similarity (between RAG and LLM answers)
    semantic_start_time = time.time()
    semantic_similarity_rag_llm = calculate_semantic_similarity_between_answers(rag_answer, llm_answer)
    semantic_end_time = time.time()
    print(f"[{datetime.now()}] Semantic Similarity (RAG vs LLM) took {semantic_end_time - semantic_start_time:.2f} seconds", file=sys.stderr)

    # Semantic Similarity (RAG answer vs Query)
    semantic_rag_query_start_time = time.time()
    semantic_similarity_rag_query = calculate_semantic_similarity_to_query(rag_answer, query)
    semantic_rag_query_end_time = time.time()
    print(f"[{datetime.now()}] Semantic Similarity (RAG vs Query) took {semantic_rag_query_end_time - semantic_rag_query_start_time:.2f} seconds", file=sys.stderr)
    
    # BERTScore (RAG vs. LLM)
    bert_start_time = time.time()
    bert_score_rag_vs_llm = calculate_bert_score(rag_answer, llm_answer)
    bert_end_time = time.time()
    print(f"[{datetime.now()}] BERTScore took {bert_end_time - bert_start_time:.2f} seconds", file=sys.stderr)
    
    # Factual Accuracy
    factual_start_time = time.time()
    factual_accuracy_rag = check_factual_accuracy(query, rag_answer)
    factual_accuracy_llm = check_factual_accuracy(query, llm_answer)
    factual_end_time = time.time()
    print(f"[{datetime.now()}] Factual Accuracy took {factual_end_time - factual_start_time:.2f} seconds", file=sys.stderr)
    
    # Judge Evaluation
    judge_start_time = time.time()
    judge_evaluation = get_judge_evaluation(query, rag_answer, llm_answer)
    judge_end_time = time.time()
    print(f"[{datetime.now()}] Judge Evaluation took {judge_end_time - judge_start_time:.2f} seconds", file=sys.stderr)
    
    # Combine all scores
    evaluation_results = {
        "semantic_similarity_rag_llm": semantic_similarity_rag_llm,
        "semantic_similarity_rag_query": semantic_similarity_rag_query,
        "bert_score_rag_vs_llm": bert_score_rag_vs_llm,
        "factual_accuracy": {
            "rag": factual_accuracy_rag,
            "llm": factual_accuracy_llm
        },
        "judge": judge_evaluation
    }

    # Calculate RAG reward
    rag_reward = calculate_reward(evaluation_results)
    evaluation_results["rag_reward"] = rag_reward

    print(f"[{datetime.now()}] Finished comprehensive_evaluation", file=sys.stderr)
    return evaluation_results

if __name__ == "__main__":
    data = json.load(sys.stdin)
    query = data.get("query")
    rag_answer = data.get("rag_answer")
    llm_answer = data.get("llm_answer")

    if not all([query, rag_answer, llm_answer]):
        print(json.dumps({"error": "Missing query, rag_answer, or llm_answer"}))
    else:
        evaluation_result = comprehensive_evaluation(query, rag_answer, llm_answer)
        print(json.dumps(evaluation_result, indent=2))
