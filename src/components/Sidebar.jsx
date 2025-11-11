import React from 'react';
import { FiMessageSquare, FiClock, FiLogOut, FiX } from 'react-icons/fi'; // Import FiX for close button
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-top">
                <div className="sidebar-header">project_H</div>
                <button className="close-sidebar-button" onClick={toggleSidebar}>
                    <FiX />
                </button>
            </div>
            <nav className="sidebar-nav">
                <Link to="/" className="nav-item active" onClick={toggleSidebar}>
                    <FiMessageSquare />
                    <span>Chat</span>
                </Link>
                <Link to="/history" className="nav-item" onClick={toggleSidebar}>
                    <FiClock />
                    <span>History</span>
                </Link>
            </nav>
            <button onClick={handleLogout} className="logout-button">
                <FiLogOut />
                <span>Logout</span>
            </button>
        </div>
    );
};

export default Sidebar;