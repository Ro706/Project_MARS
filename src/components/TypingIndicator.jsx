import React from 'react';
import { motion } from 'framer-motion';
import './TypingIndicator.css';

const TypingIndicator = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="typing-indicator"
        >
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
            <span className="typing-text">AI is thinking...</span>
        </motion.div>
    );
};

export default TypingIndicator;