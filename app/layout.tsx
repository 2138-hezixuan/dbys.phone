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
  title: '刻不容缓 - 传承千年的技艺',
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
  appleWebApp: {
    capable: true,
    title: '雕版印刷',
    statusBarStyle: 'black-translucent',
  },
  applicationName: '雕版印刷',
  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
  },
  robots: {
    nocache: true,
  },
}

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
      suppressHydrationWarning
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
        
        {/* 关键CSS：确保页面在初始加载时就不可滚动 */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* 绝对锁定页面，确保在JS执行前就生效 */
              html, body {
                overflow: hidden !important;
                position: fixed !important;
                width: 100% !important;
                height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                touch-action: none !important;
                -webkit-overflow-scrolling: none !important;
                overscroll-behavior: none !important;
                -webkit-tap-highlight-color: transparent !important;
                -webkit-touch-callout: none !important;
              }
              
              /* 防止滚动条闪现 */
              * {
                -ms-overflow-style: none !important;
                scrollbar-width: none !important;
              }
              
              *::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
              }
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