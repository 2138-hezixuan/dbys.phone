'use client';

import { ReactNode } from 'react';

interface TouchPreventWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * 游戏防滑包装组件
 * 为雕版印刷游戏设计的触摸事件处理包装器
 */
export default function TouchPreventWrapper({ 
  children, 
  className = '' 
}: TouchPreventWrapperProps) {
  
  // 处理触摸事件，阻止默认行为
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    // 防止多点触控导致的问题
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  };
  
  return (
    <div 
      className={`game-container ${className}`}
      onTouchMove={handleTouchMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={(e) => e.stopPropagation()}
      onTouchCancel={(e) => e.stopPropagation()}
      // 阻止鼠标滚轮
      onWheel={(e) => e.preventDefault()}
      style={{
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
    >
      {children}
    </div>
  );
}