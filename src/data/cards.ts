import { TacticalCard } from '../types';

export const CARD_POOL: Record<string, TacticalCard> = {
  militia: {
    id: 'militia',
    name: '民兵',
    type: 'unit',
    cost: 1,
    atk: 1,
    hp: 2,
    maxHp: 2,
    description: '基础单位，保家卫国。',
    image: 'https://i.postimg.cc/k2jWQ5dN/idol-4.png'
  },
  spearman: {
    id: 'spearman',
    name: '步兵',
    type: 'unit',
    cost: 2,
    atk: 2,
    hp: 3,
    maxHp: 3,
    description: '训练有素的步兵。',
    image: 'https://i.postimg.cc/sMn5Y2RJ/idol-5.png'
  },
  shield: {
    id: 'shield',
    name: '盾卫',
    type: 'unit',
    cost: 2,
    atk: 1,
    hp: 5,
    maxHp: 5,
    description: '坚如磐石，难以撼动。',
    image: 'https://i.postimg.cc/K19tPYyf/idol-6.png'
  },
  archer: {
    id: 'archer',
    name: '弓手',
    type: 'unit',
    cost: 3,
    atk: 3,
    hp: 2,
    maxHp: 2,
    description: '百步穿杨，远程打击。',
    image: 'https://i.postimg.cc/k2jWQ5dN/idol-4.png'
  },
  cavalry: {
    id: 'cavalry',
    name: '骑兵',
    type: 'unit',
    cost: 4,
    atk: 4,
    hp: 4,
    maxHp: 4,
    description: '冲锋陷阵，势不可挡。',
    image: 'https://i.postimg.cc/sMn5Y2RJ/idol-5.png'
  },
  general: {
    id: 'general',
    name: '猛将',
    type: 'unit',
    cost: 5,
    atk: 5,
    hp: 6,
    maxHp: 6,
    description: '万夫不当之勇。',
    image: 'https://i.postimg.cc/k2jWQ5dN/idol-4.png'
  },
  hero: {
    id: 'hero',
    name: '传奇英雄',
    type: 'unit',
    cost: 7,
    atk: 8,
    hp: 8,
    maxHp: 8,
    description: '战场上的主宰。',
    image: 'https://i.postimg.cc/K19tPYyf/idol-6.png'
  },
  spear_equip: {
    id: 'spear_equip',
    name: '神兵利器',
    type: 'equipment',
    cost: 1,
    description: '装备：攻击 +2。',
    image: 'https://i.postimg.cc/k2jWQ5dN/idol-4.png'
  },
  armor_equip: {
    id: 'armor_equip',
    name: '重铠',
    type: 'equipment',
    cost: 2,
    description: '装备：生命 +3。',
    image: 'https://i.postimg.cc/sMn5Y2RJ/idol-5.png'
  },
  drum: {
    id: 'drum',
    name: '战鼓',
    type: 'unit',
    cost: 2,
    atk: 0,
    hp: 3,
    maxHp: 3,
    description: '支援：每回合开始额外获得 1 点资源。',
    image: 'https://i.postimg.cc/sMn5Y2RJ/idol-5.png'
  },
  fire_spell: {
    id: 'fire_spell',
    name: '火攻',
    type: 'spell',
    cost: 3,
    description: '术法：对一个敌方单位造成 4 点伤害。',
    image: 'https://i.postimg.cc/K19tPYyf/idol-6.png'
  },
  order_spell: {
    id: 'order_spell',
    name: '号令',
    type: 'spell',
    cost: 3,
    description: '术法：己方全体单位本回合攻击 +2。',
    image: 'https://i.postimg.cc/k2jWQ5dN/idol-4.png'
  },
  heal_spell: {
    id: 'heal_spell',
    name: '甘露',
    type: 'spell',
    cost: 2,
    description: '术法：恢复主帅 5 点生命。',
    image: 'https://i.postimg.cc/sMn5Y2RJ/idol-5.png'
  }
};

export const createDeck = (isRed: boolean): TacticalCard[] => {
  const prefix = isRed ? 'red' : 'blue';
  
  const lowCost: TacticalCard[] = [];
  const midCost: TacticalCard[] = [];
  const highCost: TacticalCard[] = [];

  // Categorize cards by cost
  Object.values(CARD_POOL).forEach((baseCard, i) => {
    const card = { ...baseCard, id: `${prefix}-${baseCard.id}-${i}` };
    if (card.cost <= 2) {
      for (let j = 0; j < 3; j++) lowCost.push({ ...card, id: `${card.id}-${j}` });
    } else if (card.cost <= 4) {
      for (let j = 0; j < 2; j++) midCost.push({ ...card, id: `${card.id}-${j}` });
    } else {
      for (let j = 0; j < 2; j++) highCost.push({ ...card, id: `${card.id}-${j}` });
    }
  });

  // Shuffle each category
  const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);
  shuffle(lowCost);
  shuffle(midCost);
  shuffle(highCost);

  // Construct progressive deck: mostly low at start, then mid, then high
  return [...lowCost, ...midCost, ...highCost];
};
