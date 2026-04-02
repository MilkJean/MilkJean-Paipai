import React from 'react';
import { motion } from 'motion/react';
import { Card as CardType } from '../types';
import { ASSETS } from '../constants';

interface PlayingCardProps {
  card: CardType;
  onClick: () => void;
  isSelected: boolean;
  index: number;
  customImage?: string;
  isHand?: boolean;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({ card, onClick, isSelected, index, customImage, isHand }) => {
  const frameUrl = (ASSETS.CARD_FRAMES as any)[`${card.suit}-${card.rank}`] || ASSETS.CARD_BACK;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ 
        opacity: 1, 
        y: isHand ? (isSelected ? -60 : 30) : 0,
        scale: isSelected ? 1.1 : 1,
        rotate: isHand ? (index - 4) * 2 : 0,
        zIndex: isSelected ? 100 : index,
      }}
      whileHover={{ 
        scale: 1.15, 
        y: isHand ? (isSelected ? -70 : 10) : -10,
        zIndex: 200,
      }}
      onClick={onClick}
      className="relative w-40 h-60 cursor-pointer outline-none select-none"
      style={{ 
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden'
      }}
    >
      {/* Glow Layer - Using a separate div for stability */}
      <motion.div
        animate={{
          opacity: isSelected ? 1 : 0,
          scale: isSelected ? 1.02 : 1,
        }}
        className="absolute -inset-4 bg-emerald-500/30 blur-2xl rounded-full pointer-events-none z-0"
      />
      
      {/* Card Content Container */}
      <div className="relative w-full h-full z-10">
        {/* Bottom Layer: Custom Image or Default Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[92.5%] h-[90%] overflow-hidden rounded-[10%]">
            {customImage ? (
              <img src={customImage} className="w-full h-full object-cover" alt="Custom Card Art" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                 <img src={ASSETS.CARD_BACK} className="w-full h-full object-cover opacity-20" alt="Card Back" referrerPolicy="no-referrer" />
              </div>
            )}
          </div>
        </div>

        {/* Top Layer: Fixed Card Frame */}
        <div className="absolute inset-0 pointer-events-none">
          <img 
            src={frameUrl} 
            className="w-full h-full object-fill" 
            alt={`${card.suit} ${card.rank} frame`} 
            referrerPolicy="no-referrer" 
          />
        </div>
      </div>
    </motion.div>
  );
};
