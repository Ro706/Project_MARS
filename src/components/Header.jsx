import React from 'react';
import { FiPlus, FiTrash2, FiMenu } from 'react-icons/fi'; // Import FiMenu
import './Header.css';

const Header = ({ onNewChat, onClearChat, toggleSidebar }) => { // Added toggleSidebar prop
    return (
        <div className="header">
            <button className="menu-button" onClick={toggleSidebar}> {/* Menu button for small screens */}
                <FiMenu />
            </button>
            <h1 className="header-title">Chat</h1>
            <div className="header-actions">
                <button className="header-button primary" onClick={onNewChat}>
                    <FiPlus />
                    <span>New Chat</span>
                </button>
                <button className="header-button secondary" onClick={onClearChat}>
                    <FiTrash2 />
                    <span>Clear Chat</span>
                </button>
            </div>
        </div>
    );
};

export default Header;