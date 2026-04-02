import React from 'react';
import { TacticalCard } from '../types';

interface GameCardProps {
  card: TacticalCard;
  onClick?: () => void;
  isSelected?: boolean;
  isOpponent?: boolean;
  disabled?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ 
  card, 
  onClick, 
  isSelected, 
  isOpponent,
  disabled 
}) => {
  if (isOpponent) {
    return (
      <div className="w-24 h-36 bg-slate-800 border-2 border-slate-700 rounded-lg flex items-center justify-center shadow-lg">
        <div className="w-16 h-24 bg-slate-700 rounded flex items-center justify-center">
          <div className="text-slate-500 font-bold text-2xl">?</div>
        </div>
      </div>
    );
  }

  const typeColors = {
    unit: 'border-blue-500 bg-blue-900/20',
    equipment: 'border-amber-500 bg-amber-900/20',
    spell: 'border-purple-500 bg-purple-900/20',
    support: 'border-emerald-500 bg-emerald-900/20'
  };

  return (
    <div 
      onClick={!disabled ? onClick : undefined}
      className={`relative w-32 h-48 border-2 rounded-xl p-3 flex flex-col cursor-pointer transition-all hover:scale-105 shadow-xl
        ${typeColors[card.type]} 
        ${isSelected ? 'ring-4 ring-yellow-400 scale-110 z-10' : ''}
        ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-bold truncate pr-1 text-white">{card.name}</span>
        <span className="bg-slate-950/80 text-sm px-2 py-0.5 rounded-lg text-yellow-400 font-mono font-bold border border-yellow-400/30">
          {card.cost}
        </span>
      </div>
      
      <div className="flex-1 bg-slate-950/50 rounded-lg overflow-hidden mb-2 relative border border-slate-800">
        <img 
          src={card.image} 
          alt={card.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        {card.type === 'unit' && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 flex justify-around text-xs py-1 border-t border-slate-800">
            <span className="text-red-400 font-black">⚔️{card.atk}</span>
            <span className="text-green-400 font-black">❤️{card.hp}</span>
          </div>
        )}
      </div>
      
      <div className="text-xs leading-snug text-slate-200 line-clamp-3 font-medium">
        {card.description}
      </div>
    </div>
  );
};
