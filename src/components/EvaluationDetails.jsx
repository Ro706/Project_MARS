import React from 'react';
import './EvaluationDetails.css';

const EvaluationDetails = ({ evaluation }) => {
    if (!evaluation || evaluation.error) {
        return <p>Evaluation data is not available.</p>;
    }

    const { semantic_similarity, bert_score_rag_vs_llm, factual_accuracy, judge } = evaluation;

    return (
        <div className="evaluation-details-container">
            <h3 className="details-title">Evaluation Details</h3>
            <div className="details-grid">
                <div className="detail-item">
                    <h4>Semantic Similarity</h4>
                    <p>{semantic_similarity}</p>
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
                <div className="detail-item judge-evaluation">
                    <h4>Judge Evaluation</h4>
                    <p><strong>Winner:</strong> {judge.winner}</p>
                    <p><strong>Justification:</strong> {judge.justification}</p>
                </div>
            </div>
        </div>
    );
};

export default EvaluationDetails;
