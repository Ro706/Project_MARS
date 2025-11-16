import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ComparisonGrid from './ComparisonGrid';
import './ComparisonModal.css';

const ComparisonModal = ({ isOpen, onClose, data }) => {
    if (!data) {
        return null;
    }

    const { rag_answer, llm_answer, evaluation } = data;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="modal-overlay"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>Comparison Result</h2>
                            <button onClick={onClose} className="close-button">&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="comparison-responses">
                                <div className="comparison-response-item">
                                    <h3>RAG Model</h3>
                                    <div className="comparison-message-text">{rag_answer}</div>
                                </div>
                                <div className="comparison-response-item">
                                    <h3>LLM</h3>
                                    <div className="comparison-message-text">{llm_answer}</div>
                                </div>
                            </div>
                            {evaluation && <ComparisonGrid evaluation={evaluation} />}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ComparisonModal;
