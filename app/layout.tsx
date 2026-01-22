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
  // 添加移动端相关的meta标签
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
  // 添加其他移动端meta标签
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'format-detection': 'telephone=no, date=no, address=no, email=no',
  },
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
    <html lang="zh-CN">
      <head>
        {/* 通过meta标签添加移动端控制，这比metadata配置更可靠 */}
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" 
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#000000" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="format-detection" content="date=no" />
        <meta name="format-detection" content="address=no" />
        <meta name="format-detection" content="email=no" />
        
        {/* 添加PWA相关标签（可选） */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        
        {/* 禁止搜索引擎转码（针对百度等国内浏览器） */}
        <meta httpEquiv="Cache-Control" content="no-transform" />
        <meta httpEquiv="Cache-Control" content="no-siteapp" />
      </head>
      <body className={`${notoSerifSC.variable} ${maShanZheng.variable} font-serif antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}