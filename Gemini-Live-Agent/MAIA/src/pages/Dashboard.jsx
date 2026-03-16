import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { appClient } from '@/lib/app-client';
import { Mic, Send, Volume2, VolumeX, Menu, Camera, Wind, Timer, Phone, Heart, Shield, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import VoiceOrb from '@/components/voice/VoiceOrb';
import EmergencyBanner from '@/components/shared/EmergencyBanner';
import ThemeToggle from '@/components/shared/ThemeToggle';
import WelcomeModal from '@/components/onboarding/WelcomeModal';

const quickActions = [
  { path: '/CameraInput', icon: Camera, label: 'Camera Scan' },
  { path: '/Breathing', icon: Wind, label: 'Breathing' },
  { path: '/LaborTracker', icon: Timer, label: 'Labor Tracker' },
  { path: '/Contacts', icon: Phone, label: 'Contacts' },
  { path: '/SymptomChecker', icon: Heart, label: 'Symptoms' },
  { path: '/Advocacy', icon: Shield, label: 'Advocacy' },
  { path: '/Settings', icon: SettingsIcon, label: 'Settings' },
];

export default function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userName, setUserName] = useState('');
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const navigate = useNavigate();

  useEffect(() => {
    appClient.auth.me().then(user => {
      const onboarded = user?.onboarding_completed;
      const name = user?.mom_name || user?.full_name?.split(' ')[0] || '';
      const baby = user?.baby_name || 'Baby';
      
      setUserName(name);
      setIsCheckingOnboarding(false);
      
      if (!onboarded) {
        setShowOnboarding(true);
      } else {
        setMessages([
          { role: 'assistant', content: `Hi ${name}! 💜 I'm MAIA, here to support you and ${baby}. How can I help you today?` }
        ]);
      }
    });
  }, []);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    const user = await appClient.auth.me();
    const name = user?.mom_name || user?.full_name?.split(' ')[0] || '';
    const baby = user?.baby_name || 'Baby';
    setUserName(name);
    setMessages([
      { role: 'assistant', content: `Welcome ${name}! 💜 I'm so glad you're here. I'm MAIA, your maternal health companion for you and ${baby}. How can I support you today?` }
    ]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startListening = () => {
    console.log('[MAIA Voice] Mic button clicked — starting recognition');
    const SpeechRecognition = window.SpeechRecognition || window['webkitSpeechRecognition'];
    if (!SpeechRecognition) {
      console.warn('[MAIA Voice] SpeechRecognition not supported in this browser');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Voice recognition isn't available in your browser. Please type your message instead."
      }]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('[MAIA Voice] Recognition started — listening for speech');
    };

    // Guard: ensure sendMessage is called exactly once per mic session.
    let hasSent = false;

    recognition.onresult = (event) => {
      // Accumulate only FINAL results — ignore interim partial words.
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (!finalTranscript.trim() || hasSent) return;

      hasSent = true;
      console.log('[MAIA Voice] Final transcript captured:', finalTranscript.trim());
      recognition.stop(); // close session — no further results needed
      setIsListening(false);
      sendMessage(finalTranscript.trim());
    };

    recognition.onerror = (event) => {
      console.error('[MAIA Voice] Recognition error:', event.error);
      setIsListening(false);

      const errorMessages = {
        'not-allowed':   "Microphone access was denied. Please allow microphone permission in your browser settings.",
        'no-speech':     "No speech was detected. Please try again.",
        'audio-capture': "No microphone was found. Please check your device.",
        'network':       "A network error occurred during recognition. Please try again.",
      };
      const msg = errorMessages[event.error] || `Voice recognition error: ${event.error}. Please try again.`;
      setMessages(prev => [...prev, { role: 'assistant', content: msg }]);
    };

    recognition.onend = () => {
      console.log('[MAIA Voice] Recognition ended');
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start(); // browser will prompt for mic permission if not yet granted
    setIsListening(true);
    console.log('[MAIA Voice] recognition.start() called');
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const speakText = (text) => {
    if (!speakerEnabled) return; // respect the toggle — don't speak when off
    const cleanText = text.replace(/[💜🤰❤️‍🩹🩺]/g, '').replace(/\*\*/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  const toggleSpeaker = () => {
    const next = !speakerEnabled;
    setSpeakerEnabled(next);
    if (!next) stopSpeaking(); // stop any active playback when disabling
  };

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    // Check for feature requests
    const lowerText = text.toLowerCase();
    let detectedFeature = null;
    
    if (lowerText.includes('camera') || lowerText.includes('photo') || lowerText.includes('picture') || lowerText.includes('scan')) {
      detectedFeature = { path: '/CameraInput', name: 'Camera Scan' };
    } else if (lowerText.includes('breath') || lowerText.includes('relax') || lowerText.includes('calm')) {
      detectedFeature = { path: '/Breathing', name: 'Breathing Exercise' };
    } else if (lowerText.includes('contraction') || lowerText.includes('labor') || lowerText.includes('timing')) {
      detectedFeature = { path: '/LaborTracker', name: 'Labor Tracker' };
    } else if (lowerText.includes('contact') || lowerText.includes('emergency contact') || lowerText.includes('support network')) {
      detectedFeature = { path: '/Contacts', name: 'Emergency Contacts' };
    } else if (lowerText.includes('symptom') || lowerText.includes('check') || lowerText.includes('assess')) {
      detectedFeature = { path: '/SymptomChecker', name: 'Symptom Checker' };
    } else if (lowerText.includes('advocacy') || lowerText.includes('rights') || lowerText.includes('advocate')) {
      detectedFeature = { path: '/Advocacy', name: 'Advocacy Resources' };
    }

    if (detectedFeature) {
      const confirmMessage = { 
        role: 'assistant', 
        content: `I can help you with that! Opening ${detectedFeature.name} now...` 
      };
      setMessages(prev => [...prev, confirmMessage]);
      setIsProcessing(false);
      speakText(confirmMessage.content);
      setTimeout(() => navigate(detectedFeature.path), 1500);
      return;
    }

    const response = await appClient.integrations.Core.InvokeLLM({
      prompt: `You are MAIA (Maternal AI Assistant). Support pregnant/postpartum mothers with evidence-based guidance, especially addressing healthcare disparities for Black mothers.

Rules: Be warm and brief. For dangerous symptoms (severe headache, vision changes, heavy bleeding, fever >100.4°F), urge immediate care. Use: monitor → call provider → urgent care → emergency.

${messages.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n')}
User: ${text}
Respond concisely:`,
    });

    const assistantMessage = { role: 'assistant', content: response };
    setMessages(prev => [...prev, assistantMessage]);
    setIsProcessing(false);
    speakText(response);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (isCheckingOnboarding) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground font-body">Loading MAIA...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <WelcomeModal open={showOnboarding} onComplete={handleOnboardingComplete} />
      <div className="flex flex-col h-screen max-w-lg mx-auto">
      {/* Header */}
      <div className="px-5 pt-6 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">MAIA</h1>
          <p className="text-sm text-muted-foreground">{userName ? `Hi, ${userName}` : 'Your AI companion'}</p>
        </div>
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={toggleSpeaker} className="rounded-xl">
            {speakerEnabled
              ? isSpeaking
                ? <Volume2 className="w-5 h-5 text-primary" />
                : <Volume2 className="w-5 h-5" />
              : <VolumeX className="w-5 h-5 text-muted-foreground" />
            }
          </Button>
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="rounded-xl">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <h3 className="font-heading font-bold mb-4">Menu</h3>
              <div className="space-y-2">
                {quickActions.map(action => (
                  <Button
                    key={action.path}
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => navigate(action.path)}
                  >
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <EmergencyBanner />

      {/* Messages */}
      <ScrollArea className="flex-1 px-5" ref={scrollRef}>
        <div className="space-y-4 pb-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isProcessing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex gap-1.5">
                <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Voice Orb */}
      <VoiceOrb isListening={isListening} isProcessing={isProcessing} onToggle={toggleListening} />

      {/* Text Input */}
      <form onSubmit={handleSubmit} className="px-5 pb-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="rounded-xl bg-muted border-0 h-11"
          />
          <Button type="submit" size="icon" className="rounded-xl h-11 w-11 flex-shrink-0" disabled={!input.trim() || isProcessing}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
    </>
  );
}