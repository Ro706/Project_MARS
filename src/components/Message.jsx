import React from 'react';
import { motion } from 'framer-motion';
import './Message.css';

const Message = ({ message }) => {
    const { text, sender, timestamp } = message; // Destructure timestamp
    const isUser = sender === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`message-container ${isUser ? 'user' : 'bot'}`}
        >
            <div className="message-content">
                <div className="message-text">{text}</div>
                {timestamp && <div className="message-timestamp">{timestamp}</div>}
            </div>
        </motion.div>
    );
};

export default Message;