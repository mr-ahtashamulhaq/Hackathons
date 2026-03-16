import React, { useState, useRef, useEffect } from 'react';
import { appClient } from '@/lib/app-client';
import { Mic, Send, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import EmergencyBanner from '@/components/shared/EmergencyBanner';
import VoiceOrb from '@/components/voice/VoiceOrb';
import ThemeToggle from '@/components/shared/ThemeToggle';

export default function VoiceAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi, I'm MAIA 💜 I'm here to support you through your pregnancy and postpartum journey. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const navigate = useNavigate();

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
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
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

  return (
    <div className="max-w-lg mx-auto flex flex-col h-screen">
      <div className="px-5 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" onClick={() => navigate('/Dashboard')} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-heading font-bold">MAIA</h1>
            <p className="text-xs text-muted-foreground">Voice Assistant</p>
          </div>
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
  );
}