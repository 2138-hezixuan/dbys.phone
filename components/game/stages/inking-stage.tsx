"use client";

import React from "react"
import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Droplets, RotateCcw } from "lucide-react";

interface InkingStageProps {
  writtenText: string;
  onComplete: (inkLevel: number) => void;
}

export function InkingStage({ writtenText, onComplete }: InkingStageProps) {
  const [inkLevel, setInkLevel] = useState(0);
  const [isInking, setIsInking] = useState(false);
  const [brushPosition, setBrushPosition] = useState({ x: 50, y: 50 });
  const [inkedAreas, setInkedAreas] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  
  const boardRef = useRef<HTMLDivElement>(null);
  const brushRef = useRef<HTMLDivElement>(null);
  const isInkingRef = useRef(false);
  const lastTouchPosition = useRef({ x: 0, y: 0 });

  // 检测是否为移动设备
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      setIsMobile(mobile);
      console.log(`🖌️ 刷墨阶段 - ${mobile ? '移动设备' : '桌面设备'}`);
    }
  }, []);

  // 标记游戏交互元素
  useEffect(() => {
    console.log('🎮 刷墨阶段防滑初始化');
    
    // 给刷子元素添加游戏交互标记
    if (brushRef.current) {
      brushRef.current.setAttribute('data-game-draggable', 'true');
      brushRef.current.setAttribute('data-game-interactive', 'true');
      brushRef.current.classList.add('game-draggable');
      brushRef.current.style.touchAction = 'none';
      brushRef.current.style.userSelect = 'none';
      brushRef.current.style.webkitUserSelect = 'none';
    }
    
    // 给木板区域添加游戏交互标记
    if (boardRef.current) {
      boardRef.current.setAttribute('data-game-interactive', 'true');
      boardRef.current.classList.add('game-interactive');
      boardRef.current.style.touchAction = 'none';
      boardRef.current.style.userSelect = 'none';
      boardRef.current.style.webkitUserSelect = 'none';
      boardRef.current.style.overflow = 'hidden';
    }
    
    // 清理函数
    return () => {
      console.log('🔄 清理刷墨阶段事件监听器');
      if (brushRef.current) {
        brushRef.current.removeAttribute('data-game-draggable');
        brushRef.current.removeAttribute('data-game-interactive');
        brushRef.current.classList.remove('game-draggable');
      }
      if (boardRef.current) {
        boardRef.current.removeAttribute('data-game-interactive');
        boardRef.current.classList.remove('game-interactive');
      }
    };
  }, []);

  // 处理容器触摸，防止页面滚动
  const handleContainerTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // 触摸事件处理 - 开始刷墨
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // 防止页面滚动
    e.preventDefault();
    e.stopPropagation();
    
    setIsInking(true);
    isInkingRef.current = true;
    
    const board = boardRef.current;
    if (!board) return;
    
    const rect = board.getBoundingClientRect();
    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    
    // 记录触摸开始位置
    lastTouchPosition.current = { x: clientX, y: clientY };
    
    // 计算刷子在木板上的初始位置
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    setBrushPosition({ 
      x: Math.max(0, Math.min(100, x)), 
      y: Math.max(0, Math.min(100, y)) 
    });
  }, []);

  // 鼠标事件处理 - 开始刷墨
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsInking(true);
    isInkingRef.current = true;
    
    const board = boardRef.current;
    if (!board) return;
    
    const rect = board.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    // 记录鼠标开始位置
    lastTouchPosition.current = { x: clientX, y: clientY };
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    setBrushPosition({ 
      x: Math.max(0, Math.min(100, x)), 
      y: Math.max(0, Math.min(100, y)) 
    });
  }, []);

  // 触摸事件处理 - 刷墨移动
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // 防止页面滚动
    e.preventDefault();
    e.stopPropagation();
    
    if (!isInkingRef.current) return;
    
    const board = boardRef.current;
    if (!board) return;
    
    const rect = board.getBoundingClientRect();
    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    
    // 计算刷子在木板上的相对位置
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    // 限制刷子在木板范围内
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    
    setBrushPosition({ x: clampedX, y: clampedY });
    
    // 记录刷过的区域
    const gridX = Math.floor(clampedX / 10);
    const gridY = Math.floor(clampedY / 10);
    const key = `${gridX}-${gridY}`;
    
    setInkedAreas(prev => {
      const newSet = new Set(prev);
      newSet.add(key);
      return newSet;
    });
    
    // 更新墨水覆盖度
    setInkLevel(prev => {
      const newLevel = Math.min(100, prev + 0.3);
      return newLevel;
    });
    
    // 更新最后触摸位置
    lastTouchPosition.current = { x: clientX, y: clientY };
  }, []);

  // 鼠标事件处理 - 刷墨移动
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isInkingRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const board = boardRef.current;
    if (!board) return;
    
    const rect = board.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    const clampedX = Math.max(0, Math.min(100, x));
    const clampedY = Math.max(0, Math.min(100, y));
    
    setBrushPosition({ x: clampedX, y: clampedY });
    
    // 记录刷过的区域
    const gridX = Math.floor(clampedX / 10);
    const gridY = Math.floor(clampedY / 10);
    const key = `${gridX}-${gridY}`;
    
    setInkedAreas(prev => {
      const newSet = new Set(prev);
      newSet.add(key);
      return newSet;
    });
    
    // 更新墨水覆盖度
    setInkLevel(prev => {
      const newLevel = Math.min(100, prev + 0.3);
      return newLevel;
    });
    
    lastTouchPosition.current = { x: clientX, y: clientY };
  }, []);

  // 触摸结束
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsInking(false);
    isInkingRef.current = false;
  }, []);

  // 鼠标结束
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsInking(false);
    isInkingRef.current = false;
  }, []);

  // 鼠标离开
  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    if (isInkingRef.current) {
      setIsInking(false);
      isInkingRef.current = false;
    }
  }, []);

  const reset = () => {
    setInkLevel(0);
    setInkedAreas(new Set());
  };

  const getInkOpacity = (gridX: number, gridY: number) => {
    const key = `${gridX}-${gridY}`;
    return inkedAreas.has(key) ? 1 : 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="inking-stage min-h-screen pt-20 pb-8 px-4 flex flex-col items-center"
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
        <h2 className="text-3xl font-bold text-foreground mb-2">第四步：刷墨</h2>
        <p className="text-muted-foreground">用墨刷在雕好的木板上均匀涂抹墨汁</p>
      </div>

      {/* 墨水量显示 */}
      <div className="flex items-center gap-4 mb-6" style={{ touchAction: 'none' }}>
        <Droplets className="w-5 h-5 text-foreground" />
        <div className="w-48 h-3 bg-muted rounded-full overflow-hidden" style={{ touchAction: 'none' }}>
          <motion.div
            className="h-full bg-ink"
            style={{ backgroundColor: '#1a1a1a' }}
            animate={{ width: `${inkLevel}%` }}
            transition={{ type: "spring" }}
          />
        </div>
        <span className="text-sm text-muted-foreground w-12">{Math.round(inkLevel)}%</span>
      </div>

      {/* 提示状态 */}
      <div className="mb-4 text-sm" style={{ touchAction: 'none' }}>
        {inkLevel < 30 && <span className="text-amber-600">墨量不足，继续刷墨...</span>}
        {inkLevel >= 30 && inkLevel < 70 && <span className="text-blue-600">刷墨中，尽量覆盖整个版面</span>}
        {inkLevel >= 70 && inkLevel < 90 && <span className="text-green-600">墨量适中</span>}
        {inkLevel >= 90 && <span className="text-primary">墨量充足！可以开始印刷了</span>}
      </div>

      {/* 木板和刷墨区域 */}
      <div 
        ref={boardRef}
        className="relative w-72 h-72 rounded-lg shadow-2xl cursor-none overflow-hidden select-none game-interactive"
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
        style={{
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          msUserSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {/* 木板背景 */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #a0826d 0%, #8b7355 50%, #6d5943 100%)',
            touchAction: 'none',
          }}
        >
          {/* 木纹 */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-black/10 w-full"
              style={{ 
                top: `${(i + 1) * 6.5}%`, 
                touchAction: 'none',
                pointerEvents: 'none',
              }}
            />
          ))}
        </div>

        {/* 雕刻的文字 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ touchAction: 'none' }}>
          <span 
            className="text-[140px] font-serif"
            style={{ 
              color: '#5d4e40',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3), -1px -1px 2px rgba(255,255,255,0.2)',
              transform: 'scaleX(-1)',
              touchAction: 'none',
            }}
          >
            {writtenText}
          </span>
        </div>

        {/* 墨水层 */}
        <div className="absolute inset-0 pointer-events-none" style={{ touchAction: 'none' }}>
          {[...Array(10)].map((_, y) => (
            <div key={y} className="flex h-[10%]" style={{ touchAction: 'none' }}>
              {[...Array(10)].map((_, x) => (
                <motion.div
                  key={`${x}-${y}`}
                  className="w-[10%] h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: getInkOpacity(x, y) }}
                  style={{
                    backgroundColor: 'rgba(26, 26, 26, 0.85)',
                    touchAction: 'none',
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* 文字在墨上的效果 */}
        {inkLevel > 20 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ touchAction: 'none' }}>
            <span 
              className="text-[140px] font-serif"
              style={{ 
                color: '#1a1a1a',
                transform: 'scaleX(-1)',
                opacity: inkLevel / 100,
                touchAction: 'none',
              }}
            >
              {writtenText}
            </span>
          </div>
        )}

        {/* 墨刷 */}
        <motion.div
          ref={brushRef}
          className="absolute pointer-events-none z-10"
          animate={{
            left: `${brushPosition.x}%`,
            top: `${brushPosition.y}%`,
          }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 30,
            // 刷墨时不使用动画，直接跟随
            ...(isInkingRef.current ? { duration: 0 } : {})
          }}
          style={{ 
            transform: 'translate(-50%, -50%)',
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          <div className="relative" style={{ touchAction: 'none' }}>
            {/* 刷子手柄 */}
            <div 
              className="w-4 h-16 rounded-t-full mx-auto" 
              style={{ 
                backgroundColor: '#a0826d',
                background: 'linear-gradient(to bottom, #a0826d, #8b7355)',
                touchAction: 'none',
              }} 
            />
            {/* 刷毛 */}
            <div className="w-12 h-6 rounded-b-lg flex justify-center" style={{ touchAction: 'none' }}>
              <div className="w-10 h-1 absolute bottom-1" style={{ backgroundColor: '#4a4a4a', touchAction: 'none' }} />
            </div>
            {/* 刷墨效果 */}
            {isInking && (
              <motion.div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-14 h-3 rounded-full"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', touchAction: 'none' }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.3 }}
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4 mt-6">
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
          重新刷墨
        </Button>
        <Button 
          onClick={() => onComplete(inkLevel)}
          disabled={inkLevel < 30}
          className="px-8 game-interactive"
          style={{ 
            touchAction: 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          完成刷墨
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mt-4 text-center max-w-md">
        提示：按住鼠标/手指在木板上移动刷子，尽量均匀覆盖整个版面
      </p>
      
      {/* 移动端专用提示 */}
      {isMobile && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
          移动端提示：直接按住木板移动刷子，不会滑动页面
        </div>
      )}

      {/* 防滑状态指示器（开发用） */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="fixed bottom-16 right-4 bg-black/80 text-white px-3 py-1 rounded text-xs z-50"
          style={{ pointerEvents: 'none' }}
        >
          刷墨状态: {isInking ? '进行中' : '未开始'} | 墨量: {Math.round(inkLevel)}%
        </div>
      )}

      {/* 添加内联样式确保防滑 */}
      <style jsx>{`
        .inking-stage {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }
        
        /* 确保刷墨区域内的所有元素都不触发滚动 */
        [data-game-interactive] {
          -webkit-user-drag: none !important;
          user-drag: none !important;
          -webkit-tap-highlight-color: transparent !important;
          -webkit-touch-callout: none !important;
        }
        
        /* 防止刷墨区域外的滚动 */
        .cursor-none {
          -webkit-overflow-scrolling: none !important;
          overscroll-behavior: none !important;
        }
        
        /* 优化刷墨动画性能 */
        .game-interactive {
          will-change: transform;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
        
        /* 针对移动端优化触摸反馈 */
        @media (hover: none) and (pointer: coarse) {
          .game-interactive {
            min-width: 48px;
            min-height: 48px;
          }
          
          button.game-interactive {
            min-height: 44px;
            min-width: 44px;
          }
          
          /* 刷墨区域在移动端更大 */
          .w-72 {
            width: 300px !important;
            height: 300px !important;
          }
        }
      `}</style>
    </motion.div>
  );
}