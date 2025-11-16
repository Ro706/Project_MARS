import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ComparisonGraph.css';

const ComparisonGraph = ({ evaluation }) => {
    if (!evaluation || evaluation.error) {
        return null;
    }

    const { factual_accuracy, bert_score_rag_vs_llm } = evaluation;

    const data = [
        { name: 'Factual Accuracy', RAG: factual_accuracy.rag, LLM: factual_accuracy.llm },
        { name: 'BERT Score F1', RAG: bert_score_rag_vs_llm.f1, LLM: bert_score_rag_vs_llm.f1 },
    ];

    return (
        <div className="comparison-graph-container">
            <h3 className="graph-title">Visual Comparison</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            borderColor: '#374151',
                            color: '#f8fafc',
                        }}
                    />
                    <Legend wrapperStyle={{ color: '#f8fafc' }} />
                    <Bar dataKey="RAG" fill="#2563eb" />
                    <Bar dataKey="LLM" fill="#f97316" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ComparisonGraph;
