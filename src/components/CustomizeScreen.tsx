import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Upload, X, Image as ImageIcon, Trash2, AlertCircle, Trash } from 'lucide-react';
import { SUIT_NAMES, SUIT_SYMBOLS, RANK_LABELS, ASSETS, ALL_JOKERS, RARITY_NAMES } from '../constants';
import { Rarity } from '../types';
import { compressImage, getLocalStorageSize } from '../utils/image';
import { ConfirmationModal } from './ConfirmationModal';

const CARD_COLORS = {
  spades: 'text-slate-900',
  clubs: 'text-slate-900',
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
};

const RARITY_COLORS: Record<Rarity, string> = {
  Common: 'bg-slate-500',
  Uncommon: 'bg-blue-500',
  Rare: 'bg-orange-500',
  Legendary: 'bg-purple-600',
};

interface CustomizeScreenProps {
  onBack: () => void;
  customCardImages: Record<string, string>;
  setCustomCardImages: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  customJokerImages: Record<string, string>;
  setCustomJokerImages: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  customBackground: string | null;
  setCustomBackground: (bg: string | null) => void;
}

export const CustomizeScreen: React.FC<CustomizeScreenProps> = ({
  onBack,
  customCardImages,
  setCustomCardImages,
  customJokerImages,
  setCustomJokerImages,
  customBackground,
  setCustomBackground
}) => {
  const [storageSize, setStorageSize] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    setStorageSize(getLocalStorageSize());
  }, [customCardImages, customJokerImages, customBackground]);

  const handleClearAll = () => {
    setCustomCardImages({});
    setCustomJokerImages({});
    setCustomBackground(null);
    setShowClearConfirm(false);
  };

  return (
    <div className="min-h-screen text-slate-100 p-8 relative overflow-x-hidden">
      {/* 全局背景 (Blank) - 负责向下延伸 */}
      <div 
        className="absolute inset-0 z-0 bg-repeat-y bg-top"
        style={{ 
          backgroundImage: 'url(https://i.postimg.cc/prFgFVGN/BG-blank.png)',
          backgroundSize: '100% auto',
          backgroundColor: '#020617'
        }}
      />
      
      {/* 顶部第一块背景 (Hero BG) */}
      <div 
        className="absolute top-0 left-0 right-0 h-screen z-0 bg-cover bg-top bg-no-repeat"
        style={{ 
          backgroundImage: 'url(https://i.postimg.cc/DyybcWQD/BG-change-card.png)',
        }}
      />
      
      {/* 漂浮花色背景动画 - 蓝色，从左下向右上移动，铺满全屏 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
        {[...Array(80)].map((_, i) => {
          const suits = ['♠', '♥', '♦', '♣'];
          const suit = suits[i % 4];
          
          // 规律性的网格分布
          const cols = 8;
          const col = i % cols;
          const row = Math.floor(i / cols);
          
          const startLeft = (col / cols) * 120 - 10;
          const startTop = (row / 10) * 120 - 10;
          
          return (
            <motion.div
              key={i}
              initial={{ 
                left: `${startLeft}%`,
                top: `${startTop}%`,
                opacity: 0,
                scale: 0.5,
                rotate: 45
              }}
              animate={{ 
                x: [0, 200], // 统一的移动距离
                y: [0, -200],
                opacity: [0, 0.15, 0], // 降低透明度，更含蓄
              }}
              transition={{ 
                duration: 10, // 统一的运动速度
                repeat: Infinity, 
                ease: "linear",
                delay: (i % 20) * -0.5 // 规律性的交错延迟
              }}
              className="absolute text-6xl md:text-8xl select-none font-sans"
              style={{ color: '#0057fe' }}
            >
              {suit}
            </motion.div>
          );
        })}
      </div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10 -mt-[30px]">
        <div className="flex items-center justify-between gap-6">
          <button 
            onClick={onBack}
            className="flex items-center justify-center gap-3 text-white hover:scale-105 transition-all font-black uppercase tracking-widest text-[20px] min-w-[260px] h-[110px] bg-contain bg-center bg-no-repeat drop-shadow-xl -translate-x-[22px]"
            style={{ backgroundImage: 'url(https://i.postimg.cc/c121jrfs/back-button.png)' }}
          >
            <div className="flex items-center gap-3 translate-y-[1px]">
              <ArrowLeft className="w-7 h-7" />
              返回主页
            </div>
          </button>
          
          <div className="flex-1 flex flex-col items-center">
            <img 
              src="https://i.postimg.cc/rmpF64hm/title-change.png" 
              alt="卡牌美术自定义" 
              className="h-20 md:h-28 object-contain mb-4"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="min-w-[260px] translate-x-[20px]" />
        </div>

        <ConfirmationModal 
          isOpen={showClearConfirm}
          onClose={() => setShowClearConfirm(false)}
          onConfirm={handleClearAll}
          title="清除所有自定义美术"
          description="确定要清除所有上传的卡牌、小丑牌和背景图吗？此操作不可撤销。"
          confirmText="确认清除"
          cancelText="取消"
          icon={Trash}
          iconColor="text-red-500"
          confirmColor="bg-red-600"
        />

        {/* 存储空间状态框 - 更加标准且清晰的布局 */}
        <div 
          className="py-4 px-10 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-10 text-amber-950 bg-cover bg-center bg-no-repeat transition-all w-full max-w-[1148px] h-[120px]"
          style={{ backgroundImage: 'url(https://i.postimg.cc/85wJMDY8/alert-change.png)', fontSize: '16px', lineHeight: '24px' }}
        >
          <div className="flex flex-col shrink-0 text-center md:text-left ml-[60px] translate-x-[5px] -translate-y-[2px]">
            <span className="text-[20px] font-black italic tracking-tighter uppercase">
              存储空间状态
            </span>
            <span className="text-sm font-bold text-amber-950/70 uppercase tracking-widest">
              Storage Capacity
            </span>
          </div>

          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[20px] font-black italic text-amber-950 h-[20px]">
                {storageSize > 4.5 ? '⚠️ 空间即将耗尽' : '✅ 运行状态良好'}
              </span>
              <span className="text-[20px] font-sans font-black text-amber-950 h-[20px]">
                {storageSize.toFixed(2)}MB / 5.00MB
              </span>
            </div>
            <div className="h-4 w-full bg-amber-950/10 rounded-full overflow-hidden p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  storageSize > 4.5 ? 'bg-gradient-to-r from-red-500 to-orange-400' : 
                  storageSize > 3.5 ? 'bg-gradient-to-r from-yellow-400 to-amber-300' : 
                  'bg-gradient-to-r from-blue-500 to-emerald-400'
                }`}
                style={{ width: `${Math.min(100, (storageSize / 5) * 100)}%` }}
              />
            </div>
            <p className="text-sm font-bold text-amber-950/95 leading-tight h-[20px]">
              {storageSize > 4.5 
                ? "存储空间即将耗尽！如果无法保存新图片，请尝试使用“清除全部”或上传更小的图片。" 
                : "您可以自由上传自定义卡牌美术。建议单张图片大小控制在 200KB 以内以获得最佳体验。"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-5 border-b border-slate-800 pb-4">
            <h3 className="text-2xl font-black italic text-blue-400">扑克牌美术</h3>
          </div>
          {Object.keys(SUIT_NAMES).map(suit => (
            <div key={suit} className="space-y-4">
              <h3 className={`text-xl font-bold flex items-center gap-2 ${CARD_COLORS[suit as keyof typeof CARD_COLORS]}`}>
                {SUIT_SYMBOLS[suit as keyof typeof SUIT_SYMBOLS]} {SUIT_NAMES[suit as keyof typeof SUIT_NAMES]}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2].map(rank => {
                  const cardKey = `${suit}-${rank}`;
                  const customImg = customCardImages[cardKey];
                  return (
                    <div key={rank} className="relative group">
                      <div className={`aspect-[2/3] ${customImg ? 'bg-slate-900' : 'bg-[#fdfcf0]'} shadow-xl rounded-xl overflow-hidden flex flex-col items-center justify-center relative`}>
                        {customImg ? (
                          <img src={customImg} className="w-full h-full object-cover" alt={`${rank} of ${suit}`} referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center relative">
                            {rank >= 2 && rank <= 9 ? (
                              <img 
                                src={(ASSETS.RANK_IMAGES as any)[rank]?.[suit === 'spades' ? 'green' : suit === 'diamonds' ? 'yellow' : 'white']} 
                                className="w-full h-full object-contain opacity-40"
                                alt={`${rank} ${suit}`}
                                referrerPolicy="no-referrer"
                              />
                            ) : null}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <div className={`text-xl font-bold ${CARD_COLORS[suit as keyof typeof CARD_COLORS]}`}>{RANK_LABELS[rank]}</div>
                              <div className={`text-2xl ${CARD_COLORS[suit as keyof typeof CARD_COLORS]}`}>{SUIT_SYMBOLS[suit as keyof typeof SUIT_SYMBOLS]}</div>
                            </div>
                          </div>
                        )}
                        
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer p-2 text-center">
                          <Upload className="w-6 h-6 mb-1" />
                          <span className="text-sm font-bold uppercase">上传图片</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = async () => {
                                  try {
                                    // Compress to 400x600 for cards
                                    const compressed = await compressImage(reader.result as string, 400, 600, 0.7);
                                    setCustomCardImages(prev => ({
                                      ...prev,
                                      [cardKey]: compressed
                                    }));
                                  } catch (err) {
                                    console.error('Image compression failed:', err);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>

                        {customImg && (
                          <button 
                            onClick={() => {
                              const next = { ...customCardImages };
                              delete next[cardKey];
                              setCustomCardImages(next);
                            }}
                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="text-sm text-center mt-1 text-slate-500 font-sans">{RANK_LABELS[rank]} {SUIT_SYMBOLS[suit as keyof typeof SUIT_SYMBOLS]}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          
          {/* 特殊卡牌 (大王/小王) */}
          <div className="space-y-4 flex flex-col relative">
            <button 
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center justify-center gap-3 text-white hover:scale-105 transition-all font-black uppercase tracking-widest text-[14px] w-full h-[80px] bg-contain bg-center bg-no-repeat drop-shadow-xl absolute -top-[100px] left-[20px]"
              style={{ backgroundImage: 'url(https://i.postimg.cc/RZQMNdyM/clear-all-button.png)' }}
            >
              <Trash2 className="w-5 h-5" />
              清除全部
            </button>

            <h3 className="text-xl font-bold flex items-center gap-2 text-red-500">
              🃏 特殊卡牌
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'big', name: '大王', label: 'BIG' },
                { id: 'small', name: '小王', label: 'SML' }
              ].map(joker => {
                const customImg = customJokerImages[joker.id];
                return (
                  <div key={joker.id} className="relative group">
                    <div className={`aspect-[2/3] ${customImg ? 'bg-slate-900' : 'bg-[#fdfcf0]'} shadow-xl rounded-xl overflow-hidden flex flex-col items-center justify-center relative`}>
                      {customImg ? (
                        <img src={customImg} className="w-full h-full object-cover" alt={joker.name} referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center relative">
                          <img 
                            src={(ASSETS.JOKER_FRAMES as any)[joker.id]} 
                            className="w-full h-full object-contain opacity-40" 
                            alt={joker.name} 
                            referrerPolicy="no-referrer" 
                          />
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-xl font-bold text-red-500">{joker.label}</div>
                            <div className="text-2xl">🃏</div>
                          </div>
                        </div>
                      )}
                      
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer p-2 text-center">
                        <Upload className="w-6 h-6 mb-1" />
                        <span className="text-sm font-bold uppercase">上传图片</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = async () => {
                                try {
                                  // Compress to 400x400 for jokers
                                  const compressed = await compressImage(reader.result as string, 400, 400, 0.7);
                                  setCustomJokerImages(prev => ({
                                    ...prev,
                                    [joker.id]: compressed
                                  }));
                                } catch (err) {
                                  console.error('Joker image compression failed:', err);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      {customImg && (
                        <button 
                          onClick={() => {
                            const next = { ...customJokerImages };
                            delete next[joker.id];
                            setCustomJokerImages(next);
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-center mt-1 text-slate-500 font-sans">{joker.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-8 pt-8 border-t border-slate-800">
          <h3 className="text-2xl font-black italic text-sky-400">游戏背景</h3>
          <div 
            className="max-w-3xl aspect-[1.6/1] bg-[length:100%_100%] bg-center bg-no-repeat p-12 pt-16 group transition-all relative flex flex-col"
            style={{ backgroundImage: 'url(https://i.postimg.cc/XYC3BC7y/shipin-large.png)' }}
          >
            <div className="flex-1 rounded-2xl overflow-hidden relative flex items-center justify-center mx-4 mb-4">
              {customBackground ? (
                <img src={customBackground} className="w-full h-full object-cover" alt="Custom Background" referrerPolicy="no-referrer" />
              ) : (
                <div className="text-slate-500 text-center">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-sans">建议尺寸: 1920 x 1080</p>
                </div>
              )}
              
              <label className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer p-4 text-center">
                <Upload className="w-10 h-10 mb-2" />
                <span className="text-lg font-bold uppercase">更换背景图</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = async () => {
                        try {
                          // Compress to 1280x720 for background
                          const compressed = await compressImage(reader.result as string, 1280, 720, 0.6);
                          setCustomBackground(compressed);
                        } catch (err) {
                          console.error('Background compression failed:', err);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>

              {customBackground && (
                <button 
                  onClick={() => setCustomBackground(null)}
                  className="absolute top-4 right-4 p-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-500 leading-relaxed max-w-2xl -translate-y-[80px] translate-x-[25px]">
            上传一张 1920x1080 的图片作为游戏背景。建议使用色彩柔和、不干扰视线的图片。
          </p>
        </div>

        <div className="space-y-8 pt-8 border-t border-slate-800">
          <h3 className="text-2xl font-black italic text-amber-400">魔法伙伴美术</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {ALL_JOKERS.map(joker => {
            const customImg = customJokerImages[joker.id];
            return (
              <div 
                key={joker.id} 
                className="aspect-[2/3] bg-[length:100%_100%] bg-center bg-no-repeat group hover:scale-[1.02] transition-all relative overflow-hidden shadow-xl"
                style={{ 
                  backgroundImage: `url(${
                    joker.rarity === 'Uncommon' 
                      ? 'https://i.postimg.cc/PJ2bM96v/buddy-frame-blue.png' 
                      : joker.rarity === 'Rare' 
                        ? 'https://i.postimg.cc/ZnFszwVX/buddy-frame-yellow.png' 
                        : 'https://i.postimg.cc/Qx3FdfdQ/buddy-frame.png'
                  })` 
                }}
              >
                {/* Content positioned to fit the frame */}
                <div className="absolute inset-0 flex flex-col p-4 pt-10">
                  <div className="text-center mb-4 -translate-y-[20px]">
                    <h4 className="text-[27px] font-black italic text-slate-900 leading-none">“{joker.name}”</h4>
                    <span className={`text-sm px-2 py-0.5 rounded-full uppercase font-black tracking-tighter ${RARITY_COLORS[joker.rarity]} mt-1 inline-block translate-y-[10px]`}>
                      {RARITY_NAMES[joker.rarity]}
                    </span>
                  </div>

                  <div className="flex-1 flex items-center justify-center p-2 -translate-y-[30px]">
                    <div className="w-full aspect-square rounded-xl overflow-hidden relative group/upload">
                      {customImg ? (
                        <img src={customImg} className="w-full h-full object-cover" alt={joker.name} referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <img 
                            src={ASSETS.IDOLS[ALL_JOKERS.indexOf(joker) % ASSETS.IDOLS.length] || ASSETS.DEFAULT_JOKER} 
                            className="w-full h-full object-contain" 
                            alt="Default Joker" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>
                      )}
                      
                      <label className="absolute inset-0 bg-black/70 opacity-0 group-hover/upload:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer p-4 text-center">
                        <Upload className="w-6 h-6 mb-1 text-white" />
                        <span className="text-sm font-black uppercase tracking-widest text-white">上传贴图</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = async () => {
                                try {
                                  const compressed = await compressImage(reader.result as string, 400, 400, 0.7);
                                  setCustomJokerImages(prev => ({
                                    ...prev,
                                    [joker.id]: compressed
                                  }));
                                } catch (err) {
                                  console.error('Joker image compression failed:', err);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      {customImg && (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            const next = { ...customJokerImages };
                            delete next[joker.id];
                            setCustomJokerImages(next);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full opacity-0 group-hover/upload:opacity-100 transition-opacity z-20"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Bottom description area */}
                  <div className="mt-auto p-3 text-center -translate-y-[30px]">
                    <p className="text-[15px] text-slate-700 leading-tight font-medium italic line-clamp-2">{joker.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
};
