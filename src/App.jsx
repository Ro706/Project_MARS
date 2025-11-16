import React, { useRef, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatArea from './components/ChatArea';
import MessageInput from './components/MessageInput';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import './App.css';
import "@fontsource/inter";
import axios from 'axios';

function App() {
  const onSendMessageRef = useRef(null);
  const location = useLocation();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [currentChatMessages, setCurrentChatMessages] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, [location]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const showSidebarAndHeader = location.pathname !== '/login' && location.pathname !== '/signup';
  const showMessageInput = location.pathname === '/';

  const saveCurrentChat = async () => {
    if (currentChatMessages.length > 0 && token) {
      try {
        await axios.post('http://localhost:5800/api/chat/save', { messages: currentChatMessages }, {
          headers: {
            'auth-token': token,
          },
        });
        console.log('Current chat saved successfully!');
      } catch (error) {
        console.error('Error saving current chat:', error);
      }
    }
  };

  const handleNewChat = () => {
    saveCurrentChat();
    setCurrentChatMessages([]);
  };

  const handleClearChat = async () => {
    if (currentChatMessages.length > 0 && token) {
      await saveCurrentChat();
      setCurrentChatMessages([]);
      console.log('Chat saved and cleared from frontend.');
    }
  };

  return (
    <div className="app-container">
      {showSidebarAndHeader && (
        <>
          <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
          {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>} {/* Overlay for mobile */}
        </>
      )}
      <div className="main-content">
        {showSidebarAndHeader && <Header onNewChat={handleNewChat} onClearChat={handleClearChat} toggleSidebar={toggleSidebar} />}
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={token ? <ChatArea onSendMessage={onSendMessageRef} messages={currentChatMessages} setMessages={setCurrentChatMessages} /> : <Navigate to="/login" />} />
        </Routes>
        {showMessageInput && <MessageInput onSendMessage={onSendMessageRef} />}
      </div>
    </div>
  );
}

export default App;