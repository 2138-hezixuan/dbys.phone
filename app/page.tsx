'use client'; // 必须添加这行，因为我们要使用客户端钩子

import { useEffect } from 'react';
import { WoodblockGame } from "@/components/game/woodblock-game";
import { usePreventTouch } from '@/hooks/usePreventTouch';

export default function Home() {
  // 使用防触摸Hook - 这是移动端防滑的核心
  usePreventTouch();
  
  // 额外的防滑措施 - 增强保护
  useEffect(() => {
    // 只在客户端执行
    if (typeof window === 'undefined') return;
    
    console.log('雕版印刷游戏 - 防滑功能已初始化');
    
    // 1. 防止拖拽行为
    const preventDrag = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };
    
    // 2. 防止文本选择
    const preventSelection = (e: Event) => {
      e.preventDefault();
      return false;
    };
    
    // 3. 防止键盘快捷键导致的缩放
    const preventZoomShortcut = (e: KeyboardEvent) => {
      // 防止 Ctrl/Cmd + 加号/减号/0 缩放
      if ((e.ctrlKey || e.metaKey) && 
          (e.key === '+' || e.key === '-' || e.key === '0' || e.key === '=')) {
        e.preventDefault();
      }
    };
    
    // 4. 更严格的防止滚动 - 针对某些浏览器的特殊行为
    const strictPreventScroll = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    
    // 添加额外的事件监听器
    const dragEvents: Array<keyof DocumentEventMap> = ['dragstart', 'dragover', 'drop'];
    dragEvents.forEach(event => {
      document.addEventListener(event, preventDrag as EventListener);
    });
    
    document.addEventListener('selectstart', preventSelection);
    document.addEventListener('keydown', preventZoomShortcut);
    
    // 添加更严格的滚动阻止
    const scrollEvents: Array<keyof DocumentEventMap> = ['scroll', 'wheel', 'mousewheel'];
    scrollEvents.forEach(event => {
      document.addEventListener(event, strictPreventScroll, { 
        passive: false,
        capture: true 
      });
    });
    
    // 5. 针对iOS的特殊处理
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream) {
      console.log('检测到iOS设备，应用额外防滑措施');
      
      // 防止iOS的弹性滚动
      const preventElasticScroll = (e: TouchEvent) => {
        if (document.body.scrollTop !== 0 || document.documentElement.scrollTop !== 0) {
          e.preventDefault();
        }
      };
      
      document.addEventListener('touchmove', preventElasticScroll, { passive: false });
      
      // iOS双击缩放阻止
      let lastTouchTime = 0;
      const preventDoubleTap = (e: TouchEvent) => {
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - lastTouchTime;
        
        if (timeDiff < 300 && timeDiff > 0) {
          e.preventDefault();
        }
        
        lastTouchTime = currentTime;
      };
      
      document.addEventListener('touchend', preventDoubleTap, { passive: false });
      
      // 清理iOS特定监听器
      return () => {
        document.removeEventListener('touchmove', preventElasticScroll);
        document.removeEventListener('touchend', preventDoubleTap);
        dragEvents.forEach(event => {
          document.removeEventListener(event, preventDrag as EventListener);
        });
        document.removeEventListener('selectstart', preventSelection);
        document.removeEventListener('keydown', preventZoomShortcut);
        scrollEvents.forEach(event => {
          document.removeEventListener(event, strictPreventScroll);
        });
      };
    }
    
    // 清理函数
    return () => {
      console.log('清理页面防滑事件监听器');
      
      dragEvents.forEach(event => {
        document.removeEventListener(event, preventDrag as EventListener);
      });
      
      document.removeEventListener('selectstart', preventSelection);
      document.removeEventListener('keydown', preventZoomShortcut);
      scrollEvents.forEach(event => {
        document.removeEventListener(event, strictPreventScroll);
      });
    };
  }, []); // 空依赖数组，只在组件挂载时执行一次
  
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
    }
  }, []);
  
  return (
    // 使用游戏容器包装，确保防滑样式生效
    <div className="game-container">
      {/* 添加防滑提示（只在移动端显示） */}
      {typeof window !== 'undefined' && 
       /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) && (
        <div className="fixed top-0 left-0 right-0 bg-[var(--accent)] text-[var(--accent-foreground)] text-center py-1 text-sm z-50">
          防滑模式已启用 - 尽情体验雕版印刷
        </div>
      )}
      
      {/* 雕版印刷游戏主体 */}
      <WoodblockGame />
      
      {/* 防滑功能状态指示器（开发调试用） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-xs z-50">
          防滑状态: <span className="text-green-400">✓ 正常</span>
        </div>
      )}
    </div>
  );
}