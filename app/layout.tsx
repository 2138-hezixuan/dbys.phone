import React from "react"
import type { Metadata } from 'next'
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
    >
      <head>
        {/* 移动端视口控制 */}
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" 
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#000000" />
        
        {/* 禁止自动识别 */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="format-detection" content="date=no" />
        <meta name="format-detection" content="address=no" />
        <meta name="format-detection" content="email=no" />
        
        {/* 禁止搜索引擎转码 */}
        <meta httpEquiv="Cache-Control" content="no-transform" />
        <meta httpEquiv="Cache-Control" content="no-siteapp" />
        
        {/* PWA相关标签 */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        
        {/* 游戏专用防滑脚本 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 游戏专用防滑解决方案
              (function() {
                // 记录触摸开始位置
                let touchStartY = 0;
                let touchStartX = 0;
                
                // 判断是否为游戏交互元素
                function isGameInteractiveElement(element) {
                  if (!element) return false;
                  
                  // 检查元素本身
                  if (element.hasAttribute('data-game-draggable') || 
                      element.hasAttribute('data-game-pressable') ||
                      element.hasAttribute('data-game-tool') ||
                      element.classList.contains('game-draggable') ||
                      element.classList.contains('game-pressable') ||
                      element.classList.contains('game-tool') ||
                      element.classList.contains('wood-block') ||
                      element.classList.contains('ink-brush') ||
                      element.classList.contains('carving-tool') ||
                      element.classList.contains('paper-sheet') ||
                      element.classList.contains('draggable') ||
                      element.classList.contains('pressable')) {
                    return true;
                  }
                  
                  // 检查父元素
                  let parent = element.parentElement;
                  while (parent) {
                    if (parent.hasAttribute('data-game-interactive') ||
                        parent.classList.contains('game-interactive')) {
                      return true;
                    }
                    parent = parent.parentElement;
                  }
                  
                  return false;
                }
                
                // 触摸开始 - 记录位置
                document.addEventListener('touchstart', function(e) {
                  touchStartY = e.touches[0].clientY;
                  touchStartX = e.touches[0].clientX;
                  
                  // 如果是游戏交互元素，不阻止默认行为
                  if (isGameInteractiveElement(e.target)) {
                    return;
                  }
                }, { passive: true });
                
                // 触摸移动 - 阻止非游戏元素的滚动
                document.addEventListener('touchmove', function(e) {
                  // 如果是游戏交互元素，允许移动
                  if (isGameInteractiveElement(e.target)) {
                    // 计算移动距离
                    const touchY = e.touches[0].clientY;
                    const touchX = e.touches[0].clientX;
                    const deltaY = Math.abs(touchY - touchStartY);
                    const deltaX = Math.abs(touchX - touchStartX);
                    
                    // 如果移动距离较小，可能是点击，不阻止
                    if (deltaY < 10 && deltaX < 10) {
                      return;
                    }
                    
                    // 游戏元素移动，不阻止默认行为
                    return;
                  }
                  
                  // 非游戏元素，阻止滚动
                  e.preventDefault();
                }, { passive: false });
                
                // 触摸结束
                document.addEventListener('touchend', function(e) {
                  // 重置触摸位置
                  touchStartY = 0;
                  touchStartX = 0;
                }, { passive: true });
                
                // 防止双击缩放
                let lastTouchEnd = 0;
                document.addEventListener('touchend', function(e) {
                  const now = Date.now();
                  if (now - lastTouchEnd <= 300) {
                    e.preventDefault();
                  }
                  lastTouchEnd = now;
                }, false);
                
                // 防止键盘滚动
                document.addEventListener('keydown', function(e) {
                  const scrollKeys = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'];
                  if (scrollKeys.includes(e.code)) {
                    e.preventDefault();
                  }
                });
                
                // 防止鼠标滚轮滚动
                document.addEventListener('wheel', function(e) {
                  e.preventDefault();
                }, { passive: false });
                
                // 页面加载时确保在顶部
                window.addEventListener('load', function() {
                  setTimeout(function() {
                    window.scrollTo(0, 0);
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                  }, 100);
                });
                
                // 防止弹性滚动
                document.addEventListener('scroll', function(e) {
                  window.scrollTo(0, 0);
                });
                
                console.log('游戏防滑脚本已加载');
              })();
            `,
          }}
        />
      </head>
      <body className="font-serif antialiased bg-background text-foreground">
        {/* 游戏主容器 */}
        <div className="game-container">
          {children}
        </div>
        
        <Analytics />
      </body>
    </html>
  )
}