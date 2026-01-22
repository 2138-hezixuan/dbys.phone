"use client";

import React from "react"

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Droplets, RotateCcw } from "lucide-react";

interface InkingStageProps {
  writtenText: string;
  onComplete: (inkLevel: number) => void;
}

export function InkingStage({ writtenText, onComplete }: InkingStageProps) {
  const [inkLevel, setInkLevel] = useState(0);
  const [isInking, setIsInking] = useState(false);
  const [brushPosition, setBrushPosition] = useState({ x: 50, y: 50 });
  const [inkedAreas, setInkedAreas] = useState<Set<string>>(new Set());
  const boardRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isInking) return;
    
    const board = boardRef.current;
    if (!board) return;
    
    const rect = board.getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    
    setBrushPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    
    // 记录刷过的区域
    const gridX = Math.floor(x / 10);
    const gridY = Math.floor(y / 10);
    const key = `${gridX}-${gridY}`;
    
    setInkedAreas(prev => {
      const newSet = new Set(prev);
      newSet.add(key);
      return newSet;
    });
    
    // 更新墨水覆盖度
    setInkLevel(prev => Math.min(100, prev + 0.5));
  }, [isInking]);

  const reset = () => {
    setInkLevel(0);
    setInkedAreas(new Set());
  };

  const getInkOpacity = (gridX: number, gridY: number) => {
    const key = `${gridX}-${gridY}`;
    return inkedAreas.has(key) ? 1 : 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-20 pb-8 px-4 flex flex-col items-center"
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">第四步：刷墨</h2>
        <p className="text-muted-foreground">用墨刷在雕好的木板上均匀涂抹墨汁</p>
      </div>

      {/* 墨水量显示 */}
      <div className="flex items-center gap-4 mb-6">
        <Droplets className="w-5 h-5 text-foreground" />
        <div className="w-48 h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-ink"
            style={{ backgroundColor: '#1a1a1a' }}
            animate={{ width: `${inkLevel}%` }}
            transition={{ type: "spring" }}
          />
        </div>
        <span className="text-sm text-muted-foreground w-12">{Math.round(inkLevel)}%</span>
      </div>

      {/* 提示状态 */}
      <div className="mb-4 text-sm">
        {inkLevel < 30 && <span className="text-amber-600">墨量不足，继续刷墨...</span>}
        {inkLevel >= 30 && inkLevel < 70 && <span className="text-blue-600">刷墨中，尽量覆盖整个版面</span>}
        {inkLevel >= 70 && inkLevel < 90 && <span className="text-green-600">墨量适中</span>}
        {inkLevel >= 90 && <span className="text-primary">墨量充足！可以开始印刷了</span>}
      </div>

      {/* 木板和刷墨区域 */}
      <div 
        ref={boardRef}
        className="relative w-72 h-72 rounded-lg shadow-2xl cursor-none overflow-hidden select-none"
        onMouseDown={() => setIsInking(true)}
        onMouseUp={() => setIsInking(false)}
        onMouseLeave={() => setIsInking(false)}
        onMouseMove={handleMove}
        onTouchStart={() => setIsInking(true)}
        onTouchEnd={() => setIsInking(false)}
        onTouchMove={handleMove}
      >
        {/* 木板背景 */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #a0826d 0%, #8b7355 50%, #6d5943 100%)',
          }}
        >
          {/* 木纹 */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-black/10 w-full"
              style={{ top: `${(i + 1) * 6.5}%` }}
            />
          ))}
        </div>

        {/* 雕刻的文字 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-[140px] font-serif"
            style={{ 
              color: '#5d4e40',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3), -1px -1px 2px rgba(255,255,255,0.2)',
              transform: 'scaleX(-1)'
            }}
          >
            {writtenText}
          </span>
        </div>

        {/* 墨水层 */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, y) => (
            <div key={y} className="flex h-[10%]">
              {[...Array(10)].map((_, x) => (
                <motion.div
                  key={`${x}-${y}`}
                  className="w-[10%] h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: getInkOpacity(x, y) }}
                  style={{
                    backgroundColor: 'rgba(26, 26, 26, 0.85)',
                  }}
                />
              ))}
            </div>
          ))}
        </div>

        {/* 文字在墨上的效果 */}
        {inkLevel > 20 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span 
              className="text-[140px] font-serif"
              style={{ 
                color: '#1a1a1a',
                transform: 'scaleX(-1)',
                opacity: inkLevel / 100
              }}
            >
              {writtenText}
            </span>
          </div>
        )}

        {/* 墨刷 */}
        <motion.div
          className="absolute pointer-events-none z-10"
          animate={{
            left: `${brushPosition.x}%`,
            top: `${brushPosition.y}%`,
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative">
            {/* 刷子手柄 */}
            <div className="w-4 h-16 bg-gradient-to-b from-wood-light to-wood rounded-t-full mx-auto" 
                 style={{ backgroundColor: '#a0826d' }} />
            {/* 刷毛 */}
            <div className="w-12 h-6 bg-gradient-to-b from-gray-800 to-gray-900 rounded-b-lg flex justify-center">
              <div className="w-10 h-1 bg-gray-700 absolute bottom-1" />
            </div>
            {/* 刷墨效果 */}
            {isInking && (
              <motion.div
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-14 h-3 rounded-full bg-black/30"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.3 }}
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4 mt-6">
        <Button variant="outline" onClick={reset} className="gap-2 bg-transparent">
          <RotateCcw className="w-4 h-4" />
          重新刷墨
        </Button>
        <Button 
          onClick={() => onComplete(inkLevel)}
          disabled={inkLevel < 30}
          className="px-8"
        >
          完成刷墨
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mt-4 text-center max-w-md">
        提示：按住鼠标/手指在木板上移动刷子，尽量均匀覆盖整个版面
      </p>
    </motion.div>
  );
}
