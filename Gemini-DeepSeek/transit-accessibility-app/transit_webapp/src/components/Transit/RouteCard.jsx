import React from 'react';
import { Leaf, ChevronRight } from 'lucide-react';

const RouteCard = ({ route }) => {
    return (
        <div className={`route-card ${route.isRisk ? 'route-card-risk' : ''}`}>
            <div className="route-card-header">
                <div className="route-info-col">
                    <div className="route-top-row">
                        {route.recommended && (
                            <span className="star-label">★ Recommended</span>
                        )}
                        {route.isRisk && (
                            <span className="risk-label">⚠ {route.riskText.split('(')[0]}</span>
                        )}
                    </div>
                    <div className="route-station-name">{route.station}</div>
                </div>
                <div className="route-price">{route.cost}</div>
                <ChevronRight size={20} color="#ADB5BD" />
            </div>

            <div className="route-meta-row">
                {route.distance} | {route.duration} | Arrival time: {route.arrivalTime}
            </div>

            <div className="route-badges-row">
                {route.tags.map((tag, idx) => (
                    <span key={idx} className="chip-basic">{tag}</span>
                ))}
                <span className="chip-co2">
                    <Leaf size={10} fill="currentColor" /> {route.co2} CO₂
                </span>
                <span className={`chip-status ${route.badge.type}`}>
                    {route.badge.text}
                </span>
            </div>
        </div>
    );
};

export default RouteCard;
