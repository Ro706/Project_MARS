import React from 'react';
import './ComparisonGrid.css';

const ComparisonGrid = ({ evaluation }) => {
    if (!evaluation || evaluation.error) {
        return <p>Evaluation data is not available.</p>;
    }

    const metrics = ['faithfulness', 'factual_accuracy', 'completeness', 'clarity'];

    return (
        <div className="comparison-grid-container">
            <h3 className="grid-title">Comparison Metrics</h3>
            <table className="comparison-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>RAG</th>
                        <th>LLM</th>
                    </tr>
                </thead>
                <tbody>
                    {metrics.map((metric) => (
                        <tr key={metric}>
                            <td className="metric-name">{metric.replace(/_/g, ' ')}</td>
                            <td>{evaluation.rag[metric]}</td>
                            <td>{evaluation.llm[metric]}</td>
                        </tr>
                    ))}
                    <tr>
                        <td className="metric-name">Semantic Similarity</td>
                        <td colSpan="2">{evaluation.semantic_similarity}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td className="final-score-label">Final Score</td>
                        <td>{evaluation.rag_final_score}</td>
                        <td>{evaluation.llm_final_score}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default ComparisonGrid;
