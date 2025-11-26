
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MatchResult, MatchEvent } from '../types';
import { Panel, Button } from './RetroUI';

interface MatchEngineProps {
  matchData: MatchResult;
  onFinish: () => void;
}

// Helper to calculate dynamic position based on ball position and base formation
const usePlayerMovement = (
    baseX: number, 
    baseY: number, 
    ballX: number, 
    ballY: number, 
    role: 'GK' | 'DEF' | 'MID' | 'FWD', 
    side: 'home' | 'away'
) => {
    // Movement sensitivity factors
    let xFactor = 0.5; // How much they follow the ball X
    let yFactor = 0.2; // How much they follow the ball Y
    
    // Limits to keep players in logical zones
    let minX = 0, maxX = 100;

    if (side === 'home') {
        // Home team (Left to Right)
        if (role === 'GK') { xFactor = 0.05; yFactor = 0.1; minX=1; maxX=10; }
        if (role === 'DEF') { xFactor = 0.3; minX=10; maxX=60; }
        if (role === 'MID') { xFactor = 0.5; minX=30; maxX=80; }
        if (role === 'FWD') { xFactor = 0.7; minX=50; maxX=95; }
    } else {
        // Away team (Right to Left)
        if (role === 'GK') { xFactor = 0.05; yFactor = 0.1; minX=90; maxX=99; }
        if (role === 'DEF') { xFactor = 0.3; minX=40; maxX=90; }
        if (role === 'MID') { xFactor = 0.5; minX=20; maxX=70; }
        if (role === 'FWD') { xFactor = 0.7; minX=5; maxX=50; }
    }

    // Calculate target position
    // If side is home, ballX increases means attack.
    // If side is away, ballX decreases means attack.
    
    let targetX = baseX + (ballX - 50) * xFactor;
    let targetY = baseY + (ballY - 50) * yFactor;

    // Add some "breathing" noise to look like running
    const [noise, setNoise] = useState({x: 0, y: 0});

    useEffect(() => {
        const interval = setInterval(() => {
            setNoise({
                x: (Math.random() - 0.5) * 2, // +/- 1% jitter
                y: (Math.random() - 0.5) * 2
            });
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // Clamp values
    targetX = Math.max(minX, Math.min(maxX, targetX));
    targetY = Math.max(5, Math.min(95, targetY));

    return { x: targetX + noise.x, y: targetY + noise.y };
};

const PlayerDot: React.FC<{
    role: 'GK' | 'DEF' | 'MID' | 'FWD',
    side: 'home' | 'away',
    baseX: number,
    baseY: number,
    ballPos: {x: number, y: number},
    color: string
}> = ({ role, side, baseX, baseY, ballPos, color }) => {
    const { x, y } = usePlayerMovement(baseX, baseY, ballPos.x, ballPos.y, role, side);

    return (
        <div 
            className={`absolute w-3 h-3 rounded-full shadow-sm border border-black/20 transition-all duration-700 ease-in-out z-10 flex items-center justify-center text-[6px] font-bold text-white/80`}
            style={{ 
                left: `${x}%`, 
                top: `${y}%`,
                backgroundColor: color,
                transform: 'translate(-50%, -50%)'
            }}
        >
            {/* Optional: Add numbers or roles here */}
        </div>
    );
}

const PitchView: React.FC<{ 
    ballPos: {x: number, y: number}, 
    homeColor: string, 
    awayColor: string 
}> = ({ ballPos, homeColor, awayColor }) => {
    
    // Standard formations (Base positions)
    // Home: 4-4-2 (Left side)
    const homeFormation = [
        { role: 'GK', x: 5, y: 50 },
        { role: 'DEF', x: 20, y: 20 }, { role: 'DEF', x: 20, y: 40 }, { role: 'DEF', x: 20, y: 60 }, { role: 'DEF', x: 20, y: 80 },
        { role: 'MID', x: 45, y: 20 }, { role: 'MID', x: 45, y: 40 }, { role: 'MID', x: 45, y: 60 }, { role: 'MID', x: 45, y: 80 },
        { role: 'FWD', x: 70, y: 40 }, { role: 'FWD', x: 70, y: 60 },
    ];

    // Away: 4-4-2 (Right side)
    const awayFormation = [
        { role: 'GK', x: 95, y: 50 },
        { role: 'DEF', x: 80, y: 20 }, { role: 'DEF', x: 80, y: 40 }, { role: 'DEF', x: 80, y: 60 }, { role: 'DEF', x: 80, y: 80 },
        { role: 'MID', x: 55, y: 20 }, { role: 'MID', x: 55, y: 40 }, { role: 'MID', x: 55, y: 60 }, { role: 'MID', x: 55, y: 80 },
        { role: 'FWD', x: 30, y: 40 }, { role: 'FWD', x: 30, y: 60 },
    ];

    return (
        <div className="relative w-full aspect-[1.6] bg-[#1a472a] rounded-lg overflow-hidden shadow-inner border-2 border-white/10 pitch-pattern">
            {/* Field Lines */}
            <div className="absolute inset-0 border-2 border-white/20 m-2 rounded-sm"></div>
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/20"></div>
            <div className="absolute top-1/2 left-1/2 w-16 h-16 border border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            
            {/* Goals */}
            <div className="absolute left-0 top-1/2 w-1 h-12 bg-white/40 -translate-y-1/2 border-r border-white/40"></div>
            <div className="absolute right-0 top-1/2 w-1 h-12 bg-white/40 -translate-y-1/2 border-l border-white/40"></div>

            {/* Home Players */}
            {homeFormation.map((p, i) => (
                <PlayerDot 
                    key={`h-${i}`} 
                    role={p.role as any} 
                    side="home" 
                    baseX={p.x} 
                    baseY={p.y} 
                    ballPos={ballPos} 
                    color={homeColor} 
                />
            ))}

            {/* Away Players */}
            {awayFormation.map((p, i) => (
                <PlayerDot 
                    key={`a-${i}`} 
                    role={p.role as any} 
                    side="away" 
                    baseX={p.x} 
                    baseY={p.y} 
                    ballPos={ballPos} 
                    color={awayColor} 
                />
            ))}

            {/* Ball Animation */}
            <div 
                className="absolute w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_8px_white] transition-all duration-700 ease-out z-20"
                style={{ 
                    left: `${ballPos.x}%`, 
                    top: `${ballPos.y}%`,
                    transform: 'translate(-50%, -50%)' 
                }}
            ></div>
        </div>
    )
}

export const MatchEngine: React.FC<MatchEngineProps> = ({ matchData, onFinish }) => {
  const [currentEventIndex, setCurrentEventIndex] = useState(-1);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [logs, setLogs] = useState<MatchEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [viewMode, setViewMode] = useState<'VISUAL' | 'TEXT'>('VISUAL');
  const [ballPos, setBallPos] = useState({x: 50, y: 50});

  useEffect(() => {
    if (isPaused) return;

    if (currentEventIndex < matchData.events.length - 1) {
      const timeout = setTimeout(() => {
        const nextIndex = currentEventIndex + 1;
        const event = matchData.events[nextIndex];
        
        setLogs(prev => [...prev, event]);
        setCurrentEventIndex(nextIndex);

        // Update score
        if (event.type === 'GOAL') {
          if (event.side === 'home') setHomeScore(h => h + 1);
          else if (event.side === 'away') setAwayScore(a => a + 1);
          setIsPaused(true);
          setTimeout(() => setIsPaused(false), 2000);
        }

        // Update Ball Position
        if (event.coordinate) {
            setBallPos(event.coordinate);
        }

      }, 1200); // Speed of match
      return () => clearTimeout(timeout);
    }
  }, [currentEventIndex, matchData.events, isPaused]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  const finished = currentEventIndex >= matchData.events.length - 1;

  // Use team colors or defaults
  const homeColor = matchData.homeTeam.primaryColor || '#dc2626'; // Red default
  const awayColor = matchData.awayTeam.primaryColor || '#2563eb'; // Blue default

  // If colors are too similar (e.g. both red), force away to white/blue
  const finalAwayColor = homeColor === awayColor ? '#ffffff' : awayColor;

  return (
    <div className="flex flex-col h-full p-4 gap-4">
      {/* Scoreboard */}
      <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-6 shadow-2xl flex justify-between items-center border border-white/10">
        <div className="text-center w-1/3">
          <div className="text-2xl font-black text-white">{matchData.homeTeam.shortName}</div>
          <div className="text-5xl font-bold text-white drop-shadow-lg">{homeScore}</div>
        </div>
        
        <div className="flex flex-col items-center">
            <div className="text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-full mb-2">
                {currentEventIndex >= 0 ? matchData.events[currentEventIndex].minute : 0}'
            </div>
            <div className="text-xs text-slate-500 uppercase tracking-widest">Süper Lig</div>
        </div>

        <div className="text-center w-1/3">
          <div className="text-2xl font-black text-white">{matchData.awayTeam.shortName}</div>
          <div className="text-5xl font-bold text-white drop-shadow-lg">{awayScore}</div>
        </div>
      </div>

      {/* Visual / Text Toggle */}
      <div className="flex bg-slate-800/50 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('VISUAL')} 
            className={`flex-1 py-1 text-xs font-bold rounded ${viewMode === 'VISUAL' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}`}
          >
            2D SAHA
          </button>
          <button 
            onClick={() => setViewMode('TEXT')} 
            className={`flex-1 py-1 text-xs font-bold rounded ${viewMode === 'TEXT' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}`}
          >
            CANLI ANLATIM
          </button>
      </div>

      {/* Main Content */}
      <Panel className="flex-1 min-h-[300px]" title={viewMode === 'VISUAL' ? 'CANLI MAÇ MERKEZİ' : 'MAÇ ANLATIMI'}>
        {viewMode === 'VISUAL' ? (
            <div className="flex flex-col h-full">
                <div className="p-4">
                    <PitchView 
                        ballPos={ballPos} 
                        homeColor={homeColor} 
                        awayColor={finalAwayColor} 
                    />
                </div>
                <div className="px-4 pb-4 flex-1">
                     <div className="h-full overflow-y-auto no-scrollbar mask-gradient">
                        <div className="text-center text-slate-300 font-medium text-lg mt-2 px-6 py-4 bg-slate-800/50 rounded-xl border border-white/5 shadow-inner">
                            {logs.length > 0 ? logs[logs.length-1].description : "Maç başlıyor..."}
                        </div>
                     </div>
                </div>
            </div>
        ) : (
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 font-medium text-sm">
                {logs.map((log, idx) => (
                    <div key={idx} className={`p-3 rounded-xl flex gap-3 ${log.type === 'GOAL' ? 'bg-green-900/30 border border-green-500/30' : 'bg-slate-800/30'}`}>
                        <span className="text-slate-400 font-bold min-w-[24px]">{log.minute}'</span>
                        <span className="text-slate-200">{log.description}</span>
                    </div>
                ))}
            </div>
        )}
      </Panel>

      {/* Footer Controls */}
      {finished && (
          <Button onClick={onFinish} className="w-full py-4 text-lg animate-bounce">MAÇ BİTTİ - DEVAM ET</Button>
      )}
    </div>
  );
};
