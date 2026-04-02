import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Layers } from 'lucide-react';
import { GameState } from '../types';
import { SUIT_NAMES } from '../constants';

interface DeckViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
}

export const DeckViewModal: React.FC<DeckViewModalProps> = ({ isOpen, onClose, gameState }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[300] flex items-center justify-center p-4"
        >
          <div 
            className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            style={{
              backgroundImage: `url(https://i.postimg.cc/Js7bHkSw/BG.png)`,
              backgroundRepeat: 'repeat',
            }}
          >
            <div 
              className="p-8 border-b border-slate-800 flex justify-between items-center"
              style={{
                backgroundImage: `url(https://i.postimg.cc/yD6F3Z2H/BG-top.png)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="flex items-center gap-4">
                <Layers className="w-8 h-8 text-blue-400" />
                <h2 className="text-4xl font-black italic text-white">查看牌组</h2>
                <span className="px-6 py-2 bg-slate-950/50 rounded-full text-sm font-black font-sans text-slate-400 border border-slate-800">
                  剩余 {gameState.deck.length + gameState.hand.length} / {gameState.runDeck.length}
                </span>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-950/50 hover:bg-slate-800 rounded-full transition-all">
                <X className="w-8 h-8 text-slate-400" />
              </button>
            </div>
            
            <div className="p-10 overflow-y-auto space-y-12 custom-scrollbar">
              {['spades', 'hearts', 'clubs', 'diamonds'].map(suit => {
                const suitCards = gameState.runDeck.filter(c => c.suit === suit).sort((a, b) => b.rank - a.rank);
                const suitIcon = {
                  spades: '♠',
                  hearts: '♥',
                  clubs: '♣',
                  diamonds: '♦'
                }[suit as keyof typeof SUIT_NAMES];
                const suitColor = (suit === 'hearts' || suit === 'diamonds') ? 'text-red-500' : 'text-slate-300';

                return (
                  <div key={suit} className="space-y-3">
                    <div className={`text-xl font-bold flex items-center gap-3 ${suitColor}`}>
                      <span className="text-3xl">{suitIcon}</span>
                      <span className="uppercase tracking-[0.2em] text-base">{SUIT_NAMES[suit as keyof typeof SUIT_NAMES]}</span>
                    </div>
                    <div className="grid grid-cols-7 sm:grid-cols-13 gap-2">
                      {suitCards.map(card => {
                        const isInHand = gameState.hand.some(c => c.id === card.id);
                        const isInDeck = gameState.deck.some(c => c.id === card.id);
                        const isSelected = gameState.selectedCards.some(c => c.id === card.id);
                        const isAvailable = isInHand || isInDeck || isSelected;
                        
                        const rankLabel = {
                          11: 'J', 12: 'Q', 13: 'K', 14: 'A'
                        }[card.rank as number] || card.rank;

                        return (
                          <div 
                            key={card.id}
                            className={`
                              aspect-[2/3] rounded-md border flex items-center justify-center font-bold text-sm transition-all overflow-hidden relative
                              ${isAvailable 
                                ? `${suitColor} bg-slate-800 border-slate-700 shadow-sm` 
                                : 'text-slate-700 bg-slate-950 border-slate-900 opacity-30 grayscale'
                              }
                              ${isInHand ? 'ring-1 ring-blue-500/50' : ''}
                              ${isSelected ? 'ring-2 ring-emerald-500' : ''}
                            `}
                            title={`${rankLabel} ${SUIT_NAMES[suit as keyof typeof SUIT_NAMES]} ${isInHand ? '(在手中)' : isInDeck ? '(在牌组中)' : '(已打出)'}`}
                          >
                            {rankLabel}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="p-6 bg-slate-950/50 border-t border-slate-800 flex gap-10 text-sm font-sans uppercase tracking-widest text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-800 border border-slate-700 rounded" />
                <span>可用</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-800 border border-blue-500/50 rounded ring-1 ring-blue-500/50" />
                <span>在手中</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-950 border border-slate-900 opacity-30 rounded" />
                <span>已打出 / 已弃掉</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
