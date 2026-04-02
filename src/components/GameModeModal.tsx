import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Users, X } from 'lucide-react';

interface GameModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: 'SINGLE' | 'TWO_PLAYER') => void;
}

export const GameModeModal: React.FC<GameModeModalProps> = ({ isOpen, onClose, onSelectMode }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-8 md:p-12">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight uppercase">选择游戏模式</h2>
                  <p className="text-slate-400 mt-1">SELECT GAME MODE</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Single Player Option */}
                <button
                  onClick={() => onSelectMode('SINGLE')}
                  className="group relative flex flex-col items-center p-8 bg-white/5 border border-white/10 rounded-2xl transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
                >
                  <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <User className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">单人游戏</h3>
                  <p className="text-slate-400 text-center text-sm">
                    经典小丑牌玩法，挑战最高分数，收集强力卡组。
                  </p>
                  <div className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    开始挑战
                  </div>
                </button>

                {/* Two Player Option */}
                <button
                  onClick={() => onSelectMode('TWO_PLAYER')}
                  className="group relative flex flex-col items-center p-8 bg-white/5 border border-white/10 rounded-2xl transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
                >
                  <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Users className="w-10 h-10 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">双人对战</h3>
                  <p className="text-slate-400 text-center text-sm">
                    全新战术桌游玩法，排兵布阵，摧毁对方主城。
                  </p>
                  <div className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-full text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    立即开战
                  </div>
                </button>
              </div>
            </div>
            
            <div className="bg-white/5 p-4 text-center border-t border-white/10">
              <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">
                V1.2.0 Tactical Combat Update
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
