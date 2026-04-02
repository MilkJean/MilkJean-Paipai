import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Play, ImageIcon, Settings } from 'lucide-react';
import { ASSETS } from '../constants';
import { GameModeModal } from './GameModeModal';

interface StartScreenProps {
  onStartGame: (mode: 'SINGLE' | 'TWO_PLAYER') => void;
  onCustomize: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame, onCustomize }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showModeModal, setShowModeModal] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Handle the play promise to avoid "Uncaught (in promise) DOMException"
    const playVideo = async () => {
      try {
        await video.play();
      } catch (err) {
        console.warn('Video autoplay failed or was interrupted:', err);
      }
    };

    playVideo();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden">
      <video 
        ref={videoRef}
        loop 
        muted 
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none"
        poster={ASSETS.BG_MAIN}
        onError={(e) => {
          if (e.currentTarget.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
            console.error('Video loading error: All video sources failed to load.');
          }
        }}
      >
        <source src="https://modelscope-resouces.oss-cn-zhangjiakou.aliyuncs.com/avatar%2F6e2af9c4-02ff-40f7-9f94-d00cd51bd7d7.mp4" type="video/mp4" />
        <source src="/bg.mp4" type="video/mp4" />
        <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 游戏标题 - 放在左侧，使用图片 */}
      <div className="flex-1 flex items-center p-8 md:p-20 relative z-10 -mt-[30px]">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <img 
            src="https://i.postimg.cc/GtGkD6vX/Open_Page_Logo.png" 
            alt="牌牌大冒险" 
            className="w-auto h-[251px] drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] -translate-y-[30px]"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>

      {/* 按钮区域 - 居中放在下方 */}
      <div className="p-12 md:p-16 relative z-10 flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-5xl"
        >
          <button 
            onClick={() => setShowModeModal(true)}
            className="group relative transition-all active:scale-95 hover:brightness-110"
          >
            <img 
              src="https://i.postimg.cc/gj8vh13Q/Open_Page_Start_Game_Button.png" 
              alt="开始游戏" 
              className="w-64 md:w-80 h-auto drop-shadow-xl"
              referrerPolicy="no-referrer"
            />
          </button>

          <button 
            onClick={onCustomize}
            className="group relative transition-all active:scale-95 hover:brightness-110"
          >
            <img 
              src="https://i.postimg.cc/90ZG9sys/Open_Page_Replace.png" 
              alt="替换你的卡牌" 
              className="w-64 md:w-80 h-auto drop-shadow-xl"
              referrerPolicy="no-referrer"
            />
          </button>
        </motion.div>

        {/* 设置按钮 - 绝对定位到右下角，不干扰主按钮居中 */}
        <div className="absolute bottom-12 right-12 flex items-center gap-4 opacity-40 hover:opacity-100 transition-opacity cursor-pointer group">
          <div className="flex flex-col items-end">
            <span className="text-sm font-sans text-slate-400 uppercase tracking-tighter">System Settings</span>
            <span className="text-sm font-black uppercase tracking-widest text-white">设置</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
            <Settings className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <GameModeModal 
        isOpen={showModeModal} 
        onClose={() => setShowModeModal(false)} 
        onSelectMode={(mode) => {
          setShowModeModal(false);
          onStartGame(mode);
        }}
      />
    </div>
  );
};
