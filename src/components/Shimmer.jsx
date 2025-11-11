import React from 'react';
import './Shimmer.css';

const Shimmer = () => {
    return (
        <div className="shimmer-wrapper">
            <div className="shimmer-avatar"></div>
            <div className="shimmer-content">
                <div className="shimmer-line"></div>
                <div className="shimmer-line short"></div>
            </div>
        </div>
    );
};

export default Shimmer;