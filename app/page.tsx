'use client'; // 必须添加这行，因为我们要使用客户端钩子

import { useEffect, useRef } from 'react';
import { WoodblockGame } from "@/components/game/woodblock-game";

export default function Home() {
  // 使用 ref 来跟踪游戏状态
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  // 专门处理游戏交互元素的防滑
  useEffect(() => {
    // 只在客户端执行
    if (typeof window === 'undefined') return;
    
    console.log('雕版印刷游戏 - 页面加载');
    
    // 标记游戏交互元素
    const markGameElements = () => {
      // 延迟执行，确保DOM已加载
      setTimeout(() => {
        // 查找并标记游戏交互元素
        const interactiveSelectors = [
          '.wood-block', '.ink-brush', '.carving-tool', '.paper-sheet',
          '.draggable', '.drag-handle', '.brush-tool',
          '.press-area', '.pressure-zone', '.stamp-area',
          '[data-draggable]', '[data-drag]', '[data-tool]'
        ];
        
        interactiveSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            if (el instanceof HTMLElement) {
              // 添加游戏交互标记
              el.setAttribute('data-game-interactive', 'true');
              
              // 根据元素类型添加特定标记
              if (selector.includes('wood') || selector.includes('draggable') || selector.includes('drag')) {
                el.setAttribute('data-game-draggable', 'true');
                el.classList.add('game-draggable');
              }
              
              if (selector.includes('brush') || selector.includes('tool')) {
                el.setAttribute('data-game-tool', 'true');
                el.classList.add('game-tool');
              }
              
              if (selector.includes('press') || selector.includes('stamp')) {
                el.setAttribute('data-game-pressable', 'true');
                el.classList.add('game-pressable');
              }
              
              // 设置触摸行为
              el.style.touchAction = 'none';
            }
          });
        });
        
        console.log(`标记了游戏交互元素`);
      }, 500); // 延迟500ms，确保游戏组件已加载
    };
    
    // 执行标记
    markGameElements();
    
    // 监听游戏区域外的触摸事件，阻止滚动
    const handleTouchMoveOutsideGame = (e: TouchEvent) => {
      // 检查触摸目标是否是游戏交互元素
      const target = e.target as HTMLElement;
      const isGameElement = 
        target.hasAttribute('data-game-interactive') ||
        target.closest('[data-game-interactive]') ||
        target.classList.contains('game-draggable') ||
        target.classList.contains('game-tool') ||
        target.classList.contains('game-pressable') ||
        target.closest('.game-draggable') ||
        target.closest('.game-tool') ||
        target.closest('.game-pressable');
      
      // 如果不是游戏元素，阻止滚动
      if (!isGameElement) {
        e.preventDefault();
      }
    };
    
    // 添加事件监听器
    document.addEventListener('touchmove', handleTouchMoveOutsideGame, { 
      passive: false,
      capture: true 
    });
    
    // 防止拖拽行为
    const preventDrag = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };
    
    document.addEventListener('dragstart', preventDrag);
    document.addEventListener('dragover', preventDrag);
    document.addEventListener('drop', preventDrag);
    
    // 防止文本选择
    const preventSelection = (e: Event) => {
      e.preventDefault();
      return false;
    };
    
    document.addEventListener('selectstart', preventSelection);
    
    // 针对 iOS 的特殊处理
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      console.log('iOS设备检测 - 应用额外优化');
      
      // 防止 iOS 弹性滚动
      const handleIOSScroll = () => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      };
      
      // 监听滚动事件
      window.addEventListener('scroll', handleIOSScroll, { passive: false });
      
      // 防止双击缩放
      let lastTouchTime = 0;
      const preventDoubleTap = (e: TouchEvent) => {
        const currentTime = new Date().getTime();
        if (currentTime - lastTouchTime < 300) {
          e.preventDefault();
        }
        lastTouchTime = currentTime;
      };
      
      document.addEventListener('touchend', preventDoubleTap, { passive: false });
      
      // 清理 iOS 特定监听器
      return () => {
        window.removeEventListener('scroll', handleIOSScroll);
        document.removeEventListener('touchend', preventDoubleTap);
      };
    }
    
    // 清理函数
    return () => {
      console.log('清理页面事件监听器');
      
      document.removeEventListener('touchmove', handleTouchMoveOutsideGame);
      document.removeEventListener('dragstart', preventDrag);
      document.removeEventListener('dragover', preventDrag);
      document.removeEventListener('drop', preventDrag);
      document.removeEventListener('selectstart', preventSelection);
    };
  }, []); // 空依赖数组，只在组件挂载时执行一次
  
  // 处理游戏组件的防滑逻辑
  const handleGameInteraction = (e: React.TouchEvent) => {
    // 这个函数可以在游戏组件中调用，处理具体的游戏交互
    e.stopPropagation();
    // 游戏交互逻辑...
  };
  
  // 检查当前设备类型
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isTouchDevice = 'ontouchstart' in window;
      
      console.log('设备信息:', {
        userAgent: navigator.userAgent,
        isMobile,
        isTouchDevice,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight
      });
      
      // 如果是移动设备，添加特殊处理
      if (isMobile) {
        // 防止地址栏/工具栏滚动
        const scrollToTop = () => {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        };
        
        // 页面加载后滚动到顶部
        setTimeout(scrollToTop, 100);
        
        // 监听窗口大小变化（防止地址栏隐藏/显示导致的滚动）
        window.addEventListener('resize', scrollToTop);
        
        return () => {
          window.removeEventListener('resize', scrollToTop);
        };
      }
    }
  }, []);
  
  return (
    // 使用游戏容器包装，确保防滑样式生效
    <div 
      ref={gameContainerRef}
      className="game-container"
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
      // 这些事件处理器确保游戏容器本身不滚动
      onTouchMove={(e) => {
        // 只在非游戏交互元素上阻止
        const target = e.target as HTMLElement;
        if (!target.hasAttribute('data-game-interactive') && 
            !target.closest('[data-game-interactive]')) {
          e.preventDefault();
        }
      }}
      onWheel={(e) => e.preventDefault()}
    >
      {/* 添加防滑提示（只在移动端显示） */}
      {typeof window !== 'undefined' && 
       /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && (
        <div 
          className="fixed top-0 left-0 right-0 bg-[var(--accent)] text-[var(--accent-foreground)] text-center py-1 text-sm z-50"
          style={{ userSelect: 'none' }}
        >
          防滑模式已启用 - 尽情体验雕版印刷
        </div>
      )}
      
      {/* 雕版印刷游戏主体 */}
      <WoodblockGame />
      
      {/* 防滑功能状态指示器（开发调试用） */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="fixed bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-xs z-50"
          style={{ userSelect: 'none' }}
        >
          防滑状态: <span className="text-green-400">✓ 正常</span>
        </div>
      )}
      
      {/* 添加一些内联样式确保防滑 */}
      <style jsx global>{`
        /* 确保游戏容器内的所有元素默认不滚动 */
        .game-container * {
          -webkit-overflow-scrolling: none !important;
          overscroll-behavior: none !important;
        }
        
        /* 游戏交互元素样式 */
        [data-game-interactive],
        .game-draggable,
        .game-tool,
        .game-pressable {
          touch-action: none !important;
          pointer-events: auto !important;
          -webkit-tap-highlight-color: transparent !important;
          user-select: none !important;
        }
        
        /* 针对iOS的特殊处理 */
        @supports (-webkit-touch-callout: none) {
          .game-container {
            -webkit-touch-callout: none !important;
          }
        }
        
        /* 防止滚动条闪现 */
        .game-container::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
      `}</style>
    </div>
  );
}