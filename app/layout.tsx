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
      style={{
        overflow: 'hidden',
        position: 'fixed',
        width: '100%',
        height: '100%',
      }}
    >
      <head>
        {/* 移动端视口控制 - 必须的防滑设置 */}
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" 
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#000000" />
        
        {/* 禁止电话号码、日期等自动识别 */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="format-detection" content="date=no" />
        <meta name="format-detection" content="address=no" />
        <meta name="format-detection" content="email=no" />
        
        {/* 禁止搜索引擎转码（针对百度等国内浏览器） */}
        <meta httpEquiv="Cache-Control" content="no-transform" />
        <meta httpEquiv="Cache-Control" content="no-siteapp" />
        
        {/* PWA相关标签 */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        
        {/* 预加载关键字体 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* 防滑脚本 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 防止触摸滚动
              document.addEventListener('touchmove', function(e) {
                // 允许按钮等交互元素滚动
                if (e.target.tagName === 'BUTTON' || 
                    e.target.tagName === 'INPUT' || 
                    e.target.tagName === 'TEXTAREA' ||
                    e.target.classList.contains('interactive') ||
                    e.target.classList.contains('scrollable')) {
                  return;
                }
                e.preventDefault();
              }, { passive: false });
              
              // 防止弹性滚动
              document.addEventListener('touchstart', function() {
                if (document.body.scrollTop !== 0) {
                  document.body.scrollTop = 0;
                }
                if (document.documentElement.scrollTop !== 0) {
                  document.documentElement.scrollTop = 0;
                }
              });
              
              // 禁用双击缩放
              let lastTouchEnd = 0;
              document.addEventListener('touchend', function(event) {
                const now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) {
                  event.preventDefault();
                }
                lastTouchEnd = now;
              }, false);
              
              // 页面加载时滚动到顶部
              window.addEventListener('load', function() {
                setTimeout(function() {
                  window.scrollTo(0, 0);
                  document.body.scrollTop = 0;
                  document.documentElement.scrollTop = 0;
                }, 0);
              });
              
              // 防止所有键盘滚动
              document.addEventListener('keydown', function(e) {
                const keys = ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End'];
                if (keys.includes(e.code)) {
                  e.preventDefault();
                }
              });
            `,
          }}
        />
      </head>
      <body 
        className="font-serif antialiased bg-background text-foreground"
        style={{
          overflow: 'hidden',
          position: 'fixed',
          width: '100%',
          height: '100%',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          margin: 0,
          padding: 0,
          touchAction: 'none',
          overscrollBehavior: 'none',
        }}
      >
        {/* 游戏主容器 - 这个div将应用game-container样式 */}
        <div 
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
        >
          {children}
        </div>
        
        <Analytics />
        
        {/* 额外的防滑样式注入 */}
        <style jsx global>{`
          /* 强制隐藏滚动条 */
          ::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }
          
          /* 防止文本选择 */
          * {
            -webkit-touch-callout: none !important;
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
          }
          
          /* 允许特定元素文本选择 */
          .selectable,
          [contenteditable="true"],
          input,
          textarea {
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
          }
          
          /* 防止图片拖拽 */
          img {
            -webkit-user-drag: none !important;
            -khtml-user-drag: none !important;
            -moz-user-drag: none !important;
            -o-user-drag: none !important;
            user-drag: none !important;
          }
          
          /* 针对iOS的额外处理 */
          @supports (-webkit-touch-callout: none) {
            html, body {
              height: -webkit-fill-available !important;
              min-height: -webkit-fill-available !important;
            }
          }
          
          /* 触摸设备优化 */
          @media (hover: none) and (pointer: coarse) {
            button, 
            .btn, 
            .tool, 
            .brush,
            .interactive {
              touch-action: manipulation !important;
              -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1) !important;
            }
          }
        `}</style>
      </body>
    </html>
  )
}