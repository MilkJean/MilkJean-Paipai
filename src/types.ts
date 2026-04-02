
// Tactical Game Types
export type TacticalCardType = 'unit' | 'equipment' | 'spell' | 'support';

export interface TacticalCard {
  id: string;
  name: string;
  type: TacticalCardType;
  cost: number;
  atk?: number;
  hp?: number;
  maxHp?: number;
  description: string;
  image: string;
}

export interface TacticalPlayer {
  id: 'player1' | 'player2';
  name: string;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  hand: TacticalCard[];
  deck: TacticalCard[];
  discard: TacticalCard[];
  slots: (TacticalCard | null)[];
}

export interface TacticalGameState {
  turn: number;
  currentPlayer: 'player1' | 'player2';
  phase: 'main' | 'battle';
  winner: 'player1' | 'player2' | null;
}

export interface RoomInfo {
  roomId: string;
  role: 'host' | 'guest';
}

// Balatro-style Game Types
export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = number;
export type HandType = 'High Card' | 'Pair' | 'Two Pair' | 'Three of a Kind' | 'Straight' | 'Flush' | 'Full House' | 'Four of a Kind' | 'Straight Flush' | 'Royal Flush';

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Legendary';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  value?: number;
  image?: string;
}

export interface Joker {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  price: number;
  effect: (event: GameEvent, state: GameState) => Partial<GameState> | void;
  image?: string;
}

export interface Consumable {
  id: string;
  name: string;
  description: string;
  type: 'Tarot' | 'Planet' | 'Spectral';
  price: number;
  effect: (state: GameState) => Partial<GameState> | void;
  image?: string;
}

export interface Blind {
  id: string;
  name: string;
  type: 'Small Blind' | 'Big Blind' | 'Boss Blind';
  targetScore: number;
  reward: number;
  bossDescription?: string;
  bossImage?: string;
  bossEffect?: (event: GameEvent, state: GameState) => Partial<GameState> | void;
}

export interface GameState {
  seed: string;
  ante: number;
  round: number;
  blind: Blind | null;
  chips: number;
  mult: number;
  currentScore: number;
  targetScore: number;
  handsLeft: number;
  discardsLeft: number;
  money: number;
  runDeck: Card[];
  deck: Card[];
  hand: Card[];
  selectedCards: Card[];
  jokers: Joker[];
  jokerSlots: number;
  consumables: Consumable[];
  consumableSlots: number;
  handSize: number;
  isShopOpen: boolean;
  shopItems: (Joker | Consumable)[];
  history: string[];
  lastRoundReward?: { base: number; bonus: number };
}

export interface PokerHand {
  type: HandType;
  score: number;
  mult: number;
  cards: Card[];
  baseChips?: number;
  baseMult?: number;
  cardChips?: number;
}

export type GameEvent = 
  | { type: 'OnHandPlayed'; payload: { cards: Card[]; handType: HandType } }
  | { type: 'OnHandScored'; payload: { scoringCards: Card[]; handType: HandType } }
  | { type: 'OnDiscard' }
  | { type: 'OnRoundStart' }
  | { type: 'OnRoundEnd' }
  | { type: 'OnShopEnter' }
  | { type: 'OnShopExit' };
