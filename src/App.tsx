/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RotateCcw, ArrowLeft } from 'lucide-react';
import { 
  Card as CardType, 
  GameState, 
  HandType, 
  Joker, 
  GameEvent, 
  Blind
} from './types';
import { 
  INITIAL_DECK, 
  BLINDS_BY_ANTE, 
  ALL_JOKERS,
  HAND_NAMES
} from './constants';
import { getPokerHand, shuffle } from './utils/poker';

// Components
import { StartScreen } from './components/StartScreen';
import { CustomizeScreen } from './components/CustomizeScreen';
import { GameUI } from './components/GameUI';
import { HandReferenceModal } from './components/HandReferenceModal';
import { ShopModal } from './components/ShopModal';
import { GameOverModal } from './components/GameOverModal';
import { DeckViewModal } from './components/DeckViewModal';
import { ConfirmationModal } from './components/ConfirmationModal';

import { TacticalGame } from './components/TacticalGame/TacticalGame';

type View = 'START' | 'GAME' | 'CUSTOMIZE' | 'TWO_PLAYER';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('START');

  // Handle room query parameter for auto-joining
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('room')) {
      setCurrentView('TWO_PLAYER');
    } else if (currentView === 'START') {
      // If we are on start screen and no room param, ensure URL is clean
      const url = new URL(window.location.href);
      if (url.searchParams.has('room')) {
        url.searchParams.delete('room');
        window.history.replaceState({}, document.title, url.toString());
      }
    }
  }, [currentView]);

  const [customCardImages, setCustomCardImages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('custom-card-images');
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });
  const [customJokerImages, setCustomJokerImages] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('custom-joker-images');
      return saved ? JSON.parse(saved) : {};
    } catch (e) { return {}; }
  });
  const [customBackground, setCustomBackground] = useState<string | null>(() => {
    try {
      return localStorage.getItem('custom-game-background');
    } catch (e) { return null; }
  });
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lastHand, setLastHand] = useState<{ 
    type: HandType; 
    baseChips: number; 
    baseMult: number; 
    finalChips: number; 
    finalMult: number; 
    total: number;
    steps: string[];
  } | null>(null);
  
  const [showHandReference, setShowHandReference] = useState(false);
  const [showDeckView, setShowDeckView] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const targetWidth = 1920;
      const targetHeight = 1080;
      const widthScale = window.innerWidth / targetWidth;
      const heightScale = window.innerHeight / targetHeight;
      setScale(Math.min(widthScale, heightScale));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ensureAnteExists = useCallback((ante: number) => {
    if (!BLINDS_BY_ANTE[ante]) {
      const baseScore = BLINDS_BY_ANTE[1][0].targetScore;
      const targetScore = Math.floor(baseScore * Math.pow(1.5, ante - 1));
      const bossImages = [
        'https://i.postimg.cc/k2jWQ5dN/idol-4.png',
        'https://i.postimg.cc/sMn5Y2RJ/idol-5.png',
        'https://i.postimg.cc/K19tPYyf/idol-6.png'
      ];
      BLINDS_BY_ANTE[ante] = [
        { 
          id: `sb${ante}`, 
          name: `暗影刺客 ${ante}`, 
          type: 'Small Blind', 
          targetScore, 
          reward: 3 + ante,
          bossImage: bossImages[0],
          bossDescription: '潜伏在阴影中的刺客，速度极快。'
        },
        { 
          id: `bb${ante}`, 
          name: `机械巨兽 ${ante}`, 
          type: 'Big Blind', 
          targetScore: Math.floor(targetScore * 1.5), 
          reward: 4 + ante,
          bossImage: bossImages[1],
          bossDescription: '钢铁铸就的怪物，拥有惊人的防御力。'
        },
        { 
          id: `boss${ante}`, 
          name: `邪恶巫师 ${ante}`, 
          type: 'Boss Blind', 
          targetScore: Math.floor(targetScore * 2), 
          reward: 5 + ante,
          bossImage: bossImages[2],
          bossDescription: '掌握禁忌魔法的巫师，会干扰你的卡牌。'
        }
      ];
    }
    return BLINDS_BY_ANTE[ante];
  }, []);

  const startNewRun = useCallback(() => {
    const seed = Math.random().toString(36).substring(7);
    const runDeck = [...INITIAL_DECK];
    const deck = shuffle([...runDeck]);
    const hand = deck.slice(0, 8);
    const remainingDeck = deck.slice(8);

    const initialState: GameState = {
      seed, ante: 1, round: 0, blind: BLINDS_BY_ANTE[1][0],
      chips: 0, mult: 0, currentScore: 0, targetScore: BLINDS_BY_ANTE[1][0].targetScore,
      handsLeft: 4, discardsLeft: 3, money: 4, runDeck, deck: remainingDeck,
      hand, selectedCards: [], jokers: [], jokerSlots: 5, consumables: [],
      consumableSlots: 2, handSize: 8, isShopOpen: false, shopItems: [],
      history: ['战斗开始'],
    };
    setGameState(initialState);
    setIsGameOver(false);
    setLastHand(null);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('joker-poker-run');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as GameState;
        parsed.jokers = (parsed.jokers || []).map(j => {
          const original = ALL_JOKERS.find(oj => oj.id === j.id);
          return original ? { ...original, ...j } : j;
        });
        parsed.shopItems = (parsed.shopItems || []).map(item => {
          const original = ALL_JOKERS.find(oj => oj.id === item.id);
          return original ? { ...original, ...item } : item;
        });
        if (parsed.blind) {
          const anteBlinds = ensureAnteExists(parsed.ante);
          const originalBlind = anteBlinds.find(b => b.id === parsed.blind?.id);
          if (originalBlind) parsed.blind = { ...originalBlind, ...parsed.blind };
        }
        setGameState(parsed);
      } catch (e) { startNewRun(); }
    } else { startNewRun(); }
  }, [startNewRun, ensureAnteExists]);

  useEffect(() => {
    if (gameState) {
      try {
        localStorage.setItem('joker-poker-run', JSON.stringify(gameState));
      } catch (e) {
        console.error('Failed to save game state to localStorage:', e);
      }
    }
  }, [gameState]);

  useEffect(() => {
    try {
      localStorage.setItem('custom-card-images', JSON.stringify(customCardImages));
    } catch (e) {
      console.error('Failed to save custom card images to localStorage:', e);
    }
  }, [customCardImages]);

  useEffect(() => {
    try {
      localStorage.setItem('custom-joker-images', JSON.stringify(customJokerImages));
    } catch (e) {
      console.error('Failed to save custom joker images to localStorage:', e);
    }
  }, [customJokerImages]);

  useEffect(() => {
    try {
      if (customBackground) localStorage.setItem('custom-game-background', customBackground);
      else localStorage.removeItem('custom-game-background');
    } catch (e) {
      console.error('Failed to save custom background to localStorage:', e);
    }
  }, [customBackground]);

  const triggerEvent = useCallback((event: GameEvent, currentState: GameState): GameState => {
    let newState = { ...currentState };
    if (newState.blind?.bossEffect) {
      const bossMod = newState.blind.bossEffect(event, newState);
      if (bossMod) newState = { ...newState, ...bossMod };
    }
    newState.jokers.forEach(joker => {
      const mod = joker.effect(event, newState);
      if (mod) newState = { ...newState, ...mod };
    });
    return newState;
  }, []);

  const potentialScore = useMemo(() => {
    if (!gameState || gameState.selectedCards.length === 0) return null;
    const pokerHand = getPokerHand(gameState.selectedCards);
    const { baseChips, baseMult, cardChips } = pokerHand;
    let currentChips = baseChips + cardChips;
    let currentMult = baseMult;
    let tempState = { ...gameState, chips: currentChips, mult: currentMult };
    
    const bossEffects: any[] = [];
    if (tempState.blind?.bossEffect) {
      const bossMod = tempState.blind.bossEffect({ type: 'OnHandScored', payload: { scoringCards: pokerHand.cards, handType: pokerHand.type } }, tempState);
      if (bossMod) {
        if (bossMod.chips) { bossEffects.push({ name: tempState.blind.name, chips: bossMod.chips - tempState.chips }); tempState.chips = bossMod.chips; }
        if (bossMod.mult) { bossEffects.push({ name: tempState.blind.name, mult: bossMod.mult - tempState.mult }); tempState.mult = bossMod.mult; }
      }
    }

    const jokerEffects: any[] = [];
    tempState.jokers.forEach(joker => {
      const mod = joker.effect({ type: 'OnHandScored', payload: { scoringCards: pokerHand.cards, handType: pokerHand.type } }, tempState);
      if (mod) {
        if (mod.chips !== undefined) { jokerEffects.push({ name: joker.name, chips: mod.chips - tempState.chips }); tempState.chips = mod.chips; }
        if (mod.mult !== undefined) { jokerEffects.push({ name: joker.name, mult: mod.mult - tempState.mult }); tempState.mult = mod.mult; }
      }
    });

    return {
      type: HAND_NAMES[pokerHand.type],
      chips: tempState.chips, mult: tempState.mult,
      total: Math.floor(tempState.chips * tempState.mult),
      bossEffects, jokerEffects
    };
  }, [gameState?.selectedCards, gameState?.jokers, gameState?.blind]);

  const selectCard = (card: CardType) => {
    if (!gameState) return;
    if (lastHand) setLastHand(null);
    const isSelected = gameState.selectedCards.find(c => c.id === card.id);
    if (isSelected) {
      setGameState({ ...gameState, selectedCards: gameState.selectedCards.filter(c => c.id !== card.id) });
    } else if (gameState.selectedCards.length < 5) {
      setGameState({ ...gameState, selectedCards: [...gameState.selectedCards, card] });
    }
  };

  const playHand = () => {
    if (!gameState || gameState.selectedCards.length === 0 || gameState.handsLeft <= 0) return;
    const pokerHand = getPokerHand(gameState.selectedCards);
    const { baseChips, baseMult, cardChips } = pokerHand;
    let currentChips = baseChips + cardChips;
    let currentMult = baseMult;
    const steps: string[] = [`牌型: ${baseChips} x ${baseMult}`];
    if (cardChips > 0) steps.push(`卡牌: +${cardChips} 能量`);

    let tempState = { ...gameState, chips: currentChips, mult: currentMult };
    if (tempState.blind?.bossEffect) {
      const bossMod = tempState.blind.bossEffect({ type: 'OnHandScored', payload: { scoringCards: pokerHand.cards, handType: pokerHand.type } }, tempState);
      if (bossMod) {
        if (bossMod.chips) { steps.push(`首领: ${bossMod.chips - tempState.chips} 能量`); tempState.chips = bossMod.chips; }
        if (bossMod.mult) { steps.push(`首领: ${bossMod.mult - tempState.mult} 威力`); tempState.mult = bossMod.mult; }
      }
    }

    tempState.jokers.forEach(joker => {
      const mod = joker.effect({ type: 'OnHandScored', payload: { scoringCards: pokerHand.cards, handType: pokerHand.type } }, tempState);
      if (mod) {
        if (mod.chips !== undefined) { steps.push(`${joker.name}: ${mod.chips - tempState.chips} 能量`); tempState.chips = mod.chips; }
        if (mod.mult !== undefined) { steps.push(`${joker.name}: ${mod.mult - tempState.mult} 威力`); tempState.mult = mod.mult; }
      }
    });

    const totalScore = Math.floor(tempState.chips * tempState.mult);
    const newTotalScore = gameState.currentScore + totalScore;
    setLastHand({ type: HAND_NAMES[pokerHand.type] as any, baseChips, baseMult, finalChips: tempState.chips, finalMult: tempState.mult, total: totalScore, steps });
    setTimeout(() => setLastHand(null), 3500);

    const playedIds = gameState.selectedCards.map(c => c.id);
    const remainingHand = gameState.hand.filter(c => !playedIds.includes(c.id));
    const cardsToDrawCount = gameState.handSize - remainingHand.length;
    const drawn = gameState.deck.slice(0, cardsToDrawCount);
    const newDeck = gameState.deck.slice(cardsToDrawCount);
    const newHand = [...remainingHand, ...drawn];

    const nextState: GameState = { ...gameState, currentScore: newTotalScore, handsLeft: gameState.handsLeft - 1, hand: newHand, deck: newDeck, selectedCards: [] };
    if (newTotalScore >= gameState.targetScore) setTimeout(() => winRound(nextState), 1500);
    else if (nextState.handsLeft <= 0) setIsGameOver(true);
    else setGameState(nextState);
  };

  const discardCards = () => {
    if (!gameState || gameState.selectedCards.length === 0 || gameState.discardsLeft <= 0) return;
    if (lastHand) setLastHand(null);
    const discardedIds = gameState.selectedCards.map(c => c.id);
    const remainingHand = gameState.hand.filter(c => !discardedIds.includes(c.id));
    const cardsToDrawCount = gameState.handSize - remainingHand.length;
    const drawn = gameState.deck.slice(0, cardsToDrawCount);
    const newDeck = gameState.deck.slice(cardsToDrawCount);
    const stateAfterEvent = triggerEvent({ type: 'OnDiscard' }, gameState);
    setGameState({ ...stateAfterEvent, discardsLeft: stateAfterEvent.discardsLeft - 1, hand: [...remainingHand, ...drawn], deck: shuffle(newDeck), selectedCards: [] });
  };

  const winRound = (state: GameState) => {
    const baseReward = state.blind?.reward || 0;
    const handsBonus = state.handsLeft;
    setGameState({ ...state, money: state.money + baseReward + handsBonus, isShopOpen: true, shopItems: generateShopItems(), lastRoundReward: { base: baseReward, bonus: handsBonus }, history: [...state.history, `击败BOSS! +$${baseReward + handsBonus}`] });
    setLastHand(null);
  };

  const generateShopItems = () => {
    const pool = [...ALL_JOKERS];
    const items: Joker[] = [];
    for (let i = 0; i < 3; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      items.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return items;
  };

  const buyItem = (item: Joker) => {
    if (!gameState || gameState.money < item.price || gameState.jokers.length >= gameState.jokerSlots) return;
    setGameState({ ...gameState, money: gameState.money - item.price, jokers: [...gameState.jokers, item], shopItems: gameState.shopItems.filter(i => i.id !== item.id) });
  };

  const rerollShop = () => {
    if (!gameState || gameState.money < 2) return;
    setGameState({ ...gameState, money: gameState.money - 2, shopItems: generateShopItems() });
  };

  const nextRound = () => {
    if (!gameState) return;
    const anteBlinds = ensureAnteExists(gameState.ante);
    const currentBlindIndex = anteBlinds.findIndex(b => b.id === gameState.blind?.id);
    let nextBlind: Blind;
    let nextAnte = gameState.ante;
    if (currentBlindIndex !== -1 && currentBlindIndex < 2) nextBlind = anteBlinds[currentBlindIndex + 1];
    else { nextAnte += 1; nextBlind = ensureAnteExists(nextAnte)[0]; }
    const deck = shuffle([...gameState.runDeck]);
    setGameState({ ...gameState, ante: nextAnte, round: gameState.round + 1, blind: nextBlind, targetScore: nextBlind.targetScore, currentScore: 0, handsLeft: 4, discardsLeft: 3, deck: deck.slice(gameState.handSize), hand: deck.slice(0, gameState.handSize), selectedCards: [], isShopOpen: false });
  };

  if (currentView === 'START') return (
    <StartScreen 
      onStartGame={(mode) => {
        if (mode === 'SINGLE') setCurrentView('GAME');
        else setCurrentView('TWO_PLAYER');
      }} 
      onCustomize={() => setCurrentView('CUSTOMIZE')} 
    />
  );
  if (currentView === 'CUSTOMIZE') return <CustomizeScreen onBack={() => setCurrentView('START')} customCardImages={customCardImages} setCustomCardImages={setCustomCardImages} customJokerImages={customJokerImages} setCustomJokerImages={setCustomJokerImages} customBackground={customBackground} setCustomBackground={setCustomBackground} />;
  if (currentView === 'TWO_PLAYER') return <TacticalGame onExit={() => setCurrentView('START')} />;
  if (!gameState) return null;

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 flex items-center justify-center">
      <GameUI 
        gameState={gameState} scale={scale} onExit={() => setShowExitConfirm(true)} onRestart={() => setShowRestartConfirm(true)}
        onShowHandReference={() => setShowHandReference(true)} onSelectCard={selectCard} onPlayHand={playHand} onDiscard={discardCards}
        onShowDeckView={() => setShowDeckView(true)} lastHand={lastHand} setLastHand={setLastHand} potentialScore={potentialScore}
        customCardImages={customCardImages} customJokerImages={customJokerImages}
        customBackground={customBackground}
      />
      <HandReferenceModal isOpen={showHandReference} onClose={() => setShowHandReference(false)} />
      <ShopModal gameState={gameState} onReroll={rerollShop} onBuyItem={buyItem} onNextRound={nextRound} customJokerImages={customJokerImages} />
      <GameOverModal isGameOver={isGameOver} gameState={gameState} onRestart={startNewRun} />
      <DeckViewModal isOpen={showDeckView} onClose={() => setShowDeckView(false)} gameState={gameState} />
      <ConfirmationModal 
        isOpen={showRestartConfirm} onClose={() => setShowRestartConfirm(false)} onConfirm={() => { startNewRun(); setShowRestartConfirm(false); }}
        title="重新开始吗？" description="你当前的进度、魔法伙伴和牌组都将永久丢失。" confirmText="重新开始" cancelText="取消" icon={RotateCcw} iconColor="text-red-500" confirmColor="bg-red-600"
      />
      <ConfirmationModal 
        isOpen={showExitConfirm} onClose={() => setShowExitConfirm(false)} onConfirm={() => { setShowExitConfirm(false); setCurrentView('START'); }}
        title="退出到主菜单？" description="您的游戏进度已自动保存。" confirmText="确认退出" cancelText="取消" icon={ArrowLeft} iconColor="text-blue-500" confirmColor="bg-blue-600"
      />
    </div>
  );
}
