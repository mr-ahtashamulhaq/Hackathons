import React, { useState } from 'react';

const TransportTabs = () => {
    const [activeTab, setActiveTab] = useState('bus');

    const tabs = [
        { id: 'bus', label: 'Bus', icon: '🚌' },
        { id: 'train', label: 'Train', icon: '🚂' },
        { id: 'mrt', label: 'MRT/LRT', icon: '🚇' }
    ];

    return (
        <div className="transport-tabs">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                >
                    <span>{tab.icon}</span> {tab.label}
                </button>
            ))}
        </div>
    );
};

export default TransportTabs;
