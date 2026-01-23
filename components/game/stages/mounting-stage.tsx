"use client";

import React from "react"
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCw, Move } from "lucide-react";

interface MountingStageProps {
  writtenText: string;
  onComplete: () => void;
}

export function MountingStage({ writtenText, onComplete }: MountingStageProps) {
  const [paperPosition, setPaperPosition] = useState({ x: 0, y: -150 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const [paperStartPos, setPaperStartPos] = useState({ x: 0, y: -150 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const isMobileRef = useRef(false);
  
  // 检查是否为移动设备
  useEffect(() => {
    if (typeof window !== 'undefined') {
      isMobileRef.current = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    }
  }, []);

  // 标记游戏交互元素
  useEffect(() => {
    console.log('🎮 上板阶段防滑初始化');
    
    // 给纸张元素添加游戏交互标记
    if (paperRef.current) {
      paperRef.current.setAttribute('data-game-draggable', 'true');
      paperRef.current.setAttribute('data-game-interactive', 'true');
      paperRef.current.classList.add('game-draggable');
      paperRef.current.style.touchAction = 'none';
      paperRef.current.style.userSelect = 'none';
      paperRef.current.style.webkitUserSelect = 'none';
    }
    
    // 确保容器也不滚动
    if (containerRef.current) {
      containerRef.current.style.overflow = 'hidden';
      containerRef.current.style.touchAction = 'none';
      containerRef.current.style.userSelect = 'none';
      containerRef.current.style.webkitUserSelect = 'none';
    }
    
    // 监听器清理函数
    return () => {
      console.log('🔄 清理上板阶段事件监听器');
      if (paperRef.current) {
        paperRef.current.removeAttribute('data-game-draggable');
        paperRef.current.removeAttribute('data-game-interactive');
        paperRef.current.classList.remove('game-draggable');
      }
    };
  }, []);

  // 处理容器触摸，防止页面滚动
  const handleContainerTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // 纸张触摸开始
  const handlePaperTouchStart = useCallback((e: React.TouchEvent) => {
    // 防止页面滚动
    e.preventDefault();
    e.stopPropagation();
    
    if (isMounted) return;
    
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setPaperStartPos(paperPosition);
    setIsDragging(true);
    isDraggingRef.current = true;
    
    // 确保纸张元素有正确的标记
    if (paperRef.current) {
      paperRef.current.style.cursor = 'grabbing';
      paperRef.current.style.zIndex = '100';
    }
  }, [isMounted, paperPosition]);

  // 纸张触摸移动
  const handlePaperTouchMove = useCallback((e: React.TouchEvent) => {
    // 防止页面滚动
    e.preventDefault();
    e.stopPropagation();
    
    if (!isDraggingRef.current || isMounted) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartPos.x;
    const deltaY = touch.clientY - touchStartPos.y;
    
    // 计算新的位置
    const newX = paperStartPos.x + deltaX;
    const newY = paperStartPos.y + deltaY;
    
    setPaperPosition({ x: newX, y: newY });
    
    // 移动纸张
    if (paperRef.current) {
      paperRef.current.style.transform = `translate(${newX}px, ${newY}px) rotateY(${isFlipped ? 180 : 0}deg)`;
    }
  }, [isMounted, isFlipped, touchStartPos, paperStartPos]);

  // 纸张触摸结束
  const handlePaperTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(false);
    isDraggingRef.current = false;
    
    // 恢复光标样式
    if (paperRef.current) {
      paperRef.current.style.cursor = 'grab';
      paperRef.current.style.zIndex = '10';
    }
    
    // 检查是否放置在木板上
    checkMount();
  }, [isMounted, paperPosition, isFlipped]);

  // 鼠标事件处理（桌面端）
  const handlePaperMouseDown = useCallback((e: React.MouseEvent) => {
    if (isMounted) return;
    
    setTouchStartPos({ x: e.clientX, y: e.clientY });
    setPaperStartPos(paperPosition);
    setIsDragging(true);
    isDraggingRef.current = true;
    
    if (paperRef.current) {
      paperRef.current.style.cursor = 'grabbing';
      paperRef.current.style.zIndex = '100';
    }
  }, [isMounted, paperPosition]);

  const handlePaperMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDraggingRef.current || isMounted) return;
    
    const deltaX = e.clientX - touchStartPos.x;
    const deltaY = e.clientY - touchStartPos.y;
    
    const newX = paperStartPos.x + deltaX;
    const newY = paperStartPos.y + deltaY;
    
    setPaperPosition({ x: newX, y: newY });
    
    if (paperRef.current) {
      paperRef.current.style.transform = `translate(${newX}px, ${newY}px) rotateY(${isFlipped ? 180 : 0}deg)`;
    }
  }, [isMounted, isFlipped, touchStartPos, paperStartPos]);

  const handlePaperMouseUp = useCallback((e: React.MouseEvent) => {
    setIsDragging(false);
    isDraggingRef.current = false;
    
    if (paperRef.current) {
      paperRef.current.style.cursor = 'grab';
      paperRef.current.style.zIndex = '10';
    }
    
    checkMount();
  }, []);

  const checkMount = useCallback(() => {
    // 检查是否放置在木板区域
    const threshold = 50;
    if (Math.abs(paperPosition.x) < threshold && Math.abs(paperPosition.y) < threshold && isFlipped) {
      setIsMounted(true);
      setPaperPosition({ x: 0, y: 0 });
      
      // 移动到中心位置
      if (paperRef.current) {
        paperRef.current.style.transform = `translate(0px, 0px) rotateY(180deg)`;
      }
    }
  }, [paperPosition, isFlipped]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="mounting-stage min-h-screen pt-20 pb-8 px-4 flex flex-col items-center"
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
        <h2 className="text-3xl font-bold text-foreground mb-2">第二步：上板</h2>
        <p className="text-muted-foreground">将写好的宣纸反贴在木板上</p>
      </div>

      {/* 操作提示 */}
      <div className="flex gap-4 mb-6">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isFlipped ? 'bg-primary/20 text-primary' : 'bg-muted'}`}>
          <RotateCw className="w-4 h-4" />
          <span className="text-sm">{isFlipped ? '已翻转' : '1. 翻转纸张'}</span>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isMounted ? 'bg-primary/20 text-primary' : 'bg-muted'}`}>
          <Move className="w-4 h-4" />
          <span className="text-sm">{isMounted ? '已上板' : '2. 拖动到木板'}</span>
        </div>
      </div>

      {/* 工作区域 */}
      <div 
        ref={containerRef}
        className="relative w-80 h-96 select-none"
        style={{
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          msUserSelect: 'none',
        }}
        // 防止容器内的触摸事件导致滚动
        onTouchStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* 木板 */}
        <div 
          className="absolute inset-x-4 bottom-4 h-64 rounded-lg shadow-xl flex items-center justify-center overflow-hidden" 
          style={{ 
            background: 'linear-gradient(180deg, #a0826d 0%, #8b7355 50%, #6d5943 100%)',
            touchAction: 'none',
          }}
        >
          {/* 木纹效果 */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute h-px bg-foreground/20"
                style={{
                  top: `${(i + 1) * 5}%`,
                  left: 0,
                  right: 0,
                  transform: `scaleX(${0.8 + Math.random() * 0.4})`,
                }}
              />
            ))}
          </div>
          
          {/* 目标区域指示 */}
          {!isMounted && (
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-48 h-48 border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center"
              style={{ touchAction: 'none' }}
            >
              <span className="text-primary/50 text-sm">放置此处</span>
            </motion.div>
          )}
          
          {/* 已上板的纸张 */}
          <AnimatePresence>
            {isMounted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-48 h-48 rounded shadow-inner flex items-center justify-center"
                style={{ 
                  backgroundColor: '#f5f0e6',
                  touchAction: 'none',
                }}
              >
                <span 
                  className="text-8xl text-foreground/80"
                  style={{ transform: 'scaleX(-1)' }}
                >
                  {writtenText}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 可拖动的纸张 */}
        {!isMounted && (
          <motion.div
            ref={paperRef}
            animate={{
              x: paperPosition.x,
              y: paperPosition.y,
              rotateY: isFlipped ? 180 : 0,
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              // 拖拽时不使用动画，直接更新位置
              ...(isDraggingRef.current ? { duration: 0 } : {})
            }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
            // 鼠标事件
            onMouseDown={handlePaperMouseDown}
            onMouseMove={handlePaperMouseMove}
            onMouseUp={handlePaperMouseUp}
            onMouseLeave={() => {
              if (isDraggingRef.current) {
                setIsDragging(false);
                isDraggingRef.current = false;
                
                if (paperRef.current) {
                  paperRef.current.style.cursor = 'grab';
                  paperRef.current.style.zIndex = '10';
                }
                
                checkMount();
              }
            }}
            // 触摸事件
            onTouchStart={handlePaperTouchStart}
            onTouchMove={handlePaperTouchMove}
            onTouchEnd={handlePaperTouchEnd}
            onTouchCancel={handlePaperTouchEnd}
            style={{ 
              transformStyle: 'preserve-3d',
              touchAction: 'none',
              WebkitTapHighlightColor: 'transparent',
              WebkitTouchCallout: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
          >
            <div 
              className="w-48 h-48 rounded shadow-lg flex items-center justify-center border border-border/30 relative"
              style={{ 
                backgroundColor: '#f5f0e6',
                backfaceVisibility: 'hidden',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                touchAction: 'none',
              }}
            >
              {!isFlipped && (
                <span className="text-8xl text-foreground/80">{writtenText}</span>
              )}
              {/* 纸张纹理 */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9InJnYmEoMCwwLDAsMC4wMikiLz48L3N2Zz4=')] opacity-50" />
            </div>
            
            {/* 背面 */}
            {isFlipped && (
              <div 
                className="absolute inset-0 w-48 h-48 rounded shadow-lg flex items-center justify-center border border-border/30"
                style={{ 
                  backgroundColor: '#f5f0e6',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  touchAction: 'none',
                }}
              >
                <span 
                  className="text-8xl text-foreground/80"
                  style={{ transform: 'scaleX(-1)' }}
                >
                  {writtenText}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4 mt-6">
        <Button 
          variant="outline" 
          onClick={() => {
            setIsFlipped(!isFlipped);
            // 更新纸张旋转状态
            if (paperRef.current && !isMounted) {
              const rotate = !isFlipped ? 180 : 0;
              const x = paperPosition.x;
              const y = paperPosition.y;
              paperRef.current.style.transform = `translate(${x}px, ${y}px) rotateY(${rotate}deg)`;
            }
          }}
          disabled={isMounted}
          className="gap-2 game-interactive"
          style={{ 
            touchAction: 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <RotateCw className="w-4 h-4" />
          {isFlipped ? '翻回正面' : '翻转纸张'}
        </Button>
        <Button 
          onClick={onComplete}
          disabled={!isMounted}
          className="px-8 game-interactive"
          style={{ 
            touchAction: 'none',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          完成上板
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mt-4 text-center max-w-md">
        提示：先点击"翻转纸张"使文字反面朝上，然后拖动纸张放置到木板的指定区域
      </p>
      
      {/* 移动端专用提示 */}
      {isMobileRef.current && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
          移动端提示：直接拖动纸张，不会滑动页面
        </div>
      )}

      {/* 防滑状态指示器（开发用） */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="fixed bottom-16 right-4 bg-black/80 text-white px-3 py-1 rounded text-xs z-50"
          style={{ pointerEvents: 'none' }}
        >
          拖拽状态: {isDragging ? '进行中' : '未开始'} | 已翻转: {isFlipped ? '是' : '否'}
        </div>
      )}

      {/* 添加内联样式确保防滑 */}
      <style jsx>{`
        .mounting-stage {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }
        
        /* 确保纸张拖拽区域不响应滚动 */
        [data-game-draggable] {
          -webkit-user-drag: none !important;
          user-drag: none !important;
          -webkit-tap-highlight-color: transparent !important;
          -webkit-touch-callout: none !important;
        }
        
        /* 防止文本选择 */
        .select-none {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
        
        /* 优化拖拽时的性能 */
        .game-draggable {
          will-change: transform;
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
        }
        
        /* 针对移动端优化触摸反馈 */
        @media (hover: none) and (pointer: coarse) {
          [data-game-draggable] {
            min-width: 48px;
            min-height: 48px;
          }
          
          button.game-interactive {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
    </motion.div>
  );
}