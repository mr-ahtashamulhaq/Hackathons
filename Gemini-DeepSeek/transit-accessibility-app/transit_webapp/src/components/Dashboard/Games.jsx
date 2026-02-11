import React, { useState } from 'react';
import { Share2, Flame, Bike, Star, Menu, X } from 'lucide-react';

const Games = () => {
    const [activeGame, setActiveGame] = useState(null);
    const [co2Saved, setCo2Saved] = useState(0);
    const [triviaScore, setTriviaScore] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [gameStatus, setGameStatus] = useState('playing'); // playing, finished

    const triviaQuestions = [
        {
            q: "Which mode of transport has the lowest CO2 emissions per passenger?",
            options: ["Private Car", "Electric Bus", "Metro/Train", "Walking"],
            correct: 3
        },
        {
            q: "How much CO2 does a typical tree absorb per year?",
            options: ["5kg", "22kg", "100kg", "50kg"],
            correct: 1
        },
        {
            q: "What percentage of global emissions come from transport?",
            options: ["~10%", "~16%", "~25%", "~40%"],
            correct: 1
        }
    ];

    const resetTrivia = () => {
        setTriviaScore(0);
        setCurrentQuestion(0);
        setGameStatus('playing');
    };

    const handleTriviaAnswer = (index) => {
        if (index === triviaQuestions[currentQuestion].correct) {
            setTriviaScore(prev => prev + 1);
        }

        if (currentQuestion < triviaQuestions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            setGameStatus('finished');
        }
    };

    const renderGame = () => {
        if (activeGame === 'clicker') {
            return (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <h3 style={{ marginBottom: '10px' }}>CO2 Clicker</h3>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>Tap the leaf to offset CO2 emissions!</p>
                    <div
                        onClick={() => setCo2Saved(prev => prev + 1)}
                        style={{
                            fontSize: '80px',
                            cursor: 'pointer',
                            userSelect: 'none',
                            transform: 'scale(1)',
                            transition: 'transform 0.1s active',
                            marginBottom: '20px'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.9)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        🌿
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#054777' }}>
                        {co2Saved}g Saved
                    </div>
                    <button
                        onClick={() => setActiveGame(null)}
                        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#054777', color: 'white', border: 'none', borderRadius: '8px' }}
                    >
                        Back to Games
                    </button>
                </div>
            );
        }

        if (activeGame === 'trivia') {
            return (
                <div style={{ padding: '20px' }}>
                    <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>Eco Trivia</h3>
                    {gameStatus === 'playing' ? (
                        <>
                            <div style={{ fontSize: '14px', color: '#666', textAlign: 'center', marginBottom: '20px' }}>
                                Question {currentQuestion + 1} of {triviaQuestions.length}
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', textAlign: 'center' }}>
                                {triviaQuestions[currentQuestion].q}
                            </div>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {triviaQuestions[currentQuestion].options.map((opt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleTriviaAnswer(i)}
                                        style={{
                                            padding: '15px',
                                            textAlign: 'left',
                                            backgroundColor: '#F0F9FF',
                                            border: '1px solid #E0E0E0',
                                            borderRadius: '12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🏆</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Finished!</div>
                            <div style={{ fontSize: '18px', marginBottom: '20px' }}>Score: {triviaScore}/{triviaQuestions.length}</div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <button
                                    onClick={resetTrivia}
                                    style={{ padding: '10px 20px', backgroundColor: '#054777', color: 'white', border: 'none', borderRadius: '8px' }}
                                >
                                    Retry
                                </button>
                                <button
                                    onClick={() => setActiveGame(null)}
                                    style={{ padding: '10px 20px', backgroundColor: '#E0E0E0', color: '#333', border: 'none', borderRadius: '8px' }}
                                >
                                    Exit
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        return null;
    };

    return (
        <div className="games-screen screen" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            backgroundColor: '#E6F3FF',
            overflowY: 'auto',
            paddingBottom: '100px'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: '#FFFFFF',
                color: '#000000',
                height: '56px',
                zIndex: 10,
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
            }}>
                <button className="icon-btn-ghost">
                    <Menu size={24} color="#343A40" />
                </button>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Welcome, Chuba!</h2>
                <button className="icon-btn-ghost">
                    <Share2 size={24} color="#343A40" />
                </button>
            </div>

            <div style={{ padding: '20px 16px' }}>
                {/* Eco Coach Section */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#000000' }}>Eco Coach</h1>
                    <p style={{ fontSize: '14px', color: '#666', margin: '0 0 16px 0' }}>Level up your eco-friendly habits</p>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        {/* Total Points Card */}
                        <div style={{
                            flex: 1,
                            backgroundColor: '#FF8C00',
                            borderRadius: '16px',
                            padding: '20px',
                            color: '#FFFFFF',
                            position: 'relative',
                            boxShadow: '0 4px 12px rgba(255, 140, 0, 0.3)'
                        }}>
                            <div style={{ marginBottom: '16px' }}>
                                <Star size={24} fill="rgba(255,255,255,0.4)" stroke="white" />
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>1247</div>
                            <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Points</div>
                        </div>

                        {/* Day Streak Card */}
                        <div style={{
                            flex: 1,
                            backgroundColor: '#FF477E',
                            borderRadius: '16px',
                            padding: '20px',
                            color: '#FFFFFF',
                            position: 'relative',
                            boxShadow: '0 4px 12px rgba(255, 71, 126, 0.3)'
                        }}>
                            <div style={{ marginBottom: '16px' }}>
                                <Flame size={24} fill="rgba(255,255,255,0.4)" stroke="white" />
                            </div>
                            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>7</div>
                            <div style={{ fontSize: '14px', opacity: 0.9 }}>Day Streak 🔥</div>
                        </div>
                    </div>
                </div>

                {/* Playable Games Section */}
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Playable Games</h3>
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div
                            onClick={() => setActiveGame('clicker')}
                            style={{
                                flex: 1,
                                backgroundColor: '#FFFFFF',
                                borderRadius: '16px',
                                padding: '16px',
                                textAlign: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🌿</div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>CO2 Clicker</div>
                        </div>
                        <div
                            onClick={() => { setActiveGame('trivia'); resetTrivia(); }}
                            style={{
                                flex: 1,
                                backgroundColor: '#FFFFFF',
                                borderRadius: '16px',
                                padding: '16px',
                                textAlign: 'center',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧠</div>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>Eco Trivia</div>
                        </div>
                    </div>
                </div>

                {/* Game Modal Overlay */}
                {activeGame && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px'
                    }}>
                        <div style={{
                            backgroundColor: '#FFFFFF',
                            width: '100%',
                            maxWidth: '400px',
                            borderRadius: '24px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <button
                                onClick={() => setActiveGame(null)}
                                style={{
                                    position: 'absolute',
                                    top: '16px',
                                    right: '16px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={24} color="#333" />
                            </button>
                            {renderGame()}
                        </div>
                    </div>
                )}

                {/* Badges Section */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    padding: '20px',
                    marginBottom: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Badges</h3>
                        <span style={{ fontSize: '14px', color: '#666' }}>4 earned</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ backgroundColor: '#F0F9FF', borderRadius: '12px', padding: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                                <span style={{ fontSize: '24px' }}>🚌</span>
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '500' }}>First Journey</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ backgroundColor: '#F0F9FF', borderRadius: '12px', padding: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                                <span style={{ fontSize: '24px' }}>🔥</span>
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '500' }}>Week Warrior</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ backgroundColor: '#F0F9FF', borderRadius: '12px', padding: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                                <span style={{ fontSize: '24px' }}>🚲</span>
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '500' }}>Bike Champion</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ backgroundColor: '#F0F9FF', borderRadius: '12px', padding: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                                <span style={{ fontSize: '24px' }}>🌳</span>
                            </div>
                            <div style={{ fontSize: '12px', fontWeight: '500' }}>Tree Saver</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ backgroundColor: '#F0F9FF', borderRadius: '12px', padding: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                                <span style={{ fontSize: '24px' }}>🚇</span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#999' }}>Metro Master</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ backgroundColor: '#F0F9FF', borderRadius: '12px', padding: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                                <span style={{ fontSize: '24px', opacity: 0.3 }}>⭐</span>
                            </div>
                            <div style={{ fontSize: '12px', color: '#999' }}>Eco Hero</div>
                        </div>
                    </div>
                </div>

                {/* Weekly Progress Section */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '20px',
                    padding: '20px',
                    marginBottom: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '700' }}>Weekly Progress</h3>

                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '150px', paddingBottom: '24px', position: 'relative' }}>
                        {/* Chart Grid Lines (Mock) */}
                        <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pointerEvents: 'none' }}>
                            {[16, 12, 8, 4, 0].map(val => (
                                <div key={val} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '12px', color: '#999', width: '15px' }}>{val}</span>
                                    <div style={{ flex: 1, borderTop: '1px solid #F0F0F0' }} />
                                </div>
                            ))}
                        </div>

                        {/* Bars */}
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-around', alignItems: 'flex-end', paddingLeft: '25px', zIndex: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '32px', height: '80px', backgroundColor: '#054777', borderRadius: '4px' }} />
                                <span style={{ fontSize: '12px', color: '#666' }}>W1</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '32px', height: '110px', backgroundColor: '#054777', borderRadius: '4px' }} />
                                <span style={{ fontSize: '12px', color: '#666' }}>W2</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '32px', height: '95px', backgroundColor: '#054777', borderRadius: '4px' }} />
                                <span style={{ fontSize: '12px', color: '#666' }}>W3</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '32px', height: '120px', backgroundColor: '#054777', borderRadius: '4px' }} />
                                <span style={{ fontSize: '12px', color: '#666' }}>W4</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                        <Flame size={14} color="#FF8C00" fill="#FF8C00" />
                        <span style={{ fontSize: '12px', color: '#666' }}>Blue bars = streak days!</span>
                    </div>
                </div>

                {/* Active Challenges Section */}
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>Active Challenges</h3>

                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '20px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: '#E6F3FF',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Bike size={24} color="#054777" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Cycle to work</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Complete 3 more rides (2/5)</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00C853' }}>+500</div>
                            <div style={{ fontSize: '10px', color: '#999' }}>Points</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Games;
