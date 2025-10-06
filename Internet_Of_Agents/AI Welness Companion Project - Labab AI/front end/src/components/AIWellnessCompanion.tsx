import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Camera, Send, Heart, Brain, User, Settings, TrendingUp, 
  MessageCircle, Image, Play, Pause, RotateCcw, BookOpen, Phone, 
  Sun, Moon, Star, Sparkles, Shield, Clock, Calendar, Award,
  Headphones, Coffee, Flower2, Rainbow, Zap, Target, CheckCircle,
  AlertTriangle, Bell, Volume2, VolumeX, Smile, Frown, Meh,
  Activity, BarChart3, PieChart, TreePine, Waves, Wind
} from 'lucide-react';
import './ai-therapy-companion.css';

const AIWellnessCompanion = () => {
  const [currentMode, setCurrentMode] = useState('chat');
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      content: 'Hello there! 🌟 I\'m Luna, your personal wellness companion. I\'m here to listen, support, and walk alongside you on your mental health journey. How are you feeling today?',
      mood: 'warm',
      timestamp: new Date().toLocaleTimeString(),
      hasActions: false,
      actions: [],
      persona: 'luna',
      energy: 'gentle'
    }
  ]);

  // Agent integration states
  const [latestMood, setLatestMood] = useState(null);
  const [crisisAlert, setCrisisAlert] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [userMood, setUserMood] = useState('neutral');
  const [moodIntensity, setMoodIntensity] = useState(5);
  const [currentStreak, setCurrentStreak] = useState(7);
  const [totalSessions, setTotalSessions] = useState(23);
  
  // Enhanced states
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [breathingCount, setBreathingCount] = useState(4);
  const [breathingType, setBreathingType] = useState('4-4-4');
  
  const [showJournal, setShowJournal] = useState(false);
  const [journalPrompt, setJournalPrompt] = useState('');
  const [journalEntries, setJournalEntries] = useState([]);
  
  const [showCrisisSupport, setShowCrisisSupport] = useState(false);
  const [showMeditation, setShowMeditation] = useState(false);
  const [meditationTimer, setMeditationTimer] = useState(300); // 5 minutes
  const [meditationActive, setMeditationActive] = useState(false);
  
  const [showGoals, setShowGoals] = useState(false);
  const [dailyGoals, setDailyGoals] = useState([
    { id: 1, text: 'Practice 5 minutes of mindfulness', completed: true },
    { id: 2, text: 'Write in journal', completed: false },
    { id: 3, text: 'Take a mindful walk', completed: false },
    { id: 4, text: 'Connect with a friend', completed: true }
  ]);
  
  const [showInsights, setShowInsights] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'Alex',
    preferredPersona: 'luna',
    voiceEnabled: true,
    personalityType: 'gentle-supportive',
    preferredTime: 'evening',
    currentGoals: ['reduce-anxiety', 'improve-sleep', 'build-confidence'],
    therapyStyle: 'cbt-mindfulness'
  });
  
  const [moodHistory, setMoodHistory] = useState([
    { date: 'Mon', mood: 'positive', score: 0.7, energy: 'calm', notes: 'Great therapy session' },
    { date: 'Tue', mood: 'neutral', score: 0.5, energy: 'balanced', notes: 'Regular day at work' },
    { date: 'Wed', mood: 'anxious', score: 0.3, energy: 'restless', notes: 'Presentation stress' },
    { date: 'Thu', mood: 'positive', score: 0.8, energy: 'energetic', notes: 'Accomplished goals' },
    { date: 'Fri', mood: 'neutral', score: 0.6, energy: 'tired', notes: 'End of week fatigue' },
    { date: 'Sat', mood: 'sad', score: 0.2, energy: 'low', notes: 'Missing family' },
    { date: 'Today', mood: userMood, score: moodIntensity/10, energy: 'balanced', notes: '' }
  ]);

  const [achievements, setAchievements] = useState([
    { id: 1, title: '7-Day Streak', icon: '🔥', unlocked: true, description: 'Used the app for 7 consecutive days' },
    { id: 2, title: 'Mindful Moments', icon: '🧘', unlocked: true, description: 'Completed 10 breathing exercises' },
    { id: 3, title: 'Journal Master', icon: '📝', unlocked: false, description: 'Write 30 journal entries' },
    { id: 4, title: 'Mood Tracker', icon: '📊', unlocked: true, description: 'Track mood for 14 days' }
  ]);

  const [calmingSounds, setCalmingSounds] = useState([
    { name: 'Rain', icon: '🌧️', active: false },
    { name: 'Ocean Waves', icon: '🌊', active: false },
    { name: 'Forest', icon: '🌲', active: false },
    { name: 'Fireplace', icon: '🔥', active: false }
  ]);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const meditationIntervalRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enhanced persona system
  const personas = {
    luna: {
      name: 'Luna',
      personality: 'Gentle, nurturing, and wise like moonlight',
      greeting: 'Hello, beautiful soul',
      color: 'purple',
      icon: '🌙'
    },
    sage: {
      name: 'Sage',
      personality: 'Wise, grounded, and naturally healing',
      greeting: 'Welcome, friend',
      color: 'green',
      icon: '🌿'
    },
    phoenix: {
      name: 'Phoenix',
      personality: 'Empowering, resilient, and transformative',
      greeting: 'Rise and shine',
      color: 'orange',
      icon: '🔥'
    },
    aurora: {
      name: 'Aurora',
      personality: 'Inspiring, hopeful, and radiant',
      greeting: 'Good to see you',
      color: 'blue',
      icon: '✨'
    }
  };

  const getMoodColor = (mood) => {
    const colors = {
      'positive': 'mood-positive',
      'negative': 'mood-negative',
      'anxious': 'mood-anxious',
      'sad': 'mood-sad',
      'excited': 'mood-excited',
      'calm': 'mood-calm',
      'stressed': 'mood-stressed',
      'angry': 'mood-angry',
      'peaceful': 'mood-peaceful'
    };
    return colors[mood] || 'mood-neutral';
  };

  const getMoodBg = (mood) => {
    const bgs = {
      'positive': 'mood-positive',
      'negative': 'mood-negative',
      'anxious': 'mood-anxious',
      'sad': 'mood-sad',
      'excited': 'mood-excited',
      'calm': 'mood-calm',
      'stressed': 'mood-stressed',
      'angry': 'mood-angry',
      'peaceful': 'mood-peaceful'
    };
    return bgs[mood] || 'mood-neutral';
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      'positive': '😊', 'negative': '😔', 'anxious': '😰', 'sad': '😢',
      'excited': '🤩', 'calm': '😌', 'stressed': '😤', 'angry': '😡',
      'peaceful': '😇', 'neutral': '😐'
    };
    return emojis[mood] || '😐';
  };

  const detectMoodFromMessage = (text) => {
    const lowerText = text.toLowerCase();
    
    // Advanced mood detection
    if (lowerText.includes('anxious') || lowerText.includes('worried') || lowerText.includes('nervous')) return 'anxious';
    if (lowerText.includes('sad') || lowerText.includes('down') || lowerText.includes('depressed')) return 'sad';
    if (lowerText.includes('angry') || lowerText.includes('furious') || lowerText.includes('mad')) return 'angry';
    if (lowerText.includes('excited') || lowerText.includes('thrilled') || lowerText.includes('amazing')) return 'excited';
    if (lowerText.includes('calm') || lowerText.includes('peaceful') || lowerText.includes('serene')) return 'calm';
    if (lowerText.includes('stressed') || lowerText.includes('overwhelmed') || lowerText.includes('pressure')) return 'stressed';
    if (lowerText.includes('happy') || lowerText.includes('great') || lowerText.includes('wonderful')) return 'positive';
    
    return 'neutral';
  };

  const generatePersonalizedResponse = (userMessage, detectedMood) => {
    const currentPersona = personas[userProfile.preferredPersona];
    const responses = {
      anxious: [
        "I can sense the anxiety in your words, and I want you to know that what you're feeling is completely valid. Anxiety often shows up when we care deeply about something. Let's take this one breath at a time. 🌬️",
        "Those anxious feelings are trying to protect you, but sometimes they can feel overwhelming. You're safe right now, in this moment. Would you like to try a grounding technique together? 🌱",
        "I hear the worry in your message. Anxiety can make our minds race with 'what-ifs,' but right now, you're here with me, and that's what matters. Let's focus on what you can control. 💙"
      ],
      sad: [
        "I can feel the heaviness in your words, and I'm honored that you're sharing this with me. Sadness is one of our most human emotions - it shows how deeply you feel and care. You don't have to carry this alone. 🤗",
        "Your sadness is valid, and it's okay to sit with these feelings. Sometimes sadness is our heart's way of processing change or loss. I'm here to hold space for you. 💜",
        "I sense the pain behind your words. Sadness can feel so isolating, but please know that sharing it with me means you're already taking a brave step toward healing. 🌙"
      ],
      stressed: [
        "I can feel the weight you're carrying right now. Stress often comes when life demands more than we feel we can give. Let's break this down together and find some relief. 🫂",
        "That overwhelmed feeling is so real, and it's your mind's way of saying 'I need support.' You've come to the right place. Let's create some space to breathe. 🌸",
        "Stress can make everything feel urgent and impossible. But you're stronger than you know, and we can tackle this step by step. What's the most pressing thing on your mind? 💪"
      ],
      positive: [
        "I can feel the joy radiating from your message! It's beautiful to witness your happiness. These positive moments are like sunshine for the soul - let's savor this feeling together! ☀️",
        "Your positive energy is contagious! I'm so glad you're experiencing this lightness. Happiness shared is happiness doubled. What's bringing you the most joy right now? ✨",
        "This wonderful mood you're in is something to celebrate! Your joy reminds me why supporting your mental health journey is so meaningful. Keep shining! 🌟"
      ]
    };

    const moodResponses = responses[detectedMood] || [
      "Thank you for sharing with me. I'm here to listen and support you however you need. What would feel most helpful right now?"
    ];
    
    const randomResponse = moodResponses[Math.floor(Math.random() * moodResponses.length)];
    
    // Add personalized touch based on user's therapy goals
    let additionalSupport = '';
    if (userProfile.currentGoals.includes('reduce-anxiety') && detectedMood === 'anxious') {
      additionalSupport = ' Since reducing anxiety is one of your goals, shall we try that breathing technique we practiced?';
    }
    if (userProfile.currentGoals.includes('improve-sleep') && (detectedMood === 'stressed' || detectedMood === 'anxious')) {
      additionalSupport = ' I notice stress can affect your sleep goal. Would a calming meditation help right now?';
    }

    return randomResponse + additionalSupport;
  };

  
const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = {
      type: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString(),
      mood: userMood,
      hasActions: false,
      actions: [],
      persona: userProfile.preferredPersona,
      energy: 'user'
    };

    // add user message to UI
    setMessages(prev => [...prev, newMessage]);
    setIsProcessing(true);
    setMessage('');

    try {
      // Call combined analyze endpoint on backend
      const resp = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      });

      const data = await resp.json();

      // Companion reply
      const aiMsg = {
        type: 'ai',
        content: data.companion || (data.compound_reply || 'Sorry, something went wrong.'),
        mood: (data.mood && data.mood[0] && data.mood[0].label) ? data.mood[0].label : null,
        timestamp: new Date().toLocaleTimeString(),
        hasActions: false,
        actions: [],
        persona: 'luna',
        energy: 'ai'
      };

      // update mood and crisis panels
      if (data.mood) {
        setLatestMood(data.mood);
      }
      if (data.crisis) {
        setCrisisAlert(data.crisis);
      }

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Agent call failed', err);
      const aiMsg = {
        type: 'ai',
        content: 'Sorry, I could not reach the agent service. Please try again later.',
        mood: 'neutral',
        timestamp: new Date().toLocaleTimeString(),
        hasActions: false,
        actions: [],
        persona: 'luna',
        energy: 'ai'
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsProcessing(false);
    }
  };
;

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate voice recording
      setTimeout(() => {
        setIsRecording(false);
        const voiceMessage = "I've been feeling really anxious lately";
        setMessage(voiceMessage);
        handleSendMessage();
      }, 3000);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageMessage = {
        type: 'user',
        content: '📸 Shared an image',
        timestamp: new Date().toLocaleTimeString(),
        mood: userMood,
        hasActions: false,
        actions: [],
        persona: userProfile.preferredPersona,
        energy: 'user'
      };
      
      setMessages(prev => [...prev, imageMessage]);
      
      // Simulate image analysis
      setTimeout(() => {
        const aiResponse = {
          type: 'ai',
          content: "I can see from your image that you might be feeling a bit tired or stressed. Sometimes our faces tell stories our words don't. How are you really feeling right now?",
          mood: 'concerned',
          timestamp: new Date().toLocaleTimeString(),
          hasActions: true,
          actions: ['journal'],
          persona: userProfile.preferredPersona,
          energy: 'supportive'
        };
        setMessages(prev => [...prev, aiResponse]);
        setUserMood('stressed');
      }, 2000);
    }
  };

  const getMoodIntensityFromMessage = (text) => {
    const intensifiers = ['very', 'extremely', 'incredibly', 'so', 'really', 'absolutely'];
    const hasIntensifier = intensifiers.some(word => text.toLowerCase().includes(word));
    return hasIntensifier ? Math.min(moodIntensity + 2, 10) : Math.max(moodIntensity - 1, 1);
  };

  const updateMoodHistory = (mood) => {
    setMoodHistory(prev =>
      prev.map(item =>
        item.date === 'Today'
          ? { ...item, mood, score: moodIntensity/10, notes: 'Updated from conversation' }
          : item
      )
    );
  };

  const getRecommendedActions = (mood) => {
    const actionMap = {
      anxious: ['breathing', 'meditation', 'grounding'],
      sad: ['journal', 'music', 'selfcare'],
      stressed: ['breathing', 'meditation', 'goals'],
      angry: ['breathing', 'physical', 'journal'],
      positive: ['celebrate', 'gratitude', 'goals'],
      excited: ['channel', 'goals', 'share'],
      calm: ['meditation', 'gratitude', 'creative']
    };
    return actionMap[mood] || ['journal', 'breathing'];
  };

  const checkAchievements = () => {
    // Simple achievement logic - in real app, this would be more sophisticated
    setTotalSessions(prev => prev + 1);
    if (totalSessions > 0 && totalSessions % 10 === 0) {
      // Unlock achievement logic
    }
  };

  const startBreathingExercise = (type = '4-4-4') => {
    setBreathingType(type);
    setShowBreathingExercise(true);
    setBreathingPhase('prepare');
    setBreathingCount(3);
    
    // Preparation countdown
    const prepInterval = setInterval(() => {
      setBreathingCount(prev => {
        if (prev <= 1) {
          clearInterval(prepInterval);
          startBreathingCycle(type);
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startBreathingCycle = (type) => {
    const cycles = type.split('-').map(Number);
    const [inhale, hold, exhale] = cycles;
    let currentCycle = 0;
    let phase = 0; // 0: inhale, 1: hold, 2: exhale
    const phases = ['inhale', 'hold', 'exhale'];
    const durations = [inhale, hold, exhale];
    
    setBreathingPhase(phases[phase]);
    setBreathingCount(durations[phase]);
    
    const breathingInterval = setInterval(() => {
      setBreathingCount(prev => {
        if (prev <= 1) {
          phase = (phase + 1) % 3;
          if (phase === 0) currentCycle++;
          
          if (currentCycle >= 6) { // 6 complete cycles
            clearInterval(breathingInterval);
            completeBreathingExercise();
            return 0;
          }
          
          setBreathingPhase(phases[phase]);
          return durations[phase];
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeBreathingExercise = () => {
    setShowBreathingExercise(false);
    const completionMessage = {
      type: 'ai',
      content: "Beautiful work! 🌟 You just completed a full breathing cycle. Notice how your body feels now - that's the power of mindful breathing. How do you feel compared to when we started?",
      mood: 'positive',
      timestamp: new Date().toLocaleTimeString(),
      hasActions: true,
      actions: ['checkin', 'continue'],
      persona: userProfile.preferredPersona,
      energy: 'supportive'
    };
    setMessages(prev => [...prev, completionMessage]);
  };

  const startMeditation = (duration) => {
    setMeditationTimer(duration);
    setShowMeditation(true);
    setMeditationActive(true);
    
    meditationIntervalRef.current = setInterval(() => {
      setMeditationTimer(prev => {
        if (prev <= 1) {
          clearInterval(meditationIntervalRef.current);
          completeMeditation();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const completeMeditation = () => {
    setMeditationActive(false);
    setShowMeditation(false);
    const completionMessage = {
      type: 'ai',
      content: "What a peaceful meditation session! 🧘‍♀️ You've just gifted yourself with mindful presence. Take a moment to notice any shifts in how you feel - perhaps more centered, calm, or clear?",
      mood: 'peaceful',
      timestamp: new Date().toLocaleTimeString(),
      hasActions: true,
      actions: ['reflect', 'gratitude'],
      persona: userProfile.preferredPersona,
      energy: 'peaceful'
    };
    setMessages(prev => [...prev, completionMessage]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleCalmingSound = (soundName) => {
    setCalmingSounds(prev =>
      prev.map(sound =>
        sound.name === soundName
          ? { ...sound, active: !sound.active }
          : { ...sound, active: false } // Only one sound at a time
      )
    );
  };

  const openJournal = () => {
    const prompts = [
      "What's one thing you're grateful for right now, even if today has been challenging?",
      "Describe how you're feeling using colors, weather, or nature metaphors.",
      "What would you tell a dear friend who was going through exactly what you're experiencing?",
      "What's one small thing that brought you joy or comfort today?",
      "If your current emotion was a character, what would it look like and what would it say?",
      "What do you need most right now - and how can you give that to yourself?",
      "Write about a moment today when you felt most like yourself.",
      "What's something you've learned about yourself recently?",
      "Describe your ideal tomorrow - how would it feel?",
      "What strength have you shown today, even in a small way?"
    ];
    
    setJournalPrompt(prompts[Math.floor(Math.random() * prompts.length)]);
    setShowJournal(true);
  };

  const saveJournalEntry = (entry) => {
    const newEntry = {
      id: Date.now(),
      content: entry,
      prompt: journalPrompt,
      mood: userMood,
      timestamp: new Date(),
      date: new Date().toLocaleDateString()
    };
    
    setJournalEntries(prev => [newEntry, ...prev]);
    setShowJournal(false);
    
    const responseMessage = {
      type: 'ai',
      content: "Thank you for sharing your thoughts with me. 📝 Writing can be such a powerful way to process emotions and gain clarity. Your willingness to reflect shows real emotional courage.",
      mood: 'supportive',
      timestamp: new Date().toLocaleTimeString(),
      hasActions: true,
      actions: ['continue', 'insights'],
      persona: userProfile.preferredPersona,
      energy: 'supportive'
    };
    setMessages(prev => [...prev, responseMessage]);
  };

  const renderActionButtons = (actions) => {
    const actionMap = {
      breathing: {
        label: 'Breathing Exercise',
        icon: <Heart size={16} />,
        action: () => startBreathingExercise(),
        color: 'action-breathing'
      },
      meditation: {
        label: 'Quick Meditation',
        icon: <Brain size={16} />,
        action: () => startMeditation(300),
        color: 'action-meditation'
      },
      journal: {
        label: 'Journal Prompt',
        icon: <BookOpen size={16} />,
        action: openJournal,
        color: 'action-journal'
      },
      grounding: {
        label: '5-4-3-2-1 Grounding',
        icon: <TreePine size={16} />,
        action: () => startGroundingExercise(),
        color: 'action-grounding'
      },
      crisis: {
        label: 'Crisis Support',
        icon: <Phone size={16} />,
        action: () => setShowCrisisSupport(true),
        color: 'action-crisis'
      },
      goals: {
        label: 'Daily Goals',
        icon: <Target size={16} />,
        action: () => setShowGoals(true),
        color: 'action-goals'
      },
      music: {
        label: 'Calming Sounds',
        icon: <Headphones size={16} />,
        action: () => toggleCalmingSound('Rain'),
        color: 'action-music'
      },
      gratitude: {
        label: 'Gratitude Moment',
        icon: <Star size={16} />,
        action: () => startGratitudePractice(),
        color: 'action-gratitude'
      }
    };

    return (
      <div className="action-buttons">
        {actions.map(actionKey => {
          const action = actionMap[actionKey];
          if (!action) return null;
          
          return (
            <button
              key={actionKey}
              onClick={action.action}
              className={`action-button ${action.color}`}
            >
              {action.icon}
              {action.label}
            </button>
          );
        })}
      </div>
    );
  };

  const startGroundingExercise = () => {
    const groundingMessage = {
      type: 'ai',
      content: "Let's try the 5-4-3-2-1 grounding technique together. This helps bring you back to the present moment:\n\n🔍 **Look around and name 5 things you can see**\n👂 **Listen for 4 things you can hear**\n🤲 **Notice 3 things you can touch**\n👃 **Identify 2 things you can smell**\n👅 **Think of 1 thing you can taste**\n\nTake your time with each step. I'll wait here with you.",
      mood: 'grounding',
      timestamp: new Date().toLocaleTimeString(),
      hasActions: true,
      actions: ['continue', 'breathing'],
      persona: userProfile.preferredPersona,
      energy: 'grounding'
    };
    setMessages(prev => [...prev, groundingMessage]);
  };

  const startGratitudePractice = () => {
    const gratitudeMessage = {
      type: 'ai',
      content: "✨ Let's take a moment for gratitude - it's like sunshine for the soul. Think of three things you're grateful for right now:\n\n💙 **Something about yourself**\n🌟 **Something in your environment**\n💕 **Someone in your life**\n\nThey can be big or small - gratitude doesn't discriminate. What comes to mind?",
      mood: 'grateful',
      timestamp: new Date().toLocaleTimeString(),
      hasActions: true,
      actions: ['continue', 'journal'],
      persona: userProfile.preferredPersona,
      energy: 'grateful'
    };
    setMessages(prev => [...prev, gratitudeMessage]);
  };

  return (
    <div className="ai-companion-container">
      {/* Enhanced Header */}
      <div className="header-container">
        <div className="header-inner">
          <div className="header-content">
            <div className="header-left">
              <div className="avatar-container">
                <div className="avatar-circle">
                  <span className="avatar-text">{personas[userProfile.preferredPersona].icon}</span>
                </div>
                {isSpeaking && (
                  <div className="speaking-indicator" />
                )}
              </div>
              <div>
                <h1 className="header-title">
                  {personas[userProfile.preferredPersona].name}
                </h1>
                <p className="header-subtitle">Your mental wellness companion</p>
              </div>
            </div>
            
            <div className="header-right">
              <div className={`mood-badge ${getMoodBg(userMood)} ${getMoodColor(userMood)}`}>
                {getMoodEmoji(userMood)} {userMood}
              </div>
              <div className="streak-badge">
                <Zap size={16} />
                {currentStreak} day streak
              </div>
              <button className="control-button">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="main-container">
        <div className="main-grid">
          {/* Main Chat Area */}
          <div className="xl-col-span-2 order-1">
            <div className="chat-container">
              {/* Messages */}
              <div className="messages-container">
                <div className="messages-list">
                  {messages.map((msg, index) => (
                    <div key={index} className={`message-row ${msg.type === 'user' ? 'message-row-user' : 'message-row-ai'}`}>
                      <div className={`message-content ${msg.type === 'user' ? '' : 'message-ai'}`}>
                        {msg.type === 'ai' && (
                          <div className="ai-avatar">
                            <span className="ai-avatar-text">{personas[userProfile.preferredPersona].icon}</span>
                          </div>
                        )}
                        <div className={`message-bubble ${
                          msg.type === 'user' 
                            ? 'message-bubble-user' 
                            : 'message-bubble-ai'
                        }`}>
                          <p className="message-text">{msg.content}</p>
                          <p className="message-timestamp">{msg.timestamp}</p>
                          {msg.type === 'ai' && msg.hasActions && renderActionButtons(msg.actions)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div ref={messagesEndRef} />
              </div>

              {/* Enhanced Input Area */}
              <div className="input-container">
                <div className="input-controls">
                  <button
                    onClick={handleVoiceToggle}
                    className={`control-button ${
                      isRecording 
                        ? 'mic-button-recording' 
                        : 'mic-button'
                    }`}
                  >
                    {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
                  </button>
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="control-button camera-button"
                  >
                    <Camera size={22} />
                  </button>
                  
                  <div className="input-wrapper">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share what's on your mind..."
                      className="message-input"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <div className="input-emoji">
                      💭
                    </div>
                  <div className="agent-status-panel" style={{marginTop:8, padding:8, borderTop:'1px solid #eee'}}>
                    {latestMood && (
                      <div><strong>Mood:</strong> {Array.isArray(latestMood) ? latestMood[0].label + ' (' + (latestMood[0].score*100).toFixed(0) + '%)' : JSON.stringify(latestMood)}</div>
                    )}
                    {crisisAlert && crisisAlert.crisis && (
                      <div style={{color:'red', marginTop:6}}><strong>Crisis Alert:</strong> {crisisAlert.message}</div>
                    )}
                  </div>

                  </div>
                  
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className="control-button send-button"
                  >
                    <Send size={22} />
                  </button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                {isRecording && (
                  <div className="recording-indicator">
                    <div className="recording-badge">
                      <div className="recording-dot" />
                      Listening... Tap microphone to stop
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Left Sidebar */}
          <div className="sidebar order-2 xl-order-1">
            {/* Mood Chart */}
            <div className="sidebar-card">
              <h3 className="sidebar-header">
                <BarChart3 size={20} />
                Your Emotional Journey
              </h3>
              <div className="flex items-end gap-2 h-32 mb-4">
                {moodHistory.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center group relative">
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {day.notes || 'No notes'}
                    </div>
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        day.mood === 'positive' ? 'bg-green-400' :
                        day.mood === 'sad' ? 'bg-blue-400' :
                        day.mood === 'anxious' ? 'bg-yellow-400' :
                        day.mood === 'stressed' ? 'bg-orange-400' :
                        day.mood === 'angry' ? 'bg-red-400' :
                        day.mood === 'calm' ? 'bg-teal-400' :
                        'bg-gray-400'
                      } hover:opacity-75`}
                      style={{ height: `${Math.max(day.score * 100, 10)}%` }}
                    />
                    <span className="text-xs text-gray-600 mt-2">{day.date}</span>
                    <span className="text-lg">{getMoodEmoji(day.mood)}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current mood:</span>
                  <span className={`px-2 py-1 rounded ${getMoodBg(userMood)} ${getMoodColor(userMood)} font-medium`}>
                    {getMoodEmoji(userMood)} {userMood}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Intensity:</span>
                  <div className="flex items-center gap-1">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < moodIntensity ? 'bg-blue-500' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Persona Selector */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} className="text-indigo-600" />
                Your AI Companion
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {Object.entries(personas).map(([key, persona]) => (
                  <button
                    key={key}
                    onClick={() => setUserProfile(prev => ({...prev, preferredPersona: key}))}
                    className={`p-3 rounded-lg text-left transition-all ${
                      userProfile.preferredPersona === key 
                        ? 'bg-indigo-100 border-2 border-indigo-300' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="text-lg mb-1">{persona.icon}</div>
                    <div className="font-medium text-sm">{persona.name}</div>
                    <div className="text-xs text-gray-600">{persona.personality.split(',')[0]}</div>
                  </button>
                ))}
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Voice responses:</span>
                  <button
                    onClick={() => setUserProfile(prev => ({...prev, voiceEnabled: !prev.voiceEnabled}))}
                    className={`p-1 rounded ${userProfile.voiceEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {userProfile.voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sound effects:</span>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-1 rounded ${soundEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {soundEnabled ? <Bell size={16} /> : <VolumeX size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Calming Sounds */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Headphones size={20} className="text-teal-600" />
                Ambient Sounds
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {calmingSounds.map((sound, index) => (
                  <button
                    key={index}
                    onClick={() => toggleCalmingSound(sound.name)}
                    className={`p-3 rounded-lg transition-all ${
                      sound.active 
                        ? 'bg-teal-100 border-2 border-teal-300 text-teal-700' 
                        : 'bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="text-lg mb-1">{sound.icon}</div>
                    <div className="text-xs font-medium">{sound.name}</div>
                  </button>
                ))}
              </div>
              {calmingSounds.some(s => s.active) && (
                <div className="mt-3 p-2 bg-teal-50 rounded-lg text-center text-sm text-teal-700">
                  🎵 Playing calming sounds...
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6 order-3">
            {/* Stats Panel */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Activity size={20} className="text-green-600" />
                Your Progress
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Zap size={16} className="text-orange-600" />
                    </div>
                    <span className="text-gray-700">Current Streak</span>
                  </div>
                  <span className="font-bold text-orange-600">{currentStreak} days</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageCircle size={16} className="text-blue-600" />
                    </div>
                    <span className="text-gray-700">Total Sessions</span>
                  </div>
                  <span className="font-bold text-blue-600">{totalSessions}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Award size={16} className="text-purple-600" />
                    </div>
                    <span className="text-gray-700">Achievements</span>
                  </div>
                  <span className="font-bold text-purple-600">
                    {achievements.filter(a => a.unlocked).length}/{achievements.length}
                  </span>
                </div>
                
                <button
                  onClick={() => setShowInsights(true)}
                  className="w-full mt-4 p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  View Detailed Insights
                </button>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-yellow-600" />
                Quick Support
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => startBreathingExercise('4-4-4')}
                  className="w-full p-3 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all text-left flex items-center gap-3"
                >
                  <Heart size={18} />
                  <div>
                    <div className="font-medium">Box Breathing</div>
                    <div className="text-xs opacity-75">4-4-4 pattern</div>
                  </div>
                </button>
                
                <button
                  onClick={() => startMeditation(300)}
                  className="w-full p-3 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all text-left flex items-center gap-3"
                >
                  <Brain size={18} />
                  <div>
                    <div className="font-medium">5-Min Meditation</div>
                    <div className="text-xs opacity-75">Guided mindfulness</div>
                  </div>
                </button>
                
                <button
                  onClick={openJournal}
                  className="w-full p-3 bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-lg hover:from-green-100 hover:to-green-200 transition-all text-left flex items-center gap-3"
                >
                  <BookOpen size={18} />
                  <div>
                    <div className="font-medium">Reflective Journal</div>
                    <div className="text-xs opacity-75">Process your thoughts</div>
                  </div>
                </button>
                
                <button
                  onClick={() => setShowGoals(true)}
                  className="w-full p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-700 rounded-lg hover:from-yellow-100 hover:to-yellow-200 transition-all text-left flex items-center gap-3"
                >
                  <Target size={18} />
                  <div>
                    <div className="font-medium">Daily Goals</div>
                    <div className="text-xs opacity-75">Track your progress</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Award size={20} className="text-purple-600" />
                Achievements
              </h3>
              <div className="space-y-3">
                {achievements.slice(0, 3).map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      achievement.unlocked
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <div className={`font-medium text-sm ${
                          achievement.unlocked ? 'text-yellow-800' : 'text-gray-600'
                        }`}>
                          {achievement.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {achievement.description}
                        </div>
                      </div>
                      {achievement.unlocked && (
                        <CheckCircle size={16} className="text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
                <button className="w-full p-2 text-center text-sm text-gray-600 hover:text-gray-800 transition-colors">
                  View all achievements →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Breathing Exercise Modal */}
      {showBreathingExercise && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-10 max-w-md w-full mx-4 text-center">
            <h3 className="text-3xl font-bold text-gray-800 mb-2">Breathing Space</h3>
            <p className="text-gray-600 mb-8">Find your calm, one breath at a time</p>
            
            <div className="relative mb-8">
              <div className="w-40 h-40 mx-auto rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center transition-all duration-1000 relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full transition-all duration-1000 ${
                  breathingPhase === 'inhale' ? 'scale-100 opacity-80' : 
                  breathingPhase === 'hold' ? 'scale-100 opacity-80' : 
                  breathingPhase === 'exhale' ? 'scale-75 opacity-60' : 'scale-50 opacity-40'
                }`} />
                <div className="relative z-10">
                  <div className="text-4xl font-bold text-white mb-2">{breathingCount}</div>
                  <div className="text-lg text-white capitalize font-medium">{breathingPhase}</div>
                </div>
              </div>
              
              {breathingPhase !== 'prepare' && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4">
                  <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full shadow-md">
                    {breathingType} Pattern
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowBreathingExercise(false)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Pause
              </button>
              <button
                onClick={() => startBreathingExercise('4-7-8')}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Switch to 4-7-8
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Meditation Modal */}
      {showMeditation && (
        <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center z-50">
          <div className="text-center text-white max-w-lg mx-4">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center relative">
                <div className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping" />
                <Brain size={48} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-2">Mindful Meditation</h3>
              <p className="text-purple-200">Rest in this moment of peace</p>
            </div>
            
            <div className="mb-8">
              <div className="text-6xl font-bold text-white mb-2">
                {formatTime(meditationTimer)}
              </div>
              <div className="text-purple-200">
                {meditationTimer > 240 ? 'Settling in...' :
                 meditationTimer > 120 ? 'Finding your breath...' :
                 meditationTimer > 60 ? 'Deepening awareness...' : 'Gently returning...'}
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  clearInterval(meditationIntervalRef.current);
                  setShowMeditation(false);
                  setMeditationActive(false);
                }}
                className="px-8 py-3 bg-white bg-opacity-20 text-white rounded-xl hover:bg-opacity-30 transition-all font-medium"
              >
                End Session
              </button>
              <button
                onClick={() => setMeditationTimer(prev => prev + 300)}
                className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
              >
                +5 Minutes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Journal Modal */}
      {showJournal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <BookOpen size={20} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800">Reflective Journaling</h3>
            </div>
            
            <div className="mb-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
              <p className="text-green-800 font-medium mb-2">Today's Prompt:</p>
              <p className="text-green-700">{journalPrompt}</p>
            </div>
            
            <textarea
              id="journal-input"
              className="w-full h-48 p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-gray-50"
              placeholder="Let your thoughts flow freely... There's no right or wrong way to express yourself."
            />
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  const entry = (document.getElementById('journal-input') as HTMLTextAreaElement)?.value;
                  if (entry?.trim()) {
                    saveJournalEntry(entry);
                  }
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:opacity-90 transition-all font-medium"
              >
                Save & Reflect
              </button>
              <button
                onClick={() => setShowJournal(false)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                Maybe Later
              </button>
            </div>
            
            {journalEntries.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-3">Recent entries:</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {journalEntries.slice(0, 3).map((entry) => (
                    <div key={entry.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">{entry.date}</p>
                      <p className="text-sm text-gray-700 truncate">{entry.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Crisis Support Modal */}
      {showCrisisSupport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone size={32} className="text-red-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">You're Not Alone</h3>
              <p className="text-gray-600">Professional help is available 24/7</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                <div className="flex items-center gap-3 mb-2">
                  <Phone size={20} className="text-red-600" />
                  <h4 className="font-semibold text-red-800">Crisis Lifeline</h4>
                </div>
                <p className="text-red-700 text-xl font-bold mb-1">988</p>
                <p className="text-red-600 text-sm">24/7 suicide & crisis support</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <MessageCircle size={20} className="text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Crisis Text Line</h4>
                </div>
                <p className="text-blue-700 text-xl font-bold mb-1">Text HOME to 741741</p>
                <p className="text-blue-600 text-sm">Free crisis support via text</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <Shield size={20} className="text-green-600" />
                  <h4 className="font-semibold text-green-800">International Support</h4>
                </div>
                <p className="text-green-600 text-sm">Visit findahelpline.com for worldwide resources</p>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-purple-50 rounded-xl text-center">
              <p className="text-purple-800 font-medium mb-2">Remember:</p>
              <p className="text-purple-700 text-sm">
                Your life has immeasurable value. Crisis is temporary, but support is always available.
              </p>
            </div>
            
            <button
              onClick={() => setShowCrisisSupport(false)}
              className="w-full mt-6 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Goals Modal */}
      {showGoals && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
              <Target size={24} className="text-yellow-600" />
              Daily Wellness Goals
            </h3>
            
            <div className="space-y-3 mb-6">
              {dailyGoals.map((goal) => (
                <div
                  key={goal.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    goal.completed
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setDailyGoals(prev =>
                          prev.map(g =>
                            g.id === goal.id ? { ...g, completed: !g.completed } : g
                          )
                        );
                      }}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        goal.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {goal.completed && <CheckCircle size={16} />}
                    </button>
                    <span className={`flex-1 ${goal.completed ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                      {goal.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mb-6">
              <div className="text-sm text-gray-600">
                Progress: {dailyGoals.filter(g => g.completed).length}/{dailyGoals.length} completed
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(dailyGoals.filter(g => g.completed).length / dailyGoals.length) * 100}%` }}
                />
              </div>
            </div>
            
            <button
              onClick={() => setShowGoals(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl hover:opacity-90 transition-all font-medium"
            >
              Keep Going! 💪
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIWellnessCompanion;