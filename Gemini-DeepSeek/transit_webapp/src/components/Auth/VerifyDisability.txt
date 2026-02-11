import React from 'react';
import { X, Mic, EyeOff, MessageSquareOff, EarOff } from 'lucide-react';


const VerifyDisability = ({ isOpen, onClose }) => {
    const [step, setStep] = React.useState('VERIFY'); // VERIFY, SARA_INTRO, USER_SPEAKING, SARA_DESTINATION

    // TTS Helper
    const speak = (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        // Attempt to find a female voice
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v =>
            v.name.includes('Female') ||
            v.name.includes('Google US English') ||
            v.name.includes('Samantha') ||
            v.name.includes('Victoria') ||
            v.name.includes('Zira')
        );

        if (femaleVoice) utterance.voice = femaleVoice;
        utterance.rate = 1.0;
        utterance.pitch = 1.2; // Slightly higher pitch for female-like tone
        window.speechSynthesis.speak(utterance);
    };

    React.useEffect(() => {
        if (!isOpen) {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            return;
        }

        if (step === 'SARA_INTRO') {
            speak("Hi this is Sara, your AI Agent. You are in Kuala Lumpur. The temperature is 20 degrees Celsius. Air quality index is 78 which is Good. Humidity is 90 percent. You’ve saved 47.3 kilograms of CO2 this week. Where do you want to go?");
        } else if (step === 'SARA_DESTINATION') {
            speak("Okay! You want to go to Meskel Square. Which type of transport would you like to take? You can choose Bus, Train, or MRT LRT.");
        }

        return () => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
        };
    }, [step, isOpen]);

    if (!isOpen) return null;

    const handleDisabilitySelect = () => {
        setStep('SARA_INTRO');
    };

    const handleNextStep = () => {
        if (step === 'SARA_INTRO') setStep('USER_SPEAKING');
        else if (step === 'USER_SPEAKING') setStep('SARA_DESTINATION');
        else if (step === 'SARA_DESTINATION') onClose();
    };

    return (
        <div className={`modal-overlay ai-voice-overlay ${step !== 'VERIFY' ? 'glass-mode' : ''}`} onClick={onClose}>
            <div className={`modal-content verify-disability-modal ${step !== 'VERIFY' ? 'ai-modal' : ''}`} onClick={(e) => e.stopPropagation()}>

                {step === 'VERIFY' ? (
                    <>
                        <div className="disability-modal-header">
                            <span className="modal-title">Verify Disability</span>
                            <button className="modal-close-btn" onClick={onClose}>
                                <X size={20} color="black" />
                            </button>
                        </div>
                        <div className="disability-modal-body">
                            <div className="voice-interaction-section">
                                <div className="mic-animation-container">
                                    <div className="ripple ripple-1"></div>
                                    <div className="ripple ripple-2"></div>
                                    <div className="ripple ripple-3"></div>
                                    <div className="mic-circle">
                                        <Mic size={36} color="white" />
                                    </div>
                                </div>
                                <div className="voice-instructions">
                                    <h3 className="status-text">Speak</h3>
                                    <p className="instruction-subtext">Say “Eye” you have Visual Disabilities</p>
                                </div>
                            </div>
                            <div className="disability-options-row">
                                <div className="disability-option-btn-container" onClick={handleDisabilitySelect}>
                                    <button className="disability-circle-btn visual">
                                        <EyeOff size={28} color="black" />
                                    </button>
                                </div>
                                <div className="disability-option-btn-container" onClick={handleDisabilitySelect}>
                                    <button className="disability-circle-btn speech">
                                        <MessageSquareOff size={28} color="black" />
                                    </button>
                                </div>
                                <div className="disability-option-btn-container" onClick={handleDisabilitySelect}>
                                    <button className="disability-circle-btn hearing">
                                        <EarOff size={28} color="black" />
                                    </button>
                                </div>
                            </div>
                            <div className="bottom-instruction">
                                <p>Tap the disability option</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="sara-assistant-container">
                        {/* Sara Intro Step */}
                        {step === 'SARA_INTRO' && (
                            <div className="ai-bubble-container">
                                <div className="ai-bubble sara-intro-bubble">
                                    <p className="ai-text-line">Hi this is “Sara”...</p>
                                    <p className="ai-text-line">your AI Agent..</p>
                                    <div className="ai-info-box">
                                        <p>You are in Kuala Lumpur.</p>
                                        <p>The temperature is 20°C. Air quality index is 78° which is Good. Humidity is 90%.</p>
                                        <p>You’ve saved 47.3 kg of CO₂ this week..</p>
                                    </div>
                                    <p className="ai-question">Where do you want to go ??</p>
                                    <div className="ai-actions-grid">
                                        <button className="ai-action-btn" onClick={handleNextStep}>Journey</button>
                                        <button className="ai-action-btn">Language</button>
                                        <button className="ai-action-btn">Notify</button>
                                        <button className="ai-action-btn">Sign Out</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* User Speaking Step */}
                        {step === 'USER_SPEAKING' && (
                            <div className="ai-bubble-container user-speech">
                                <div className="ai-bubble user-bubble" onClick={handleNextStep}>
                                    <p className="user-text">I want to go to</p>
                                    <p className="user-text highlight">Meskel Square.....</p>
                                </div>
                                <div className="voice-wave-container">
                                    <div className="wave-bar"></div>
                                    <div className="wave-bar"></div>
                                    <div className="wave-bar"></div>
                                    <div className="wave-bar"></div>
                                    <div className="wave-bar"></div>
                                </div>
                            </div>
                        )}

                        {/* Sara Final Options Step */}
                        {step === 'SARA_DESTINATION' && (
                            <div className="ai-bubble-container">
                                <div className="ai-bubble sara-response-bubble">
                                    <p className="ai-text-line">Okay!</p>
                                    <p className="ai-text-line">You want to go to Meskel Square. Which type of transport would you like to take?</p>
                                    <p className="ai-text-line muted">You can choose Bus, Train, or MRT/LRT.</p>
                                </div>
                            </div>
                        )}

                        {/* Bottom AI Mic Button */}
                        <div className="ai-bottom-controls">
                            <div className="ai-mic-trigger" onClick={handleNextStep}>
                                <Mic size={40} color="white" />
                                <div className="ai-mic-circles">
                                    <div className="mic-ring"></div>
                                    <div className="mic-ring"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyDisability;
