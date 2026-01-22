"use client";

import React from "react"

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCw, Move } from "lucide-react";

interface MountingStageProps {
  writtenText: string;
  onComplete: () => void;
}

export function MountingStage({ writtenText, onComplete }: MountingStageProps) {
  const [paperPosition, setPaperPosition] = useState({ x: 0, y: -150 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || isMounted) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    
    setPaperPosition({ x, y });
  };

  const checkMount = () => {
    // 检查是否放置在木板区域
    const threshold = 50;
    if (Math.abs(paperPosition.x) < threshold && Math.abs(paperPosition.y) < threshold && isFlipped) {
      setIsMounted(true);
      setPaperPosition({ x: 0, y: 0 });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-20 pb-8 px-4 flex flex-col items-center"
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">第二步：上板</h2>
        <p className="text-muted-foreground">将写好的宣纸反贴在木板上</p>
      </div>

      {/* 操作提示 */}
      <div className="flex gap-4 mb-6">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isFlipped ? 'bg-primary/20 text-primary' : 'bg-muted'}`}>
          <RotateCw className="w-4 h-4" />
          <span className="text-sm">{isFlipped ? '已翻转' : '1. 翻转纸张'}</span>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isMounted ? 'bg-primary/20 text-primary' : 'bg-muted'}`}>
          <Move className="w-4 h-4" />
          <span className="text-sm">{isMounted ? '已上板' : '2. 拖动到木板'}</span>
        </div>
      </div>

      {/* 工作区域 */}
      <div 
        ref={containerRef}
        className="relative w-80 h-96 select-none"
        onMouseMove={handleDrag}
        onTouchMove={handleDrag}
        onMouseUp={() => { setIsDragging(false); checkMount(); }}
        onTouchEnd={() => { setIsDragging(false); checkMount(); }}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* 木板 */}
        <div className="absolute inset-x-4 bottom-4 h-64 rounded-lg shadow-xl flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #a0826d 0%, #8b7355 50%, #6d5943 100%)' }}>
          {/* 木纹效果 */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute h-px bg-foreground/20"
                style={{
                  top: `${(i + 1) * 5}%`,
                  left: 0,
                  right: 0,
                  transform: `scaleX(${0.8 + Math.random() * 0.4})`,
                }}
              />
            ))}
          </div>
          
          {/* 目标区域指示 */}
          {!isMounted && (
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-48 h-48 border-2 border-dashed border-primary/50 rounded-lg flex items-center justify-center"
            >
              <span className="text-primary/50 text-sm">放置此处</span>
            </motion.div>
          )}
          
          {/* 已上板的纸张 */}
          <AnimatePresence>
            {isMounted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-48 h-48 rounded shadow-inner flex items-center justify-center"
                style={{ backgroundColor: '#f5f0e6' }}
              >
                <span 
                  className="text-8xl text-foreground/80"
                  style={{ transform: 'scaleX(-1)' }}
                >
                  {writtenText}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 可拖动的纸张 */}
        {!isMounted && (
          <motion.div
            animate={{
              x: paperPosition.x,
              y: paperPosition.y,
              rotateY: isFlipped ? 180 : 0,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
            onMouseDown={() => setIsDragging(true)}
            onTouchStart={() => setIsDragging(true)}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div 
              className="w-48 h-48 rounded shadow-lg flex items-center justify-center border border-border/30 relative"
              style={{ 
		backgroundColor: '#f5f0e6',
                backfaceVisibility: 'hidden',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {!isFlipped && (
                <span className="text-8xl text-foreground/80">{writtenText}</span>
              )}
              {/* 纸张纹理 */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9InJnYmEoMCwwLDAsMC4wMikiLz48L3N2Zz4=')] opacity-50" />
            </div>
            
            {/* 背面 */}
            {isFlipped && (
              <div 
                className="absolute inset-0 w-48 h-48 rounded shadow-lg flex items-center justify-center border border-border/30"
                style={{ backgroundColor: '#f5f0e6' }}
              >
                <span 
                  className="text-8xl text-foreground/80"
                  style={{ transform: 'scaleX(-1)' }}
                >
                  {writtenText}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4 mt-6">
        <Button 
          variant="outline" 
          onClick={() => setIsFlipped(!isFlipped)}
          disabled={isMounted}
          className="gap-2"
        >
          <RotateCw className="w-4 h-4" />
          {isFlipped ? '翻回正面' : '翻转纸张'}
        </Button>
        <Button 
          onClick={onComplete}
          disabled={!isMounted}
          className="px-8"
        >
          完成上板
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mt-4 text-center max-w-md">
        提示：先点击"翻转纸张"使文字反面朝上，然后拖动纸张放置到木板的指定区域
      </p>
    </motion.div>
  );
}
