import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ChatHistoryPage.css';

const ChatHistoryPage = () => {
    const [chatSummaries, setChatSummaries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('User not authenticated.');
                    setLoading(false);
                    return;
                }
                const response = await axios.get('http://localhost:5800/api/chat/history', {
                    headers: {
                        'auth-token': token,
                    },
                });
                if (response.data.success) {
                    setChatSummaries(response.data.chats);
                } else {
                    setError(response.data.error || 'Failed to fetch chat history.');
                }
            } catch (err) {
                console.error('Error fetching chat history:', err);
                setError('Failed to fetch chat history. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchChatHistory();
    }, []);

    if (loading) {
        return <div className="chat-history-container">Loading chat history...</div>;
    }

    if (error) {
        return <div className="chat-history-container error">{error}</div>;
    }

    return (
        <div className="chat-history-container">
            <h2>Chat History</h2>
            {chatSummaries.length === 0 ? (
                <p>No chat history found.</p>
            ) : (
                <div className="chat-list">
                    {chatSummaries.map((chat) => (
                        <Link to={`/history/${chat._id}`} key={chat._id} className="chat-item">
                            <p className="chat-date">{new Date(chat.date).toLocaleString()}</p>
                            <p className="chat-snippet">
                                {chat.messages.length > 0
                                    ? chat.messages[0].text.substring(0, 50) + '...'
                                    : 'Empty Chat'}
                            </p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChatHistoryPage;
