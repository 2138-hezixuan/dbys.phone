'use client';

import { useEffect, useRef, useState } from 'react';
import { WoodblockGame } from "@/components/game/woodblock-game";
import { useEffect } from 'react'; // 添加这行

export default function Home() {
  useEffect(() => {
    document.title = '刻不容缓 - 传承千年的技艺'; // 添加这行
  }, []);
export default function Home() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [scrollPreventionActive, setScrollPreventionActive] = useState(false);
  const scrollLockInterval = useRef<NodeJS.Timeout | null>(null);
  const isLocked = useRef(false);

  // 主防滑效果 - 极端强化版本
  useEffect(() => {
    if (typeof window === 'undefined' || isLocked.current) return;
    
    console.log('🎮 雕版印刷游戏 - 极端防滑系统启动');
    isLocked.current = true;
    
    // 检测设备类型
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const hasTouch = 'ontouchstart' in window;
    setIsTouchDevice(isMobile || hasTouch);

    // ========== 1. 极端CSS锁定 ==========
    // 使用cssText一次性设置所有样式，避免样式竞争
    document.documentElement.style.cssText = `
      overflow: hidden !important;
      position: fixed !important;
      width: 100% !important;
      height: 100% !important;
      touch-action: none !important;
      -webkit-overflow-scrolling: none !important;
      overscroll-behavior: none !important;
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
    `;
    
    document.body.style.cssText = `
      overflow: hidden !important;
      position: fixed !important;
      width: 100% !important;
      height: 100% !important;
      touch-action: none !important;
      -webkit-overflow-scrolling: none !important;
      overscroll-behavior: none !important;
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
      -webkit-tap-highlight-color: transparent !important;
      -webkit-touch-callout: none !important;
    `;

    // 立即锁定游戏容器
    if (gameContainerRef.current) {
      gameContainerRef.current.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        overflow: hidden !important;
        touch-action: none !important;
        overscroll-behavior: none !important;
        -webkit-overflow-scrolling: none !important;
        -webkit-user-select: none !important;
        user-select: none !important;
        -webkit-tap-highlight-color: transparent !important;
        -webkit-touch-callout: none !important;
        z-index: 9999 !important;
        background-color: var(--background) !important;
      `;
    }

    // ========== 2. 极端JavaScript事件锁定 ==========
    // 阻止所有可能引起滚动的事件 - 在捕获阶段（最早阶段）
    const preventEverything = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };

    // 更全面的事件列表
    const events = [
      'touchstart', 'touchmove', 'touchend', 'touchcancel',
      'wheel', 'mousewheel', 'DOMMouseScroll',
      'scroll', 'keydown', 'keyup', 'keypress',
      'gesturestart', 'gesturechange', 'gestureend',
      'panstart', 'panmove', 'panend', 'swipe',
      'selectstart', 'dragstart', 'contextmenu',
      'pointerdown', 'pointermove', 'pointerup'
    ];

    // 添加事件监听器（捕获阶段 + passive: false）
    events.forEach(eventName => {
      document.addEventListener(eventName, preventEverything, {
        capture: true,    // 捕获阶段
        passive: false    // 允许preventDefault
      });
      
      window.addEventListener(eventName, preventEverything, {
        capture: true,
        passive: false
      });
      
      document.body.addEventListener(eventName, preventEverything, {
        capture: true,
        passive: false
      });
    });

    // ========== 3. iOS特殊处理 ==========
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (isIOS) {
      console.log('📱 iOS设备 - 应用极端防滑');
      
      // 防止弹性滚动
      document.body.style.webkitOverflowScrolling = 'auto';
      document.body.style.overscrollBehavior = 'none';
      
      // 防止下拉刷新
      const preventPullToRefresh = (e: TouchEvent) => {
        if (e.touches.length !== 1) return;
        const touch = e.touches[0];
        if (touch.clientY - touch.screenY > 10) {
          e.preventDefault();
        }
      };
      
      document.addEventListener('touchmove', preventPullToRefresh, {
        capture: true,
        passive: false
      });

      // 防止双击缩放
      let lastTouchEnd = 0;
      const preventDoubleTapZoom = (e: TouchEvent) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      };
      
      document.addEventListener('touchend', preventDoubleTapZoom, {
        capture: true,
        passive: false
      });

      // 防止长按菜单
      document.addEventListener('contextmenu', preventEverything, {
        capture: true,
        passive: false
      });
    }

    // ========== 4. 强制滚动位置锁定 ==========
    const lockScrollPosition = () => {
      // 多个方法确保滚动位置锁定
      window.scrollTo(0, 0);
      window.scrollTo(0, 1); // iOS需要
      window.scrollTo(1, 0); // iOS需要
      
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollLeft = 0;
      }
      
      if (document.body) {
        document.body.scrollTop = 0;
        document.body.scrollLeft = 0;
      }
    };

    // 立即锁定
    lockScrollPosition();
    
    // 定时锁定，防止任何滚动
    scrollLockInterval.current = setInterval(lockScrollPosition, 50); // 更频繁的锁定

    // ========== 5. 监听所有可能的滚动源 ==========
    // 监听窗口大小变化（防止地址栏隐藏/显示）
    window.addEventListener('resize', lockScrollPosition, { passive: false });
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(lockScrollPosition, 100);
      }
    });

    // ========== 6. 监控和调试 ==========
    if (process.env.NODE_ENV === 'development') {
      // 监控滚动事件
      const monitorScroll = () => {
        if (window.scrollY !== 0 || document.documentElement.scrollTop !== 0) {
          console.error('❌ 检测到滚动！位置:', {
            windowScrollY: window.scrollY,
            htmlScrollTop: document.documentElement.scrollTop,
            bodyScrollTop: document.body.scrollTop
          });
          lockScrollPosition();
        }
      };
      
      setInterval(monitorScroll, 100);
    }

    // ========== 7. 防滑状态 ==========
    setScrollPreventionActive(true);
    console.log('✅ 极端防滑系统已激活');

    // ========== 8. 清理函数 ==========
    return () => {
      console.log('🔄 清理极端防滑系统');
      isLocked.current = false;
      
      // 清除定时器
      if (scrollLockInterval.current) {
        clearInterval(scrollLockInterval.current);
      }
      
      // 移除事件监听器
      events.forEach(eventName => {
        document.removeEventListener(eventName, preventEverything, true);
        window.removeEventListener(eventName, preventEverything, true);
        document.body.removeEventListener(eventName, preventEverything, true);
      });
      
      // 移除特殊监听器
      window.removeEventListener('resize', lockScrollPosition);
      document.removeEventListener('visibilitychange', lockScrollPosition);
      
      // 恢复样式（理论上不需要，但为了安全）
      document.documentElement.style.cssText = '';
      document.body.style.cssText = '';
      
      setScrollPreventionActive(false);
    };
  }, []);

  // 游戏容器的触摸事件处理
  const handleGameContainerTouch = (e: React.TouchEvent) => {
    // 极端阻止所有触摸事件的默认行为
    e.preventDefault();
    e.stopPropagation();
  };

  // 添加一个测试按钮来验证防滑效果
  const testScrollLock = () => {
    console.log('🔍 测试滚动锁定状态:');
    console.log('- window.scrollY:', window.scrollY);
    console.log('- document.documentElement.scrollTop:', document.documentElement.scrollTop);
    console.log('- document.body.scrollTop:', document.body.scrollTop);
    console.log('- document.body.style.overflow:', document.body.style.overflow);
    console.log('- document.body.style.position:', document.body.style.position);
    
    // 尝试强制滚动
    window.scrollTo(0, 100);
    setTimeout(() => {
      console.log('✅ 测试后滚动位置:', window.scrollY);
    }, 100);
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
        zIndex: 9999,
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
      {/* 极端防滑状态提示条 */}
      {isTouchDevice && (
        <div 
          className="fixed top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-orange-500 text-white text-center py-2 px-4 text-sm z-50 font-bold shadow-md"
          style={{ 
            userSelect: 'none',
            pointerEvents: 'none',
            opacity: 0.95,
          }}
        >
          🔒 极端防滑模式 - 页面已完全锁定
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
          className="fixed bottom-4 right-4 bg-black/85 text-white p-3 rounded-lg text-xs z-50 border border-red-500/50 shadow-lg"
          style={{ userSelect: 'none', minWidth: '200px' }}
        >
          <div className="font-bold mb-2 flex items-center">
            <div className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></div>
            极端防滑系统
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>防滑状态:</span>
              <span className={`font-bold ${scrollPreventionActive ? 'text-red-400' : 'text-gray-400'}`}>
                {scrollPreventionActive ? '🔒 极端锁定' : '⚠️ 未锁定'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>设备类型:</span>
              <span className="text-blue-300">
                {isTouchDevice ? '📱 移动端' : '🖥️ 桌面端'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>定时锁定:</span>
              <span className="text-yellow-300">20次/秒</span>
            </div>
            <button 
              onClick={testScrollLock}
              className="mt-2 w-full bg-red-700 hover:bg-red-800 text-white py-1 rounded text-xs"
            >
              测试锁定
            </button>
            <div className="text-gray-400 text-xs mt-2 pt-2 border-t border-gray-700">
              页面已完全锁定，无法滑动
            </div>
          </div>
        </div>
      )}

      {/* 极端内联样式 */}
      <style jsx global>{`
        /* 极端CSS覆盖 - 使用最高优先级 */
        html, body, #__next, main, .game-container, .game-content-area {
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
          touch-action: none !important;
          -webkit-overflow-scrolling: none !important;
          overscroll-behavior: none !important;
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
          margin: 0 !important;
          padding: 0 !important;
          top: 0 !important;
          left: 0 !important;
        }
        
        /* 极端防止所有滚动条 */
        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        
        *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          background: transparent !important;
        }
        
        /* 极端防止所有用户交互 */
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-tap-highlight-color: transparent !important;
          -webkit-touch-callout: none !important;
          -webkit-user-drag: none !important;
          user-drag: none !important;
        }
        
        /* 允许按钮和输入框有基本交互 */
        button, input, textarea, [contenteditable] {
          -webkit-user-select: auto !important;
          user-select: auto !important;
          touch-action: manipulation !important;
        }
        
        /* iOS弹性滚动特殊处理 */
        @supports (-webkit-touch-callout: none) {
          html, body {
            height: -webkit-fill-available !important;
            min-height: -webkit-fill-available !important;
            overscroll-behavior-y: none !important;
            -webkit-overflow-scrolling: auto !important;
          }
        }
        
        /* 防止长按出现菜单 */
        * {
          -webkit-touch-callout: none !important;
        }
        
        /* 防止图片拖拽 */
        img {
          pointer-events: none !important;
          -webkit-user-drag: none !important;
          user-drag: none !important;
        }
        
        /* 确保游戏交互元素可点击 */
        [data-game-element],
        [data-draggable],
        [data-interactive],
        [role="button"],
        .clickable,
        .interactive {
          pointer-events: auto !important;
          cursor: pointer !important;
        }
      `}</style>
    </div>
  );
}