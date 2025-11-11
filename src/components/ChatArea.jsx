import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import Shimmer from './Shimmer';
import './ChatArea.css';

const ChatArea = ({ onSendMessage, messages, setMessages }) => {
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const saveChat = async (currentMessages) => {
        const token = localStorage.getItem('token');
        if (!token || currentMessages.length === 0) return;

        try {
            await axios.post('http://localhost:5800/api/chat/save', { messages: currentMessages }, {
                headers: {
                    'auth-token': token,
                },
            });
            console.log('Chat saved successfully!');
        } catch (error) {
            console.error('Error saving chat:', error);
        }
    };

    const fetchResponse = async (query) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5800/api/rag/query', { query }, {
                headers: {
                    'auth-token': token,
                },
            });
            const { answer, reward_score } = response.data;
            const formattedRewardScore = (reward_score * 100).toFixed(2); // Multiply by 100 and format
            const botMessage = { text: `${answer}\n\nReward Score: ${formattedRewardScore}%`, sender: 'bot' };
            setMessages((prevMessages) => [...prevMessages, botMessage]);
        } catch (error) {
            console.error('Error fetching response:', error);
            const errorMessage = { text: 'Sorry, something went wrong.', sender: 'bot' };
            setMessages((prevMessages) => [...prevMessages, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (onSendMessage) {
            onSendMessage.current = (query) => {
                const newMessage = { text: query, sender: 'user' };
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                fetchResponse(query);
            };
        }
    }, [onSendMessage, setMessages]); // Added setMessages to dependency array

    // This effect runs when the component unmounts or when a new chat is initiated
    useEffect(() => {
        return () => {
            if (messages.length > 0) {
                saveChat(messages);
            }
        };
    }, [messages]); // Dependency on messages to ensure latest state is captured

    return (
        <div className="chat-area">
            <div className="chat-messages">
                {messages.map((message, index) => (
                    <Message key={index} message={message} />
                ))}
                {loading && (
                    <div className="message-container bot">
                        <Shimmer />
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
        </div>
    );
};

export default ChatArea;