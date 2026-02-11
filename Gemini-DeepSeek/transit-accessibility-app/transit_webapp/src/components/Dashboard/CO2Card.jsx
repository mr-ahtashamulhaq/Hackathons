import React, { useState, useEffect } from 'react';
import { TreeDeciduous } from 'lucide-react';
import { userService } from '../../services/userService';

const CO2Card = () => {
    const [userStats, setUserStats] = useState({
        total_co2_saved_kg: 47.3,
        total_trips: 0,
        sustainability_streak_days: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserStats = async () => {
            try {
                const stats = await userService.getUserStats();
                setUserStats(stats);
            } catch (error) {
                console.error('Failed to fetch user stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserStats();
    }, []);

    const treesEquivalent = userService.calculateTreesEquivalent(userStats.total_co2_saved_kg);

    return (
        <div className="card co2-card-redesign">
            <div className="co2-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#495057' }}>Total CO₂ Saved</div>
                <TreeDeciduous size={24} color="#4CAF50" />
            </div>

            <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                {loading ? (
                    <div style={{ fontSize: '24px', color: '#6C757D' }}>Loading...</div>
                ) : (
                    <>
                        <div style={{ fontSize: '48px', fontWeight: '700', color: '#343A40', lineHeight: 1 }}>
                            {userStats.total_co2_saved_kg}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6C757D', marginTop: '4px' }}>kilograms of CO₂</div>
                    </>
                )}
            </div>

            <div style={{ height: '1px', backgroundColor: '#E9ECEF', margin: '16px 0' }}></div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#343A40', fontSize: '14px', fontWeight: '500' }}>
                <span>That's equal to {treesEquivalent} trees planted!</span>
                <TreeDeciduous size={16} color="#4CAF50" fill="#4CAF50" />
            </div>

            {!loading && userStats.sustainability_streak_days > 0 && (
                <div style={{ marginTop: '12px', fontSize: '13px', color: '#6C757D' }}>
                    🔥 {userStats.sustainability_streak_days} day streak!
                </div>
            )}
        </div>
    );
};

export default CO2Card;
