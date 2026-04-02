

import { Card, HandType, PokerHand, Rank } from '../types';
import { HAND_SCORES, RANK_VALUES } from '../constants';

export function getPokerHand(selectedCards: Card[]): PokerHand {
  if (selectedCards.length === 0) {
    return { type: 'High Card', cards: [], score: 0, mult: 0, baseChips: 0, baseMult: 0, cardChips: 0 };
  }

  const sorted = [...selectedCards].sort((a, b) => b.rank - a.rank);
  const ranks = sorted.map(c => c.rank);
  const suits = sorted.map(c => c.suit);

  const isFlush = sorted.length === 5 && new Set(suits).size === 1;
  
  // Straight detection (including A2345)
  const uniqueRanks = Array.from(new Set(ranks)).sort((a, b) => a - b);
  let isStraight = false;
  let straightCards: Card[] = [];

  if (uniqueRanks.length >= 5) {
    for (let i = 0; i <= uniqueRanks.length - 5; i++) {
      const window = uniqueRanks.slice(i, i + 5);
      if (window[4] - window[0] === 4) {
        isStraight = true;
        straightCards = sorted.filter(c => window.includes(c.rank));
      }
    }
    // A2345
    if (!isStraight && uniqueRanks.includes(14) && uniqueRanks.includes(2) && uniqueRanks.includes(3) && uniqueRanks.includes(4) && uniqueRanks.includes(5)) {
      isStraight = true;
      straightCards = sorted.filter(c => [14, 2, 3, 4, 5].includes(c.rank));
    }
  }

  const counts: Record<number, number> = {};
  ranks.forEach(r => counts[r] = (counts[r] || 0) + 1);
  const countValues = Object.values(counts).sort((a, b) => b - a);

  let type: HandType = 'High Card';
  let scoringCards: Card[] = [sorted[0]];

  if (isFlush && isStraight) {
    type = sorted[0].rank === 14 && sorted[4].rank === 10 ? 'Royal Flush' : 'Straight Flush';
    scoringCards = sorted.slice(0, 5);
  } else if (countValues[0] === 4) {
    type = 'Four of a Kind';
    const fourRank = Object.keys(counts).find(r => counts[Number(r)] === 4);
    scoringCards = sorted.filter(c => c.rank === Number(fourRank));
  } else if (countValues[0] === 3 && countValues[1] === 2) {
    type = 'Full House';
    scoringCards = sorted.slice(0, 5);
  } else if (isFlush) {
    type = 'Flush';
    scoringCards = sorted.slice(0, 5);
  } else if (isStraight) {
    type = 'Straight';
    scoringCards = straightCards.slice(0, 5);
  } else if (countValues[0] === 3) {
    type = 'Three of a Kind';
    const threeRank = Object.keys(counts).find(r => counts[Number(r)] === 3);
    scoringCards = sorted.filter(c => c.rank === Number(threeRank));
  } else if (countValues[0] === 2 && countValues[1] === 2) {
    type = 'Two Pair';
    const pairRanks = Object.keys(counts).filter(r => counts[Number(r)] === 2);
    scoringCards = sorted.filter(c => pairRanks.includes(String(c.rank)));
  } else if (countValues[0] === 2) {
    type = 'Pair';
    const pairRank = Object.keys(counts).find(r => counts[Number(r)] === 2);
    scoringCards = sorted.filter(c => c.rank === Number(pairRank));
  }

  const base = HAND_SCORES[type];
  const cardChips = scoringCards.reduce((sum, c) => sum + RANK_VALUES[c.rank], 0);

  return {
    type,
    cards: scoringCards,
    score: base.chips + cardChips,
    mult: base.mult,
    baseChips: base.chips,
    baseMult: base.mult,
    cardChips
  };
}

export function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
