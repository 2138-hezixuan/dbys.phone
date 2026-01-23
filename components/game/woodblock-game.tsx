"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import type { GameStage, GameState } from "@/lib/game-types";
import { IntroScreen } from "./intro-screen";
import { StageProgress } from "./stage-progress";
import { WritingStage } from "./stages/writing-stage";
import { MountingStage } from "./stages/mounting-stage";
import { CarvingStage } from "./stages/carving-stage";
import { InkingStage } from "./stages/inking-stage";
import { PrintingStage } from "./stages/printing-stage";
import { CompleteScreen } from "./complete-screen";

const initialState: GameState = {
  currentStage: 'intro',
  completedStages: [],
  score: 0,
  writtenText: '福',
  carvedPaths: [],
  inkLevel: 0,
  printQuality: 0,
};

export function WoodblockGame() {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [isDragging, setIsDragging] = useState(false);
  const [touchStartPosition, setTouchStartPosition] = useState({ x: 0, y: 0 });
  const [elementStartPosition, setElementStartPosition] = useState({ x: 0, y: 0 });
  const currentElementRef = useRef<HTMLElement | null>(null);
  const hasSetupRef = useRef(false);

  // 游戏专用的防滑和拖拽逻辑
  useEffect(() => {
    if (typeof window === 'undefined' || hasSetupRef.current) return;
    
    console.log('🎮 雕版印刷游戏 - 防滑系统初始化');
    hasSetupRef.current = true;
    
    // 标记游戏交互元素的辅助函数
    const markGameElements = () => {
      // 查找并标记所有游戏交互元素
      const interactiveSelectors = [
        '.wood-block', '.ink-brush', '.carving-tool', '.paper-sheet',
        '.draggable', '.drag-handle', '.brush-tool', '.brush-handle',
        '.press-area', '.pressure-zone', '.stamp-area', '.printing-press',
        '[data-draggable]', '[data-drag]', '[data-tool]', '[data-pressable]',
        '.game-draggable', '.game-tool', '.game-pressable'
      ];
      
      interactiveSelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            if (el instanceof HTMLElement) {
              // 只添加标记，不添加事件监听器
              el.setAttribute('data-game-interactive', 'true');
              
              if (selector.includes('wood') || 
                  selector.includes('drag') || 
                  selector === '.game-draggable' ||
                  selector === '[data-draggable]') {
                el.setAttribute('data-game-draggable', 'true');
                el.classList.add('game-draggable');
              }
              
              if (selector.includes('brush') || 
                  selector.includes('tool') || 
                  selector === '.game-tool' ||
                  selector === '[data-tool]') {
                el.setAttribute('data-game-tool', 'true');
                el.classList.add('game-tool');
              }
              
              if (selector.includes('press') || 
                  selector.includes('stamp') || 
                  selector.includes('pressure') ||
                  selector === '.game-pressable' ||
                  selector === '[data-pressable]') {
                el.setAttribute('data-game-pressable', 'true');
                el.classList.add('game-pressable');
              }
              
              // 设置触摸行为
              el.style.touchAction = 'none';
            }
          });
        } catch (error) {
          console.warn('标记游戏元素时出错:', error);
        }
      });
    };
    
    // 初始化时标记一次
    markGameElements();
    
    // 延迟再次标记，确保DOM完全加载
    setTimeout(markGameElements, 500);
    
    // 使用 MutationObserver 监听DOM变化
    const observer = new MutationObserver((mutations) => {
      // 只处理新增节点的变化
      const hasAddedNodes = mutations.some(mutation => 
        mutation.addedNodes && mutation.addedNodes.length > 0
      );
      if (hasAddedNodes) {
        setTimeout(markGameElements, 100);
      }
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: false,
      characterData: false
    });
    
    // 清理函数
    return () => {
      observer.disconnect();
      console.log('🔄 游戏防滑系统清理');
    };
  }, [gameState.currentStage]); // 依赖当前阶段，阶段变化时重新标记

  // 拖拽逻辑
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const touch = e.touches[0];
    const target = e.currentTarget as HTMLElement;
    
    setIsDragging(true);
    currentElementRef.current = target;
    setTouchStartPosition({ x: touch.clientX, y: touch.clientY });
    
    // 获取元素当前位置
    const rect = target.getBoundingClientRect();
    setElementStartPosition({ x: rect.left, y: rect.top });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !currentElementRef.current) return;
    
    e.stopPropagation();
    e.preventDefault();
    
    const touch = e.touches[0];
    const currentX = touch.clientX;
    const currentY = touch.clientY;
    
    const deltaX = currentX - touchStartPosition.x;
    const deltaY = currentY - touchStartPosition.y;
    
    // 移动元素
    currentElementRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  }, [isDragging, touchStartPosition.x, touchStartPosition.y]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    setIsDragging(false);
    currentElementRef.current = null;
  }, []);

  const handleGameContainerTouch = useCallback((e: React.TouchEvent) => {
    // 游戏容器自身的触摸事件处理
    // 阻止默认行为，但不阻止冒泡，让子元素处理
    e.preventDefault();
  }, []);

  const goToStage = useCallback((stage: GameStage) => {
    setGameState(prev => ({
      ...prev,
      currentStage: stage,
      completedStages: stage !== 'intro' && stage !== 'complete' 
        ? [...prev.completedStages]
        : prev.completedStages,
    }));
  }, []);

  const completeStage = useCallback((stage: GameStage, data?: Partial<GameState>) => {
    const stageOrder: GameStage[] = ['writing', 'mounting', 'carving', 'inking', 'printing'];
    const currentIndex = stageOrder.indexOf(stage);
    const nextStage = currentIndex < stageOrder.length - 1 
      ? stageOrder[currentIndex + 1] 
      : 'complete';

    setGameState(prev => ({
      ...prev,
      ...data,
      currentStage: nextStage,
      completedStages: [...prev.completedStages, stage],
    }));
  }, []);

  const handleWritingComplete = useCallback((text: string) => {
    completeStage('writing', { writtenText: text, score: gameState.score + 20 });
  }, [completeStage, gameState.score]);

  const handleMountingComplete = useCallback(() => {
    completeStage('mounting', { score: gameState.score + 20 });
  }, [completeStage, gameState.score]);

  const handleCarvingComplete = useCallback((paths: { x: number; y: number; force: number }[][]) => {
    // 根据力度计算额外分数
    const avgForce = paths.length > 0 
      ? paths.flat().reduce((sum, p) => sum + p.force, 0) / paths.flat().length 
      : 0;
    const bonusScore = Math.round(avgForce * 10);
    completeStage('carving', { carvedPaths: paths, score: gameState.score + 20 + bonusScore });
  }, [completeStage, gameState.score]);

  const handleInkingComplete = useCallback((inkLevel: number) => {
    completeStage('inking', { inkLevel, score: gameState.score + Math.round(inkLevel * 0.2) });
  }, [completeStage, gameState.score]);

  const handlePrintingComplete = useCallback((quality: number) => {
    completeStage('printing', { printQuality: quality, score: gameState.score + Math.round(quality * 0.2) });
  }, [completeStage, gameState.score]);

  const handleRestart = useCallback(() => {
    setGameState(initialState);
    hasSetupRef.current = false; // 重置标记，允许重新初始化
  }, []);

  const renderStage = () => {
    switch (gameState.currentStage) {
      case 'intro':
        return <IntroScreen onStart={() => goToStage('writing')} />;
      
      case 'writing':
        return <WritingStage onComplete={handleWritingComplete} />;
      
      case 'mounting':
        return (
          <MountingStage 
            writtenText={gameState.writtenText} 
            onComplete={handleMountingComplete} 
          />
        );
      
      case 'carving':
        return (
          <CarvingStage 
            writtenText={gameState.writtenText}
            onComplete={handleCarvingComplete}
          />
        );
      
      case 'inking':
        return (
          <InkingStage 
            writtenText={gameState.writtenText}
            onComplete={handleInkingComplete}
          />
        );
      
      case 'printing':
        return (
          <PrintingStage 
            writtenText={gameState.writtenText}
            inkLevel={gameState.inkLevel}
            onComplete={handlePrintingComplete}
          />
        );
      
      case 'complete':
        return (
          <CompleteScreen 
            writtenText={gameState.writtenText}
            score={gameState.score}
            onRestart={handleRestart}
          />
        );
      
      default:
        return null;
    }
  };

  const showProgress = gameState.currentStage !== 'intro' && gameState.currentStage !== 'complete';

  return (
    <div 
      className="woodblock-game min-h-screen bg-background relative"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        touchAction: 'none',
        overscrollBehavior: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
      onTouchStart={handleGameContainerTouch}
      onTouchMove={handleGameContainerTouch}
      onTouchEnd={handleGameContainerTouch}
      onTouchCancel={handleGameContainerTouch}
    >
      {/* 游戏内部防滑状态指示器（开发用） */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="fixed top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded text-xs z-50"
          style={{ pointerEvents: 'none' }}
        >
          游戏防滑: {hasSetupRef.current ? '✓' : '✗'} | 拖拽: {isDragging ? '进行中' : '未开始'}
        </div>
      )}
      
      {showProgress && (
        <StageProgress 
          currentStage={gameState.currentStage}
          completedStages={gameState.completedStages}
        />
      )}
      
      <AnimatePresence mode="wait">
        {renderStage()}
      </AnimatePresence>
      
      {/* 游戏专用的内联样式 */}
      <style jsx>{`
        .woodblock-game {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }
        
        .woodblock-game * {
          touch-action: none !important;
          -webkit-user-select: none !important;
          user-select: none !important;
        }
        
        /* 确保拖拽元素有适当的层级 */
        [data-game-draggable] {
          cursor: grab;
          z-index: 10;
          position: relative;
        }
        
        [data-game-draggable]:active {
          cursor: grabbing;
          z-index: 100;
        }
        
        /* 游戏工具样式 */
        [data-game-tool] {
          cursor: pointer;
        }
        
        /* 防止画布被拖动 */
        canvas {
          -webkit-user-drag: none;
          user-drag: none;
        }
      `}</style>
    </div>
  );
}