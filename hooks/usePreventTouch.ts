'use client';

import { useEffect } from 'react';

/**
 * 自定义Hook：防止移动端触摸滑动
 * 专为雕版印刷游戏设计
 */
export function usePreventTouch() {
  useEffect(() => {
    // 只在客户端执行
    if (typeof window === 'undefined') return;
    
    console.log('防滑功能已启用 - 雕版印刷游戏');
    
    // 记录原始样式，以便恢复
    const originalBodyStyle = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      width: document.body.style.width,
      height: document.body.style.height,
      touchAction: document.body.style.touchAction,
    };
    
    const originalHtmlStyle = {
      overflow: document.documentElement.style.overflow,
    };
    
    // 立即设置样式防止滚动
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.touchAction = 'none';
    document.documentElement.style.overflow = 'hidden';
    
    // 阻止所有触摸和滚动事件的默认行为
    const preventDefault = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    
    // 阻止的事件类型列表
    const eventsToPrevent = [
      'touchstart',
      'touchmove',
      'touchend',
      'touchcancel',
      'gesturestart',
      'gesturechange',
      'gestureend',
      'wheel',
      'mousewheel',
      'DOMMouseScroll', // Firefox
      'scroll',
    ];
    
    // 添加事件监听器
    eventsToPrevent.forEach(event => {
      document.addEventListener(event, preventDefault, { 
        passive: false, // 重要：设为false才能调用preventDefault
        capture: true   // 捕获阶段处理
      });
    });
    
    // 阻止上下文菜单（长按菜单）
    document.addEventListener('contextmenu', preventDefault);
    
    // 防止双击缩放（移动端）
    let lastTouchEnd = 0;
    const preventDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };
    
    document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });
    
    // 防止键盘弹出（针对移动端输入）
    const preventKeyboard = (e: FocusEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // 如果有输入框，可以允许
        return;
      }
      (e.target as HTMLElement)?.blur();
    };
    
    document.addEventListener('focusin', preventKeyboard);
    
    // 清理函数：组件卸载时移除事件监听
    return () => {
      console.log('清理防滑事件监听器');
      
      // 恢复原始样式
      document.body.style.overflow = originalBodyStyle.overflow;
      document.body.style.position = originalBodyStyle.position;
      document.body.style.width = originalBodyStyle.width;
      document.body.style.height = originalBodyStyle.height;
      document.body.style.touchAction = originalBodyStyle.touchAction;
      document.documentElement.style.overflow = originalHtmlStyle.overflow;
      
      // 移除事件监听器
      eventsToPrevent.forEach(event => {
        document.removeEventListener(event, preventDefault);
      });
      
      document.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('touchend', preventDoubleTapZoom);
      document.removeEventListener('focusin', preventKeyboard);
    };
  }, []); // 空依赖数组，只在组件挂载时执行一次
}