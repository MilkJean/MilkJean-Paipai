import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { GameState } from '../types';
import { ASSETS } from '../constants';

interface GameOverModalProps {
  isGameOver: boolean;
  gameState: GameState;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isGameOver,
  gameState,
  onRestart
}) => {
  return (
    <AnimatePresence>
      {isGameOver && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-red-950/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4"
        >
          <div 
            className="max-w-md w-full text-center space-y-10 p-12 rounded-[3rem] border border-red-500/30 shadow-2xl relative overflow-hidden"
            style={{
              backgroundImage: `url(${ASSETS.BG_MAIN})`,
              backgroundRepeat: 'repeat',
            }}
          >
            <div className="absolute inset-0 bg-red-950/40 pointer-events-none" />
            <div className="relative z-10 space-y-10">
              <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                <X className="w-12 h-12 text-red-500" />
              </div>
              <div>
                <h2 className="text-7xl font-black italic uppercase tracking-tighter mb-6 text-white drop-shadow-lg">挑战失败</h2>
                <p className="text-red-300 font-sans text-xl uppercase tracking-[0.2em]">你没能击败BOSS。</p>
              </div>
              <div className="bg-slate-950/80 p-10 rounded-[2rem] border border-red-900/30 backdrop-blur-sm">
                <div className="text-sm text-slate-500 uppercase font-black tracking-[0.4em] mb-3">最终章节</div>
                <div className="text-6xl font-black text-white">{gameState.ante}</div>
              </div>
              <button 
                onClick={onRestart}
                className="w-full py-5 bg-white text-slate-950 hover:bg-slate-200 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
              >
                重新开始
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
