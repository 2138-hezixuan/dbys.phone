"use client";

import { useEffect } from 'react';

/**
 * 绝对强制防滑组件
 * 这个组件必须放在游戏的最外层，确保100%防滑
 */
export function ForceNoScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    console.log('🛡️ 绝对强制防滑系统启动');
    
    // ===== 1. CSS绝对锁定 =====
    // 立即应用样式，不等待CSS加载
    const originalStyles = {
      html: {
        overflow: document.documentElement.style.overflow,
        position: document.documentElement.style.position,
        touchAction: document.documentElement.style.touchAction,
        height: document.documentElement.style.height,
      },
      body: {
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        touchAction: document.body.style.touchAction,
        width: document.body.style.width,
        height: document.body.style.height,
        top: document.body.style.top,
        left: document.body.style.left,
        margin: document.body.style.margin,
        padding: document.body.style.padding,
      }
    };
    
    // 对html和body应用绝对锁定
    document.documentElement.style.cssText = `
      overflow: hidden !important;
      position: fixed !important;
      touch-action: none !important;
      width: 100% !important;
      height: 100% !important;
      -webkit-overflow-scrolling: none !important;
      overscroll-behavior: none !important;
    `;
    
    document.body.style.cssText = `
      overflow: hidden !important;
      position: fixed !important;
      touch-action: none !important;
      width: 100% !important;
      height: 100% !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      -webkit-overflow-scrolling: none !important;
      overscroll-behavior: none !important;
      -webkit-user-select: none !important;
      user-select: none !important;
    `;
    
    // ===== 2. JavaScript事件绝对阻止 =====
    // 在捕获阶段（最早阶段）阻止所有可能引起滚动的事件
    const preventAll = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };
    
    // 核心事件列表
    const events = [
      'touchstart',
      'touchmove',
      'touchend',
      'touchcancel',
      'wheel',
      'mousewheel',
      'DOMMouseScroll',
      'scroll',
      'keydown',
      'keyup',
      'keypress'
    ];
    
    // 添加事件监听器（捕获阶段 + passive: false）
    events.forEach(eventName => {
      document.addEventListener(eventName, preventAll, {
        capture: true,    // 捕获阶段
        passive: false    // 允许preventDefault
      });
      
      window.addEventListener(eventName, preventAll, {
        capture: true,
        passive: false
      });
      
      document.body.addEventListener(eventName, preventAll, {
        capture: true,
        passive: false
      });
    });
    
    // ===== 3. iOS特殊处理 =====
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    if (isIOS) {
      console.log('📱 iOS设备 - 应用特殊防滑');
      
      // 防止弹性滚动
      document.body.style.webkitOverflowScrolling = 'auto';
      document.body.style.overscrollBehavior = 'none';
      
      // 防止双击缩放
      let lastTouchTime = 0;
      const preventDoubleTapZoom = (e: TouchEvent) => {
        const now = Date.now();
        if (now - lastTouchTime < 500) {
          e.preventDefault();
          e.stopPropagation();
        }
        lastTouchTime = now;
      };
      
      document.addEventListener('touchend', preventDoubleTapZoom, {
        capture: true,
        passive: false
      });
      
      // 防止长按菜单
      document.addEventListener('contextmenu', preventAll, {
        capture: true,
        passive: false
      });
    }
    
    // ===== 4. 确保游戏容器绝对锁定 =====
    const ensureGameContainerLocked = () => {
      const gameContainer = document.querySelector('.game-container, [data-game-container]');
      if (gameContainer && gameContainer instanceof HTMLElement) {
        gameContainer.style.cssText = `
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          overflow: hidden !important;
          touch-action: none !important;
          -webkit-overflow-scrolling: none !important;
          overscroll-behavior: none !important;
          z-index: 9999 !important;
        `;
        
        // 为游戏容器添加事件监听
        gameContainer.addEventListener('touchstart', preventAll, {
          capture: true,
          passive: false
        });
        gameContainer.addEventListener('touchmove', preventAll, {
          capture: true,
          passive: false
        });
      }
    };
    
    // 立即执行一次
    ensureGameContainerLocked();
    
    // 延迟再次检查，确保DOM加载完成
    setTimeout(ensureGameContainerLocked, 100);
    setTimeout(ensureGameContainerLocked, 500);
    
    // ===== 5. 强制滚动位置锁定 =====
    const lockScrollPosition = () => {
      window.scrollTo(0, 0);
      window.scrollTo(0, 1); // iOS Safari 需要
      window.scrollTo(1, 0); // iOS Safari 需要
      
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
    const scrollLockInterval = setInterval(lockScrollPosition, 100);
    
    // ===== 6. 监听所有可能的滚动源 =====
    // 监听窗口大小变化（防止地址栏隐藏/显示）
    window.addEventListener('resize', lockScrollPosition);
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        lockScrollPosition();
        ensureGameContainerLocked();
      }
    });
    
    // ===== 7. 清理函数 =====
    return () => {
      console.log('🔄 清理绝对防滑系统');
      
      // 清除定时器
      clearInterval(scrollLockInterval);
      
      // 移除事件监听器
      events.forEach(eventName => {
        document.removeEventListener(eventName, preventAll, true);
        window.removeEventListener(eventName, preventAll, true);
        document.body.removeEventListener(eventName, preventAll, true);
      });
      
      // 恢复原始样式
      Object.keys(originalStyles.html).forEach(key => {
        document.documentElement.style[key] = originalStyles.html[key];
      });
      
      Object.keys(originalStyles.body).forEach(key => {
        document.body.style[key] = originalStyles.body[key];
      });
      
      window.removeEventListener('resize', lockScrollPosition);
      document.removeEventListener('visibilitychange', lockScrollPosition);
    };
  }, []);
  
  // 这个组件不渲染任何内容
  return null;
}