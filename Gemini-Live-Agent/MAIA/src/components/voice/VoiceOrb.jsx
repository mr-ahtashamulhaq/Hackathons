import React from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VoiceOrb({ isListening, isProcessing, onToggle }) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="relative">
        {/* Outer ripple rings */}
        {isListening && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/20"
              animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/15"
              animate={{ scale: [1, 2.2, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-primary/10"
              animate={{ scale: [1, 2.6, 1], opacity: [0.15, 0, 0.15] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            />
          </>
        )}

        {/* Processing animation */}
        {isProcessing && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}

        {/* Main orb button */}
        <motion.button
          onClick={onToggle}
          whileTap={{ scale: 0.92 }}
          className={cn(
            "relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
            isListening 
              ? "bg-primary shadow-primary/30" 
              : isProcessing
              ? "bg-primary/80 shadow-primary/20"
              : "bg-gradient-to-br from-primary to-primary/80 shadow-primary/20 hover:shadow-primary/40"
          )}
        >
          {isProcessing ? (
            <Loader2 className="w-10 h-10 text-white animate-spin" />
          ) : isListening ? (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <MicOff className="w-10 h-10 text-white" />
            </motion.div>
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
        </motion.button>
      </div>
    </div>
  );
}