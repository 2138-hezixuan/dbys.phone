import React from "react"
import type { Metadata, Viewport } from 'next'
import { Noto_Serif_SC, Ma_Shan_Zheng } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const notoSerifSC = Noto_Serif_SC({ 
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: '--font-serif-sc'
});

const maShanZheng = Ma_Shan_Zheng({ 
  subsets: ["latin"],
  weight: ["400"],
  variable: '--font-brush'
});

export const metadata: Metadata = {
  title: '雕版印刷 - 传承千年的技艺',
  description: '体验中国传统雕版印刷工艺，通过互动游戏学习写样、上板、刻版、刷墨、印刷五大步骤',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  // 添加移动端相关元数据
  appleWebApp: {
    capable: true,
    title: '雕版印刷',
    statusBarStyle: 'black-translucent',
  },
  // 添加其他移动端元数据
  applicationName: '雕版印刷',
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  // 防止搜索引擎转码
  robots: {
    nocache: true,
  },
}

// 单独定义 viewport 配置
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fefefe' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' }
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html 
      lang="zh-CN" 
      className={`${notoSerifSC.variable} ${maShanZheng.variable}`}
      style={{ overflow: 'hidden', touchAction: 'none' }}
      suppressHydrationWarning
    >
      <head>
        {/* 移动端视口控制 - 使用 next/head 的配置 */}
        {/* 禁止自动识别 */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="format-detection" content="date=no" />
        <meta name="format-detection" content="address=no" />
        <meta name="format-detection" content="email=no" />
        
        {/* 禁止搜索引擎转码 */}
        <meta httpEquiv="Cache-Control" content="no-transform" />
        <meta httpEquiv="Cache-Control" content="no-siteapp" />
        
        {/* 防止百度转码 */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta name="renderer" content="webkit" />
        
        {/* PWA相关标签 */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        
        {/* iOS Safari 全屏相关 */}
        <meta name="apple-mobile-web-app-title" content="雕版印刷" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        {/* Android Chrome 相关 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#000000" />
        
        {/* 防止页面被缩放 */}
        <meta name="HandheldFriendly" content="true" />
        
        {/* 防止微软旧版浏览器兼容模式 */}
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="msapplication-TileColor" content="#000000" />
        
        {/* 游戏专用防滑脚本 - 优化版本 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 游戏专用防滑解决方案
              (function() {
                'use strict';
                
                // 只在移动设备上启用
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                const hasTouch = 'ontouchstart' in window;
                
                if (!isMobile && !hasTouch) {
                  console.log('桌面设备，防滑脚本部分功能已禁用');
                  return;
                }
                
                console.log('移动设备，防滑脚本启动');
                
                // 记录触摸开始位置
                let touchStartY = 0;
                let touchStartX = 0;
                let lastTouchEnd = 0;
                let isPreventingScroll = true;
                
                // 判断是否为游戏交互元素
                function isGameInteractiveElement(element) {
                  if (!element) return false;
                  
                  // 检查元素本身
                  if (element.hasAttribute('data-game-draggable') || 
                      element.hasAttribute('data-game-pressable') ||
                      element.hasAttribute('data-game-tool') ||
                      element.hasAttribute('data-game-interactive') ||
                      element.hasAttribute('data-draggable') ||
                      element.hasAttribute('data-pressable') ||
                      element.classList.contains('game-draggable') ||
                      element.classList.contains('game-pressable') ||
                      element.classList.contains('game-tool') ||
                      element.classList.contains('game-interactive') ||
                      element.classList.contains('wood-block') ||
                      element.classList.contains('ink-brush') ||
                      element.classList.contains('carving-tool') ||
                      element.classList.contains('paper-sheet') ||
                      element.classList.contains('draggable') ||
                      element.classList.contains('pressable') ||
                      element.classList.contains('tool-element')) {
                    return true;
                  }
                  
                  // 检查父元素链
                  let parent = element.parentElement;
                  while (parent) {
                    if (parent.hasAttribute('data-game-interactive') ||
                        parent.classList.contains('game-interactive') ||
                        parent.classList.contains('game-container') ||
                        parent.classList.contains('game-content')) {
                      return true;
                    }
                    parent = parent.parentElement;
                  }
                  
                  return false;
                }
                
                // 初始化页面状态
                function initializePageState() {
                  // 确保页面在顶部
                  window.scrollTo(0, 0);
                  document.documentElement.scrollTop = 0;
                  document.body.scrollTop = 0;
                  
                  // 添加禁止滚动的样式
                  document.documentElement.style.overflow = 'hidden';
                  document.documentElement.style.touchAction = 'none';
                  document.body.style.overflow = 'hidden';
                  document.body.style.touchAction = 'none';
                  
                  // 防止地址栏/工具栏隐藏导致的布局变化
                  setTimeout(() => {
                    window.scrollTo(0, 0);
                  }, 100);
                }
                
                // 触摸开始 - 记录位置
                function handleTouchStart(e) {
                  if (e.touches.length === 1) {
                    touchStartY = e.touches[0].clientY;
                    touchStartX = e.touches[0].clientX;
                  }
                  
                  // 如果是游戏交互元素，暂时不阻止默认行为
                  if (isGameInteractiveElement(e.target)) {
                    // 允许游戏元素响应触摸
                    return;
                  }
                  
                  // 非游戏元素，阻止默认行为
                  e.preventDefault();
                }
                
                // 触摸移动 - 阻止非游戏元素的滚动
                function handleTouchMove(e) {
                  // 如果是游戏交互元素，允许移动
                  if (isGameInteractiveElement(e.target)) {
                    // 计算移动距离
                    if (e.touches.length === 1) {
                      const touchY = e.touches[0].clientY;
                      const touchX = e.touches[0].clientX;
                      const deltaY = Math.abs(touchY - touchStartY);
                      const deltaX = Math.abs(touchX - touchStartX);
                      
                      // 如果移动距离较小，可能是点击，不阻止
                      if (deltaY < 5 && deltaX < 5) {
                        return;
                      }
                    }
                    
                    // 游戏元素移动，不阻止默认行为
                    return;
                  }
                  
                  // 非游戏元素，阻止滚动
                  e.preventDefault();
                }
                
                // 触摸结束
                function handleTouchEnd(e) {
                  // 重置触摸位置
                  touchStartY = 0;
                  touchStartX = 0;
                  
                  // 防止双击缩放
                  const now = Date.now();
                  if (now - lastTouchEnd < 500) {
                    e.preventDefault();
                  }
                  lastTouchEnd = now;
                }
                
                // 防止键盘滚动
                function handleKeyDown(e) {
                  const scrollKeys = [32, 33, 34, 35, 36, 37, 38, 39, 40]; // 空格、翻页、方向键
                  if (scrollKeys.includes(e.keyCode)) {
                    e.preventDefault();
                  }
                }
                
                // 防止鼠标滚轮滚动
                function handleWheel(e) {
                  e.preventDefault();
                }
                
                // 防止滚动事件
                function handleScroll(e) {
                  if (isPreventingScroll) {
                    window.scrollTo(0, 0);
                  }
                }
                
                // 添加事件监听器
                function addEventListeners() {
                  // 触摸事件
                  document.addEventListener('touchstart', handleTouchStart, { passive: false });
                  document.addEventListener('touchmove', handleTouchMove, { passive: false });
                  document.addEventListener('touchend', handleTouchEnd, { passive: false });
                  document.addEventListener('touchcancel', handleTouchEnd, { passive: false });
                  
                  // 键盘事件
                  document.addEventListener('keydown', handleKeyDown, { passive: false });
                  
                  // 鼠标滚轮事件
                  document.addEventListener('wheel', handleWheel, { passive: false });
                  
                  // 滚动事件
                  window.addEventListener('scroll', handleScroll, { passive: false });
                  
                  // 防止上下文菜单
                  document.addEventListener('contextmenu', function(e) {
                    if (isPreventingScroll) {
                      e.preventDefault();
                    }
                  });
                  
                  // 防止拖拽选择文本
                  document.addEventListener('selectstart', function(e) {
                    if (isPreventingScroll) {
                      e.preventDefault();
                    }
                  });
                }
                
                // 移除事件监听器（清理函数）
                function removeEventListeners() {
                  document.removeEventListener('touchstart', handleTouchStart);
                  document.removeEventListener('touchmove', handleTouchMove);
                  document.removeEventListener('touchend', handleTouchEnd);
                  document.removeEventListener('touchcancel', handleTouchEnd);
                  document.removeEventListener('keydown', handleKeyDown);
                  document.removeEventListener('wheel', handleWheel);
                  window.removeEventListener('scroll', handleScroll);
                }
                
                // 初始化
                function init() {
                  // 设置初始状态
                  initializePageState();
                  
                  // 添加事件监听器
                  addEventListeners();
                  
                  // 监听页面可见性变化
                  document.addEventListener('visibilitychange', function() {
                    if (!document.hidden) {
                      // 页面重新可见时，重新初始化
                      initializePageState();
                    }
                  });
                  
                  // 监听窗口大小变化（防止移动端地址栏隐藏/显示）
                  window.addEventListener('resize', initializePageState);
                  
                  console.log('游戏防滑脚本已完全加载');
                }
                
                // 等待DOM加载完成
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', init);
                } else {
                  init();
                }
                
                // 提供全局控制函数
                window.gameScrollPrevention = {
                  enable: function() {
                    isPreventingScroll = true;
                    document.documentElement.style.overflow = 'hidden';
                    document.body.style.overflow = 'hidden';
                  },
                  disable: function() {
                    isPreventingScroll = false;
                    document.documentElement.style.overflow = '';
                    document.body.style.overflow = '';
                    removeEventListeners();
                  },
                  status: function() {
                    return isPreventingScroll;
                  }
                };
              })();
            `,
          }}
        />
        
        {/* 添加关键渲染路径的CSS */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* 关键CSS：防止初始渲染时的滚动 */
              html, body {
                overflow: hidden !important;
                position: fixed !important;
                width: 100% !important;
                height: 100% !important;
                touch-action: none !important;
                -webkit-overflow-scrolling: none !important;
                overscroll-behavior: none !important;
              }
              
              /* 确保游戏容器在加载时就不可滚动 */
              .game-container {
                overflow: hidden !important;
                touch-action: none !important;
              }
            `,
          }}
        />
      </head>
      <body 
        className="font-serif antialiased bg-background text-foreground"
        style={{ 
          overflow: 'hidden',
          touchAction: 'none',
          position: 'fixed',
          width: '100%',
          height: '100%',
          margin: 0,
          padding: 0,
        }}
      >
        {/* 游戏主容器 */}
        <div 
          className="game-container"
          style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            touchAction: 'none',
          }}
        >
          {children}
        </div>
        
        {/* 防滑状态指示器（仅在开发模式显示） */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                // 创建状态指示器
                const indicator = document.createElement('div');
                indicator.id = 'scroll-prevention-indicator';
                indicator.style.cssText = \`
                  position: fixed;
                  bottom: 10px;
                  left: 10px;
                  background: rgba(0, 0, 0, 0.8);
                  color: #0f0;
                  padding: 8px 12px;
                  border-radius: 4px;
                  font-family: monospace;
                  font-size: 12px;
                  z-index: 999999;
                  pointer-events: none;
                \`;
                indicator.textContent = '防滑: 启用中';
                document.body.appendChild(indicator);
                
                // 更新状态
                setInterval(() => {
                  if (window.gameScrollPrevention && window.gameScrollPrevention.status()) {
                    indicator.textContent = '防滑: ✓ 启用中';
                    indicator.style.color = '#0f0';
                  } else {
                    indicator.textContent = '防滑: ✗ 已禁用';
                    indicator.style.color = '#f00';
                  }
                }, 1000);
              }
            `,
          }}
        />
        
        <Analytics />
      </body>
    </html>
  )
}