import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const techniques = {
  calm: { name: '4-7-8 Calming', inhale: 4, hold: 7, exhale: 8, desc: 'Deep relaxation for anxiety' },
  labor: { name: 'Labor Breathing', inhale: 4, hold: 0, exhale: 6, desc: 'Slow breathing for contractions' },
  quick: { name: 'Box Breathing', inhale: 4, hold: 4, exhale: 4, desc: 'Quick stress relief' },
};

export default function BreathingCircle({ technique = 'calm' }) {
  const [phase, setPhase] = useState('idle'); // idle, inhale, hold, exhale
  const [isActive, setIsActive] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  const config = techniques[technique];

  const startBreathing = () => {
    setIsActive(true);
    setCycles(0);
    runCycle();
  };

  const stopBreathing = () => {
    setIsActive(false);
    setPhase('idle');
    setCountdown(0);
    clearTimeout(timerRef.current);
    clearInterval(countdownRef.current);
  };

  const runCountdown = (seconds, onComplete) => {
    setCountdown(seconds);
    let remaining = seconds;
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(countdownRef.current);
        onComplete();
      }
    }, 1000);
  };

  const runCycle = () => {
    // Inhale
    setPhase('inhale');
    runCountdown(config.inhale, () => {
      // Hold (if exists)
      if (config.hold > 0) {
        setPhase('hold');
        runCountdown(config.hold, () => {
          // Exhale
          setPhase('exhale');
          runCountdown(config.exhale, () => {
            setCycles(c => c + 1);
            // Next cycle
            timerRef.current = setTimeout(() => runCycle(), 500);
          });
        });
      } else {
        // Exhale
        setPhase('exhale');
        runCountdown(config.exhale, () => {
          setCycles(c => c + 1);
          timerRef.current = setTimeout(() => runCycle(), 500);
        });
      }
    });
  };

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearInterval(countdownRef.current);
    };
  }, []);

  useEffect(() => {
    stopBreathing();
  }, [technique]);

  const getPhaseLabel = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      default: return 'Tap to Start';
    }
  };

  const getScale = () => {
    switch (phase) {
      case 'inhale': return 1;
      case 'hold': return 1;
      case 'exhale': return 0.6;
      default: return 0.75;
    }
  };

  const getDuration = () => {
    switch (phase) {
      case 'inhale': return config.inhale;
      case 'hold': return 0.3;
      case 'exhale': return config.exhale;
      default: return 1;
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-2">
        <h3 className="font-heading font-bold text-lg">{config.name}</h3>
        <p className="text-sm text-muted-foreground">{config.desc}</p>
      </div>

      {/* Breathing Circle */}
      <div className="relative flex items-center justify-center my-8" style={{ width: 280, height: 280 }}>
        {/* Outer ring pulses */}
        {isActive && (
          <>
            <motion.div
              className="absolute rounded-full border-2 border-primary/20"
              style={{ width: 280, height: 280 }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: getDuration() + 1, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute rounded-full border border-accent/15"
              style={{ width: 260, height: 260 }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.05, 0.2] }}
              transition={{ duration: getDuration() + 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            />
          </>
        )}

        {/* Main breathing circle */}
        <motion.div
          className="rounded-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center cursor-pointer"
          style={{ width: 220, height: 220 }}
          animate={{ scale: getScale() }}
          transition={{ duration: getDuration(), ease: 'easeInOut' }}
          onClick={isActive ? stopBreathing : startBreathing}
        >
          <motion.div
            className="rounded-full bg-gradient-to-br from-primary/50 to-accent/30 flex items-center justify-center"
            style={{ width: 160, height: 160 }}
            animate={{ scale: getScale() }}
            transition={{ duration: getDuration(), ease: 'easeInOut', delay: 0.1 }}
          >
            <motion.div
              className="rounded-full bg-gradient-to-br from-primary to-accent/70 flex flex-col items-center justify-center text-white"
              style={{ width: 100, height: 100 }}
              animate={{ scale: getScale() > 0.8 ? 1 : 0.9 }}
              transition={{ duration: getDuration(), ease: 'easeInOut' }}
            >
              {isActive ? (
                <>
                  <span className="text-2xl font-bold">{countdown}</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-80 mt-0.5">
                    {phase === 'inhale' ? 'In' : phase === 'hold' ? 'Hold' : 'Out'}
                  </span>
                </>
              ) : (
                <span className="text-xs font-medium">Start</span>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Phase Label */}
      <motion.p 
        key={phase}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-heading font-semibold text-foreground mb-2"
      >
        {getPhaseLabel()}
      </motion.p>

      {isActive && (
        <p className="text-sm text-muted-foreground">
          Cycles completed: <span className="font-semibold text-primary">{cycles}</span>
        </p>
      )}
    </div>
  );
}