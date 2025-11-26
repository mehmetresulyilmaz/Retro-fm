
import React, { useRef, useState, useEffect } from 'react';
import { Player, Position } from '../types';
import { getTacticalAdvice } from '../services/geminiService';
import { Button } from './RetroUI';

interface SquadListProps {
  players: Player[];
  primaryColor?: string;
  secondaryColor?: string;
  currentTactic: string;
  onTacticChange: (tactic: string) => void;
  onSellPlayer: (player: Player) => void;
}

const getPositionStyle = (pos: Position) => {
  switch (pos) {
    case Position.GK: return { text: "text-yellow-400", border: "border-l-yellow-500" };
    case Position.DEF: return { text: "text-blue-400", border: "border-l-blue-500" };
    case Position.MID: return { text: "text-green-400", border: "border-l-green-500" };
    case Position.FWD: return { text: "text-red-400", border: "border-l-red-500" };
    default: return { text: "text-gray-400", border: "border-l-gray-500" };
  }
};

const getStatClass = (val: number) => {
  if (val >= 16) return "bg-[#006400] text-white font-bold shadow-sm px-1 rounded";
  if (val >= 12) return "text-green-400 font-bold";
  if (val < 8) return "text-red-400/70";
  return "text-gray-400";
};

export const SquadList: React.FC<SquadListProps> = ({ 
    players, 
    primaryColor = '#2c4f6b', 
    secondaryColor = '#ffffff',
    currentTactic,
    onTacticChange,
    onSellPlayer
}) => {
  const [customPhotos, setCustomPhotos] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  useEffect(() => {
    try {
        const loaded: Record<string, string> = {};
        players.forEach(p => {
            const key = `player_photo_${p.id}`;
            const stored = localStorage.getItem(key);
            if (stored) loaded[p.id] = stored;
        });
        setCustomPhotos(loaded);
    } catch (e) {
        console.warn("Could not load photos", e);
    }
  }, [players]);

  const handlePhotoClick = (playerId: string) => {
    setSelectedPlayerId(playerId);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedPlayerId || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const resizeImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const MAX_SIZE = 150;
                let width = img.width;
                let height = img.height;
                const minDim = Math.min(width, height);
                const sx = (width - minDim) / 2;
                const sy = (height - minDim) / 2;
                canvas.width = MAX_SIZE;
                canvas.height = MAX_SIZE;
                ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, MAX_SIZE, MAX_SIZE);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        });
    };
    try {
        const base64 = await resizeImage(file);
        setCustomPhotos(prev => ({...prev, [selectedPlayerId]: base64}));
        localStorage.setItem(`player_photo_${selectedPlayerId}`, base64);
    } catch (err) {
        console.error("Image processing failed", err);
    }
  };

  const getDisplayPhoto = (player: Player) => {
    if (customPhotos[player.id]) return customPhotos[player.id];
    if (player.image && player.image.startsWith('http')) return player.image;
    return `https://i.pravatar.cc/150?u=${player.id}`;
  };

  const handleGetAdvice = async () => {
    setLoadingAdvice(true);
    const result = await getTacticalAdvice(players);
    setAdvice(result);
    setLoadingAdvice(false);
  };

  const sortedPlayers = [...players].sort((a, b) => {
    const posOrder = { [Position.GK]: 1, [Position.DEF]: 2, [Position.MID]: 3, [Position.FWD]: 4 };
    return posOrder[a.position] - posOrder[b.position] || b.overall - a.overall;
  });

  return (
    <div className="flex-1 bg-[#1a1a1a] flex flex-col overflow-hidden relative">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

      {/* Tactic Selector Header */}
      <div className="bg-[#2c4f6b] p-2 flex justify-between items-center border-b border-black">
         <span className="text-white font-bold text-xs uppercase">Diziliş:</span>
         <select 
            value={currentTactic} 
            onChange={(e) => onTacticChange(e.target.value)}
            className="bg-[#1a354a] text-white text-xs font-bold border border-[#5c7f9b] p-1 rounded outline-none"
         >
            <option value="4-4-2">4-4-2 KLASİK</option>
            <option value="4-3-3">4-3-3 HÜCUM</option>
            <option value="3-5-2">3-5-2 KONTROL</option>
            <option value="4-2-3-1">4-2-3-1 DENGELİ</option>
            <option value="5-4-1">5-4-1 SAVUNMA</option>
         </select>
      </div>

      {/* Advice Modal */}
      {advice && (
         <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-6 animate-in fade-in">
            <div className="bg-[#2c4f6b] border-2 border-white/20 shadow-2xl p-4 max-w-sm rounded">
               <h3 className="text-white font-bold mb-2 uppercase tracking-wide border-b border-white/20 pb-2">Teknik Ekip Raporu</h3>
               <p className="text-gray-200 text-sm font-sans mb-4 leading-relaxed">{advice}</p>
               <Button onClick={() => setAdvice(null)} className="w-full">TAMAM</Button>
            </div>
         </div>
      )}

      {/* Floating Advice Button */}
      <div className="absolute bottom-4 right-4 z-40">
        <button 
           onClick={handleGetAdvice}
           disabled={loadingAdvice}
           className="bg-[#dba800] text-black w-12 h-12 rounded-full shadow-lg flex items-center justify-center border-2 border-white active:scale-95 transition-transform"
        >
           {loadingAdvice ? (
             <div className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></div>
           ) : (
             <span className="text-2xl">🧠</span>
           )}
        </button>
      </div>

      <div className="overflow-auto h-full w-full no-scrollbar pb-20">
        <table className="w-full text-left font-sans border-collapse table-auto whitespace-nowrap">
          <thead 
            style={{ backgroundColor: primaryColor, color: secondaryColor }}
            className="text-[10px] sticky top-0 z-30 shadow-md"
          >
            <tr>
              <th className="sticky left-0 z-40 p-2 font-bold border-b-2 border-[#fff]/20 bg-[inherit] w-[140px] drop-shadow-[2px_0_5px_rgba(0,0,0,0.5)]">OYUNCU</th>
              <th className="p-2 text-center font-bold border-b-2 border-[#fff]/20 w-10">POZ</th>
              <th className="p-2 text-center font-bold border-b-2 border-[#fff]/20 w-8">YAŞ</th>
              <th className="p-2 text-center font-bold border-b-2 border-[#fff]/20 w-10">GNL</th>
              <th className="p-2 text-center font-bold border-b-2 border-[#fff]/20 w-16">DEĞER</th>
              <th className="p-2 text-center font-bold border-b-2 border-[#fff]/20 w-14">İŞLEM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedPlayers.map((player, idx) => {
               const posStyle = getPositionStyle(player.position);
               const rowBg = idx % 2 === 0 ? 'bg-[#262626]' : 'bg-[#202020]';
               const formattedValue = (player.value / 1000000).toFixed(1) + 'M€';
               
               return (
              <tr key={player.id} className={`${rowBg} active:bg-[#3d607c] active:text-white transition-colors h-12`}>
                <td className={`p-2 sticky left-0 z-20 ${rowBg} border-r border-black/30 drop-shadow-[2px_0_5px_rgba(0,0,0,0.5)]`}>
                    <div className="flex items-center gap-2">
                        <div 
                            className="relative group cursor-pointer shrink-0" 
                            onClick={() => handlePhotoClick(player.id)}
                        >
                            <img 
                                src={getDisplayPhoto(player)} 
                                className="w-8 h-8 rounded bg-gray-800 object-cover border border-gray-600 group-active:opacity-50"
                                onError={(e) => { (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?u=${player.id}`; }}
                                loading="lazy"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-active:opacity-100 bg-black/50 text-[8px] text-white rounded pointer-events-none">+</div>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm truncate max-w-[90px] text-gray-200">{player.name.split(' ').pop()}</span>
                            <div className="w-10 h-1 rounded-full bg-gray-700 mt-1">
                                <div className={`h-full ${player.condition > 90 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${player.condition}%` }}></div>
                            </div>
                        </div>
                    </div>
                </td>
                <td className={`p-2 text-center text-xs font-black tracking-wider ${posStyle.text} border-l-[3px] ${posStyle.border} bg-black/20`}>{player.position}</td>
                <td className="p-2 text-center text-gray-400 text-xs">{player.age}</td>
                <td className="p-2 text-center">
                   <div className={`w-7 h-6 mx-auto flex items-center justify-center rounded text-xs font-bold border border-white/10 ${player.overall >= 16 ? 'bg-yellow-600 text-white' : 'bg-[#111] text-gray-300'}`}>{player.overall}</div>
                </td>
                <td className="p-2 text-center text-gray-400 text-xs">{formattedValue}</td>
                <td className="p-2 text-center">
                    <button 
                        onClick={() => onSellPlayer(player)}
                        className="bg-red-900/80 text-white text-[9px] px-2 py-1 border border-red-700 rounded shadow hover:bg-red-700 active:scale-95"
                    >
                        SAT
                    </button>
                </td>
              </tr>
            );
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
