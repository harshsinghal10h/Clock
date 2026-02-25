import React, { useState, useEffect, useRef } from 'react';
import { Settings, X, Moon, Sun, Monitor, Globe, Clock } from 'lucide-react';

const DIAL_COLORS = [
  { id: 'white', name: 'White', bg: '#f4f4f4', text: '#1a1a1a' },
  { id: 'turquoise', name: 'Turquoise', bg: '#9ad5d2', text: '#1a5c5a' },
  { id: 'glacier', name: 'Glacier', bg: '#e0f0f5', text: '#2c4c5b' },
  { id: 'ocean', name: 'Ocean', bg: '#1b4b5a', text: '#e0f0f5' },
  { id: 'tennis', name: 'Tennis', bg: '#d9e6a1', text: '#3a4a11' },
  { id: 'rose', name: 'Rose', bg: '#f5d0d6', text: '#5a2a36' },
  { id: 'skyblue', name: 'Sky Blue', bg: '#b0d0e6', text: '#1a3c5a' },
  { id: 'cream', name: 'Cream', bg: '#f5f0e6', text: '#5a4a3a' },
  { id: 'slate', name: 'Slate', bg: '#5a6a7a', text: '#e0e6ec' },
  { id: 'noir', name: 'Noir', bg: '#1a1a1a', text: '#e0e0e0' },
  { id: 'signalblue', name: 'Signal Blue', bg: '#2a5a8a', text: '#e0e6ec' },
  { id: 'salmon', name: 'Salmon', bg: '#f5a096', text: '#5a1a16' },
  { id: 'yellow', name: 'Yellow', bg: '#f5d000', text: '#5a4a00' },
  { id: 'beige', name: 'Beige', bg: '#e6d0b0', text: '#4a3a1a' },
  { id: 'pistachio', name: 'Pistachio', bg: '#b0d0b0', text: '#1a3a1a' }
];

const TIMEZONES = [
  { id: 'Local', name: 'Local Time' },
  { id: 'UTC', name: 'UTC' },
  { id: 'America/New_York', name: 'New York (EST/EDT)' },
  { id: 'America/Chicago', name: 'Chicago (CST/CDT)' },
  { id: 'America/Denver', name: 'Denver (MST/MDT)' },
  { id: 'America/Los_Angeles', name: 'Los Angeles (PST/PDT)' },
  { id: 'Europe/London', name: 'London (GMT/BST)' },
  { id: 'Europe/Paris', name: 'Paris (CET/CEST)' },
  { id: 'Asia/Tokyo', name: 'Tokyo (JST)' },
  { id: 'Asia/Dubai', name: 'Dubai (GST)' },
  { id: 'Australia/Sydney', name: 'Sydney (AEST/AEDT)' },
];

export default function App() {
  const [dialColor, setDialColor] = useState(DIAL_COLORS[1]); // Turquoise default
  const [movement, setMovement] = useState<'sweep' | 'tick'>('sweep');
  const [timeZone, setTimeZone] = useState('Local');
  const [theme, setTheme] = useState<'day' | 'night' | 'system'>('system');
  const [showSettings, setShowSettings] = useState(false);

  const hourHandRef = useRef<SVGGElement>(null);
  const minuteHandRef = useRef<SVGGElement>(null);
  const secondHandRef = useRef<SVGGElement>(null);

  // Handle Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Clock Animation
  useEffect(() => {
    let animationFrameId: number;
    
    const updateClock = () => {
      const now = new Date();
      let ms = now.getMilliseconds();
      let d = now;
      
      if (timeZone !== 'Local') {
        const tzString = now.toLocaleString('en-US', { timeZone });
        d = new Date(tzString);
      }

      const hours = d.getHours();
      const minutes = d.getMinutes();
      const seconds = d.getSeconds();

      const secCalc = movement === 'sweep' ? seconds + ms / 1000 : seconds;
      const minCalc = minutes + secCalc / 60;
      const hrCalc = (hours % 12) + minCalc / 60;

      if (secondHandRef.current) secondHandRef.current.setAttribute('transform', `rotate(${secCalc * 6})`);
      if (minuteHandRef.current) minuteHandRef.current.setAttribute('transform', `rotate(${minCalc * 6})`);
      if (hourHandRef.current) hourHandRef.current.setAttribute('transform', `rotate(${hrCalc * 30})`);

      animationFrameId = requestAnimationFrame(updateClock);
    };

    updateClock();
    return () => cancelAnimationFrame(animationFrameId);
  }, [timeZone, movement]);

  const renderMarkers = () => {
    const markers = [];
    for (let i = 0; i < 60; i++) {
      const angle = i * 6;
      const isHour = i % 5 === 0;
      
      if (isHour) {
        const hour = i === 0 ? 12 : i / 5;
        const rad = angle * Math.PI / 180;
        const radius = 58;
        const x = radius * Math.sin(rad);
        const y = -radius * Math.cos(rad);
        
        const minRadius = 95;
        const minX = minRadius * Math.sin(rad);
        const minY = -minRadius * Math.cos(rad);
        
        let rot = angle;
        if (angle > 90 && angle < 270) rot -= 180;

        markers.push(
          <g key={`hour-marker-${i}`}>
            <g transform={`rotate(${angle}) translate(0, -84)`}>
              <rect x="-1.5" y="-6" width="3" height="12" rx="1.5" fill="url(#silver-metal)" filter="url(#drop-shadow-small)" />
              <rect x="-0.5" y="-5" width="1" height="10" rx="0.5" fill="#ffffff" />
            </g>
            <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={dialColor.text} fontSize="14" fontWeight="500" letterSpacing="-0.5">{hour}</text>
            <text x={minX} y={minY} textAnchor="middle" dominantBaseline="central" fill={dialColor.text} fontSize="4.5" fontWeight="500" opacity="0.7" transform={`rotate(${rot}, ${minX}, ${minY})`}>
              {i === 0 ? '60' : (i < 10 ? '0' + i : i)}
            </text>
          </g>
        );
      } else {
        markers.push(
          <g key={`min-marker-${i}`} transform={`rotate(${angle}) translate(0, -88)`}>
            <rect x="-0.5" y="-3" width="1" height="6" fill={dialColor.text} opacity="0.7" />
          </g>
        );
      }
    }
    return markers;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 dark:bg-zinc-950 transition-colors duration-500 overflow-hidden relative font-sans">
      
      {/* Clock Container */}
      <div 
        className="w-[90vmin] h-[90vmin] max-w-[800px] max-h-[800px] rounded-full relative transition-colors duration-500"
        style={{ 
          backgroundColor: dialColor.bg,
          boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05), 10px 10px 30px rgba(0,0,0,0.1), -10px -10px 30px rgba(255,255,255,0.1)'
        }}
      >
        <svg viewBox="-100 -100 200 200" className="w-full h-full block">
          <defs>
            <filter id="drop-shadow" x="-20%" y="-20%" width="150%" height="150%">
              <feDropShadow dx="1.5" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.25"/>
            </filter>
            <filter id="drop-shadow-small" x="-20%" y="-20%" width="150%" height="150%">
              <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.5" floodColor="#000000" floodOpacity="0.2"/>
            </filter>
            <linearGradient id="silver-metal" x1="-100" y1="-100" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff"/>
              <stop offset="30%" stopColor="#e8e8e8"/>
              <stop offset="70%" stopColor="#cccccc"/>
              <stop offset="100%" stopColor="#999999"/>
            </linearGradient>
            <linearGradient id="groove-shadow" x1="-100" y1="-100" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#888888"/>
              <stop offset="30%" stopColor="#aaaaaa"/>
              <stop offset="70%" stopColor="#dddddd"/>
              <stop offset="100%" stopColor="#ffffff"/>
            </linearGradient>
          </defs>

          <g id="clock-face">
            {renderMarkers()}
          </g>

          <g id="hour-hand" ref={hourHandRef} filter="url(#drop-shadow)">
            <path d="
              M -3.5, 12
              L -3.5, -5
              C -3.5, -15 -4, -20 -4, -25
              L -4, -48
              C -4, -56 0, -60 0, -60
              C 0, -60 4, -56 4, -48
              L 4, -25
              C 4, -20 3.5, -15 3.5, -5
              L 3.5, 12
              A 3.5 3.5 0 0 1 -3.5 12
              Z
            " fill="url(#silver-metal)"/>
            <path d="
              M -1.5, -10
              L -1.5, -52
              A 1.5 1.5 0 0 1 1.5 -52
              L 1.5, -10
              A 1.5 1.5 0 0 1 -1.5 -10
              Z
            " fill="url(#groove-shadow)"/>
          </g>

          <g id="minute-hand" ref={minuteHandRef} filter="url(#drop-shadow)">
            <path d="
              M -2.5, 15
              L -2.5, -5
              C -2.5, -15 -3, -20 -3, -30
              L -3, -75
              C -3, -82 0, -85 0, -85
              C 0, -85 3, -82 3, -75
              L 3, -30
              C 3, -20 2.5, -15 2.5, -5
              L 2.5, 15
              A 2.5 2.5 0 0 1 -2.5 15
              Z
            " fill="url(#silver-metal)"/>
            <path d="
              M -1.2, -10
              L -1.2, -78
              A 1.2 1.2 0 0 1 1.2 -78
              L 1.2, -10
              A 1.2 1.2 0 0 1 -1.2 -10
              Z
            " fill="url(#groove-shadow)"/>
          </g>

          <g id="second-hand" ref={secondHandRef} filter="url(#drop-shadow)">
            <path d="
              M -0.75, 25
              L -0.5, -90
              A 0.5 0.5 0 0 1 0.5 -90
              L 0.75, 25
              A 0.75 0.75 0 0 1 -0.75 25
              Z
            " fill="url(#silver-metal)"/>
          </g>

          <g id="pivot" filter="url(#drop-shadow)">
            <circle cx="0" cy="0" r="5" fill="url(#silver-metal)"/>
            <circle cx="0" cy="0" r="3" fill="transparent" stroke="url(#groove-shadow)" strokeWidth="0.5"/>
            <circle cx="0" cy="0" r="1" fill="#888888"/>
          </g>
        </svg>
      </div>

      {/* Settings Toggle Button */}
      <button 
        onClick={() => setShowSettings(true)}
        className="absolute top-6 right-6 p-3 bg-white/50 dark:bg-zinc-800/50 hover:bg-white/80 dark:hover:bg-zinc-800/80 backdrop-blur-md rounded-full shadow-lg transition-all text-gray-800 dark:text-gray-200 z-10"
      >
        <Settings size={24} />
      </button>

      {/* Settings Panel Backdrop */}
      {showSettings && (
        <div 
          className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-20 transition-opacity"
          onClick={() => setShowSettings(false)}
        />
      )}

      {/* Settings Panel */}
      <div className={`absolute inset-y-0 right-0 w-full sm:w-96 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out z-30 ${showSettings ? 'translate-x-0' : 'translate-x-full'} border-l border-white/20 dark:border-white/5 flex flex-col`}>
        
        <div className="p-6 flex items-center justify-between border-b border-gray-200 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
          <button 
            onClick={() => setShowSettings(false)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500 dark:text-gray-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          
          {/* Theme Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Theme</label>
            <div className="flex bg-gray-100 dark:bg-zinc-950 p-1 rounded-xl">
              {(['day', 'night', 'system'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all ${theme === t ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                  {t === 'day' && <Sun size={16} />}
                  {t === 'night' && <Moon size={16} />}
                  {t === 'system' && <Monitor size={16} />}
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Clock Dial Colors */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clock Dial</label>
            <div className="grid grid-cols-5 gap-y-4 gap-x-2">
              {DIAL_COLORS.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setDialColor(color)}
                  className={`group flex flex-col items-center gap-1.5`}
                >
                  <div 
                    className={`w-12 h-12 rounded-full shadow-inner border-2 transition-all ${dialColor.id === color.id ? 'border-gray-400 dark:border-gray-500 scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ backgroundColor: color.bg }}
                  >
                    <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold" style={{ color: color.text }}>IC</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium text-center leading-tight">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Movement */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Clock size={16} /> Movement
            </label>
            <div className="flex bg-gray-100 dark:bg-zinc-950 p-1 rounded-xl">
              <button
                onClick={() => setMovement('sweep')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${movement === 'sweep' ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                Mechanical Sweep
              </button>
              <button
                onClick={() => setMovement('tick')}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${movement === 'tick' ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
              >
                Ticking
              </button>
            </div>
          </div>

          {/* Time Zone */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Globe size={16} /> Time Zone
            </label>
            <div className="relative">
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full bg-gray-100 dark:bg-zinc-950 border-none text-gray-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-gray-400 p-3 outline-none cursor-pointer appearance-none"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.id} value={tz.id}>{tz.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
