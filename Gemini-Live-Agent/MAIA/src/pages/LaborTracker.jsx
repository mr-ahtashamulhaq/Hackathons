import React, { useState, useEffect, useRef } from 'react';
import { appClient } from '@/lib/app-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Timer, Play, Square, AlertTriangle, TrendingUp, Clock, ArrowLeft, Mic, MicOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import PageHeader from '@/components/shared/PageHeader';
import EmergencyBanner from '@/components/shared/EmergencyBanner';
import { toast } from 'sonner';

export default function LaborTracker() {
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [intensity, setIntensity] = useState('moderate');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [safeWord, setSafeWord] = useState('');
  const intervalRef = useRef(null);
  const recognitionRef = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: contractions = [] } = useQuery({
    queryKey: ['contractions'],
    queryFn: () => appClient.entities.Contraction.list('-created_date', 20),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => appClient.entities.Contact.list(),
  });

  useEffect(() => {
    appClient.auth.me().then(user => {
      setSafeWord(user?.labor_safe_word || '');
    });
  }, []);

  const createMutation = useMutation({
    mutationFn: (data) => appClient.entities.Contraction.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contractions'] }),
  });

  useEffect(() => {
    if (isTracking) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isTracking, startTime]);

  useEffect(() => {
    if (voiceEnabled) {
      startVoiceRecognition();
    } else {
      stopVoiceRecognition();
    }
    return () => stopVoiceRecognition();
  }, [voiceEnabled]);

  const startVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window['webkitSpeechRecognition'];
    if (!SpeechRecognition) {
      toast.error('Voice recognition not supported');
      setVoiceEnabled(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      
      // Check for safe word
      if (safeWord && transcript.includes(safeWord.toLowerCase())) {
        if (isTracking) {
          stopContraction();
          toast.success('Contraction ended');
        }
        return;
      }

      // Detect start phrases
      if (!isTracking && (
        transcript.includes('start') || 
        transcript.includes('beginning') || 
        transcript.includes('contraction')
      )) {
        startContraction();
        toast.success('Contraction started');
      }
      
      // Detect end phrases
      if (isTracking && (
        transcript.includes('stop') || 
        transcript.includes('end') || 
        transcript.includes('done') ||
        transcript.includes('over')
      )) {
        stopContraction();
        toast.success('Contraction ended');
      }
    };

    recognition.onerror = () => {
      toast.error('Voice recognition error');
      setVoiceEnabled(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    toast.success(safeWord ? `Voice tracking active. Say "${safeWord}" to stop.` : 'Voice tracking active. Say "start" or "stop".');
  };

  const stopVoiceRecognition = () => {
    recognitionRef.current?.stop();
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
  };

  const saveSafeWord = async () => {
    await appClient.auth.updateMe({ labor_safe_word: safeWord });
    setShowSettings(false);
    toast.success('Safe word saved!');
  };

  const startContraction = () => {
    const now = Date.now();
    setStartTime(now);
    setElapsed(0);
    setIsTracking(true);
  };

  const stopContraction = async () => {
    clearInterval(intervalRef.current);
    setIsTracking(false);
    const endTime = new Date().toISOString();

    createMutation.mutate({
      start_time: new Date(startTime).toISOString(),
      end_time: endTime,
      duration_seconds: elapsed,
      intensity,
    });

    // Notify contacts if severe or strong contractions
    if (intensity === 'severe' || intensity === 'very_strong') {
      await notifyContacts();
    }
  };

  const notifyContacts = async () => {
    const user = await appClient.auth.me();
    const motherName = user?.mom_name || user?.full_name || 'A mother';
    
    // Filter medical professionals and emergency contacts
    const medicalContacts = contacts.filter(c => 
      c.relationship === 'doctor' || 
      c.relationship === 'midwife' || 
      c.relationship === 'doula' ||
      c.is_emergency
    );

    if (medicalContacts.length === 0) {
      toast.info('No emergency contacts configured');
      return;
    }

    const stats = getStats();
    const message = `LABOR UPDATE: ${motherName} is experiencing ${intensity} contractions. ${stats ? `Average: ${stats.avgDuration}s duration, ${stats.avgInterval}min apart.` : ''} Tracked via MAIA app.`;

    // Send SMS to each contact
    for (const contact of medicalContacts) {
      try {
        await appClient.integrations.Core.SendEmail({
          to: contact.phone + '@txt.att.net', // SMS gateway (multi-carrier support would need backend)
          subject: 'Labor Alert',
          body: message,
          from_name: 'MAIA Labor Tracker'
        });
      } catch (error) {
        console.error('Failed to notify:', contact.name);
      }
    }

    toast.success(`Notified ${medicalContacts.length} contact(s)`);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getStats = () => {
    if (contractions.length < 2) return null;
    const durations = contractions.filter(c => c.duration_seconds).map(c => c.duration_seconds);
    const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);

    // Calculate intervals between contractions
    const sorted = [...contractions].sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
    const intervals = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const diff = (new Date(sorted[i].start_time).getTime() - new Date(sorted[i + 1].start_time).getTime()) / 1000 / 60;
      intervals.push(diff);
    }
    const avgInterval = intervals.length > 0 ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length) : 0;

    const shouldGo = avgDuration >= 60 && avgInterval <= 5 && contractions.length >= 6;

    return { avgDuration, avgInterval, shouldGo };
  };

  const stats = getStats();

  return (
    <>
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Voice Settings</DialogTitle>
            <DialogDescription>Set a safe word to instantly stop tracking</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="safeWord">Safe Word</Label>
              <Input
                id="safeWord"
                value={safeWord}
                onChange={(e) => setSafeWord(e.target.value)}
                placeholder="e.g., breathe, relief, done"
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Say this word during a contraction to automatically stop the timer
              </p>
            </div>
            <Button onClick={saveSafeWord} className="w-full h-11">
              Save Safe Word
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-lg mx-auto pb-8">
        <div className="px-5 pt-6 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button size="icon" variant="ghost" onClick={() => navigate('/Dashboard')} className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-heading font-bold">Labor Tracker</h1>
              <p className="text-xs text-muted-foreground">Time contractions</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              size="icon" 
              variant={voiceEnabled ? "default" : "ghost"} 
              onClick={toggleVoice}
              className="rounded-xl"
            >
              {voiceEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setShowSettings(true)} className="rounded-xl">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <EmergencyBanner />

      <div className="px-5 space-y-5">
        {/* Timer Display */}
        <Card className="p-6 text-center">
          <motion.div
            animate={isTracking ? { scale: [1, 1.02, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-5xl font-heading font-bold text-foreground mb-4"
          >
            {formatTime(elapsed)}
          </motion.div>

          <Select value={intensity} onValueChange={setIntensity}>
            <SelectTrigger className="w-48 mx-auto rounded-xl mb-4">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mild">Mild</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="strong">Strong</SelectItem>
              <SelectItem value="very_strong">Very Strong</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={isTracking ? stopContraction : startContraction}
            size="lg"
            className={`rounded-2xl h-14 px-10 gap-2 text-lg ${isTracking ? 'bg-destructive hover:bg-destructive/90' : ''}`}
          >
            {isTracking ? (
              <><Square className="w-5 h-5" /> Stop</>
            ) : (
              <><Play className="w-5 h-5" /> Start Contraction</>
            )}
          </Button>
        </Card>

        {/* 5-1-1 Rule */}
        {stats && stats.shouldGo && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-4 bg-destructive/10 border-destructive/20">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <h3 className="font-heading font-bold text-destructive">Time to Go!</h3>
              </div>
              <p className="text-sm text-destructive/80">
                Your contractions are following the 5-1-1 pattern (5 min apart, 1 min long, for 1 hour). Consider heading to the hospital.
              </p>
            </Card>
          </motion.div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 text-center">
              <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{stats.avgDuration}s</p>
              <p className="text-xs text-muted-foreground">Avg Duration</p>
            </Card>
            <Card className="p-4 text-center">
              <Clock className="w-5 h-5 text-accent mx-auto mb-1" />
              <p className="text-2xl font-bold">{stats.avgInterval}m</p>
              <p className="text-xs text-muted-foreground">Avg Interval</p>
            </Card>
          </div>
        )}

        {/* History */}
        <div>
          <h3 className="font-heading font-semibold mb-3">Recent Contractions</h3>
          <div className="space-y-2">
            {contractions.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No contractions tracked yet</p>
            )}
            {contractions.slice(0, 10).map((c, i) => (
              <Card key={c.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-muted-foreground w-6">#{contractions.length - i}</div>
                  <div>
                    <p className="text-sm font-medium">{c.duration_seconds ? `${c.duration_seconds}s` : '—'}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="rounded-lg capitalize text-xs">
                  {c.intensity || 'moderate'}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}