"use client";

import React from "react"
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Hand, RotateCcw } from "lucide-react";

interface PrintingStageProps {
  writtenText: string;
  inkLevel: number;
  onComplete: (quality: number) => void;
}

export function PrintingStage({ writtenText, inkLevel, onComplete }: PrintingStageProps) {
  const [isPaperPlaced, setIsPaperPlaced] = useState(false);
  const [rubCount, setRubCount] = useState(0);
  const [isRubbing, setIsRubbing] = useState(false);
  const [rubPosition, setRubPosition] = useState({ x: 50, y: 50 });
  const [rubbedAreas, setRubbedAreas] = useState<Set<string>>(new Set());
  const [isPrinted, setIsPrinted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const paperRef = useRef<HTMLDivElement>(null);
  const pressAreaRef = useRef<HTMLDivElement>(null);
  const isRubbingRef = useRef(false);
  const lastTouchPosition = useRef({ x: 0, y: 0 });

  const quality = Math.min(100, (rubCount / 80) * 100 * (inkLevel / 100));

  // 检测是否为移动设备
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobile(mobile);
      console.log(`🖨️ 印刷阶段 - ${mobile ? '移动设备' : '桌面设备'}`);
    }
  }, []);

  // 标记游戏交互元素
  useEffect(() => {
    console.log('🎮 印刷阶段防滑初始化');
    
    // 给宣纸按压区域添加游戏交互标记
    if (pressAreaRef.current) {
      pressAreaRef.current.setAttribute('data-game-pressable', 'true');
      pressAreaRef.current.setAttribute('data-game-interactive', 'true');
      pressAreaRef.current.classList.add('game-pressable');
      pressAreaRef.current.style.touchAction = 'none';
      pressAreaRef.current.style.userSelect = 'none';
      pressAreaRef.current.style.webkitUserSelect = 'none';
    }
    
    // 给宣纸元素添加游戏交互标记
    if (paperRef.current) {
      paperRef.current.setAttribute('data-game-interactive', 'true');
      paperRef.current.classList.add('game-interactive');
      paperRef.current.style.touchAction = 'none';
      paperRef.current.style.userSelect = 'none';
      paperRef.current.style.webkitUserSelect = 'none';
    }
    
    // 清理函数
    return () => {
      console.log('🔄 清理印刷阶段事件监听器');
      if (pressAreaRef.current) {
        pressAreaRef.current.removeAttribute('data-game-pressable');
        pressAreaRef.current.removeAttribute('data-game-interactive');
        pressAreaRef.current.classList.remove('game-pressable');
      }
      if (paperRef.current) {
        paperRef.current.removeAttribute('data-game-interactive');
        paperRef.current.classList.remove('game-interactive');
      }
    };
  }, [isPaperPlaced]);

  // 处理容器触摸，防止页面滚动
  const handleContainerTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // 触摸事件处理 - 开始按压
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // 防止页面滚动
    e.preventDefault();
    e.stopPropagation();
    
    if (!isPaperPlaced || isPrinted) return;
    
    setIsRubbing(true);
    isRubbingRef.current = true;
    
    const paper = paperRef.current;
    if (!paper) return;
    
    const rect = paper.getBoundingClientRect();
    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    
    // 记录触摸开始位置
    lastTouchPosition.current = { x: clientX, y: clientY };
    
    // 计算初始按压位置
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    setRubPosition({ 
      x: Math.max(0, Math.min(100, x)), 
      y: Math.max(0, Math.min(100, y)) 
    });
  }, [isPaperPlaced, isPrinted]);

  // 鼠标事件处理 - 开始按压
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isPaperPlaced || isPrinted) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsRubbing(true);
    isRubbingRef.current = true;
    
    const paper = paperRef.current;
    if (!paper) return;
    
    const rect = paper.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    // 记录鼠标开始位置
    lastTouchPosition.current = { x: clientX, y: clientY };
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    setRubPosition({ 
      x: Math.max(0, Math.min(100, x)), 
      y: Math.max(0, Math.min(100, y)) 
    });
  }, [isPaperPlaced, isPrinted]);

  // 触摸事件处理 - 按压移动
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // 防止页面滚动
    e.preventDefault();
    e.stopPropagation();
    
    if (!isRubbingRef.current || !isPaperPlaced || isPrinted) return;
    
    const paper = paperRef.current;
    if (!paper) return;
    
    const rect = paper.getBoundingClientRect();
    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    // 限制在纸张范围内
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    
    setRubPosition({ x: clampedX, y: clampedY });
    
    // 记录按压过的区域
    const gridX = Math.floor(clampedX / 10);
    const gridY = Math.floor(clampedY / 10);
    const key = `${gridX}-${gridY}`;
    
    setRubbedAreas(prev => {
      const newSet = new Set(prev);
      newSet.add(key);
      return newSet;
    });
    
    setRubCount(prev => prev + 0.5); // 移动端按压速度较慢，减少增量
    
    // 更新最后触摸位置
    lastTouchPosition.current = { x: clientX, y: clientY };
  }, [isPaperPlaced, isPrinted]);

  // 鼠标事件处理 - 按压移动
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isRubbingRef.current || !isPaperPlaced || isPrinted) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const paper = paperRef.current;
    if (!paper) return;
    
    const rect = paper.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    
    setRubPosition({ x: clampedX, y: clampedY });
    
    const gridX = Math.floor(clampedX / 10);
    const gridY = Math.floor(clampedY / 10);
    const key = `${gridX}-${gridY}`;
    
    setRubbedAreas(prev => {
      const newSet = new Set(prev);
      newSet.add(key);
      return newSet;
    });
    
    setRubCount(prev => prev + 1);
    
    lastTouchPosition.current = { x: clientX, y: clientY };
  }, [isPaperPlaced, isPrinted]);

  // 触摸结束
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsRubbing(false);
    isRubbingRef.current = false;
  }, []);

  // 鼠标结束
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsRubbing(false);
    isRubbingRef.current = false;
  }, []);

  // 鼠标离开
  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    if (isRubbingRef.current) {
      setIsRubbing(false);
      isRubbingRef.current = false;
    }
  }, []);

  const reset = () => {
    setIsPaperPlaced(false);
    setRubCount(0);
    setRubbedAreas(new Set());
    setIsPrinted(false);
  };

  const finishPrinting = () => {
    setIsPrinted(true);
  };

  const getTransferOpacity = (gridX: number, gridY: number) => {
    const key = `${gridX}-${gridY}`;
    return rubbedAreas.has(key) ? Math.min(1, inkLevel / 100) : 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="printing-stage min-h-screen pt-20 pb-8 px-4 flex flex-col items-center"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      // 容器防滑
      onTouchStart={handleContainerTouch}
      onTouchMove={handleContainerTouch}
      onTouchEnd={handleContainerTouch}
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">第五步：印刷</h2>
        <p className="text-muted-foreground">覆上宣纸，用手掌或刷子均匀按压</p>
      </div>

      {/* 质量指示 */}
      <div className="flex items-center gap-4 mb-6" style={{ touchAction: 'none' }}>
        <Hand className="w-5 h-5 text-foreground" />
        <div className="w-48 h-3 bg-muted rounded-full overflow-hidden" style={{ touchAction: 'none' }}>
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${quality}%` }}
            transition={{ type: "spring" }}
          />
        </div>
        <span className="text-sm text-muted-foreground w-12">{Math.round(quality)}%</span>
      </div>

      {/* 印刷区域 */}
      <div className="relative w-72 h-72" style={{ touchAction: 'none' }}>
        {/* 木板层 */}
        <div 
          className="absolute inset-0 rounded-lg shadow-xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #a0826d 0%, #8b7355 50%, #6d5943 100%)',
            touchAction: 'none',
          }}
        >
          {/* 带墨的文字 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ touchAction: 'none' }}>
            <span 
              className="text-[140px] font-serif"
              style={{ 
                color: '#1a1a1a',
                transform: 'scaleX(-1)',
                touchAction: 'none',
              }}
            >
              {writtenText}
            </span>
          </div>
        </div>

        {/* 宣纸层 */}
        <AnimatePresence>
          {isPaperPlaced && (
            <motion.div
              ref={paperRef}
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute inset-0 rounded-lg overflow-hidden cursor-none select-none game-interactive"
              style={{
                backgroundColor: '#f5f0e6',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                touchAction: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
              }}
              // 鼠标事件
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
              // 触摸事件
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchMove}
              onTouchCancel={handleTouchEnd}
            >
              {/* 按压区域（实际接收触摸事件的区域） */}
              <div 
                ref={pressAreaRef}
                className="absolute inset-0 game-pressable"
                style={{ 
                  touchAction: 'none',
                  cursor: isRubbing ? 'grabbing' : 'grab',
                }}
              />
              
              {/* 纸张纹理 */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ touchAction: 'none' }}>
                {[...Array(50)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-amber-900/20"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      width: `${Math.random() * 4 + 1}px`,
                      height: `${Math.random() * 4 + 1}px`,
                      touchAction: 'none',
                    }}
                  />
                ))}
              </div>

              {/* 墨迹转印效果 */}
              <div className="absolute inset-0 pointer-events-none" style={{ touchAction: 'none' }}>
                {[...Array(10)].map((_, y) => (
                  <div key={y} className="flex h-[10%]" style={{ touchAction: 'none' }}>
                    {[...Array(10)].map((_, x) => (
                      <motion.div
                        key={`${x}-${y}`}
                        className="w-[10%] h-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: getTransferOpacity(x, y) * 0.3 }}
                        style={{
                          backgroundColor: 'rgba(26, 26, 26, 0.1)',
                          touchAction: 'none',
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* 转印的文字 */}
              <motion.div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                animate={{ opacity: quality / 100 }}
                style={{ touchAction: 'none' }}
              >
                <span 
                  className="text-[140px] font-serif"
                  style={{ 
                    color: '#1a1a1a',
                    opacity: quality / 100,
                    touchAction: 'none',
                  }}
                >
                  {writtenText}
                </span>
              </motion.div>

              {/* 手掌/刷子指示 */}
              {!isPrinted && (
                <motion.div
                  className="absolute pointer-events-none"
                  animate={{
                    left: `${rubPosition.x}%`,
                    top: `${rubPosition.y}%`,
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 30,
                    // 按压时不使用动画，直接跟随
                    ...(isRubbingRef.current ? { duration: 0 } : {})
                  }}
                  style={{ 
                    transform: 'translate(-50%, -50%)',
                    touchAction: 'none',
                  }}
                >
                  <motion.div 
                    className="text-4xl"
                    animate={{ scale: isRubbing ? [1, 0.9, 1] : 1 }}
                    transition={{ repeat: isRubbing ? Infinity : 0, duration: 0.2 }}
                    style={{ touchAction: 'none' }}
                  >
                    🖐️
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 成品展示 */}
        <AnimatePresence>
          {isPrinted && (
            <motion.div
              initial={{ y: 0, rotateX: 0 }}
              animate={{ y: -50, rotateX: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-lg overflow-hidden"
              style={{
                backgroundColor: '#f5f0e6',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                touchAction: 'none',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ touchAction: 'none' }}>
                <span 
                  className="text-[140px] font-serif"
                  style={{ 
                    color: '#1a1a1a',
                    opacity: quality / 100,
                    touchAction: 'none',
                  }}
                >
                  {writtenText}
                </span>
              </div>
              
              {/* 完成标记 */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium"
                style={{ touchAction: 'none' }}
              >
                印刷完成
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4 mt-8">
        {!isPaperPlaced ? (
          <Button 
            onClick={() => setIsPaperPlaced(true)} 
            className="px-8 game-interactive"
            style={{ 
              touchAction: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            覆上宣纸
          </Button>
        ) : !isPrinted ? (
          <>
            <Button 
              variant="outline" 
              onClick={reset} 
              className="gap-2 bg-transparent game-interactive"
              style={{ 
                touchAction: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <RotateCcw className="w-4 h-4" />
              重新开始
            </Button>
            <Button 
              onClick={finishPrinting}
              disabled={quality < 30}
              className="px-8 game-interactive"
              style={{ 
                touchAction: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              揭起宣纸
            </Button>
          </>
        ) : (
          <Button 
            onClick={() => onComplete(quality)} 
            className="px-8 game-interactive"
            style={{ 
              touchAction: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            完成印刷
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground mt-4 text-center max-w-md">
        {!isPaperPlaced 
          ? "提示：点击「覆上宣纸」将纸张放置在刷好墨的木板上" 
          : !isPrinted 
            ? "提示：按住并移动手掌，均匀按压整个纸面，使墨迹转印到纸上"
            : "恭喜！您已完成雕版印刷的全部工序！"
        }
      </p>
      
      {/* 移动端专用提示 */}
      {isMobile && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
          移动端提示：直接按住宣纸区域移动按压，不会滑动页面
        </div>
      )}

      {/* 防滑状态指示器（开发用） */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="fixed bottom-16 right-4 bg-black/80 text-white px-3 py-1 rounded text-xs z-50"
          style={{ pointerEvents: 'none' }}
        >
          按压状态: {isRubbing ? '进行中' : '未开始'} | 质量: {Math.round(quality)}%
        </div>
      )}

      {/* 添加内联样式确保防滑 */}
      <style jsx>{`
        .printing-stage {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }
        
        /* 防止按压区域导致页面滚动 */
        [data-game-pressable] {
          -webkit-tap-highlight-color: transparent !important;
          -webkit-user-drag: none !important;
          user-drag: none !important;
          -webkit-touch-callout: none !important;
        }
        
        /* 确保印刷区域内所有元素都不触发滚动 */
        .cursor-none {
          -webkit-overflow-scrolling: none !important;
          overscroll-behavior: none !important;
        }
        
        /* 防止印刷区域的文字选择 */
        .select-none {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
        
        /* 优化按压动画性能 */
        .game-pressable {
          will-change: transform;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
        
        /* 针对移动端优化触摸反馈 */
        @media (hover: none) and (pointer: coarse) {
          .game-interactive, .game-pressable {
            min-width: 48px;
            min-height: 48px;
          }
          
          button.game-interactive {
            min-height: 44px;
            min-width: 44px;
          }
          
          /* 印刷区域在移动端更大 */
          .w-72 {
            width: 300px !important;
            height: 300px !important;
          }
        }
      `}</style>
    </motion.div>
  );
}