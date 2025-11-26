
import { GoogleGenAI, Type } from "@google/genai";
import { Team, Player, MatchResult, Position, MatchEvent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- INSTANT DATA PRESETS (SPEED OPTIMIZATION) ---
const PRESETS: Record<string, any> = {
    "GALATASARAY": {
        name: "Galatasaray", shortName: "GS", primaryColor: "#A90432", secondaryColor: "#FDB912",
        players: [
            { name: "Fernando Muslera", position: "KL", age: 38, nat: "UY", ovr: 16, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Fernando_Muslera_2018.jpg/200px-Fernando_Muslera_2018.jpg" },
            { name: "Davinson Sanchez", position: "DF", age: 28, nat: "CO", ovr: 17 },
            { name: "Victor Nelsson", position: "DF", age: 25, nat: "DK", ovr: 15 },
            { name: "Abdülkerim Bardakcı", position: "DF", age: 29, nat: "TR", ovr: 15 },
            { name: "Ismail Jakobs", position: "DF", age: 25, nat: "SN", ovr: 14 },
            { name: "Lucas Torreira", position: "OS", age: 28, nat: "UY", ovr: 17 },
            { name: "Gabriel Sara", position: "OS", age: 25, nat: "BR", ovr: 17 },
            { name: "Barış Alper Yılmaz", position: "OS", age: 24, nat: "TR", ovr: 16 },
            { name: "Yunus Akgün", position: "OS", age: 24, nat: "TR", ovr: 15 },
            { name: "Dries Mertens", position: "FV", age: 37, nat: "BE", ovr: 15 },
            { name: "Victor Osimhen", position: "FV", age: 25, nat: "NG", ovr: 19, img: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Victor_Osimhen_2023.jpg/200px-Victor_Osimhen_2023.jpg" },
            { name: "Mauro Icardi", position: "FV", age: 31, nat: "AR", ovr: 18 },
            { name: "Michy Batshuayi", position: "FV", age: 30, nat: "BE", ovr: 15 },
            { name: "Kerem Demirbay", position: "OS", age: 31, nat: "TR", ovr: 14 },
            { name: "Kaan Ayhan", position: "DF", age: 29, nat: "TR", ovr: 13 },
            { name: "Günay Güvenç", position: "KL", age: 33, nat: "TR", ovr: 12 },
        ]
    },
    "FENERBAHÇE": {
        name: "Fenerbahçe", shortName: "FB", primaryColor: "#002d72", secondaryColor: "#ffed00",
        players: [
            { name: "Dominik Livakovic", position: "KL", age: 29, nat: "HR", ovr: 16 },
            { name: "Alexander Djiku", position: "DF", age: 30, nat: "GH", ovr: 16 },
            { name: "Çağlar Söyüncü", position: "DF", age: 28, nat: "TR", ovr: 15 },
            { name: "Bright Osayi-Samuel", position: "DF", age: 26, nat: "NG", ovr: 15 },
            { name: "Jayden Oosterwolde", position: "DF", age: 23, nat: "NL", ovr: 14 },
            { name: "Sofyan Amrabat", position: "OS", age: 28, nat: "MA", ovr: 16 },
            { name: "Fred", position: "OS", age: 31, nat: "BR", ovr: 17 },
            { name: "Sebastian Szymanski", position: "OS", age: 25, nat: "PL", ovr: 16 },
            { name: "Dusan Tadic", position: "OS", age: 35, nat: "RS", ovr: 17 },
            { name: "Allan Saint-Maximin", position: "OS", age: 27, nat: "FR", ovr: 16 },
            { name: "Edin Dzeko", position: "FV", age: 38, nat: "BA", ovr: 16 },
            { name: "Youssef En-Nesyri", position: "FV", age: 27, nat: "MA", ovr: 16 },
            { name: "Irfan Can Kahveci", position: "OS", age: 29, nat: "TR", ovr: 15 },
            { name: "Mert Müldür", position: "DF", age: 25, nat: "TR", ovr: 14 },
            { name: "Cengiz Ünder", position: "OS", age: 27, nat: "TR", ovr: 14 },
            { name: "İsmail Yüksek", position: "OS", age: 25, nat: "TR", ovr: 14 },
        ]
    },
    "BEŞİKTAŞ": {
        name: "Beşiktaş", shortName: "BJK", primaryColor: "#000000", secondaryColor: "#ffffff",
        players: [
            { name: "Mert Günok", position: "KL", age: 35, nat: "TR", ovr: 15 },
            { name: "Gabriel Paulista", position: "DF", age: 33, nat: "BR", ovr: 15 },
            { name: "Felix Uduokhai", position: "DF", age: 27, nat: "DE", ovr: 14 },
            { name: "Jonas Svensson", position: "DF", age: 31, nat: "NO", ovr: 13 },
            { name: "Arthur Masuaku", position: "DF", age: 30, nat: "CD", ovr: 14 },
            { name: "Al-Musrati", position: "OS", age: 28, nat: "LY", ovr: 15 },
            { name: "Gedson Fernandes", position: "OS", age: 25, nat: "PT", ovr: 16 },
            { name: "Rafa Silva", position: "OS", age: 31, nat: "PT", ovr: 17 },
            { name: "Joao Mario", position: "OS", age: 31, nat: "PT", ovr: 15 },
            { name: "Milot Rashica", position: "OS", age: 28, nat: "XK", ovr: 14 },
            { name: "Ciro Immobile", position: "FV", age: 34, nat: "IT", ovr: 17 },
            { name: "Semih Kılıçsoy", position: "FV", age: 19, nat: "TR", ovr: 14 },
            { name: "Ernest Muçi", position: "OS", age: 23, nat: "AL", ovr: 14 },
            { name: "Emirhan Topçu", position: "DF", age: 23, nat: "TR", ovr: 13 },
        ]
    },
    "TRABZONSPOR": {
        name: "Trabzonspor", shortName: "TS", primaryColor: "#800000", secondaryColor: "#3bbce3",
        players: [
            { name: "Uğurcan Çakır", position: "KL", age: 28, nat: "TR", ovr: 16 },
            { name: "Stefan Savic", position: "DF", age: 33, nat: "ME", ovr: 15 },
            { name: "Batista Mendy", position: "DF", age: 24, nat: "FR", ovr: 14 },
            { name: "Eren Elmalı", position: "DF", age: 24, nat: "TR", ovr: 13 },
            { name: "Okay Yokuşlu", position: "OS", age: 30, nat: "TR", ovr: 14 },
            { name: "Edin Visca", position: "OS", age: 34, nat: "BA", ovr: 15 },
            { name: "Simon Banza", position: "FV", age: 28, nat: "CD", ovr: 15 },
            { name: "Anthony Nwakaeme", position: "FV", age: 35, nat: "NG", ovr: 14 },
            { name: "Denis Dragus", position: "FV", age: 25, nat: "RO", ovr: 13 },
            { name: "Muhammed Cham", position: "OS", age: 23, nat: "AT", ovr: 13 },
            { name: "Ozan Tufan", position: "OS", age: 29, nat: "TR", ovr: 13 },
        ]
    }
};

const RANDOM_NAMES_TR = ["Ahmet", "Mehmet", "Can", "Burak", "Emre", "Yusuf", "Kerem", "Arda", "Oğuz", "Semih", "Mert", "Deniz", "Kaan", "Efe"];
const RANDOM_SURNAMES = ["Yılmaz", "Demir", "Kaya", "Çelik", "Yıldız", "Öztürk", "Aydın", "Özdemir", "Arslan", "Doğan", "Koç", "Kurt", "Şahin"];
const RANDOM_FOREIGN_NAMES = ["John", "Michael", "David", "Lucas", "Matteo", "Gabriel", "Leo", "Kevin", "Robert", "James"];

// --- UTILS ---

const cleanJson = (text: string) => {
  if (!text) return "{}";
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '');
  const firstOpen = cleaned.indexOf('{');
  const lastClose = cleaned.lastIndexOf('}');
  if (firstOpen !== -1 && lastClose > firstOpen) {
    cleaned = cleaned.substring(firstOpen, lastClose + 1);
  }
  return cleaned.trim();
};

const calculateValue = (ovr: number, age: number): number => {
    let base = 500000;
    if (ovr > 10) base = 2000000;
    if (ovr > 14) base = 8000000;
    if (ovr > 16) base = 20000000;
    if (ovr > 18) base = 50000000;
    const ageMultiplier = age < 23 ? 1.5 : (age > 32 ? 0.6 : 1.0);
    return Math.floor(base * ageMultiplier);
};

// Procedural generator to replace AI for speed
const generateRandomSquad = (teamName: string): Player[] => {
    const players: Player[] = [];
    const positions = [
        Position.GK, Position.DEF, Position.DEF, Position.DEF, Position.DEF,
        Position.MID, Position.MID, Position.MID, Position.MID,
        Position.FWD, Position.FWD, 
        Position.GK, Position.DEF, Position.MID, Position.FWD // Subs
    ];

    positions.forEach((pos, i) => {
        const isForeign = Math.random() > 0.6;
        const name = isForeign 
            ? `${RANDOM_FOREIGN_NAMES[Math.floor(Math.random() * RANDOM_FOREIGN_NAMES.length)]} ${String.fromCharCode(65+Math.floor(Math.random()*26))}.`
            : `${RANDOM_NAMES_TR[Math.floor(Math.random() * RANDOM_NAMES_TR.length)]} ${RANDOM_SURNAMES[Math.floor(Math.random() * RANDOM_SURNAMES.length)]}`;
        
        const baseOvr = 10 + Math.floor(Math.random() * 6); // 10-16 range
        
        players.push({
            id: `rnd-${teamName}-${i}`,
            name,
            position: pos,
            age: 18 + Math.floor(Math.random() * 18),
            nationality: isForeign ? "EU" : "TR",
            overall: baseOvr,
            condition: 100,
            value: calculateValue(baseOvr, 25),
            stats: { finishing: 10, passing: 10, tackling: 10, pace: 10 }
        });
    });
    return players;
};

// --- MAIN SERVICES ---

export const generateTeamSquad = async (teamName: string): Promise<Team> => {
  // 1. Check Presets (INSTANT)
  const upperName = teamName.toUpperCase();
  let foundPreset = null;
  
  if (upperName.includes("GALATASARAY") || upperName.includes("CIMBOM")) foundPreset = PRESETS["GALATASARAY"];
  else if (upperName.includes("FENER") || upperName.includes("FB")) foundPreset = PRESETS["FENERBAHÇE"];
  else if (upperName.includes("BEŞİKTAŞ") || upperName.includes("BESIKTAS") || upperName.includes("BJK")) foundPreset = PRESETS["BEŞİKTAŞ"];
  else if (upperName.includes("TRABZON") || upperName.includes("TS")) foundPreset = PRESETS["TRABZONSPOR"];

  if (foundPreset) {
      return {
          id: foundPreset.shortName.toLowerCase(),
          name: foundPreset.name,
          shortName: foundPreset.shortName,
          primaryColor: foundPreset.primaryColor,
          secondaryColor: foundPreset.secondaryColor,
          tactic: '4-2-3-1',
          budget: 20000000,
          players: foundPreset.players.map((p: any, i: number) => ({
              id: `pre-${foundPreset.shortName}-${i}`,
              name: p.name,
              position: p.position as Position,
              age: p.age,
              nationality: p.nat,
              overall: p.ovr,
              condition: 100,
              image: p.img,
              value: calculateValue(p.ovr, p.age),
              stats: { finishing: p.ovr, passing: p.ovr, tackling: p.ovr, pace: p.ovr } // Simplified stats
          }))
      };
  }

  // 2. If unknown team, use FAST procedural generation (No AI delay)
  // Only use AI if you really want to, but for speed we skip it for squad gen
  const randomPlayers = generateRandomSquad(teamName);
  return {
    id: teamName.toLowerCase().replace(/\s/g, '-'),
    name: teamName,
    shortName: teamName.substring(0,3).toUpperCase(),
    primaryColor: '#334155', // Default Slate
    secondaryColor: '#ffffff',
    tactic: '4-4-2',
    budget: 5000000,
    players: randomPlayers
  };
};

export const getTacticalAdvice = async (players: Player[]): Promise<string> => {
  // Keep AI for this as it's an "optional" click
  const model = "gemini-2.5-flash";
  const playerList = players.slice(0, 11).map(p => `${p.name} (${p.position})`).join(", ");
  const prompt = `Futbol taktik analisti ol. Şu oyuncular için: ${playerList}. En iyi diziliş ve oyun planını Türkçe, 2 kısa cümlede özetle.`;
  try {
     const response = await ai.models.generateContent({ model, contents: prompt });
     return response.text || "Dengeli oyna.";
  } catch (e) { return "Analiz servisi yoğun."; }
};

export const generateTransferMarket = async (): Promise<Player[]> => {
    // Generate market locally for speed, occasionally mix real AI data
    const market = generateRandomSquad("Market");
    return market.slice(0, 8).map(p => ({
        ...p,
        overall: p.overall + Math.floor(Math.random() * 4), // Slightly better players
        club: "Serbest"
    }));
}

export const simulateMatchCommentary = async (homeTeam: Team, awayTeam: Team): Promise<MatchResult> => {
  const model = "gemini-2.5-flash";

  // Reduced prompt for speed
  const prompt = `
    Simulate football match: ${homeTeam.name} vs ${awayTeam.name}.
    Generate 15 events (JSON).
    Events must have: minute, type (GOAL, MISS, CARD, SUB, ATTACK, DEFENSE), description (Turkish), side (home/away).
    Make it exciting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                events: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            minute: { type: Type.INTEGER },
                            type: { type: Type.STRING, enum: ['GOAL', 'MISS', 'CARD', 'SUB', 'ATTACK', 'DEFENSE'] },
                            description: { type: Type.STRING },
                            side: { type: Type.STRING, enum: ['home', 'away'] }
                        }
                    }
                }
            }
        }
      }
    });

    const data = JSON.parse(cleanJson(response.text || "{}"));
    const events: MatchEvent[] = data.events || [];
    
    // Add visual coordinates
    const enrichedEvents = events.map(evt => {
        let coords = { x: 50, y: 50 };
        if (evt.side === 'home') {
            if (evt.type === 'GOAL') coords = { x: 95, y: 50 };
            else if (evt.type === 'MISS') coords = { x: 90, y: Math.random() > 0.5 ? 40 : 60 };
            else if (evt.type === 'ATTACK') coords = { x: 70 + Math.random() * 20, y: 20 + Math.random() * 60 };
            else if (evt.type === 'DEFENSE') coords = { x: 20 + Math.random() * 20, y: 20 + Math.random() * 60 };
        } else {
            if (evt.type === 'GOAL') coords = { x: 5, y: 50 };
            else if (evt.type === 'MISS') coords = { x: 10, y: Math.random() > 0.5 ? 40 : 60 };
            else if (evt.type === 'ATTACK') coords = { x: 30 - Math.random() * 20, y: 20 + Math.random() * 60 };
            else if (evt.type === 'DEFENSE') coords = { x: 80 - Math.random() * 20, y: 20 + Math.random() * 60 };
        }
        return { ...evt, coordinate: coords };
    });

    // Sort by minute
    enrichedEvents.sort((a,b) => a.minute - b.minute);

    let homeScore = 0, awayScore = 0;
    enrichedEvents.forEach(e => {
        if (e.type === 'GOAL') e.side === 'home' ? homeScore++ : awayScore++;
    });

    return {
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      played: true,
      events: enrichedEvents
    };
  } catch (error) {
    // Fallback simulation if AI fails
    return {
      homeTeam,
      awayTeam,
      homeScore: 0,
      awayScore: 0,
      played: true,
      events: [
          { minute: 1, type: 'ATTACK', description: 'Maç başladı.', side: 'home', coordinate: {x: 50, y: 50} },
          { minute: 90, type: 'WHISTLE', description: 'Maç sona erdi (Bağlantı sorunu).', side: 'neutral', coordinate: {x: 50, y: 50} }
      ]
    };
  }
};
