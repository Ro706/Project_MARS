import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Message from '../components/Message';
import './ChatDetailsPage.css';

const ChatDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [chat, setChat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const fetchChatDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('User not authenticated.');
                    setLoading(false);
                    return;
                }
                const response = await axios.get(`http://localhost:5800/api/chat/${id}`, {
                    headers: {
                        'auth-token': token,
                    },
                });
                if (response.data.success) {
                    setChat(response.data.chat);
                } else {
                    setError(response.data.error || 'Failed to fetch chat details.');
                }
            } catch (err) {
                console.error('Error fetching chat details:', err);
                setError('Failed to fetch chat details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchChatDetails();
    }, [id]);

    useEffect(() => {
        scrollToBottom();
    }, [chat]);

    const handleDeleteChat = async () => {
        if (window.confirm('Are you sure you want to delete this chat?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5800/api/chat/${id}`, {
                    headers: {
                        'auth-token': token,
                    },
                });
                navigate('/history'); // Redirect to history page after deletion
            } catch (err) {
                console.error('Error deleting chat:', err);
                alert('Failed to delete chat.');
            }
        }
    };

    if (loading) {
        return <div className="chat-details-container">Loading chat details...</div>;
    }

    if (error) {
        return <div className="chat-details-container error">{error}</div>;
    }

    if (!chat) {
        return <div className="chat-details-container">Chat not found.</div>;
    }

    return (
        <div className="chat-details-container">
            <div className="chat-details-header">
                <h2>Chat from {new Date(chat.date).toLocaleString()}</h2>
                <button onClick={handleDeleteChat} className="delete-button">Delete Chat</button>
            </div>
            <div className="chat-window">
                {chat.messages.map((message, index) => (
                    <Message key={index} message={message} />
                ))}
                <div ref={chatEndRef} />
            </div>
        </div>
    );
};

export default ChatDetailsPage;
