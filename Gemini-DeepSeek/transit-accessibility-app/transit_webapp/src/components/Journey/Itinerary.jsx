import React from 'react';

const Itinerary = ({ steps }) => {
    return (
        <div className="itinerary-container">
            {steps.map((step, index) => (
                <div key={index} className="itinerary-step">
                    <div className="step-icon">{step.icon}</div>
                    {index < steps.length - 1 && <div className="step-line"></div>}
                    <div className="step-content">
                        <div className="step-title">{step.title}</div>
                        <div className="step-subtitle">{step.subtitle}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Itinerary;
