import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Swords, 
  Hand, 
  RotateCcw, 
  ArrowLeft, 
  Zap, 
  Heart, 
  ScrollText, 
  Trophy,
  History,
  Copy,
  Check,
  Users,
  User,
  X,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { TacticalCard, TacticalGameState, TacticalPlayer, RoomInfo } from '../../types';
import { createDeck, CARD_POOL } from '../../data/cards';
import { GameCard } from '../GameCard';
import { io, Socket } from 'socket.io-client';
import { customAlphabet } from 'nanoid';
const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 6);

interface TacticalGameProps {
  onExit: () => void;
}

export const TacticalGame: React.FC<TacticalGameProps> = ({ onExit }) => {
  const [player, setPlayer] = useState<TacticalPlayer>({
    id: 'player1',
    name: '红方玩家',
    hp: 20,
    maxHp: 20,
    mana: 0,
    maxMana: 0,
    hand: [],
    deck: [],
    discard: [],
    slots: [null, null, null, null]
  });
  const [ai, setAi] = useState<TacticalPlayer>({
    id: 'player2',
    name: '蓝方玩家',
    hp: 20,
    maxHp: 20,
    mana: 0,
    maxMana: 0,
    hand: [],
    deck: [],
    discard: [],
    slots: [null, null, null, null]
  });
  const [gameState, setGameState] = useState<TacticalGameState>({
    turn: 0,
    currentPlayer: 'player2',
    phase: 'main',
    winner: null
  });
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [gameMode, setGameMode] = useState<'single' | 'multi' | null>(null);
  const [spellAnimation, setSpellAnimation] = useState<{ name: string; targets: number[]; isEnemy: boolean } | null>(null);
  const [combatAnimation, setCombatAnimation] = useState<{ slot: number; type: string; damageP1?: number; damageP2?: number } | null>(null);
  const [activeCombatSlot, setActiveCombatSlot] = useState<number | null>(null);
  
  // Multiplayer state
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const roomInfoRef = useRef<RoomInfo | null>(null);
  const [isWaitingForPlayer, setIsWaitingForPlayer] = useState(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [copied, setCopied] = useState(false);
  const [sharedAppUrl, setSharedAppUrl] = useState<string>('');
  const [socketServerUrl, setSocketServerUrl] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error' | 'connecting'>('disconnected');
  const [lastError, setLastError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const toSharedUrl = (url: string) => {
    if (!url) return '';
    // AI Studio pattern: dev URL has -dev-, shared URL has -pre-
    // Also handle ais-dev- to ais-pre-
    let normalized = url.replace('ais-dev-', 'ais-pre-').replace('-dev-', '-pre-');
    // Ensure no trailing slash for consistency
    if (normalized.endsWith('/')) normalized = normalized.slice(0, -1);
    return normalized;
  };

  // Fetch config
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        console.log('Fetched config:', data);
        const normalizedSharedUrl = toSharedUrl(data.sharedAppUrl || window.location.origin);
        console.log('Normalized Shared URL:', normalizedSharedUrl);
        setSharedAppUrl(normalizedSharedUrl);
        setSocketServerUrl(normalizedSharedUrl); // Force socketServerUrl = sharedAppUrl
      })
      .catch(err => {
        console.warn('Failed to fetch config, falling back to normalized local origin:', err);
        const fallbackUrl = toSharedUrl(window.location.origin);
        setSharedAppUrl(fallbackUrl);
        setSocketServerUrl(fallbackUrl);
      });
  }, []);

  // Socket connection
  useEffect(() => {
    if (!socketServerUrl) return;

    console.log('Initializing socket connection to:', socketServerUrl);
    setConnectionStatus('connecting');
    
    const socket = io(socketServerUrl, {
      path: "/socket.io/",
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      withCredentials: false,
      forceNew: true
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setLastError(err.message);
      setConnectionStatus('error');
    });

    socket.on('room_created', ({ roomId, role }) => {
      console.log('Room created:', roomId, role);
      setIsCreatingRoom(false);
      setRoomInfo({ roomId, role });
      setGameMode('multi');
      setIsWaitingForPlayer(true);
      addLog('房间已创建，等待对手加入...');
    });

    socket.on('room_joined', ({ roomId, role }) => {
      console.log('Room joined:', roomId, role);
      setRoomInfo({ roomId, role });
      setGameMode('multi');
      setIsWaitingForPlayer(true);
      addLog('成功加入房间，等待对战开始...');
      
      // Clear the query parameter to avoid re-joining on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('room');
      window.history.replaceState({}, document.title, url.toString());
    });

    socket.on('player_joined', ({ playerCount }) => {
      if (playerCount === 2) {
        addLog('对手已加入，对战开始！');
        setIsSyncing(true);
        
        const currentRoomInfo = roomInfoRef.current;
        if (currentRoomInfo?.role === 'host') {
          setIsWaitingForPlayer(false);
          setIsSyncing(false);
          handleStartMultiPlayer();
        }
      }
    });

    socket.on('state_updated', (state: any) => {
      console.log('State updated from host');
      const currentRoomInfo = roomInfoRef.current;
      if (currentRoomInfo?.role === 'guest') {
        setPlayer(state.ai);
        setAi(state.player);
        setIsWaitingForPlayer(false);
        setIsSyncing(false);
      } else {
        setPlayer(state.player);
        setAi(state.ai);
      }
      setGameState(state.gameState);
    });

    socket.on('remote_action', (action: any) => {
      if (action.type === 'spell') {
        setSpellAnimation({ 
          name: action.card.id.includes('fire') ? '火攻' : '号令', 
          targets: action.targets, 
          isEnemy: true 
        });
        setTimeout(() => setSpellAnimation(null), 800);
      }
    });

    socket.on('player_left', () => {
      addLog('对手已离开房间');
      setIsWaitingForPlayer(true);
    });

    socket.on('error', (msg) => {
      setIsCreatingRoom(false);
      setRoomError(msg);
    });

    return () => {
      socket.disconnect();
    };
  }, [socketServerUrl]);

  const createRoom = () => {
    // If we are on dev/private instance, redirect to shared instance to create room
    const currentOrigin = window.location.origin.replace(/\/$/, '');
    const targetOrigin = sharedAppUrl.replace(/\/$/, '');
    
    if (targetOrigin && currentOrigin !== targetOrigin) {
      console.log('Redirecting to shared instance for room creation:', targetOrigin);
      window.location.href = `${targetOrigin}/?createRoom=1`;
      return;
    }

    if (connectionStatus !== 'connected') {
      setRoomError('服务器连接中，请稍后再试...');
      return;
    }

    setRoomError(null);
    setIsCreatingRoom(true);
    const id = nanoid();
    console.log('Emitting create_room:', id);
    socketRef.current?.emit('create_room', { roomId: id });
  };

  const joinRoom = useCallback((id: string) => {
    console.log('Attempting to join room:', id, 'Connection status:', connectionStatus);
    if (connectionStatus !== 'connected') {
      setRoomError('服务器连接中，请稍后再试...');
      return;
    }

    setRoomError(null);
    const trimmedId = id.trim();
    socketRef.current?.emit('join_room', { roomId: trimmedId });
  }, [connectionStatus]);

  useEffect(() => {
    roomInfoRef.current = roomInfo;
  }, [roomInfo]);

  // Handle room query parameter
  useEffect(() => {
    // Only process query params once connected
    if (connectionStatus !== 'connected') return;

    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room');
    const shouldCreate = params.get('createRoom') === '1';

    if (shouldCreate) {
      console.log('Auto-creating room from URL parameter');
      // Clear the query parameter to avoid re-creating on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('createRoom');
      window.history.replaceState({}, document.title, url.toString());
      
      // Small delay to ensure everything is stable
      const timer = setTimeout(() => {
        createRoom();
      }, 300);
      return () => clearTimeout(timer);
    } else if (roomId) {
      setJoinRoomId(roomId);
      console.log('Joining room from URL:', roomId);
      // Add a tiny delay to ensure socket is ready for emission
      const timer = setTimeout(() => {
        joinRoom(roomId);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [connectionStatus, joinRoom]); // Added connectionStatus as dependency

  const addLog = (msg: string) => {
    setHistory(prev => [msg, ...prev].slice(0, 50));
  };

  const syncState = (updatedPlayer: TacticalPlayer, updatedAi: TacticalPlayer, updatedGameState: TacticalGameState) => {
    if (!roomInfo) return;
    
    const stateToSend = roomInfo.role === 'host' 
      ? { player: updatedPlayer, ai: updatedAi, gameState: updatedGameState }
      : { player: updatedAi, ai: updatedPlayer, gameState: updatedGameState };

    socketRef.current?.emit('sync_state', { roomId: roomInfo.roomId, state: stateToSend });
  };

  const getNextTurnState = (
    currentPlayer: 'player1' | 'player2',
    p1: TacticalPlayer,
    p2: TacticalPlayer,
    currentGameState: TacticalGameState
  ) => {
    const isPlayer1 = currentPlayer === 'player1';
    const nextTurn = isPlayer1 ? currentGameState.turn + 1 : currentGameState.turn;
    
    const updatePlayer = (p: TacticalPlayer) => {
      const nextMaxMana = Math.min(p.maxMana + 1, 10);
      const hasDrum = p.slots.some(s => s?.id.includes('drum'));
      const bonusMana = hasDrum ? 1 : 0;
      return {
        ...p,
        maxMana: nextMaxMana,
        mana: Math.min(nextMaxMana + bonusMana, 11),
      };
    };

    let nextP1 = { ...p1 };
    let nextP2 = { ...p2 };

    if (isPlayer1) {
      nextP1 = updatePlayer(p1);
      if (nextP1.deck.length > 0) {
        const newDeck = [...nextP1.deck];
        const newCard = newDeck.shift()!;
        nextP1.hand = [...nextP1.hand, newCard];
        nextP1.deck = newDeck;
      }
    } else {
      nextP2 = updatePlayer(p2);
      if (nextP2.deck.length > 0) {
        const newDeck = [...nextP2.deck];
        const newCard = newDeck.shift()!;
        nextP2.hand = [...nextP2.hand, newCard];
        nextP2.deck = newDeck;
      }
    }

    const nextGameState: TacticalGameState = {
      ...currentGameState,
      turn: nextTurn,
      currentPlayer,
      phase: 'main'
    };

    return { nextP1, nextP2, nextGameState };
  };

  // Start Game
  const handleStartSinglePlayer = () => {
    setGameMode('single');
    setRoomInfo({ roomId: 'SINGLE_PLAYER', role: 'host' });
    
    const playerDeck = createDeck(true);
    const aiDeck = createDeck(false);
    const playerHand = playerDeck.splice(0, 5);
    const aiHand = aiDeck.splice(0, 5);

    const initialPlayer: TacticalPlayer = { 
      id: 'player1',
      name: '红方玩家',
      hp: 20,
      maxHp: 20,
      mana: 0,
      maxMana: 0,
      hand: playerHand,
      deck: playerDeck,
      discard: [],
      slots: [null, null, null, null]
    };
    const initialAi: TacticalPlayer = { 
      id: 'player2',
      name: '蓝方玩家 (AI)',
      hp: 20,
      maxHp: 20,
      mana: 0,
      maxMana: 0,
      hand: aiHand,
      deck: aiDeck,
      discard: [],
      slots: [null, null, null, null]
    };
    const initialGameState: TacticalGameState = { turn: 0, currentPlayer: 'player2', phase: 'main', winner: null };

    const { nextP1, nextP2, nextGameState } = getNextTurnState('player1', initialPlayer, initialAi, initialGameState);
    
    setPlayer(nextP1);
    setAi(nextP2);
    setGameState(nextGameState);
    addLog('单人模式开始！');
  };

  const handleStartMultiPlayer = () => {
    setGameMode('multi');
    
    const playerDeck = createDeck(true);
    const aiDeck = createDeck(false);
    const playerHand = playerDeck.splice(0, 5);
    const aiHand = aiDeck.splice(0, 5);

    const initialPlayer: TacticalPlayer = { 
      id: 'player1',
      name: '红方玩家 (Host)',
      hp: 20,
      maxHp: 20,
      mana: 0,
      maxMana: 0,
      hand: playerHand,
      deck: playerDeck,
      discard: [],
      slots: [null, null, null, null]
    };
    const initialAi: TacticalPlayer = { 
      id: 'player2',
      name: '蓝方玩家 (Guest)',
      hp: 20,
      maxHp: 20,
      mana: 0,
      maxMana: 0,
      hand: aiHand,
      deck: aiDeck,
      discard: [],
      slots: [null, null, null, null]
    };
    const initialGameState: TacticalGameState = { turn: 0, currentPlayer: 'player2', phase: 'main', winner: null };

    const { nextP1, nextP2, nextGameState } = getNextTurnState('player1', initialPlayer, initialAi, initialGameState);
    
    setPlayer(nextP1);
    setAi(nextP2);
    setGameState(nextGameState);
    
    const currentRoomInfo = roomInfoRef.current;
    if (currentRoomInfo) {
      socketRef.current?.emit('sync_state', { roomId: currentRoomInfo.roomId, state: { player: nextP1, ai: nextP2, gameState: nextGameState } });
    }
  };

  // Gameplay Actions
  const handlePlayCard = (slotIndex: number) => {
    const isMyTurn = (roomInfo?.role === 'host' && gameState.currentPlayer === 'player1') || 
                    (roomInfo?.role === 'guest' && gameState.currentPlayer === 'player2');
    
    if (!isMyTurn || selectedCardIndex === null || isProcessing || gameState.phase !== 'main') return;

    const card = player.hand[selectedCardIndex];
    if (card.cost > player.mana) {
      addLog('资源不足！');
      return;
    }

    let updatedPlayer = { ...player };
    let updatedAi = { ...ai };

    if (card.type === 'unit') {
      if (player.slots[slotIndex] !== null) return;
      const newSlots = [...player.slots];
      newSlots[slotIndex] = { ...card };
      const newHand = [...player.hand];
      newHand.splice(selectedCardIndex, 1);
      updatedPlayer = { ...player, slots: newSlots, hand: newHand, mana: player.mana - card.cost };
      addLog(`你派遣了：${card.name}`);
    } else if (card.type === 'equipment') {
      const target = player.slots[slotIndex];
      if (!target) return;
      const newSlots = [...player.slots];
      const bonusAtk = card.id.includes('spear') ? 2 : 0;
      const bonusHp = card.id.includes('armor') ? 3 : 0;
      newSlots[slotIndex] = { 
        ...target, 
        atk: (target.atk || 0) + bonusAtk, 
        hp: (target.hp || 0) + bonusHp,
        maxHp: (target.maxHp || 0) + bonusHp,
        name: `${target.name}(${card.name.slice(0, 1)})` 
      };
      const newHand = [...player.hand];
      newHand.splice(selectedCardIndex, 1);
      updatedPlayer = { ...player, slots: newSlots, hand: newHand, mana: player.mana - card.cost };
      addLog(`你使用了装备：${card.name}`);
    }

    setPlayer(updatedPlayer);
    setSelectedCardIndex(null);
    syncState(updatedPlayer, updatedAi, gameState);
  };

  const handleSpell = async (card: TacticalCard, index: number) => {
    const isMyTurn = (roomInfo?.role === 'host' && gameState.currentPlayer === 'player1') || 
                    (roomInfo?.role === 'guest' && gameState.currentPlayer === 'player2');
    
    if (!isMyTurn || isProcessing || gameState.phase !== 'main') return;
    if (card.cost > player.mana) return;

    setIsProcessing(true);
    try {
      let updatedPlayer = { ...player };
      let updatedAi = { ...ai };

      if (card.id.includes('fire')) {
        const enemyIndex = ai.slots.findIndex(s => s !== null);
        if (enemyIndex === -1) {
          return;
        }
        
        setSpellAnimation({ 
          name: '火攻', 
          targets: [enemyIndex], 
          isEnemy: false 
        });

        await new Promise(resolve => setTimeout(resolve, 800));

        const newAiSlots = [...ai.slots];
        const target = { ...newAiSlots[enemyIndex]! };
        target.hp! -= 4;
        const isKilled = target.hp! <= 0;
        newAiSlots[enemyIndex] = isKilled ? null : target;
        
        const newHand = [...player.hand];
        newHand.splice(index, 1);
        updatedAi = { ...ai, slots: newAiSlots };
        updatedPlayer = { ...player, hand: newHand, mana: player.mana - card.cost };
        addLog(`你使用术法：火攻！对敌方 ${target.name} 造成 4 点伤害${isKilled ? '并将其击败！' : ''}`);
      } else if (card.id.includes('order')) {
        setSpellAnimation({ 
          name: '号令', 
          targets: [0, 1, 2, 3], 
          isEnemy: false 
        });

        await new Promise(resolve => setTimeout(resolve, 800));

        const newSlots = player.slots.map(s => s ? { ...s, atk: (s.atk || 0) + 2, name: `${s.name}(号令)` } : null);
        const newHand = [...player.hand];
        newHand.splice(index, 1);
        updatedPlayer = { ...player, slots: newSlots, hand: newHand, mana: player.mana - card.cost };
        addLog('你使用术法：号令！己方全体攻击 +2');
      } else if (card.id.includes('heal')) {
        setSpellAnimation({ 
          name: '甘露', 
          targets: [], 
          isEnemy: false 
        });

        await new Promise(resolve => setTimeout(resolve, 800));

        const newHp = Math.min(player.hp + 5, player.maxHp);
        const newHand = [...player.hand];
        newHand.splice(index, 1);
        updatedPlayer = { ...player, hp: newHp, hand: newHand, mana: player.mana - card.cost };
        addLog('你使用术法：甘露！恢复了 5 点生命值');
      }

      setPlayer(updatedPlayer);
      setAi(updatedAi);
      setSelectedCardIndex(null);
      setSpellAnimation(null);
      
      socketRef.current?.emit('remote_action', { 
        roomId: (roomInfo as any)?.id || roomInfo?.roomId, 
        action: { type: 'spell', card, targets: card.id.includes('fire') ? [ai.slots.findIndex(s => s !== null)] : [0, 1, 2, 3] } 
      });
      
      syncState(updatedPlayer, updatedAi, gameState);
    } finally {
      setIsProcessing(false);
    }
  };

  const endTurn = () => {
    const isMyTurn = (roomInfo?.role === 'host' && gameState.currentPlayer === 'player1') || 
                    (roomInfo?.role === 'guest' && gameState.currentPlayer === 'player2');
    
    if (!isMyTurn || isProcessing || gameState.phase !== 'main') return;
    
    const isHost = roomInfo?.role === 'host' || gameMode === 'single';
    resolveBattle(isHost ? player : ai, isHost ? ai : player, gameState);
  };

  const resolveBattle = async (p1State?: TacticalPlayer, p2State?: TacticalPlayer, gsState?: TacticalGameState) => {
    setIsProcessing(true);
    try {
      const currentGS = gsState || gameState;
      setGameState(prev => ({ ...prev, phase: 'battle' }));
      addLog('进入战斗阶段...');

      const isHost = roomInfo?.role === 'host' || gameMode === 'single';
      let p1 = p1State ? { ...p1State } : (isHost ? { ...player } : { ...ai });
      let p2 = p2State ? { ...p2State } : (isHost ? { ...ai } : { ...player });

      const p1Slots = [...p1.slots];
      const p2Slots = [...p2.slots];
      let currentP1Hp = p1.hp;
      let currentP2Hp = p2.hp;

      for (let i = 0; i < 4; i++) {
        const p1Unit = p1Slots[i];
        const p2Unit = p2Slots[i];

        if (!p1Unit && !p2Unit) continue;

        setActiveCombatSlot(i);
        await new Promise(resolve => setTimeout(resolve, 600));

        if (p1Unit && p2Unit) {
          const d1 = p2Unit.atk!;
          const d2 = p1Unit.atk!;
          
          setCombatAnimation({ slot: i, type: 'both-attack', damageP1: d1, damageP2: d2 });
          addLog(`第 ${i+1} 路：${p1Unit.name} 与 ${p2Unit.name} 激战！`);
          
          await new Promise(resolve => setTimeout(resolve, 400));

          const newP1Unit = { ...p1Unit, hp: p1Unit.hp! - d1 };
          const newP2Unit = { ...p2Unit, hp: p2Unit.hp! - d2 };
          
          p1Slots[i] = newP1Unit.hp! <= 0 ? null : newP1Unit;
          p2Slots[i] = newP2Unit.hp! <= 0 ? null : newP2Unit;
        } else if (p1Unit && !p2Unit) {
          const dmg = p1Unit.atk!;
          setCombatAnimation({ slot: i, type: 'p1-direct', damageP2: dmg });
          currentP2Hp -= dmg;
          addLog(`第 ${i+1} 路：${p1Unit.name} 直接攻击蓝方！造成 ${dmg} 点伤害`);
          await new Promise(resolve => setTimeout(resolve, 800));
        } else if (!p1Unit && p2Unit) {
          const dmg = p2Unit.atk!;
          setCombatAnimation({ slot: i, type: 'p2-direct', damageP1: dmg });
          currentP1Hp -= dmg;
          addLog(`第 ${i+1} 路：${p2Unit.name} 直接攻击红方！造成 ${dmg} 点伤害`);
          await new Promise(resolve => setTimeout(resolve, 800));
        }

        const tempP1 = { ...p1, hp: Math.max(0, currentP1Hp), slots: [...p1Slots] };
        const tempP2 = { ...p2, hp: Math.max(0, currentP2Hp), slots: [...p2Slots] };
        
        if (isHost) {
          setPlayer(tempP1);
          setAi(tempP2);
        } else {
          setPlayer(tempP2);
          setAi(tempP1);
        }
        
        setCombatAnimation(null);
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      setActiveCombatSlot(null);
      p1.hp = Math.max(0, currentP1Hp);
      p1.slots = p1Slots;
      p2.hp = Math.max(0, currentP2Hp);
      p2.slots = p2Slots;

      let winner: 'player1' | 'player2' | null = null;
      if (p1.hp <= 0) winner = 'player2';
      else if (p2.hp <= 0) winner = 'player1';

      const nextPlayer = currentGS.currentPlayer === 'player1' ? 'player2' : 'player1';
      
      if (winner) {
        const nextGameState: TacticalGameState = { ...currentGS, winner, currentPlayer: nextPlayer, phase: 'main' };
        setGameState(nextGameState);
        if (gameMode === 'multi') syncState(isHost ? p1 : p2, isHost ? p2 : p1, nextGameState);
        setIsProcessing(false);
        return;
      } else {
        const { nextP1, nextP2, nextGameState } = getNextTurnState(nextPlayer, p1, p2, currentGS);
        setGameState(nextGameState);
        if (isHost) {
          setPlayer(nextP1);
          setAi(nextP2);
          if (gameMode === 'multi') syncState(nextP1, nextP2, nextGameState);
        } else {
          setPlayer(nextP2);
          setAi(nextP1);
          if (gameMode === 'multi') syncState(nextP2, nextP1, nextGameState);
        }
        
        if (gameMode === 'single' && nextPlayer === 'player2') {
          await handleAiTurn(nextP2, nextP1, nextGameState);
        } else {
          setIsProcessing(false);
        }
      }
    } catch (err) {
      console.error("Battle resolution error:", err);
      setIsProcessing(false);
    }
  };

  const handleAiTurn = async (aiPlayer: TacticalPlayer, humanPlayer: TacticalPlayer, currentGameState: TacticalGameState) => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      let updatedAi = { ...aiPlayer };
      let updatedHuman = { ...humanPlayer };

      const playableUnits = updatedAi.hand.filter(c => c.type === 'unit' && c.cost <= updatedAi.mana);
      for (const card of playableUnits) {
        const emptySlot = updatedAi.slots.findIndex(s => s === null);
        if (emptySlot !== -1 && updatedAi.mana >= card.cost) {
          const newSlots = [...updatedAi.slots];
          newSlots[emptySlot] = { ...card };
          const newHand = updatedAi.hand.filter(c => c.id !== card.id);
          updatedAi = { ...updatedAi, slots: newSlots, hand: newHand, mana: updatedAi.mana - card.cost };
          addLog(`对手出牌：${card.name}`);
          await new Promise(resolve => setTimeout(resolve, 800));
          setAi(updatedAi);
        }
      }

      const playableEquip = updatedAi.hand.filter(c => c.type === 'equipment' && c.cost <= updatedAi.mana);
      for (const card of playableEquip) {
        const targetSlot = updatedAi.slots.findIndex(s => s !== null);
        if (targetSlot !== -1 && updatedAi.mana >= card.cost) {
          const newSlots = [...updatedAi.slots];
          const target = newSlots[targetSlot]!;
          newSlots[targetSlot] = { ...target, atk: (target.atk || 0) + 1, name: `${target.name}(强)` };
          const newHand = updatedAi.hand.filter(c => c.id !== card.id);
          updatedAi = { ...updatedAi, slots: newSlots, hand: newHand, mana: updatedAi.mana - card.cost };
          addLog(`对手使用装备：${card.name}`);
          await new Promise(resolve => setTimeout(resolve, 800));
          setAi(updatedAi);
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      await resolveBattle(updatedHuman, updatedAi, currentGameState);
    } catch (err) {
      console.error("AI turn error:", err);
      setIsProcessing(false);
    }
  };

  const copyInviteLink = () => {
    if (!roomInfo) return;
    const baseUrl = sharedAppUrl || window.location.origin;
    const url = `${baseUrl}/?room=${roomInfo.roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // UI Helpers
  if (!gameMode) {
    const isWrongOrigin = sharedAppUrl && window.location.origin.replace(/\/$/, '') !== sharedAppUrl.replace(/\/$/, '');

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative">
          {/* Connection Status Indicator */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
              connectionStatus === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
              'bg-amber-500 animate-pulse'
            }`} />
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
              {connectionStatus === 'connected' ? '在线' : connectionStatus === 'error' ? '离线' : '连接中'}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-2 text-center tracking-tight italic">神话战阵</h1>
          <p className="text-slate-400 text-center mb-8 text-sm uppercase tracking-widest">战术卡牌对决</p>
          
          {isWrongOrigin && (
            <div className="mb-6 p-3 bg-amber-950/20 border border-amber-900/30 rounded-xl flex gap-3 items-start">
              <AlertTriangle className="text-amber-500 shrink-0" size={18} />
              <div className="text-[10px] text-amber-200/70 leading-relaxed">
                当前不是共享实例，多人模式可能受限。创建房间时将自动跳转到共享实例。
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button 
              onClick={handleStartSinglePlayer}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 text-sm"
            >
              <User size={20} />
              单人模式 (对战 AI)
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-2 text-slate-500">或者</span></div>
            </div>

            <button 
              onClick={createRoom}
              disabled={isCreatingRoom}
              className={`w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3 text-sm ${
                isCreatingRoom ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isCreatingRoom ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Users size={20} />
              )}
              {isCreatingRoom ? '正在创建...' : '创建多人房间'}
            </button>

            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="输入房间 ID..." 
                value={joinRoomId}
                onChange={(e) => {
                  setJoinRoomId(e.target.value.toUpperCase());
                  if (roomError) setRoomError(null);
                }}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && joinRoomId) joinRoom(joinRoomId);
                }}
              />
              <button 
                onClick={() => {
                  if (joinRoomId) joinRoom(joinRoomId);
                }}
                className="px-6 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all text-sm"
              >
                加入
              </button>
            </div>
          </div>

          <button 
            onClick={onExit}
            className="w-full mt-8 py-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            返回主菜单
          </button>

          {/* Diagnostic Info */}
          <div className="mt-8 pt-6 border-t border-slate-800/50">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[8px] font-mono text-slate-600 uppercase tracking-tighter">
              <div>Origin:</div>
              <div className="text-right truncate">{window.location.origin}</div>
              <div>Shared:</div>
              <div className="text-right truncate">{sharedAppUrl || 'Loading...'}</div>
              <div>Socket:</div>
              <div className="text-right truncate">{socketServerUrl || 'Loading...'}</div>
              <div>Status:</div>
              <div className={`text-right ${connectionStatus === 'connected' ? 'text-emerald-500' : 'text-amber-500'}`}>{connectionStatus}</div>
            </div>
          </div>

          {connectionStatus === 'error' && lastError && (
            <div className="mt-6 p-4 bg-red-950/20 border border-red-900/30 rounded-2xl text-center">
              <div className="text-[10px] text-red-400 font-mono mb-1">
                连接失败: {lastError}
              </div>
              <div className="text-[8px] text-slate-500 font-mono mb-3 break-all opacity-50">
                目标: {socketServerUrl}
              </div>
              <p className="text-[9px] text-slate-500 uppercase tracking-tighter leading-relaxed mb-4">
                提示: 请确保已点击“分享”按钮并刷新页面。<br/>
                如果共享实例未启动，多人模式将无法工作。
              </p>
              <div className="flex gap-2 justify-center">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 rounded-lg transition-colors border border-slate-700"
                >
                  刷新重试
                </button>
                {socketServerUrl !== window.location.origin && (
                  <button 
                    onClick={() => {
                      setSocketServerUrl(window.location.origin);
                      setLastError(null);
                    }}
                    className="px-4 py-2 bg-indigo-900/40 hover:bg-indigo-900/60 text-[10px] text-indigo-300 rounded-lg transition-colors border border-indigo-800/50"
                  >
                    切换到本地连接
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (roomError) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <X size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">无法加入房间</h2>
          <p className="text-slate-400 mb-8">{roomError === 'Room not found' ? '该房间已失效或不存在。' : roomError}</p>
          
          <div className="space-y-3">
            <button 
              onClick={createRoom}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
              创建新房间
            </button>
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setRoomError(null);
                  setGameMode(null);
                  const url = new URL(window.location.href);
                  url.searchParams.delete('room');
                  window.history.replaceState({}, '', url.toString());
                  onExit();
                }}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all text-sm"
              >
                返回主菜单
              </button>
              <button 
                onClick={() => {
                  setRoomError(null);
                  const params = new URLSearchParams(window.location.search);
                  const roomId = params.get('room');
                  if (roomId) joinRoom(roomId);
                }}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all text-sm"
              >
                重试加入
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isWaitingForPlayer) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">{isSyncing ? '正在同步数据...' : '等待对手中...'}</h2>
          <p className="text-slate-400 mb-6">{isSyncing ? '对战即将开始' : `房间 ID: ${roomInfo?.roomId}`}</p>
          
          <div className="space-y-4">
            <button 
              onClick={copyInviteLink}
              className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${copied ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? '已复制链接' : '复制邀请链接'}
            </button>
            
            <button 
              onClick={() => {
                if (roomInfo) {
                  socketRef.current?.emit('leave_room', { roomId: roomInfo.roomId });
                }
                setGameMode(null);
                setRoomInfo(null);
                setIsWaitingForPlayer(false);
                onExit();
              }}
              className="w-full py-3 text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              取消并返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isMyTurn = (roomInfo?.role === 'host' && gameState.currentPlayer === 'player1') || 
                  (roomInfo?.role === 'guest' && gameState.currentPlayer === 'player2');

  return (
    <div className="h-screen bg-slate-950 text-slate-200 p-4 font-sans selection:bg-indigo-500/30 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-4 h-full">
        
        {/* Left Sidebar: Stats & Logs */}
        <div className="col-span-3 flex flex-col gap-4 h-full overflow-hidden">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">对局信息</h3>
              <div className="px-2 py-1 bg-slate-800 rounded text-xs font-mono text-indigo-400">
                第 {gameState.turn} 回合
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">对手</span>
                  <span className="font-bold text-blue-400">{ai.hp} / {ai.maxHp}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(ai.hp / ai.maxHp) * 100}%` }}
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/50">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">你</span>
                  <span className="font-bold text-red-400">{player.hp} / {player.maxHp}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(player.hp / player.maxHp) * 100}%` }}
                    className="h-full bg-gradient-to-r from-red-600 to-red-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col overflow-hidden backdrop-blur-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">战斗记录</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              {history.map((log, i) => (
                <div key={i} className="text-sm text-slate-400 border-l-2 border-slate-800 pl-3 py-1">
                  {log}
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={onExit}
            className="py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-sm font-bold uppercase tracking-widest text-slate-500 transition-all"
          >
            投降退出
          </button>
        </div>

        {/* Main Board */}
        <div className="col-span-9 flex flex-col gap-4 h-full overflow-hidden">
          
          {/* Opponent Hand (Mini) */}
          <div className="flex justify-center gap-2 h-12 opacity-50 flex-shrink-0">
            {ai.hand.map((_, i) => (
              <div key={i} className="w-8 h-12 bg-slate-800 border border-slate-700 rounded shadow-lg" />
            ))}
          </div>

          {/* The Battlefield */}
          <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded-3xl p-4 relative overflow-hidden backdrop-blur-md min-h-0">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            
            <div className="h-full flex flex-col justify-around relative z-10">
              {/* Opponent Slots */}
              <div className="flex justify-center gap-4">
                {ai.slots.map((card, i) => (
                  <div key={i} className={`relative group ${activeCombatSlot === i ? 'ring-2 ring-blue-500 ring-offset-4 ring-offset-slate-950 rounded-xl' : ''}`}>
                    <div className="w-32 h-48 bg-slate-950/50 border-2 border-dashed border-slate-800 rounded-xl flex items-center justify-center transition-all group-hover:border-blue-500/30">
                      {card ? (
                        <GameCard card={card} disabled />
                      ) : (
                        <div className="text-xs text-slate-700 font-mono uppercase tracking-tighter">空位</div>
                      )}
                    </div>
                    {combatAnimation?.slot === i && combatAnimation.type === 'p2-direct' && (
                      <motion.div 
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ y: 50, opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center z-50"
                      >
                        <div className="text-4xl font-black text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">-{combatAnimation.damageP1}</div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>

              {/* Combat Divider */}
              <div className="relative h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent my-2">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 bg-slate-950 text-xs font-mono text-slate-600 uppercase tracking-[0.3em]">对峙线</div>
              </div>

              {/* Player Slots */}
              <div className="flex justify-center gap-4">
                {player.slots.map((card, i) => (
                  <div 
                    key={i} 
                    onClick={() => handlePlayCard(i)}
                    className={`relative group cursor-pointer ${activeCombatSlot === i ? 'ring-2 ring-red-500 ring-offset-4 ring-offset-slate-950 rounded-xl' : ''}`}
                  >
                    <div className={`w-32 h-48 bg-slate-950/50 border-2 border-dashed rounded-xl flex items-center justify-center transition-all 
                      ${selectedCardIndex !== null && player.hand[selectedCardIndex]?.type === 'unit' && !card ? 'border-indigo-500/50 bg-indigo-500/5 animate-pulse' : 'border-slate-800 group-hover:border-red-500/30'}
                    `}>
                      {card ? (
                        <GameCard card={card} disabled />
                      ) : (
                        <div className="text-xs text-slate-700 font-mono uppercase tracking-tighter">
                          {selectedCardIndex !== null && player.hand[selectedCardIndex]?.type === 'unit' ? '在此部署' : '空位'}
                        </div>
                      )}
                    </div>
                    {combatAnimation?.slot === i && combatAnimation.type === 'p1-direct' && (
                      <motion.div 
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ y: -50, opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center z-50"
                      >
                        <div className="text-4xl font-black text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">-{combatAnimation.damageP2}</div>
                      </motion.div>
                    )}
                    {combatAnimation?.slot === i && combatAnimation.type === 'both-attack' && (
                      <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1.2, opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                      >
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex gap-4 shadow-2xl">
                          <span className="text-red-500 font-black">-{combatAnimation.damageP1}</span>
                          <span className="text-slate-400 font-mono text-sm">VS</span>
                          <span className="text-blue-500 font-black">-{combatAnimation.damageP2}</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Spell Animation Overlay */}
            <AnimatePresence>
              {spellAnimation && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  className="absolute inset-0 z-[100] flex items-center justify-center pointer-events-none"
                >
                  <div className={`px-12 py-6 rounded-3xl border-4 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center gap-4
                    ${spellAnimation.name === '火攻' ? 'bg-orange-500/20 border-orange-500 text-orange-500' : 'bg-indigo-500/20 border-indigo-500 text-indigo-500'}
                  `}>
                    <div className="text-6xl font-black italic tracking-tighter uppercase">{spellAnimation.name}</div>
                    <div className="text-sm font-mono uppercase tracking-[0.5em] opacity-70">术法发动</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Winner Overlay */}
            <AnimatePresence>
              {gameState.winner && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className={`text-8xl font-black italic mb-4 tracking-tighter uppercase ${gameState.winner === (roomInfo?.role === 'host' ? 'player1' : 'player2') ? 'text-emerald-500' : 'text-red-500'}`}>
                    {gameState.winner === (roomInfo?.role === 'host' ? 'player1' : 'player2') ? '胜利' : '失败'}
                  </div>
                  <p className="text-slate-400 mb-12 text-lg tracking-widest uppercase">战斗已结束</p>
                  <button 
                    onClick={() => {
                      setGameMode(null);
                      setRoomInfo(null);
                      setGameState({ turn: 0, currentPlayer: 'player2', phase: 'main', winner: null });
                    }}
                    className="px-12 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all transform hover:scale-105 text-sm"
                  >
                    返回大厅
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Player Hand & Controls */}
          <div className="h-52 flex items-center gap-4 flex-shrink-0">
            <div className="flex-1 flex justify-start items-center gap-4 overflow-x-auto py-2 px-6 bg-slate-900/50 border border-slate-800 rounded-3xl backdrop-blur-sm scrollbar-thin scrollbar-thumb-slate-800 h-full">
              <div className="flex gap-4 min-w-max">
                {player.hand.map((card, i) => (
                  <div key={i} onClick={() => {
                    if (card.type === 'spell') {
                      handleSpell(card, i);
                    } else {
                      setSelectedCardIndex(selectedCardIndex === i ? null : i);
                    }
                  }}>
                    <GameCard 
                      card={card} 
                      isSelected={selectedCardIndex === i}
                      disabled={!isMyTurn || card.cost > player.mana || isProcessing}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="w-48 flex flex-col gap-3 h-full">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center flex-1 flex flex-col justify-center">
                <div className="text-xs font-mono text-slate-500 uppercase mb-1">资源点数</div>
                <div className="text-3xl font-black text-indigo-400 font-mono leading-none">{player.mana} <span className="text-slate-700 text-xl">/ {player.maxMana}</span></div>
              </div>
              
              <button 
                onClick={endTurn}
                disabled={!isMyTurn || isProcessing}
                className={`h-16 rounded-2xl font-black uppercase tracking-widest transition-all transform active:scale-95 shadow-lg text-sm flex-shrink-0
                  ${isMyTurn && !isProcessing 
                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white hover:from-indigo-500 hover:to-indigo-600 shadow-indigo-500/20' 
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed shadow-none'}
                `}
              >
                {gameState.phase === 'battle' ? '战斗中...' : (isMyTurn ? '结束回合' : '对手回合')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
