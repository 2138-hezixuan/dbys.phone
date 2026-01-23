'use client';

import { useEffect, useRef, useState } from 'react';
import { WoodblockGame } from "@/components/game/woodblock-game";

export default function Home() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [scrollPreventionActive, setScrollPreventionActive] = useState(false);
  
  // 主防滑效果
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    console.log('🎮 雕版印刷游戏 - 防滑系统启动');
    
    // 检测设备类型
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const hasTouch = 'ontouchstart' in window;
    setIsTouchDevice(isMobile || hasTouch);
    
    // 保存原始样式以便恢复
    const originalBodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      width: document.body.style.width,
      height: document.body.style.height,
      top: document.body.style.top,
      left: document.body.style.left,
    };
    
    const originalHtmlStyles = {
      overflow: document.documentElement.style.overflow,
    };
    
    // 应用防滑样式到body和html
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.top = '0';
    document.body.style.left = '0';
    document.body.style.touchAction = 'none';
    document.body.style.msTouchAction = 'none';
    document.body.style.webkitOverflowScrolling = 'none';
    
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.touchAction = 'none';
    
    // 核心防滑函数
    const preventDefaultScroll = (e: Event) => {
      e.preventDefault();
      return false;
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      // 记录触摸开始时间，用于防止双击缩放
      if (gameContainerRef.current) {
        gameContainerRef.current.dataset.lastTouchStart = Date.now().toString();
      }
      
      // 总是阻止默认行为
      e.preventDefault();
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      // 重要：阻止所有触摸移动导致的滚动
      e.preventDefault();
      
      // 防止多点触控导致的缩放
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
    };
    
    // iOS特殊处理：防止双击缩放
    const handleDoubleTap = (e: TouchEvent) => {
      const now = Date.now();
      const lastTouch = gameContainerRef.current?.dataset.lastTouchStart;
      
      if (lastTouch && (now - parseInt(lastTouch)) < 500) {
        e.preventDefault();
      }
    };
    
    // 防止键盘滚动
    const preventKeyboardScroll = (e: KeyboardEvent) => {
      const scrollKeys = [
        'Space', 'ArrowUp', 'ArrowDown', 
        'ArrowLeft', 'ArrowRight', 'PageUp', 
        'PageDown', 'Home', 'End'
      ];
      
      if (scrollKeys.includes(e.code)) {
        e.preventDefault();
      }
    };
    
    // 防止鼠标滚轮滚动
    const preventWheelScroll = (e: WheelEvent) => {
      e.preventDefault();
    };
    
    // 配置事件监听选项
    const passiveFalseOptions = { passive: false };
    const captureOptions = { passive: false, capture: true };
    
    // 添加事件监听器
    // 1. 触摸事件
    document.addEventListener('touchstart', handleTouchStart, captureOptions);
    document.addEventListener('touchmove', handleTouchMove, captureOptions);
    document.addEventListener('touchend', handleTouchEnd, captureOptions);
    document.addEventListener('touchcancel', handleTouchEnd, captureOptions);
    
    // 2. 防止双击缩放（iOS）
    document.addEventListener('touchend', handleDoubleTap, passiveFalseOptions);
    
    // 3. 防止键盘滚动
    document.addEventListener('keydown', preventKeyboardScroll, passiveFalseOptions);
    
    // 4. 防止滚轮滚动
    document.addEventListener('wheel', preventWheelScroll, passiveFalseOptions);
    
    // 5. 防止拖拽选择文本
    document.addEventListener('selectstart', preventDefaultScroll, passiveFalseOptions);
    document.addEventListener('dragstart', preventDefaultScroll, passiveFalseOptions);
    
    // 6. 防止上下文菜单
    document.addEventListener('contextmenu', preventDefaultScroll, passiveFalseOptions);
    
    // 设置状态
    setScrollPreventionActive(true);
    
    console.log('✅ 防滑系统已激活');
    
    // 清理函数
    return () => {
      console.log('🔄 清理防滑系统');
      
      // 移除事件监听器
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
      document.removeEventListener('touchend', handleDoubleTap);
      document.removeEventListener('keydown', preventKeyboardScroll);
      document.removeEventListener('wheel', preventWheelScroll);
      document.removeEventListener('selectstart', preventDefaultScroll);
      document.removeEventListener('dragstart', preventDefaultScroll);
      document.removeEventListener('contextmenu', preventDefaultScroll);
      
      // 恢复原始样式
      Object.keys(originalBodyStyles).forEach(key => {
        document.body.style[key] = originalBodyStyles[key];
      });
      
      Object.keys(originalHtmlStyles).forEach(key => {
        document.documentElement.style[key] = originalHtmlStyles[key];
      });
      
      setScrollPreventionActive(false);
    };
  }, []);
  
  // 额外的防滑：监听滚动事件并立即重置
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const resetScrollPosition = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    
    // 监听滚动事件
    window.addEventListener('scroll', resetScrollPosition, { passive: false });
    
    // 初始滚动到顶部
    resetScrollPosition();
    
    // 监听窗口大小变化（防止移动端地址栏隐藏/显示导致滚动）
    window.addEventListener('resize', resetScrollPosition);
    
    return () => {
      window.removeEventListener('scroll', resetScrollPosition);
      window.removeEventListener('resize', resetScrollPosition);
    };
  }, []);
  
  // 游戏容器的触摸事件处理
  const handleGameContainerTouch = (e: React.TouchEvent) => {
    // 阻止所有触摸事件的默认行为
    e.preventDefault();
    e.stopPropagation();
  };
  
  return (
    <div 
      ref={gameContainerRef}
      className="game-container"
      style={{
        // 布局样式
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        
        // 防滑样式
        touchAction: 'none',
        overscrollBehavior: 'none',
        
        // 用户交互样式
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        userSelect: 'none',
        
        // 特定浏览器兼容性
        msTouchAction: 'none',
        msContentZooming: 'none',
        msScrollChaining: 'none',
        
        // 视觉样式
        backgroundColor: 'var(--background)',
        zIndex: 0,
      }}
      // 触摸事件处理器
      onTouchStart={handleGameContainerTouch}
      onTouchMove={handleGameContainerTouch}
      onTouchEnd={handleGameContainerTouch}
      onTouchCancel={handleGameContainerTouch}
      // 鼠标事件处理器
      onWheel={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 防滑状态提示条 */}
      {isTouchDevice && (
        <div 
          className="fixed top-0 left-0 right-0 bg-gradient-to-r from-green-600 to-emerald-500 text-white text-center py-2 px-4 text-sm z-50 font-bold shadow-md"
          style={{ 
            userSelect: 'none',
            pointerEvents: 'none',
            opacity: 0.95,
          }}
        >
          🎮 防滑模式已启用 - 可放心拖拽游戏元素，不会滑动页面
        </div>
      )}
      
      {/* 游戏区域 */}
      <div 
        className="game-content-area"
        style={{
          width: '100%',
          height: '100%',
          touchAction: 'none',
          userSelect: 'none',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <WoodblockGame />
      </div>
      
      {/* 开发调试面板 */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="fixed bottom-4 right-4 bg-black/85 text-white p-3 rounded-lg text-xs z-50 border border-green-500/50 shadow-lg"
          style={{ userSelect: 'none', minWidth: '200px' }}
        >
          <div className="font-bold mb-2 flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
            防滑系统状态
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>防滑状态:</span>
              <span className={`font-bold ${scrollPreventionActive ? 'text-green-400' : 'text-red-400'}`}>
                {scrollPreventionActive ? '✓ 正常' : '✗ 异常'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>设备类型:</span>
              <span className="text-blue-300">
                {isTouchDevice ? '📱 移动端' : '🖥️ 桌面端'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>滚动锁定:</span>
              <span className="text-yellow-300">已强制锁定</span>
            </div>
            <div className="text-gray-400 text-xs mt-2 pt-2 border-t border-gray-700">
              页面滑动已完全禁用 • 游戏交互正常
            </div>
          </div>
        </div>
      )}
      
      {/* 全局内联样式 - 最高优先级 */}
      <style jsx global>{`
        /* 最重要：完全禁用html和body的滚动 */
        html, body {
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
          touch-action: none !important;
          -webkit-overflow-scrolling: none !important;
          overscroll-behavior: none !important;
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        
        /* 防止任何滚动条闪现 */
        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        
        *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        
        /* 游戏容器内所有元素防滑 */
        .game-container,
        .game-container *,
        .game-content-area,
        .game-content-area * {
          touch-action: none !important;
          -webkit-tap-highlight-color: transparent !important;
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
          -khtml-user-drag: none !important;
          -moz-user-drag: none !important;
          -o-user-drag: none !important;
          user-drag: none !important;
        }
        
        /* 防止iOS Safari的弹性滚动 */
        @supports (-webkit-touch-callout: none) {
          body {
            /* 防止iOS下拉刷新 */
            overscroll-behavior-y: none !important;
            /* 防止弹性效果 */
            -webkit-overflow-scrolling: auto !important;
          }
        }
        
        /* 防止文字选中（额外保险） */
        *::selection {
          background: transparent !important;
        }
        
        *::-moz-selection {
          background: transparent !important;
        }
        
        /* 确保游戏交互元素可点击 */
        button, 
        [role="button"],
        [onclick],
        .clickable,
        .interactive {
          cursor: pointer !important;
          pointer-events: auto !important;
        }
        
        /* 防止长按菜单 */
        a, img, div {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
        }
        
        /* 防止图片拖动 */
        img {
          pointer-events: none !important;
        }
        
        /* 针对游戏组件的特殊处理 */
        [data-game-element],
        [data-draggable],
        [data-interactive] {
          touch-action: none !important;
          pointer-events: auto !important;
        }
      `}</style>
    </div>
  );
}