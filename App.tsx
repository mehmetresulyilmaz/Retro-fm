
import React, { useState, useEffect } from 'react';
import { GameState, Team, Position, Player } from './types';
import { generateTeamSquad, simulateMatchCommentary, generateTransferMarket } from './services/geminiService';
import { SquadList } from './components/SquadList';
import { MatchEngine } from './components/MatchEngine';
import { Button, Panel, LoadingScreen, BottomNav } from './components/RetroUI';

const TEAM_PRESETS = ["Galatasaray", "Fenerbahçe", "Beşiktaş", "Trabzonspor", "Samsunspor", "Göztepe"];

// Pool of potential opponents
const OPPONENT_POOL = [
  { name: "Beşiktaş", short: "BJK", p: "#000000", s: "#ffffff" },
  { name: "Trabzonspor", short: "TS", p: "#800000", s: "#3bbce3" },
  { name: "Başakşehir", short: "IBFK", p: "#e36e26", s: "#1a2c5a" },
  { name: "Samsunspor", short: "SAM", p: "#cc0000", s: "#ffffff" },
  { name: "Kasımpaşa", short: "KAS", p: "#1a2c5a", s: "#ffffff" },
  { name: "Sivasspor", short: "SVS", p: "#cc0000", s: "#ffffff" },
  { name: "Göztepe", short: "GÖZ", p: "#ffd700", s: "#cc0000" },
  { name: "Antalyaspor", short: "ANT", p: "#cc0000", s: "#ffffff" },
];

const getRandomOpponent = (excludeName: string): Team => {
  const validOpponents = OPPONENT_POOL.filter(t => !excludeName.includes(t.name));
  const pick = validOpponents[Math.floor(Math.random() * validOpponents.length)];
  return {
    id: `opp-${Math.random()}`,
    name: pick.name,
    shortName: pick.short,
    primaryColor: pick.p,
    secondaryColor: pick.s,
    players: [], 
    tactic: '4-4-2',
    budget: 0
  };
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    playerTeam: null,
    currentDate: new Date('2024-08-11'),
    view: 'MENU',
    loading: false,
    loadingMessage: '',
    transferMarket: []
  });

  const [inputTeamName, setInputTeamName] = useState("");

  useEffect(() => {
    if (gameState.view === 'TRANSFER' && gameState.transferMarket.length === 0) {
        refreshMarket();
    }
  }, [gameState.view]);

  const refreshMarket = async () => {
    setGameState(prev => ({...prev, loading: true, loadingMessage: 'Pazar Taranıyor...'}));
    try {
        const marketPlayers = await generateTransferMarket();
        setGameState(prev => ({...prev, transferMarket: marketPlayers, loading: false}));
    } catch (e) {
        setGameState(prev => ({...prev, loading: false}));
    }
  };

  const startGame = async (teamName: string) => {
    setGameState(prev => ({ ...prev, loading: true, loadingMessage: 'Veritabanı Kuruluyor...' }));
    
    // Simulate slight delay for "App feel" even if instant
    setTimeout(async () => {
        try {
            const teamData = await generateTeamSquad(teamName);
            const firstOpponent = getRandomOpponent(teamData.name);
            setGameState(prev => ({
                ...prev,
                playerTeam: teamData,
                view: 'DASHBOARD',
                loading: false,
                nextOpponent: firstOpponent,
                transferMarket: [] 
            }));
        } catch (error) {
            alert("Hata oluştu.");
            setGameState(prev => ({ ...prev, loading: false }));
        }
    }, 800);
  };

  const advanceGame = async () => {
    if (!gameState.playerTeam || !gameState.nextOpponent) return;
    const recoveredPlayers = gameState.playerTeam.players.map(player => ({
        ...player,
        condition: Math.min(100, player.condition + 15)
    }));
    const recoveredTeam = { ...gameState.playerTeam, players: recoveredPlayers };
    
    setGameState(prev => ({ ...prev, playerTeam: recoveredTeam, loading: true, loadingMessage: 'Maç Simülasyonu...' }));

    try {
      const result = await simulateMatchCommentary(recoveredTeam, gameState.nextOpponent);
      setGameState(prev => ({
        ...prev,
        view: 'MATCH_LIVE',
        loading: false,
        matchContext: result
      }));
    } catch (e) {
      setGameState(prev => ({ ...prev, loading: false }));
    }
  };

  const finishMatch = () => {
     if (!gameState.playerTeam) return;
     const fatiguedPlayers = gameState.playerTeam.players.map((player, index) => ({
        ...player,
        condition: Math.max(0, player.condition - (index < 11 ? 10 : 0))
     }));
     const matchIncome = 750000;
     setGameState(prev => ({
        ...prev,
        playerTeam: { ...prev.playerTeam!, players: fatiguedPlayers, budget: prev.playerTeam!.budget + matchIncome },
        view: 'DASHBOARD',
        currentDate: new Date(prev.currentDate.getTime() + 7 * 24 * 60 * 60 * 1000), 
        matchContext: undefined,
        nextOpponent: getRandomOpponent(gameState.playerTeam.name),
        transferMarket: []
     }));
  };

  const handleTacticChange = (newTactic: string) => {
    if (!gameState.playerTeam) return;
    setGameState(prev => ({
        ...prev,
        playerTeam: { ...prev.playerTeam!, tactic: newTactic }
    }));
  };

  const buyPlayer = (player: Player) => {
      if (!gameState.playerTeam) return;
      if (gameState.playerTeam.budget < player.value) {
          alert("Bütçe yetersiz!");
          return;
      }
      const newTeamPlayers = [...gameState.playerTeam.players, player];
      const newMarket = gameState.transferMarket.filter(p => p.id !== player.id);
      setGameState(prev => ({
          ...prev,
          playerTeam: { ...prev.playerTeam!, players: newTeamPlayers, budget: prev.playerTeam!.budget - player.value },
          transferMarket: newMarket
      }));
  };

  const sellPlayer = (player: Player) => {
      if (!gameState.playerTeam) return;
      if (gameState.playerTeam.players.length <= 11) return alert("Kadro çok dar!");
      const sellValue = Math.floor(player.value * 0.85);
      const newTeamPlayers = gameState.playerTeam.players.filter(p => p.id !== player.id);
      setGameState(prev => ({
        ...prev,
        playerTeam: { ...prev.playerTeam!, players: newTeamPlayers, budget: prev.playerTeam!.budget + sellValue }
      }));
  };

  if (gameState.loading) return <LoadingScreen message={gameState.loadingMessage} />;

  // --- MENU ---
  if (gameState.view === 'MENU') {
    return (
      <div className="h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 relative overflow-hidden animate-gradient-move">
        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vh] h-[50vh] bg-blue-600/20 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vh] h-[50vh] bg-purple-600/20 rounded-full blur-[80px]"></div>

        <div className="z-10 w-full max-w-sm space-y-8">
             <div className="text-center">
                <h1 className="text-6xl font-black text-white tracking-tighter drop-shadow-2xl italic">PRO<br/><span className="text-blue-500">MENAJER</span></h1>
                <p className="text-slate-400 text-xs tracking-[0.6em] uppercase mt-4">Mobile Simulation 2025</p>
             </div>
             
             <div className="glass-panel p-6 shadow-2xl space-y-4">
                <div className="text-[10px] text-blue-200 font-bold uppercase mb-2">Hızlı Başlangıç</div>
                <div className="grid grid-cols-2 gap-3">
                  {TEAM_PRESETS.slice(0, 4).map(team => (
                    <Button key={team} onClick={() => startGame(team)} variant="secondary" className="text-xs h-12 font-bold">
                      {team.toUpperCase()}
                    </Button>
                  ))}
                </div>
                
                <div className="relative pt-4">
                    <div className="text-[10px] text-blue-200 font-bold uppercase mb-2">Veya Takım Ara</div>
                   <input 
                      type="text" 
                      value={inputTeamName}
                      onChange={(e) => setInputTeamName(e.target.value)}
                      placeholder="Örn: Ankaragücü..."
                      className="w-full bg-slate-800/50 border border-white/10 text-white px-4 py-4 text-sm rounded-xl focus:border-blue-500 outline-none transition-colors placeholder:text-slate-600"
                    />
                </div>
                <Button onClick={() => inputTeamName && startGame(inputTeamName)} disabled={!inputTeamName} variant="primary" className="w-full h-14 text-lg font-bold shadow-blue-500/25">
                   KARİYERE BAŞLA
                </Button>
             </div>
        </div>
      </div>
    );
  }

  // --- MATCH ---
  if (gameState.view === 'MATCH_LIVE' && gameState.matchContext) {
    return (
      <div className="h-screen bg-[#0f172a] flex flex-col font-sans">
        <MatchEngine matchData={gameState.matchContext} onFinish={finishMatch} />
      </div>
    );
  }

  // --- DASHBOARD ---
  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-white font-sans overflow-hidden">
      
      {/* Header */}
      <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-white/5 flex justify-between items-center px-4 shrink-0 z-40">
           <div className="flex flex-col">
              <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase">{gameState.currentDate.toLocaleDateString('tr-TR')}</span>
              <span className="font-bold text-white text-xl tracking-tight">{gameState.playerTeam?.name}</span>
           </div>
           
           <div className="flex items-center gap-3">
             <div className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-xs font-bold text-green-400">
                €{(gameState.playerTeam?.budget || 0) / 1000000}M
             </div>
             <Button onClick={advanceGame} variant="primary" className="h-9 text-xs px-4 shadow-lg shadow-blue-500/20">
               İLERLE
             </Button>
           </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#0f172a] to-[#1e293b] relative no-scrollbar pb-6">
         
         {gameState.view === 'DASHBOARD' && (
           <div className="p-5 space-y-6">
              {/* Next Match Banner */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl h-48 flex items-center justify-center border border-white/10 group">
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900"></div>
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000')] bg-cover bg-center mix-blend-overlay opacity-30 group-hover:scale-105 transition-transform duration-700"></div>
                 
                 <div className="relative z-10 w-full px-8 flex justify-between items-center">
                    <div className="text-center">
                        <div className="text-4xl font-black">{gameState.playerTeam?.shortName}</div>
                        <div className="text-xs uppercase tracking-widest text-slate-400 mt-1">Ev Sahibi</div>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xs bg-white/10 px-2 py-1 rounded backdrop-blur text-white/80 font-bold mb-2">HAFTA 5</span>
                        <div className="text-3xl font-black text-blue-400">VS</div>
                    </div>
                    <div className="text-center">
                        <div className="text-4xl font-black">{gameState.nextOpponent?.shortName}</div>
                        <div className="text-xs uppercase tracking-widest text-slate-400 mt-1">Deplasman</div>
                    </div>
                 </div>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-2 gap-4">
                 <Panel title="TAKIM DEĞERİ" className="h-32 justify-center">
                    <div className="p-4 text-center">
                        <div className="text-3xl font-bold text-white tracking-tight">
                           €{Math.floor(gameState.playerTeam?.players.reduce((sum, p) => sum + p.value, 0) || 0 / 1000000).toLocaleString()}M
                        </div>
                        <div className="text-xs text-green-400 mt-1">▲ %5 Artış</div>
                    </div>
                 </Panel>
                 <Panel title="FORMASYON" className="h-32 justify-center">
                    <div className="p-4 text-center">
                        <div className="text-3xl font-bold text-white">{gameState.playerTeam?.tactic}</div>
                        <div className="text-xs text-blue-400 mt-1">Standart</div>
                    </div>
                 </Panel>
              </div>

              <Button 
                onClick={() => {
                   setGameState(p => ({...p, view: 'MENU', playerTeam: null}));
                   setInputTeamName("");
                }} 
                variant="danger" 
                className="w-full mt-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
              >
                KAYDETMEDEN ÇIK
              </Button>
           </div>
         )}

         {gameState.view === 'SQUAD' && gameState.playerTeam && (
           <div className="h-full flex flex-col">
              <SquadList 
                players={gameState.playerTeam.players} 
                primaryColor={gameState.playerTeam.primaryColor} 
                secondaryColor={gameState.playerTeam.secondaryColor} 
                currentTactic={gameState.playerTeam.tactic}
                onTacticChange={handleTacticChange}
                onSellPlayer={sellPlayer}
              />
           </div>
         )}

         {gameState.view === 'TRANSFER' && (
            <div className="p-5 space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-white">Transfer Pazarı</h2>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Açık</span>
                </div>
                
                {gameState.transferMarket.map(player => (
                    <div key={player.id} className="glass-panel p-4 flex justify-between items-center group active:scale-[0.98] transition-transform">
                        <div className="flex gap-4 items-center">
                             <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-slate-400">
                                {player.overall}
                             </div>
                             <div>
                                <div className="font-bold text-white">{player.name}</div>
                                <div className="text-xs text-slate-400 mt-0.5 flex gap-2">
                                    <span className="text-blue-400 font-bold">{player.position}</span>
                                    <span>• {player.age} Yaş</span>
                                </div>
                             </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className="font-bold text-yellow-500">€{(player.value / 1000000).toFixed(1)}M</span>
                            <Button onClick={() => buyPlayer(player)} className="h-7 text-xs px-3 bg-green-600/80 hover:bg-green-500">AL</Button>
                        </div>
                    </div>
                ))}
                
                <Button onClick={refreshMarket} variant="secondary" className="w-full py-4">LİSTEYİ YENİLE</Button>
            </div>
         )}

         {gameState.view === 'FIXTURE' && (
            <div className="flex flex-col items-center justify-center h-full text-slate-600 p-8 text-center">
                <div className="text-6xl mb-4 opacity-50 grayscale">🏟️</div>
                <div className="font-bold text-xl text-slate-500">FİKSTÜR</div>
                <div className="text-sm mt-2">Lig maçları yakında eklenecek.</div>
            </div>
         )}
      </main>

      <BottomNav 
        activeTab={gameState.view} 
        onTabChange={(tab) => setGameState(prev => ({ ...prev, view: tab }))} 
      />
    </div>
  );
};

export default App;
