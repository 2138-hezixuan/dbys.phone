"use client";

import { useState, useCallback, useEffect } from "react";
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

  // 防滑初始化
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    console.log('雕版印刷游戏 - 防滑初始化');
    
    // 标记游戏交互元素的辅助函数
    const markGameElements = () => {
      // 延迟执行，确保DOM已加载
      setTimeout(() => {
        // 查找并标记所有游戏交互元素
        const interactiveSelectors = [
          '.wood-block', '.ink-brush', '.carving-tool', '.paper-sheet',
          '.draggable', '.drag-handle', '.brush-tool', '.brush-handle',
          '.press-area', '.pressure-zone', '.stamp-area', '.printing-press',
          '[data-draggable]', '[data-drag]', '[data-tool]', '[data-pressable]',
          '.game-draggable', '.game-tool', '.game-pressable'
        ];
        
        interactiveSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            if (el instanceof HTMLElement) {
              // 添加游戏交互标记
              el.setAttribute('data-game-interactive', 'true');
              
              // 根据选择器添加特定标记
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
              
              // 添加事件监听器
              if (el.hasAttribute('data-game-draggable')) {
                el.addEventListener('touchstart', handleTouchStart, { passive: false });
                el.addEventListener('touchmove', handleTouchMove, { passive: false });
                el.addEventListener('touchend', handleTouchEnd);
              }
              
              if (el.hasAttribute('data-game-pressable')) {
                el.addEventListener('touchstart', handleTouchStart, { passive: false });
                el.addEventListener('touchend', handleTouchEnd);
              }
            }
          });
        });
        
        console.log(`标记了游戏交互元素`);
      }, 300);
    };
    
    // 触摸事件处理
    let isDragging = false;
    let touchStartX = 0;
    let touchStartY = 0;
    let elementStartX = 0;
    let elementStartY = 0;
    let currentElement: HTMLElement | null = null;
    
    const handleTouchStart = (e: TouchEvent) => {
      e.stopPropagation();
      isDragging = true;
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      
      currentElement = e.target as HTMLElement;
      
      // 获取元素当前位置
      if (currentElement) {
        const rect = currentElement.getBoundingClientRect();
        elementStartX = rect.left;
        elementStartY = rect.top;
      }
      
      // 防止默认行为（页面滚动）
      e.preventDefault();
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !currentElement) return;
      
      e.stopPropagation();
      const touch = e.touches[0];
      const currentX = touch.clientX;
      const currentY = touch.clientY;
      
      const deltaX = currentX - touchStartX;
      const deltaY = currentY - touchStartY;
      
      const newX = elementStartX + deltaX;
      const newY = elementStartY + deltaY;
      
      // 移动元素
      currentElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      
      // 防止页面滚动
      e.preventDefault();
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      isDragging = false;
      currentElement = null;
      e.stopPropagation();
    };
    
    // 防止页面滚动
    const preventPageScroll = (e: TouchEvent) => {
      // 检查是否是游戏交互元素
      const target = e.target as HTMLElement;
      const isGameElement = 
        target.hasAttribute('data-game-interactive') ||
        target.closest('[data-game-interactive]') ||
        target.classList.contains('game-draggable') ||
        target.classList.contains('game-tool') ||
        target.classList.contains('game-pressable');
      
      // 如果不是游戏元素，阻止滚动
      if (!isGameElement) {
        e.preventDefault();
      }
    };
    
    // 添加事件监听器
    document.addEventListener('touchmove', preventPageScroll, { 
      passive: false,
      capture: true 
    });
    
    // 标记游戏元素
    markGameElements();
    
    // 监听阶段变化，重新标记元素
    const observer = new MutationObserver(markGameElements);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true,
      attributes: false,
      characterData: false
    });
    
    return () => {
      // 清理事件监听器
      document.removeEventListener('touchmove', preventPageScroll);
      observer.disconnect();
    };
  }, [gameState.currentStage]); // 依赖当前阶段，阶段变化时重新初始化

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
      className="min-h-screen bg-background relative"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        touchAction: 'none',
        overscrollBehavior: 'none',
      }}
    >
      {showProgress && (
        <StageProgress 
          currentStage={gameState.currentStage}
          completedStages={gameState.completedStages}
        />
      )}
      
      <AnimatePresence mode="wait">
        {renderStage()}
      </AnimatePresence>
    </div>
  );
}