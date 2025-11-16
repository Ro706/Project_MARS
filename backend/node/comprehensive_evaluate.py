import json
import sys
from sentence_transformers import SentenceTransformer, util
from bert_score import score as bert_scorer
from transformers import pipeline
from groq import Groq
import dotenv
import torch

# ======== LOAD ENVIRONMENT VARIABLES ========
dotenv.load_dotenv()
GROQ_API_KEY = dotenv.get_key(dotenv.find_dotenv(), "GROQ_API_KEY")

# ======== INITIALIZE MODELS ========
semantic_model = SentenceTransformer("all-MiniLM-L6-v2")
qa_pipeline = pipeline("question-answering", model="deepset/roberta-base-squad2")
groq_client = Groq(api_key=GROQ_API_KEY)

def calculate_semantic_similarity(answer1, answer2):
    """Calculates semantic similarity between two answers."""
    if not answer1 or not answer2:
        return 0.0
    emb1 = semantic_model.encode(answer1, convert_to_tensor=True)
    emb2 = semantic_model.encode(answer2, convert_to_tensor=True)
    similarity = util.pytorch_cos_sim(emb1, emb2).item()
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
    """Uses a powerful LLM to act as a judge."""
    prompt = f"""
You are an expert judge. Your task is to compare two answers based on a user's query and declare a winner.
Provide a brief justification for your decision.

**User Query:** "{query}"

**Answer 1 (RAG):** "{rag_answer}"

**Answer 2 (LLM):** "{llm_answer}"

**Evaluation Output (JSON format):**
{{
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
        return {"winner": "Error", "justification": str(e)}

def comprehensive_evaluation(query, rag_answer, llm_answer):
    """Performs a comprehensive evaluation of two answers."""
    
    # Semantic Similarity
    semantic_similarity = calculate_semantic_similarity(rag_answer, llm_answer)
    
    # BERTScore (RAG vs. LLM)
    bert_score_rag_vs_llm = calculate_bert_score(rag_answer, llm_answer)
    
    # Factual Accuracy
    factual_accuracy_rag = check_factual_accuracy(query, rag_answer)
    factual_accuracy_llm = check_factual_accuracy(query, llm_answer)
    
    # Judge Evaluation
    judge_evaluation = get_judge_evaluation(query, rag_answer, llm_answer)
    
    # Combine all scores
    evaluation_results = {
        "semantic_similarity": semantic_similarity,
        "bert_score_rag_vs_llm": bert_score_rag_vs_llm,
        "factual_accuracy": {
            "rag": factual_accuracy_rag,
            "llm": factual_accuracy_llm
        },
        "judge": judge_evaluation
    }
    
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
