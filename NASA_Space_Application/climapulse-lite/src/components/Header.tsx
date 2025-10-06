'use client';

import React from 'react';

interface HeaderProps {
  currentTemp?: number;
  condition?: string;
}

export default function Header({ currentTemp, condition }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-2">
              🌍 ClimaPulse Lite
            </h1>
            <p className="text-blue-100 mt-2 text-lg">
              Lahore Climate Trends Dashboard
            </p>
          </div>
          
          {currentTemp && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 min-w-[200px]">
              <div className="text-sm text-blue-100 mb-1">Current Weather</div>
              <div className="text-2xl font-bold">
                {Math.round(currentTemp)}°C
              </div>
              <div className="text-sm text-blue-100">
                {condition || 'Loading...'}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-sm text-blue-100">
          🚀 Built for NASA Space Apps Challenge 2025 • Real-time climate data with AI insights
        </div>
      </div>
    </header>
  );
}