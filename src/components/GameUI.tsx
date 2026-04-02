import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, 
  Info,
  X,
  Zap,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { GameState, Card, HandType } from '../types';
import { ASSETS, RARITY_NAMES, SUIT_NAMES } from '../constants';
import { PlayingCard } from './PlayingCard';

const RARITY_COLORS: Record<string, string> = {
  Common: 'bg-slate-500',
  Uncommon: 'bg-blue-500',
  Rare: 'bg-orange-500',
  Legendary: 'bg-purple-600',
};

interface GameUIProps {
  gameState: GameState;
  scale: number;
  onExit: () => void;
  onRestart: () => void;
  onShowHandReference: () => void;
  onSelectCard: (card: Card) => void;
  onPlayHand: () => void;
  onDiscard: () => void;
  onShowDeckView: () => void;
  lastHand: { 
    type: HandType; 
    baseChips: number; 
    baseMult: number; 
    finalChips: number; 
    finalMult: number; 
    total: number;
    steps: string[];
  } | null;
  setLastHand: (val: any) => void;
  potentialScore: any;
  customCardImages: Record<string, string>;
  customJokerImages: Record<string, string>;
  customBackground: string | null;
}

export const GameUI: React.FC<GameUIProps> = ({
  gameState,
  scale,
  onExit,
  onRestart,
  onShowHandReference,
  onSelectCard,
  onPlayHand,
  onDiscard,
  onShowDeckView,
  lastHand,
  setLastHand,
  potentialScore,
  customCardImages,
  customJokerImages,
  customBackground
}) => {
  return (
    <div 
      className="flex-shrink-0 bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500/30 transition-all duration-700 flex flex-col relative overflow-hidden shadow-2xl"
      style={{
        width: '1920px',
        height: '1080px',
        transform: `scale(${scale})`,
        transformOrigin: 'center',
        backgroundImage: `url(${customBackground || 'https://i.postimg.cc/qRZmQfhK/BG.png'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Header / Stats */}
      <header className="h-20 flex-shrink-0 border-b border-slate-800/50 flex items-center z-50 transition-colors">
        <div className="w-full px-12 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-3">
              <img src={ASSETS.LEVEL_ICON} className="w-14 h-14 object-contain" alt="Ante" referrerPolicy="no-referrer" />
              <span className="text-[25px] font-bold uppercase tracking-wider text-slate-400">章节</span>
              <span className="text-[40px] font-bold font-[system-ui]">{gameState.ante}</span>
            </div>
            <div className="flex items-center gap-3">
              <img src={ASSETS.TOKEN_ICON} className="w-14 h-14 object-contain" alt="Tokens" referrerPolicy="no-referrer" />
              <span className="text-[40px] font-bold font-[system-ui]">${gameState.money}</span>
            </div>
          </div>

          <div className="flex-1 max-w-2xl mx-12" />

          <div className="flex gap-6 items-center">
            <div className="flex gap-3">
              <button onClick={onExit} className="flex items-center gap-2 px-4 py-2 bg-black/20 hover:bg-black/40 rounded-xl text-slate-400 hover:text-white transition-all group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-base font-bold uppercase tracking-widest">退出</span>
              </button>
              <button onClick={onRestart} className="p-3 bg-black/20 hover:bg-red-900/40 rounded-xl text-slate-400 hover:text-red-400 transition-all">
                <RotateCcw className="w-6 h-6" />
              </button>
              <button onClick={onShowHandReference} className="p-3 bg-black/20 hover:bg-black/40 rounded-xl text-slate-400 transition-colors">
                <Info className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full overflow-hidden grid grid-cols-4 gap-8 p-8">
        {/* Left Sidebar: Jokers */}
        <div 
          className="col-span-1 flex flex-col gap-4 overflow-hidden p-6 rounded-[2rem] relative"
          style={{ 
            backgroundImage: 'url(https://i.postimg.cc/52VZLcQh/choose-buddy-card.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="relative z-10 flex items-center justify-between px-2">
            <h2 className="text-[25px] font-bold uppercase tracking-[0.2em] text-blue-300/70">魔法伙伴 ({gameState.jokers.length}/{gameState.jokerSlots})</h2>
          </div>
          <div className="relative z-10 flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {gameState.jokers.map((joker, idx) => (
              <motion.div key={`${joker.id}-${idx}`} layoutId={joker.id} className="group relative flex flex-col rounded-3xl overflow-hidden transition-all duration-300 bg-black/30 hover:border-blue-400/30">
                <div className={`h-1.5 w-full ${RARITY_COLORS[joker.rarity]}`} />
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-black text-lg text-white leading-tight">“{joker.name}”</h3>
                    <span className={`text-sm px-2 py-0.5 rounded-full uppercase font-black tracking-tighter ${RARITY_COLORS[joker.rarity]}`}>
                      {RARITY_NAMES[joker.rarity]}
                    </span>
                  </div>
                  <div className="aspect-square w-full relative group-hover:scale-105 transition-transform flex items-center justify-center">
                    <div className="w-full h-full overflow-hidden rounded-2xl bg-slate-950/50">
                      {customJokerImages[joker.id] ? (
                        <img src={customJokerImages[joker.id]} className="w-full h-full object-cover" alt={joker.name} referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-800">
                          <img src={ASSETS.IDOLS[idx % ASSETS.IDOLS.length] || ASSETS.DEFAULT_JOKER} className="w-full h-full object-contain opacity-60" alt="Default Joker" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-3">
                    <p className="text-sm text-slate-300 leading-relaxed font-medium italic">{joker.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            {Array.from({ length: gameState.jokerSlots - gameState.jokers.length }).map((_, i) => (
              <div key={i} className="border-2 border-dashed border-blue-400/10 h-32 rounded-3xl flex items-center justify-center text-blue-400/10">
                <Zap className="w-8 h-8" />
              </div>
            ))}
          </div>
        </div>

        {/* Center: Play Area */}
        <div className="col-span-3 flex flex-col h-full overflow-hidden relative">
          {/* Video Stage Backdrop (Covers Boss, Performance, and Action Buttons) */}
          <div className="absolute top-0 left-0 right-0 bottom-[210px] z-0 overflow-hidden rounded-[3rem] border-4 border-white/80 bg-black shadow-[0_0_50px_rgba(255,255,255,0.1)]">
            {/* Real Video Placeholder */}
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              referrerPolicy="no-referrer"
            >
              <source src="https://assets.mixkit.co/videos/preview/mixkit-abstract-motion-of-red-and-blue-smoke-2322-large.mp4" type="video/mp4" />
            </video>

            {/* Overlays for readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-red-500/10 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
            
            {/* Video Stage Label (Subtle) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
              <span className="text-sm font-black uppercase tracking-[1em] font-[system-ui]">Video Stage Active</span>
            </div>
          </div>

          {/* 1. BOSS Header (Top) */}
          <div className="w-full pt-6 px-12 pb-4 bg-gradient-to-b from-black/80 to-transparent z-50">
            <div className="max-w-6xl mx-auto flex items-start gap-8">
              {/* Boss Icon */}
              <div className="relative group">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-[150px] h-[150px] rounded-[2rem] overflow-hidden bg-slate-950/80 backdrop-blur-md border-4 border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.3)] relative z-10 flex items-center justify-center p-3"
                >
                  <img 
                    src={gameState.blind?.bossImage || ASSETS.DEFAULT_JOKER} 
                    className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" 
                    alt="Boss" 
                    referrerPolicy="no-referrer" 
                  />
                </motion.div>
                <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[20px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.2em] shadow-lg z-20 animate-pulse font-[system-ui]">
                  BOSS
                </div>
              </div>

              {/* Boss Info & Health Bar */}
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex items-end gap-10">
                  {/* Left: Boss Name & Label */}
                  <div className="flex flex-col shrink-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-red-500 font-[system-ui] text-[20px] font-bold tracking-[0.4em] uppercase">当前挑战</span>
                      <div className="h-px w-8 bg-red-500/30" />
                    </div>
                    <h1 className="text-[40px] font-black tracking-tighter text-white drop-shadow-2xl uppercase italic leading-none font-[system-ui]">
                      {gameState.blind?.name}
                    </h1>
                  </div>

                  {/* Right: Health Bar */}
                  <div className="flex-1 mb-1">
                    <div className="flex justify-between mb-2 px-1">
                      <div className="flex items-center gap-3">
                        <span className="text-red-500 font-black text-[20px] tracking-[0.2em] uppercase italic font-[system-ui]">BOSS HP</span>
                        <span className="text-white font-[system-ui] text-[25px] font-black drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                          {Math.max(0, gameState.targetScore - gameState.currentScore).toLocaleString()} / {gameState.targetScore.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-red-500 font-black text-[30px] font-[system-ui] drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                        {Math.max(0, Math.floor((1 - gameState.currentScore / gameState.targetScore) * 100))}%
                      </span>
                    </div>
                    <div className="h-5 bg-slate-950 rounded-full overflow-hidden border-2 border-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] p-1">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-red-800 via-red-500 to-orange-400 rounded-full shadow-[0_0_25px_rgba(239,68,68,0.8)]"
                        initial={{ width: '100%' }}
                        animate={{ width: `${Math.max(0, (1 - gameState.currentScore / gameState.targetScore) * 100)}%` }}
                        transition={{ type: 'spring', stiffness: 40, damping: 15 }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center -mt-2">
                  <p className="text-[20px] text-slate-400 font-bold font-[system-ui]">
                    “{gameState.blind?.bossDescription}”
                  </p>
                  <div className="flex items-center gap-4 bg-black/40 px-5 py-2 rounded-xl border border-white/5 font-sans">
                    <span className="text-[20px] font-[system-ui] font-bold text-slate-500 uppercase tracking-widest">击败奖励</span>
                    <div className="flex items-center gap-2">
                      <img src={ASSETS.TOKEN_ICON} className="w-5 h-5 object-contain" alt="Reward" />
                      <span className="text-[30px] font-black text-emerald-400 font-[system-ui] tracking-tighter">${gameState.blind?.reward}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. BOSS Performance Area (Center) */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden z-20">
            {/* Performance Background Effects */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px] animate-pulse" />
              <div className="absolute w-[800px] h-[800px] border border-red-500/5 rounded-full animate-[ping_6s_linear_infinite]" />
            </div>

            {/* Score Animation Overlay (lastHand) - Shrunk to a floating tip */}
            <AnimatePresence mode="wait">
              {lastHand && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8, y: 20 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.8, y: -20 }} 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur-xl z-50 p-10 rounded-[3rem] border-2 border-emerald-500/30 shadow-[0_0_100px_rgba(16,185,129,0.2)] min-w-[600px]"
                >
                  <div className="text-emerald-400 font-sans text-xl uppercase tracking-[0.4em] mb-4 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]">{lastHand.type}</div>
                  <div className="flex items-center gap-8 mb-6">
                    <div className="flex items-center gap-4 text-5xl font-black italic">
                      <span className="text-blue-400">{lastHand.finalChips}</span>
                      <span className="text-slate-600 text-2xl">×</span>
                      <span className="text-red-400">{lastHand.finalMult}</span>
                    </div>
                    <div className="text-5xl font-black text-white tracking-tighter">= {lastHand.total.toLocaleString()}</div>
                  </div>
                  <div className="w-full space-y-2 bg-black/30 p-4 rounded-2xl border border-white/5 mb-6">
                    {lastHand.steps.slice(-3).map((step, i) => (
                      <div key={i} className="flex justify-between text-sm font-sans text-slate-400">
                        <span className="uppercase tracking-wider">{step.split(':')[0]}</span>
                        <span className="text-slate-200 font-bold">{step.split(':')[1]}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setLastHand(null)} className="px-10 py-3 bg-emerald-500 text-white rounded-full font-black text-lg uppercase tracking-[0.2em] hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20">继续</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Action Area (Bottom) */}
          <div className="h-[480px] flex-shrink-0 flex flex-col items-center justify-between pb-8 pt-12 z-30 relative">
            {/* Top Row: Buttons + Prompt/Score Area (Integrated) */}
            <div className="w-full px-12 flex items-center justify-center gap-12 -translate-y-[30px]">
              {/* Discard Button (Left) */}
              <div className="flex flex-col items-center gap-2 translate-y-[10px]">
                <button 
                  onClick={onDiscard} 
                  disabled={gameState.selectedCards.length === 0 || gameState.discardsLeft <= 0} 
                  className="group relative transition-all active:scale-95 disabled:opacity-20 disabled:grayscale flex-shrink-0"
                >
                  <div className="absolute inset-0 bg-red-500/10 blur-xl rounded-full group-hover:bg-red-500/30 transition-all" />
                  <img src={ASSETS.BTN_DISCARD} className="h-[70px] w-auto object-contain relative z-10" alt="Discard" referrerPolicy="no-referrer" />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-sm font-black text-red-500/50 uppercase tracking-widest">弃牌</div>
                </button>
              </div>

              {/* Prompt/Score Area (Center) */}
              <div className="flex-1 max-w-4xl flex flex-col items-center gap-4 -translate-y-[30px]">
                {/* Stats moved here */}
                <div className="flex gap-12">
                  <div className="flex flex-col items-center">
                    <span className="text-[20px] text-slate-400 font-[system-ui] font-bold tracking-widest mb-1">剩余出牌次数</span>
                    <span className="text-5xl font-black text-blue-400 leading-none drop-shadow-[0_0_15px_rgba(96,165,250,0.5)] font-kid">{gameState.handsLeft}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[20px] text-slate-400 font-[system-ui] font-bold tracking-widest mb-1">剩余换牌次数</span>
                    <span className="text-5xl font-black text-red-400 leading-none drop-shadow-[0_0_15px_rgba(248,113,113,0.5)] font-kid">{gameState.discardsLeft}</span>
                  </div>
                </div>

                <div className="w-full h-32 flex items-center justify-center px-8 rounded-[2.5rem] bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                  
                  <AnimatePresence mode="wait">
                    {gameState.selectedCards.length > 0 && potentialScore ? (
                      <motion.div 
                        key="score"
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }} 
                        className="flex items-center gap-10 text-[40px] font-bold font-[system-ui] text-white"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm uppercase tracking-[0.3em] text-slate-500 font-sans mb-1">当前牌型</span>
                          <span className="text-[40px] font-bold text-white tracking-tighter">{potentialScore.type}</span>
                        </div>
                        <div className="h-12 w-px bg-white/10" />
                        <div className="flex items-center gap-6">
                          <div className="flex flex-col items-center">
                            <span className="text-sm text-blue-400 uppercase font-black tracking-widest mb-1">能量</span>
                            <span className="text-[40px] font-bold text-blue-400">{potentialScore.chips}</span>
                          </div>
                          <span className="text-2xl font-black text-slate-700">×</span>
                          <div className="flex flex-col items-center">
                            <span className="text-sm text-red-400 uppercase font-black tracking-widest mb-1">威力</span>
                            <span className="text-[40px] font-bold text-red-400">{potentialScore.mult}</span>
                          </div>
                          <div className="h-12 w-px bg-white/10" />
                          <div className="flex flex-col items-end">
                            <span className="text-sm text-slate-500 uppercase font-black tracking-widest mb-1">预计伤害</span>
                            <span className="text-5xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] tracking-tighter">{potentialScore.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="prompt"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="text-slate-500/40 font-sans text-xl italic tracking-[0.5em] uppercase animate-pulse"
                      >
                        请选择卡牌进行挑战
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Play Button Area (Right) */}
              <div className="flex flex-col items-center gap-4 translate-y-[20px]">
                <button 
                  onClick={onPlayHand} 
                  disabled={gameState.selectedCards.length === 0 || gameState.handsLeft <= 0} 
                  className="group relative transition-all active:scale-95 disabled:opacity-20 disabled:grayscale flex-shrink-0"
                >
                  <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full group-hover:bg-emerald-500/40 transition-all scale-125" />
                  <img src={ASSETS.BTN_PLAY} className="h-[80px] w-auto object-contain relative z-10" alt="Play Hand" referrerPolicy="no-referrer" />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-sm font-black text-emerald-500/50 uppercase tracking-widest">出牌</div>
                </button>
              </div>
            </div>

            {/* Bottom Row: Hand & Deck View */}
            <div className="w-full flex items-end justify-center gap-6 px-12 relative translate-y-[70px]">
              {/* Deck View Button (Left side of hand) */}
              <button 
                onClick={onShowDeckView} 
                className="absolute left-12 bottom-4 px-6 py-3 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 group bg-slate-900/60 border border-white/5 hover:bg-slate-800 hover:border-blue-500/50 shadow-lg backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-blue-400 group-hover:rotate-12 transition-transform" />
                  <div className="text-left">
                    <div className="text-sm text-slate-500 leading-none mb-1 font-sans uppercase tracking-widest">剩余牌组</div>
                    <div className="text-lg font-black font-sans text-white leading-none">{gameState.deck.length + gameState.hand.length}</div>
                  </div>
                </div>
              </button>

              {/* Player Hand */}
              <div className="h-44 flex items-end justify-center gap-1 pb-2 relative z-20 overflow-visible">
                {gameState.hand.map((card, idx) => (
                  <PlayingCard 
                    key={card.id} 
                    card={card} 
                    onClick={() => onSelectCard(card)} 
                    index={idx} 
                    isSelected={gameState.selectedCards.some(c => c.id === card.id)} 
                    customImage={customCardImages[`${card.suit}-${card.rank}`]} 
                    isHand 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
