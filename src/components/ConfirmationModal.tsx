import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  icon: LucideIcon;
  iconColor: string;
  confirmColor: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  icon: Icon,
  iconColor,
  confirmColor
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[400] flex items-center justify-center p-4"
        >
          <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-8 text-center space-y-6">
            <div className={`w-16 h-16 ${iconColor.replace('text-', 'bg-')}/10 rounded-full flex items-center justify-center mx-auto border border-white/5`}>
              <Icon className={`w-8 h-8 ${iconColor}`} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold italic uppercase tracking-tighter">{title}</h2>
              <p className="text-slate-400 text-sm">{description}</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-colors"
              >
                {cancelText}
              </button>
              <button 
                onClick={onConfirm}
                className={`flex-1 py-3 ${confirmColor} hover:brightness-110 rounded-xl font-bold transition-colors`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
