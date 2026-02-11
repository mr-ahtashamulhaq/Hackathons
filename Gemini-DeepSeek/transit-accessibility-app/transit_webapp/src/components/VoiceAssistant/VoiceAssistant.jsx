import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './VoiceAssistant.css';

/**
 * Voice-First Transit Assistant MVP
 * Provides hands-free navigation and transit assistance using speech recognition and synthesis
 */
const VoiceAssistant = () => {
  const navigate = useNavigate();
  
  // Conversation states: IDLE → LISTENING → GUIDING
  const [conversationState, setConversationState] = useState('IDLE');
  
  // Speech recognition states
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUserSpeech, setLastUserSpeech] = useState('');
  
  // Text-to-speech states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastResponse, setLastResponse] = useState('');
  const [isCompletingJourney, setIsCompletingJourney] = useState(false);
  
  // Route data storage for navigation
  const [routeData, setRouteData] = useState(null);
  const [currentInstruction, setCurrentInstruction] = useState('');
  
  // Refs for speech APIs
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  /**
   * Initialize Speech Recognition API and welcome message for blind users
   */
  useEffect(() => {
    let fallbackTimer = null;
    let loadVoices = null;
    
    // Load voices for speech synthesis (needed for female voice selection)
    if ('speechSynthesis' in window) {
      loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.map(v => v.name));
      };
      
      // Load voices immediately if available
      loadVoices();
      
      // Also listen for voices changed event (some browsers need this)
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    }

    // Initialize Sara conversation when component first loads
    if (conversationState === 'IDLE' && !lastResponse) {
      // Immediate test to ensure Sara can speak
      setTimeout(() => {
        console.log('🎤 Testing Sara speech immediately...');
        speakResponse("Hello, this is Sara testing voice synthesis. Can you hear me?");
      }, 500);
      
      setTimeout(() => {
        initializeSaraConversation();
      }, 2000); // Small delay to ensure component is mounted
    }

    // Fallback: If backend doesn't respond within 3 seconds, use fallback Sara intro
    fallbackTimer = setTimeout(() => {
      if (conversationState === 'IDLE' && !lastResponse && !isSpeaking) {
        console.log('Backend timeout - using fallback Sara introduction');
        const fallbackMessage = "Hi, this is Sara, your AI navigation assistant for Toronto. The temperature is 20 degrees Celsius. Air quality index is 78 which is Good. Humidity is 90 percent. You've saved 47.3 kg of CO₂ this week. Where do you want to go?";
        setLastResponse(fallbackMessage);
        speakResponse(fallbackMessage);
      }
    }, 3000);

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configure speech recognition
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      // Handle speech recognition events
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setConversationState('LISTENING');
      };

      recognitionRef.current.onresult = (event) => {
        const speechResult = event.results[0][0].transcript;
        setLastUserSpeech(speechResult);
        handleUserSpeech(speechResult);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // Stay in current state unless we're just listening
        if (conversationState === 'LISTENING') {
          setConversationState(routeData ? 'GUIDING' : 'IDLE');
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setConversationState(routeData ? 'GUIDING' : 'IDLE');
        speakResponse("Sorry, I couldn't hear you clearly. Please try again.");
      };
    } else {
      console.warn('Speech Recognition not supported in this browser');
      speakResponse("I'm sorry, but voice recognition is not supported in this browser. Please use a supported browser for the full voice experience.");
    }

    return () => {
      // Cleanup on component unmount
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        if (loadVoices) {
          window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
        }
      }
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
    };
  }, []);  // Remove conversationState dependency to prevent loop

  /**
   * Initialize Sara conversation with introduction
   */
  const initializeSaraConversation = async () => {
    console.log('Initializing Sara conversation...');
    try {
      // Send initialize request to trigger Sara's introduction
      await sendToBackend('initialize');
      console.log('Sara initialization request sent successfully');
    } catch (error) {
      console.error('Failed to initialize Sara conversation:', error);
      // Fallback introduction if backend is not available
      const fallbackMessage = "Hi, this is Sara, your AI navigation assistant for Toronto. The temperature is 20 degrees Celsius. Air quality is good. You've saved 47.3 kg of CO₂ this week. Where would you like to go today?";
      setLastResponse(fallbackMessage);
      speakResponse(fallbackMessage);
    }
  };

  /**
   * Start listening for user speech input
   */
  const startListening = () => {
    if (recognitionRef.current && !isListening && !isProcessing) {
      setLastUserSpeech('');
      recognitionRef.current.start();
    }
  };

  /**
   * Handle user speech - send everything to Sara for conversation flow
   */
  const handleUserSpeech = async (text) => {
    setIsProcessing(true);
    
    try {
      // Send all speech to backend for Sara to handle conversation flow
      await sendToBackend(text);
    } catch (error) {
      console.error('Error processing speech:', error);
      speakResponse("I'm sorry, I had trouble processing that. Please try again.");
    }
    
    setIsProcessing(false);
  };

  /**
   * Send user speech to backend for processing with Sara conversation flow
   */
  const sendToBackend = async (text) => {
    console.log('📤 Sending to backend:', text);
    try {
      // Updated endpoint URL - the assistant router is mounted without /api prefix
      const response = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 Backend response received:', data);
      
      // Handle the response
      if (data.response) {
        console.log('✅ Setting Sara response:', data.response);
        setLastResponse(data.response);
        setCurrentInstruction(data.response);
        speakResponse(data.response);
      } else {
        console.warn('⚠️ No response field in backend data');
      }

      // Save route data if provided
      if (data.data && data.data.route) {
        const processedRoute = processRouteData(data.data);
        setRouteData(processedRoute);
        console.log('Route data saved:', processedRoute);
        setConversationState('GUIDING');
      }

      // Update conversation state based on backend response
      if (data.data && data.data.state) {
        console.log('🔄 Updating conversation state:', data.data.state);
        if (data.data.state === 'journey_active' || data.data.state === 'at_bus_stop' || 
            data.data.state === 'on_bus' || data.data.state === 'walking_to_destination') {
          setConversationState('GUIDING');
        } else if (data.data.state === 'completed') {
          // Journey completed - flag that we're completing and wait for speech to finish
          console.log('🏁 Journey completed! Waiting for Sara to finish speaking...');
          setIsCompletingJourney(true);
          setConversationState('IDLE');
          setRouteData(null);
          setLastUserSpeech('');
        }
      }

    } catch (error) {
      console.error('❌ Backend communication error:', error);
      let errorMsg = "Sorry, I'm having trouble connecting to the navigation service.";
      
      if (error.message.includes('fetch')) {
        errorMsg += " Please make sure the backend server is running on http://localhost:8000";
      } else if (error.message.includes('status: 500')) {
        errorMsg += " The server encountered an error processing your request.";
      } else if (error.message.includes('status: 404')) {
        errorMsg += " The navigation service endpoint was not found.";
      }
      
      speakResponse(errorMsg);
    }
  };

  /**
   * Process route data from backend and convert coordinates for map use
   * Converts [lon, lat] to [lat, lon] format expected by most mapping libraries
   */
  const processRouteData = (data) => {
    if (!data.route || !data.route.geometry) {
      return data;
    }

    const route = { ...data.route };
    
    // Convert geometry coordinates from [lon, lat] to [lat, lon] for map use
    if (route.geometry.coordinates) {
      route.geometry.coordinates = route.geometry.coordinates.map(coord => {
        if (Array.isArray(coord) && coord.length >= 2) {
          return [coord[1], coord[0]]; // Swap longitude and latitude
        }
        return coord;
      });
    }

    return {
      ...data,
      route: route,
      // Preserve other useful data
      distance: data.distance,
      duration: data.duration,
      steps: data.steps || []
    };
  };

  /**
   * Speak response using Text-to-Speech API with female voice
   */
  const speakResponse = (text) => {
    console.log('🎤 Sara attempting to speak:', text);
    
    if ('speechSynthesis' in window && text) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Attempt to find and use a female voice
      const voices = window.speechSynthesis.getVoices();
      console.log('Available voices:', voices.length);
      
      const femaleVoice = voices.find(v =>
        v.name.includes('Female') ||
        v.name.includes('Google US English') ||
        v.name.includes('Samantha') ||
        v.name.includes('Victoria') ||
        v.name.includes('Zira') ||
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('woman')
      );

      if (femaleVoice) {
        utterance.voice = femaleVoice;
        console.log('🎙️ Using female voice:', femaleVoice.name);
      } else {
        console.log('⚠️ No female voice found, using default voice');
      }
      
      // Configure voice settings for better accessibility with female tone
      utterance.rate = 0.8; // Slightly slower for clarity
      utterance.pitch = 1.2; // Higher pitch for more feminine tone
      utterance.volume = 1.0;
      
      // Handle speech events
      utterance.onstart = () => {
        console.log('✅ Sara started speaking');
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        console.log('✅ Sara finished speaking');
        setIsSpeaking(false);
        
        // Check if we just finished speaking the journey completion message
        if (isCompletingJourney) {
          console.log('🔄 Journey completion message finished - resetting Sara...');
          setIsCompletingJourney(false);
          // Wait a moment before resetting to let the user process
          setTimeout(() => {
            setLastResponse('');
            setCurrentInstruction('');
            // Trigger Sara's initial greeting again
            setTimeout(() => {
              initializeSaraConversation();
            }, 1000);
          }, 1500);
        }
      };
      
      utterance.onerror = (event) => {
        console.error('❌ Speech synthesis error:', event.error);
        setIsSpeaking(false);
        
        // Also handle error case for journey completion
        if (isCompletingJourney) {
          console.log('⚠️ Speech error during journey completion - still resetting...');
          setIsCompletingJourney(false);
          setTimeout(() => {
            setLastResponse('');
            setCurrentInstruction('');
            setTimeout(() => {
              initializeSaraConversation();
            }, 1000);
          }, 1500);
        }
      };
      
      // Speak the text
      console.log('🗣️ Starting speech synthesis...');
      window.speechSynthesis.speak(utterance);
      synthRef.current = utterance;
    } else {
      console.error('❌ Speech synthesis not available or no text provided:', {
        speechSynthesis: 'speechSynthesis' in window,
        textProvided: !!text
      });
    }
  };

  /**
   * Get display text for current conversation state
   */
  const getStatusText = () => {
    if (isSpeaking) return 'Speaking...';
    if (isProcessing) return 'Processing...';
    if (isListening) return 'Listening...';
    
    switch (conversationState) {
      case 'LISTENING':
        return 'Listening for your request...';
      case 'GUIDING':
        return 'Navigation mode - Tap to give updates';
      case 'IDLE':
      default:
        return 'Tap to speak';
    }
  };

  /**
   * Get appropriate button color based on state
   */
  const getButtonClass = () => {
    let classes = 'speak-button';
    if (isListening) classes += ' listening';
    if (isProcessing) classes += ' processing';
    if (isSpeaking) classes += ' speaking';
    if (conversationState === 'GUIDING') classes += ' guiding';
    return classes;
  };

  /**
   * Handle close button - stop speech and exit blind mode
   */
  const handleCloseAndExit = () => {
    console.log('🚪 Closing voice assistant - stopping all speech...');
    
    // Stop any ongoing speech immediately
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      console.log('🔇 Speech synthesis stopped');
    }
    
    // Reset TTS state
    setIsSpeaking(false);
    
    // Stop speech recognition if active
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      console.log('🎤 Speech recognition stopped');
    }
    
    // Navigate back to main app
    navigate('/');
  };

  return (
    <div className="modal-overlay ai-voice-overlay glass-mode" onClick={(e) => e.stopPropagation()}>
      <div className="modal-content verify-disability-modal ai-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Close button to return to main app */}
        <button className="modal-close-btn" onClick={handleCloseAndExit}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        <div className="sara-assistant-container" style={{ paddingTop: '10px', paddingBottom: '10px', maxWidth: '100%' }}>
          {conversationState === 'IDLE' && !lastUserSpeech && !lastResponse && (
            <div className="ai-bubble-container">
              <div className="ai-bubble sara-intro-bubble">
                <p className="ai-text-line" style={{ fontSize: '14px', margin: '4px 0' }}>🎤 Sara - Voice Assistant</p>
                <p className="ai-text-line" style={{ fontSize: '12px', margin: '2px 0' }}>Toronto Transit - Blind Mode</p>
                <div className="ai-info-box" style={{ fontSize: '11px', padding: '8px' }}>
                  <p style={{ margin: '2px 0' }}>Initializing Sara's conversation system...</p>
                  <p style={{ margin: '2px 0' }}>Please wait while Sara prepares your navigation.</p>
                </div>
                <p className="ai-question" style={{ fontSize: '11px', margin: '4px 0' }}>Sara will greet you shortly</p>
              </div>
            </div>
          )}

          {/* User Speech Display */}
          {lastUserSpeech && (
            <div className="ai-bubble-container user-speech" style={{ marginTop: '-10px' }}>
              <div className="ai-bubble user-bubble">
                <p className="user-text" style={{ fontSize: '11px', margin: '2px 0' }}>You said:</p>
                <p className="user-text highlight" style={{ fontSize: '12px', margin: '2px 0', wordWrap: 'break-word', wordBreak: 'break-word' }}>"{lastUserSpeech}"</p>
              </div>
              {isProcessing && (
                <div className="voice-wave-container">
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                </div>
              )}
            </div>
          )}

          {/* AI Response Display */}
          {lastResponse && !isProcessing && (
            <div className="ai-bubble-container" style={{ marginTop: '10px' }}>
              <div className="ai-bubble sara-response-bubble">
                <p className="ai-text-line" style={{ fontSize: '12px', lineHeight: '1.4', margin: '4px 0', wordWrap: 'break-word', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{lastResponse}</p>
                {conversationState === 'GUIDING' && (
                  <p className="ai-text-line muted" style={{ fontSize: '10px', margin: '2px 0' }}>Say "I am now at [location]" to update your position.</p>
                )}
              </div>
            </div>
          )}

          {/* Route Information */}
          {routeData && (
            <div className="ai-bubble-container" style={{ marginTop: '-20px' }}>
              <div className="ai-bubble sara-intro-bubble">
                <p className="ai-text-line" style={{ fontSize: '12px', margin: '2px 0' }}>📍 Route Information</p>
                <div className="ai-info-box" style={{ fontSize: '10px', padding: '6px' }}>
                  {routeData.distance && <p style={{ margin: '1px 0', wordWrap: 'break-word' }}>Distance: {routeData.distance}</p>}
                  {routeData.duration && <p style={{ margin: '1px 0', wordWrap: 'break-word' }}>Duration: {routeData.duration}</p>}
                  <p style={{ margin: '1px 0' }}>Navigation mode active</p>
                </div>
              </div>
            </div>
          )}

          {/* Single Main Microphone Button */}
          <div className="voice-interaction-section" style={{ margin: '-35px 0 -20px 0' }}>
            <div 
              className={`mic-animation-container ${isListening || isSpeaking ? 'active' : ''}`}
              onClick={startListening}
              style={{ 
                cursor: (isProcessing || isSpeaking) ? 'not-allowed' : 'pointer',
                opacity: (isProcessing || isSpeaking) ? 0.7 : 1
              }}
            >
              {(isListening || isSpeaking || isProcessing) && (
                <>
                  <div className="ripple ripple-1"></div>
                  <div className="ripple ripple-2"></div>
                  <div className="ripple ripple-3"></div>
                </>
              )}
              <div className="mic-circle">
                {isProcessing ? (
                  <div className="processing-spinner" style={{ width: '24px', height: '24px' }}></div>
                ) : (
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                )}
              </div>
            </div>
            <div className="voice-instructions">
              <h3 className="status-text" style={{ fontSize: '12px', margin: '4px 0' }}>{getStatusText()}</h3>
              <p className="instruction-subtext" style={{ fontSize: '10px', margin: '2px 0' }}>Tap microphone to speak</p>
            </div>
          </div>

          {/* Command Hints */}
          {conversationState === 'IDLE' && !lastResponse && (
            <div className="ai-bubble-container" style={{ marginTop: '-8px', marginBottom: '-50px' }}>
              <div className="ai-bubble sara-response-bubble">
                <p className="ai-text-line" style={{ fontSize: '11px', margin: '2px 0' }}>Sara is initializing...</p>
                <div className="ai-info-box" style={{ fontSize: '9px', padding: '6px' }}>
                  <p style={{ margin: '1px 0' }}>• Wait for Sara's introduction</p>
                  <p style={{ margin: '1px 0' }}>• Tell Sara where you want to go</p>
                  <p style={{ margin: '1px 0' }}>• Choose your transport type</p>
                  <p style={{ margin: '1px 0' }}>• Follow step-by-step guidance</p>
                </div>
              </div>
            </div>
          )}

          {conversationState === 'IDLE' && lastResponse && (
            <div className="ai-bubble-container" style={{ marginTop: '10px', marginBottom: '15px' }}>
              <div className="ai-bubble sara-response-bubble">
                <p className="ai-text-line" style={{ fontSize: '11px', margin: '2px 0' }}>Sara's Voice Commands:</p>
                <div className="ai-info-box" style={{ fontSize: '9px', padding: '6px' }}>
                  <p style={{ margin: '1px 0' }}>• "I want to go from Union Station to CN Tower"</p>
                  <p style={{ margin: '1px 0' }}>• "I want to check my profile details"</p>
                  <p style={{ margin: '1px 0' }}>• "I want to check my notifications"</p>
                  <p style={{ margin: '1px 0' }}>• "Can I see my past trips?"</p>
                  <p style={{ margin: '1px 0' }}>• "I want to play games"</p>
                  <p style={{ margin: '1px 0' }}>• "Play CO2 clicker" or "Play trivia"</p>
                  <p style={{ margin: '1px 0' }}>• "Check my badges" or "Tap" during games</p>
                  <p style={{ margin: '1px 0' }}>• "I want to change my system language"</p>
                  <p style={{ margin: '1px 0' }}>• "Thank you" to end conversations</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;