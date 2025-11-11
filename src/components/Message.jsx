import React from 'react';
import { motion } from 'framer-motion';
import './Message.css';

const Message = ({ message }) => {
    const { text, sender, timestamp } = message;
    const isUser = sender === 'user';

    const formatTimestamp = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (error) {
            console.error("Error formatting timestamp:", error);
            return isoString; // Return original if formatting fails
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`message-container ${isUser ? 'user' : 'bot'}`}
        >
            <div className="message-content">
                <div className="message-text">{text}</div>
                {timestamp && <div className="message-timestamp">{formatTimestamp(timestamp)}</div>}
            </div>
        </motion.div>
    );
};

export default Message;