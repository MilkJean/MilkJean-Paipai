

import { HandType, Rank, Suit, Card, Blind, Joker, Rarity } from './types';

export const HAND_NAMES: Record<HandType, string> = {
  'High Card': '高牌',
  'Pair': '对子',
  'Two Pair': '两对',
  'Three of a Kind': '三条',
  'Straight': '顺子',
  'Flush': '同花',
  'Full House': '葫芦',
  'Four of a Kind': '四条',
  'Straight Flush': '同花顺',
  'Royal Flush': '皇家同花顺',
};

export const HAND_DESCRIPTIONS: Record<HandType, string> = {
  'High Card': '任意一张牌。',
  'Pair': '两张数字相同的牌。',
  'Two Pair': '两组数字相同的牌。',
  'Three of a Kind': '三张数字相同的牌。',
  'Straight': '五张数字连续的牌（如 2, 3, 4, 5, 6）。',
  'Flush': '五张花色相同的牌。',
  'Full House': '三张相同的牌 + 一对相同的牌。',
  'Four of a Kind': '四张数字相同的牌。',
  'Straight Flush': '五张花色相同且数字连续的牌。',
  'Royal Flush': '同花色的 10, J, Q, K, A。',
};

export const HAND_SCORES: Record<HandType, { chips: number; mult: number }> = {
  'High Card': { chips: 5, mult: 1 },
  'Pair': { chips: 10, mult: 2 },
  'Two Pair': { chips: 20, mult: 2 },
  'Three of a Kind': { chips: 30, mult: 3 },
  'Straight': { chips: 30, mult: 4 },
  'Flush': { chips: 35, mult: 4 },
  'Full House': { chips: 40, mult: 4 },
  'Four of a Kind': { chips: 60, mult: 7 },
  'Straight Flush': { chips: 100, mult: 8 },
  'Royal Flush': { chips: 100, mult: 8 },
};

export const RANK_VALUES: Record<Rank, number> = {
  2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10,
  11: 10, 12: 10, 13: 10, 14: 11
};

export const SUIT_NAMES: Record<Suit, string> = {
  'spades': '黑桃',
  'hearts': '红桃',
  'diamonds': '方块',
  'clubs': '梅花',
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  'spades': '♠',
  'hearts': '♥',
  'clubs': '♣',
  'diamonds': '♦',
};

export const RANK_LABELS: Record<Rank, string> = {
  2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
  11: 'J', 12: 'Q', 13: 'K', 14: 'A'
};

export const RARITY_NAMES: Record<Rarity, string> = {
  'Common': '普通',
  'Uncommon': '罕见',
  'Rare': '稀有',
  'Legendary': '传说',
};

export const BLIND_TYPE_NAMES: Record<string, string> = {
  'Small Blind': '入门挑战',
  'Big Blind': '进阶挑战',
  'Boss Blind': '终极考验',
};

export const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
export const RANKS: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export const INITIAL_DECK: Card[] = SUITS.flatMap(suit => 
  RANKS.map(rank => ({
    id: `${suit}-${rank}`,
    suit,
    rank
  }))
);

export const ASSETS = {
  BG_MAIN: 'https://i.postimg.cc/Js7bHkSw/BG.png',
  BG_UNCUT: 'https://i.postimg.cc/W1gSKmn3/BG_uncut.jpg',
  BG_SIDEBAR: 'https://i.postimg.cc/Js7bHkSw/BG.png',
  BG_TOP: 'https://i.postimg.cc/yD6F3Z2H/BG-top.png',
  BG_BUTTON: 'https://i.postimg.cc/XrNwBCtn/BG-button.png',
  BG_PLAY_AREA: 'https://i.postimg.cc/9DXGw7s5/BG.jpg',
  SELECTED_AREA: 'https://i.postimg.cc/rdKxQL8Y/selected-area.png',
  TOKEN_ICON: 'https://i.postimg.cc/mDfZFpRQ/stars.png',
  LEVEL_ICON: 'https://i.postimg.cc/CRvbGKVJ/level-icon.png',
  BTN_PLAY: 'https://i.postimg.cc/gwn8NPYt/play-hand-button.png',
  BTN_DISCARD: 'https://i.postimg.cc/w1xhRmn6/discard-button.png',
  CARD_BACK: 'https://i.postimg.cc/gwQR7Bjc/stars.png',
  DEFAULT_JOKER: 'https://i.postimg.cc/w1WDXBdL/idol-1.png',
  IDOLS: [
    'https://i.postimg.cc/w1WDXBdL/idol-1.png',
    'https://i.postimg.cc/zydTCf1n/idol-2.png',
    'https://i.postimg.cc/87yLRCVR/idol-3.png',
    'https://i.postimg.cc/k2jWQ5dN/idol-4.png',
    'https://i.postimg.cc/sMn5Y2RJ/idol-5.png',
    'https://i.postimg.cc/K19tPYyf/idol-6.png',
  ],
  STARS: 'https://i.postimg.cc/gwQR7Bjc/stars.png',
  STARS_WITH_BG: 'https://i.postimg.cc/mcJMn6kk/stars-withbg.png',
  RANK_IMAGES: {
    0: { green: 'https://i.postimg.cc/PpDZnzv8/zero-green.png', white: 'https://i.postimg.cc/TLbmvq5c/zero-white.png', yellow: 'https://i.postimg.cc/BLFDfcPp/zero-yellow.png' },
    1: { green: 'https://i.postimg.cc/p9pzqt2C/one-green.png', white: 'https://i.postimg.cc/Y4hYbwpn/one-white.png', yellow: 'https://i.postimg.cc/JyGZPW1T/one-yellow.png' },
    2: { green: 'https://i.postimg.cc/McNRLrHm/two-green.png', white: 'https://i.postimg.cc/f3pXPgyC/two-white.png', yellow: 'https://i.postimg.cc/ygR9CX39/two-yellow.png' },
    3: { green: 'https://i.postimg.cc/XZmFPDqy/three-green.png', white: 'https://i.postimg.cc/t1wPcmJx/three-white.png', yellow: 'https://i.postimg.cc/XZmFPDqd/three-yellow.png' },
    4: { green: 'https://i.postimg.cc/Yv21LWTL/four-green.png', white: 'https://i.postimg.cc/jDqzn7BJ/four-white.png', yellow: 'https://i.postimg.cc/3krg0vzv/four-yellow.png' },
    5: { green: 'https://i.postimg.cc/BjZxPKRt/five-green.png', white: 'https://i.postimg.cc/MnZyfQgG/five-white.png', yellow: 'https://i.postimg.cc/dhQ8Zyg7/five-yellow.png' },
    6: { green: 'https://i.postimg.cc/LqnLNM95/six-green.png', white: 'https://i.postimg.cc/t1YW2HqT/six-white.png', yellow: 'https://i.postimg.cc/Z923QDnq/six-yellow.png' },
    7: { green: 'https://i.postimg.cc/rdKxQLVp/seven-green.png', white: 'https://i.postimg.cc/2qVh2fzP/seven-white.png', yellow: 'https://i.postimg.cc/rdKxQLVp/seven-green.png' }, // seven-yellow was missing, using green as fallback
    8: { green: 'https://i.postimg.cc/3krg0vz8/eight-green.png', white: 'https://i.postimg.cc/tsRhnx8C/eight-white.png', yellow: 'https://i.postimg.cc/zyDnHg4B/eight-yellow.png' },
    9: { green: 'https://i.postimg.cc/LJyjtsMW/nine-green.png', white: 'https://i.postimg.cc/cvDfRJNP/nine-white.png', yellow: 'https://i.postimg.cc/TKknVPXZ/nine-yellow.png' },
  },
  CARD_FRAMES: {
    'clubs-2': 'https://i.postimg.cc/K1WGbX2H/1.png',
    'clubs-3': 'https://i.postimg.cc/FY6rvt48/3.png',
    'clubs-4': 'https://i.postimg.cc/DSNvhVTR/4.png',
    'clubs-5': 'https://i.postimg.cc/v4KYyRsJ/5.png',
    'clubs-6': 'https://i.postimg.cc/WDJ2b9NX/6.png',
    'clubs-7': 'https://i.postimg.cc/bG2zN6ym/7.png',
    'clubs-8': 'https://i.postimg.cc/4KhJN8fL/8.png',
    'clubs-9': 'https://i.postimg.cc/06J82tkX/9.png',
    'clubs-10': 'https://i.postimg.cc/8Fr1PypY/10.png',
    'clubs-11': 'https://i.postimg.cc/18dmSxQY/1-J.png',
    'clubs-12': 'https://i.postimg.cc/xXZfQr27/1-Q.png',
    'clubs-13': 'https://i.postimg.cc/QFz8DL3z/1-K.png',
    'clubs-14': 'https://i.postimg.cc/zyQzNmrt/1-A.png',
    'spades-2': 'https://i.postimg.cc/YG6MQhm8/spade-1.png',
    'spades-3': 'https://i.postimg.cc/FdyN07JD/spade-3.png',
    'spades-4': 'https://i.postimg.cc/N96BR5rN/spade-4.png',
    'spades-5': 'https://i.postimg.cc/r01M5Ktn/spade-5.png',
    'spades-6': 'https://i.postimg.cc/G8FdvHs5/spade-6.png',
    'spades-7': 'https://i.postimg.cc/xJvnLcbZ/spade-7.png',
    'spades-8': 'https://i.postimg.cc/DJrn18bD/spade-8.png',
    'spades-9': 'https://i.postimg.cc/7G3wSfTd/spade-9.png',
    'spades-10': 'https://i.postimg.cc/jwHtyL7Y/spade-10.png',
    'spades-11': 'https://i.postimg.cc/cgR0frnS/spade-J.png',
    'spades-12': 'https://i.postimg.cc/xJvnLczQ/spade-Q.png',
    'spades-13': 'https://i.postimg.cc/QFz8DL3z/1-K.png', // Fallback
    'spades-14': 'https://i.postimg.cc/R674wNHz/spade-A.png',
    'hearts-2': 'https://i.postimg.cc/7G8qCgbq/heart-2.png',
    'hearts-3': 'https://i.postimg.cc/vgFG1WD8/heart-3.png',
    'hearts-4': 'https://i.postimg.cc/Q9GjBpV9/heart-4.png',
    'hearts-5': 'https://i.postimg.cc/2bRCq43L/heart-5.png',
    'hearts-6': 'https://i.postimg.cc/njbnsvMQ/heart-6.png',
    'hearts-7': 'https://i.postimg.cc/5YdfHwjw/heart-7.png',
    'hearts-8': 'https://i.postimg.cc/ftnM3xkC/heart-8.png',
    'hearts-9': 'https://i.postimg.cc/XGSnZwXx/heart-9.png',
    'hearts-10': 'https://i.postimg.cc/XGf49pyC/heart-10.png',
    'hearts-11': 'https://i.postimg.cc/mzYB7tFw/heart-J.png',
    'hearts-12': 'https://i.postimg.cc/476spmhQ/heart-Q.png',
    'hearts-13': 'https://i.postimg.cc/8JRNLjrB/heart-K.png',
    'hearts-14': 'https://i.postimg.cc/HcwdbV75/heart-A.png',
    'diamonds-2': 'https://i.postimg.cc/3yDKJL8z/diamond-2.png',
    'diamonds-3': 'https://i.postimg.cc/kVtnXjJk/diamond-3.png',
    'diamonds-4': 'https://i.postimg.cc/HJ7psSYq/diamond-4.png',
    'diamonds-5': 'https://i.postimg.cc/kVtnXjM3/diamond-5.png',
    'diamonds-6': 'https://i.postimg.cc/SXzyNZQq/dimond-6.png',
    'diamonds-7': 'https://i.postimg.cc/B81qQhZ4/dimond-7.png',
    'diamonds-8': 'https://i.postimg.cc/yJSVYf68/dimond-8.png',
    'diamonds-9': 'https://i.postimg.cc/TyWRYk2w/dimond-9.png',
    'diamonds-10': 'https://i.postimg.cc/wy89th3z/dimond-10.png',
    'diamonds-11': 'https://i.postimg.cc/wts6TWxY/diamond-J.png',
    'diamonds-12': 'https://i.postimg.cc/rdt8FhyL/diamond-Q.png',
    'diamonds-13': 'https://i.postimg.cc/k637VxD9/dimond-K.png',
    'diamonds-14': 'https://i.postimg.cc/Y4mpqX2c/diamond-A.png',
  },
  JOKER_FRAMES: {
    'big': 'https://i.postimg.cc/nsQHcdFg/big-joker.png',
    'small': 'https://i.postimg.cc/2bQrnVBx/small-joker.png',
  }
};

export const BLINDS_BY_ANTE: Record<number, Blind[]> = {
  1: [
    { 
      id: 'sb1', 
      name: '森林守卫', 
      type: 'Small Blind', 
      targetScore: 300, 
      reward: 3,
      bossImage: 'https://i.postimg.cc/w1WDXBdL/idol-1.png',
      bossDescription: '森林的古老守护者，对换牌行为感到愤怒。'
    },
    { 
      id: 'bb1', 
      name: '熔岩巨人', 
      type: 'Big Blind', 
      targetScore: 450, 
      reward: 4,
      bossImage: 'https://i.postimg.cc/zydTCf1n/idol-2.png',
      bossDescription: '沉睡在火山中的巨人，它的热气会消耗你的资源。'
    },
    { 
      id: 'boss1', 
      name: '虚空领主', 
      type: 'Boss Blind', 
      targetScore: 600, 
      reward: 5,
      bossImage: 'https://i.postimg.cc/87yLRCVR/idol-3.png',
      bossDescription: '来自虚空的统治者，每次换牌都会受到惩罚。',
      bossEffect: (event, state) => {
        if (event.type === 'OnDiscard') {
          return { discardsLeft: state.discardsLeft - 1 };
        }
      }
    },
  ]
};

// Example Jokers
export const ALL_JOKERS: Joker[] = [
  {
    id: 'j1',
    name: '大米歇尔',
    description: '每打出一手牌，威力+2。每回合结束有1/4几率损坏。',
    rarity: 'Common',
    price: 4,
    effect: (event, state) => {
      if (event.type === 'OnHandScored') {
        return { mult: state.mult + 2 };
      }
    }
  },
  {
    id: 'j2',
    name: '偶数史蒂文',
    description: '打出的偶数牌（10, 8, 6, 4, 2）计分时，威力+2。',
    rarity: 'Common',
    price: 4,
    effect: (event, state) => {
      if (event.type === 'OnHandScored') {
        const evenCards = (event.payload.scoringCards as Card[]).filter(c => c.rank % 2 === 0);
        return { mult: state.mult + (evenCards.length * 2) };
      }
    }
  },
  {
    id: 'j3',
    name: '学者',
    description: '打出的 A 计分时，能量+10，威力+2。',
    rarity: 'Common',
    price: 4,
    effect: (event, state) => {
      if (event.type === 'OnHandScored') {
        const aces = (event.payload.scoringCards as Card[]).filter(c => c.rank === 14);
        return { 
          chips: state.chips + (aces.length * 10),
          mult: state.mult + (aces.length * 2)
        };
      }
    }
  },
  {
    id: 'j4',
    name: '蓝色小丑',
    description: '牌库中每剩余一张牌，能量+1。',
    rarity: 'Common',
    price: 5,
    effect: (event, state) => {
      if (event.type === 'OnHandScored') {
        return { chips: state.chips + (state.deck.length * 1) };
      }
    }
  },
  {
    id: 'j5',
    name: '小丑模板',
    description: '每个空的伙伴槽位（包括这张）使威力 X1.15。',
    rarity: 'Uncommon',
    price: 8,
    effect: (event, state) => {
      if (event.type === 'OnHandScored') {
        const emptySlots = state.jokerSlots - state.jokers.length + 1;
        return { mult: state.mult * (1 + 0.15 * emptySlots) };
      }
    }
  },
  {
    id: 'j6',
    name: '横幅',
    description: '每剩余一次换牌机会，能量+20。',
    rarity: 'Common',
    price: 5,
    effect: (event, state) => {
      if (event.type === 'OnHandScored') {
        return { chips: state.chips + (state.discardsLeft * 20) };
      }
    }
  },
  {
    id: 'j7',
    name: '神秘山峰',
    description: '换牌次数为 0 时，威力+8。',
    rarity: 'Common',
    price: 4,
    effect: (event, state) => {
      if (event.type === 'OnHandScored' && state.discardsLeft === 0) {
        return { mult: state.mult + 8 };
      }
    }
  },
  {
    id: 'j8',
    name: '错印',
    description: '随机增加威力（0 到 5）。',
    rarity: 'Common',
    price: 4,
    effect: (event, state) => {
      if (event.type === 'OnHandScored') {
        return { mult: state.mult + Math.floor(Math.random() * 6) };
      }
    }
  },
  {
    id: 'j9',
    name: '钢铁小丑',
    description: '如果牌组包含钢铁牌（黑桃），威力 X1.2。',
    rarity: 'Uncommon',
    price: 7,
    effect: (event, state) => {
      if (event.type === 'OnHandScored') {
        const hasSpade = (event.payload.scoringCards as Card[]).some(c => c.suit === 'spades');
        if (hasSpade) return { mult: state.mult * 1.2 };
      }
    }
  },
  {
    id: 'j10',
    name: '抽象小丑',
    description: '每拥有一张魔法伙伴，威力+2。',
    rarity: 'Common',
    price: 4,
    effect: (event, state) => {
      if (event.type === 'OnHandScored') {
        return { mult: state.mult + (state.jokers.length * 2) };
      }
    }
  },
  {
    id: 'j11',
    name: '双人组',
    description: '如果打出的牌包含对子，威力 X1.5。',
    rarity: 'Rare',
    price: 10,
    effect: (event, state) => {
      if (event.type === 'OnHandScored' && event.payload.handType === 'Pair') {
        return { mult: state.mult * 1.5 };
      }
    }
  },
  {
    id: 'j12',
    name: '三人组',
    description: '如果打出的牌包含三条，威力 X2。',
    rarity: 'Rare',
    price: 12,
    effect: (event, state) => {
      if (event.type === 'OnHandScored' && event.payload.handType === 'Three of a Kind') {
        return { mult: state.mult * 2 };
      }
    }
  },
  {
    id: 'j13',
    name: '四人组',
    description: '如果打出的牌包含四条，威力 X2.5。',
    rarity: 'Rare',
    price: 15,
    effect: (event, state) => {
      if (event.type === 'OnHandScored' && event.payload.handType === 'Four of a Kind') {
        return { mult: state.mult * 2.5 };
      }
    }
  },
  {
    id: 'j14',
    name: '占卜师',
    description: '本轮每使用一张道具卡（这里指每花费 $10），威力+1。',
    rarity: 'Common',
    price: 5,
    effect: (event, state) => {
      if (event.type === 'OnHandScored') {
        return { mult: state.mult + Math.floor((100 - state.money) / 10) }; // Mock logic
      }
    }
  },
  {
    id: 'j15',
    name: '备用玩偶',
    description: '每打出一张 2, 3, 4 或 5，计分时能量+10。',
    rarity: 'Common',
    price: 4,
    effect: (event, state) => {
      if (event.type === 'OnHandScored') {
        const lowCards = (event.payload.scoringCards as Card[]).filter(c => c.rank <= 5);
        return { chips: state.chips + (lowCards.length * 10) };
      }
    }
  }
];
