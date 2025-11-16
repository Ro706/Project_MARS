import React from 'react';
import './EvaluationDetails.css';

const EvaluationDetails = ({ evaluation }) => {
    if (!evaluation || evaluation.error) {
        return <p>Evaluation data is not available.</p>;
    }

    const { semantic_similarity_rag_llm, semantic_similarity_rag_query, bert_score_rag_vs_llm, factual_accuracy, judge } = evaluation;

    return (
        <div className="evaluation-details-container">
            <h3 className="details-title">Evaluation Details</h3>
            <div className="details-grid">
                <div className="detail-item">
                    <h4>Semantic Similarity (RAG vs. LLM)</h4>
                    <p>{semantic_similarity_rag_llm}</p>
                </div>
                <div className="detail-item">
                    <h4>Semantic Similarity (RAG vs. Query)</h4>
                    <p>{semantic_similarity_rag_query}</p>
                </div>
                <div className="detail-item">
                    <h4>BERT Score (RAG vs. LLM)</h4>
                    <p>F1: {bert_score_rag_vs_llm.f1}</p>
                    <p>Precision: {bert_score_rag_vs_llm.precision}</p>
                    <p>Recall: {bert_score_rag_vs_llm.recall}</p>
                </div>
                <div className="detail-item">
                    <h4>Factual Accuracy</h4>
                    <p>RAG: {factual_accuracy.rag}</p>
                    <p>LLM: {factual_accuracy.llm}</p>
                </div>
                <div className="detail-item">
                    <h4>RAG Answer Scores</h4>
                    <p>Faithfulness: {judge.rag_scores.faithfulness}</p>
                    <p>Completeness: {judge.rag_scores.completeness}</p>
                    <p>Clarity: {judge.rag_scores.clarity}</p>
                </div>
                <div className="detail-item">
                    <h4>LLM Answer Scores</h4>
                    <p>Faithfulness: {judge.llm_scores.faithfulness}</p>
                    <p>Completeness: {judge.llm_scores.completeness}</p>
                    <p>Clarity: {judge.llm_scores.clarity}</p>
                </div>
                <div className="detail-item judge-evaluation">
                    <h4>Judge Decision</h4>
                    <p><strong>Winner:</strong> {judge.winner}</p>
                    <p><strong>Justification:</strong> {judge.justification}</p>
                </div>
            </div>
        </div>
    );
};

export default EvaluationDetails;
