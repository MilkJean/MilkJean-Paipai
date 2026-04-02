import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, RotateCcw, ChevronRight } from 'lucide-react';
import { Joker, Consumable, GameState } from '../types';
import { ASSETS, RARITY_NAMES } from '../constants';

const RARITY_COLORS: Record<string, string> = {
  Common: 'bg-slate-500',
  Uncommon: 'bg-blue-500',
  Rare: 'bg-orange-500',
  Legendary: 'bg-purple-600',
};

interface ShopModalProps {
  gameState: GameState;
  onReroll: () => void;
  onBuyItem: (item: Joker) => void;
  onNextRound: () => void;
  customJokerImages: Record<string, string>;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  gameState,
  onReroll,
  onBuyItem,
  onNextRound,
  customJokerImages
}) => {
  return (
    <AnimatePresence>
      {gameState.isShopOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
        >
          <div 
            className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col"
            style={{
              backgroundImage: `url(${ASSETS.BG_MAIN})`,
              backgroundRepeat: 'repeat',
            }}
          >
            <div 
              className="p-8 border-b border-slate-800 flex justify-between items-center"
              style={{
                backgroundImage: `url(${ASSETS.BG_TOP})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div>
                <h2 className="text-4xl font-black italic text-white flex items-center gap-4">
                  <ShoppingBag className="w-10 h-10 text-emerald-500" />
                  魔法屋
                </h2>
                <div className="flex gap-10 mt-4">
                  <p className="text-slate-400 font-sans text-lg uppercase tracking-widest">
                    基础奖励: <span className="text-emerald-400 font-black">${gameState.lastRoundReward?.base || 0}</span>
                  </p>
                  <p className="text-slate-400 font-sans text-lg uppercase tracking-widest">
                    剩余出牌奖励: <span className="text-emerald-400 font-black">${gameState.lastRoundReward?.bonus || 0}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <button 
                  onClick={onReroll}
                  disabled={gameState.money < 2}
                  className="flex items-center gap-3 bg-slate-950/50 hover:bg-slate-800 disabled:opacity-50 px-8 py-4 rounded-2xl border border-slate-700 text-base font-black uppercase tracking-widest transition-all active:scale-95"
                >
                  <RotateCcw className="w-6 h-6" />
                  刷新 ($2)
                </button>
                <div className="flex items-center gap-6 bg-slate-950 px-10 py-5 rounded-[2rem] border border-slate-800 shadow-inner">
                  <img src={ASSETS.TOKEN_ICON} className="w-12 h-12 object-contain" alt="Tokens" referrerPolicy="no-referrer" />
                  <span className="text-4xl font-black font-sans text-white">${gameState.money}</span>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-10 grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 overflow-y-auto custom-scrollbar max-h-[70vh]">
              {gameState.shopItems.map((item, idx) => (
                <div 
                  key={item.id}
                  className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-[2rem] group hover:border-emerald-500/50 transition-all flex flex-col overflow-hidden shadow-2xl"
                >
                  <div className={`h-2 w-full ${RARITY_COLORS[(item as Joker).rarity] || 'bg-slate-700'}`} />
                  
                  <div className="p-5 md:p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-4 md:mb-6">
                      <div>
                        <h3 className="text-xl md:text-2xl font-black italic text-white mb-1 md:mb-2 leading-tight">“{(item as Joker).name}”</h3>
                        <span className={`text-sm px-3 py-1 rounded-full uppercase font-black tracking-[0.1em] ${(item as Joker).rarity ? RARITY_COLORS[(item as Joker).rarity] : 'bg-slate-700'}`}>
                          {(item as Joker).rarity ? RARITY_NAMES[(item as Joker).rarity] : '魔法道具'}
                        </span>
                      </div>
                      <div className="text-xl md:text-2xl font-black text-emerald-400 font-sans drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]">${item.price}</div>
                    </div>
                    
                    <div className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8">
                      <div className="aspect-square w-full max-w-[160px] md:max-w-[200px] mx-auto relative group-hover:scale-105 transition-transform flex items-center justify-center">
                        <div className="w-full h-full overflow-hidden rounded-2xl bg-slate-950/50 border border-white/10">
                          {customJokerImages[item.id] ? (
                            <img src={customJokerImages[item.id]} className="w-full h-full object-cover" alt={item.name} referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-800">
                              <img 
                                src={ASSETS.IDOLS[idx % ASSETS.IDOLS.length] || ASSETS.DEFAULT_JOKER} 
                                className="w-full h-full object-contain opacity-60" 
                                alt="Default Joker" 
                                referrerPolicy="no-referrer" 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="bg-black/40 p-4 md:p-5 rounded-2xl border border-white/10 shadow-inner">
                        <p className="text-sm md:text-base text-slate-200 leading-relaxed font-medium italic">{(item as Joker).description}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => onBuyItem(item as Joker)}
                      disabled={gameState.money < item.price || gameState.jokers.length >= gameState.jokerSlots}
                      className="w-full py-4 md:py-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-950 disabled:text-slate-800 rounded-2xl font-black text-base md:text-lg uppercase tracking-[0.2em] transition-all mt-auto shadow-2xl shadow-emerald-900/20 active:scale-95"
                    >
                      {gameState.jokers.length >= gameState.jokerSlots ? '槽位已满' : '购买伙伴'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 bg-slate-950/50 border-t border-slate-800 flex justify-end">
              <button 
                onClick={onNextRound}
                className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold uppercase tracking-widest transition-all"
              >
                挑战下一位BOSS
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
