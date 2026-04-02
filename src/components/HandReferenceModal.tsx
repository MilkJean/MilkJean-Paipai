import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap } from 'lucide-react';
import { HandType } from '../types';
import { 
  HAND_NAMES, 
  HAND_SCORES, 
  HAND_DESCRIPTIONS, 
  ASSETS 
} from '../constants';

interface HandReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HandReferenceModal: React.FC<HandReferenceModalProps> = ({ isOpen, onClose }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-slate-950 border border-slate-700 rounded-[3rem] max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col"
          onClick={e => e.stopPropagation()}
          style={{
            backgroundImage: `url(${ASSETS.BG_MAIN})`,
            backgroundRepeat: 'repeat',
          }}
        >
          <div 
            className="flex justify-between items-center p-8 border-b border-slate-800"
            style={{
              backgroundImage: `url(${ASSETS.BG_TOP})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <img src={ASSETS.LEVEL_ICON} className="w-8 h-8 object-contain" alt="Info" referrerPolicy="no-referrer" />
              牌型指南 
            </h2>
            <button onClick={onClose} className="p-2 bg-slate-900/50 hover:bg-slate-800 rounded-full transition-colors">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar">
            {(Object.keys(HAND_NAMES) as HandType[]).reverse().map((type) => (
              <div key={type} className="p-6 bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-800 hover:border-blue-500/30 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xl font-black text-white italic">{HAND_NAMES[type]}</span>
                  <div className="flex items-center gap-2 font-sans">
                    <span className="text-blue-400 font-black">{HAND_SCORES[type].chips}</span>
                    <span className="text-slate-600">×</span>
                    <span className="text-red-400 font-black">{HAND_SCORES[type].mult}</span>
                  </div>
                </div>
                <p className="text-xl text-slate-300 leading-relaxed">
                  {HAND_DESCRIPTIONS[type]}
                </p>
              </div>
            ))}
            
            <div className="mt-8 p-8 bg-blue-500/10 border border-blue-500/20 rounded-[2rem]">
              <h3 className="text-blue-400 font-black mb-3 flex items-center gap-3 uppercase tracking-widest text-base">
                <Zap className="w-5 h-5" /> 小贴士
              </h3>
              <p className="text-lg text-slate-400 leading-relaxed font-medium">
                J 代表 11，Q 代表 12，K 代表 13，A 代表 14（也可以当作 1 使用）。
                数字越大，基础分数越高！尽量凑出更厉害的牌型来获得高分吧！
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);
