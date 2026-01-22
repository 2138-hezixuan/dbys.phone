"use client";

import React from "react"

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Hand, RotateCcw } from "lucide-react";

interface PrintingStageProps {
  writtenText: string;
  inkLevel: number;
  onComplete: (quality: number) => void;
}

export function PrintingStage({ writtenText, inkLevel, onComplete }: PrintingStageProps) {
  const [isPaperPlaced, setIsPaperPlaced] = useState(false);
  const [rubCount, setRubCount] = useState(0);
  const [isRubbing, setIsRubbing] = useState(false);
  const [rubPosition, setRubPosition] = useState({ x: 50, y: 50 });
  const [rubbedAreas, setRubbedAreas] = useState<Set<string>>(new Set());
  const [isPrinted, setIsPrinted] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);

  const quality = Math.min(100, (rubCount / 80) * 100 * (inkLevel / 100));

  const handleRub = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isRubbing || !isPaperPlaced || isPrinted) return;
    
    const paper = paperRef.current;
    if (!paper) return;
    
    const rect = paper.getBoundingClientRect();
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
    
    setRubPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    
    const gridX = Math.floor(x / 10);
    const gridY = Math.floor(y / 10);
    const key = `${gridX}-${gridY}`;
    
    setRubbedAreas(prev => {
      const newSet = new Set(prev);
      newSet.add(key);
      return newSet;
    });
    
    setRubCount(prev => prev + 1);
  };

  const reset = () => {
    setIsPaperPlaced(false);
    setRubCount(0);
    setRubbedAreas(new Set());
    setIsPrinted(false);
  };

  const finishPrinting = () => {
    setIsPrinted(true);
  };

  const getTransferOpacity = (gridX: number, gridY: number) => {
    const key = `${gridX}-${gridY}`;
    return rubbedAreas.has(key) ? Math.min(1, inkLevel / 100) : 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-20 pb-8 px-4 flex flex-col items-center"
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">第五步：印刷</h2>
        <p className="text-muted-foreground">覆上宣纸，用手掌或刷子均匀按压</p>
      </div>

      {/* 质量指示 */}
      <div className="flex items-center gap-4 mb-6">
        <Hand className="w-5 h-5 text-foreground" />
        <div className="w-48 h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${quality}%` }}
            transition={{ type: "spring" }}
          />
        </div>
        <span className="text-sm text-muted-foreground w-12">{Math.round(quality)}%</span>
      </div>

      {/* 印刷区域 */}
      <div className="relative w-72 h-72">
        {/* 木板层 */}
        <div 
          className="absolute inset-0 rounded-lg shadow-xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #a0826d 0%, #8b7355 50%, #6d5943 100%)',
          }}
        >
          {/* 带墨的文字 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span 
              className="text-[140px] font-serif"
              style={{ 
                color: '#1a1a1a',
                transform: 'scaleX(-1)'
              }}
            >
              {writtenText}
            </span>
          </div>
        </div>

        {/* 宣纸层 */}
        <AnimatePresence>
          {isPaperPlaced && (
            <motion.div
              ref={paperRef}
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute inset-0 rounded-lg overflow-hidden cursor-none select-none"
              style={{
                backgroundColor: '#f5f0e6',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
              onMouseDown={() => setIsRubbing(true)}
              onMouseUp={() => setIsRubbing(false)}
              onMouseLeave={() => setIsRubbing(false)}
              onMouseMove={handleRub}
              onTouchStart={() => setIsRubbing(true)}
              onTouchEnd={() => setIsRubbing(false)}
              onTouchMove={handleRub}
            >
              {/* 纸张纹理 */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(50)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute bg-amber-900/20"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      width: `${Math.random() * 4 + 1}px`,
                      height: `${Math.random() * 4 + 1}px`,
                    }}
                  />
                ))}
              </div>

              {/* 墨迹转印效果 */}
              <div className="absolute inset-0">
                {[...Array(10)].map((_, y) => (
                  <div key={y} className="flex h-[10%]">
                    {[...Array(10)].map((_, x) => (
                      <motion.div
                        key={`${x}-${y}`}
                        className="w-[10%] h-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: getTransferOpacity(x, y) * 0.3 }}
                        style={{
                          backgroundColor: 'rgba(26, 26, 26, 0.1)',
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* 转印的文字 */}
              <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                animate={{ opacity: quality / 100 }}
              >
                <span 
                  className="text-[140px] font-serif"
                  style={{ 
                    color: '#1a1a1a',
                    opacity: quality / 100,
                  }}
                >
                  {writtenText}
                </span>
              </motion.div>

              {/* 手掌/刷子指示 */}
              {!isPrinted && (
                <motion.div
                  className="absolute pointer-events-none"
                  animate={{
                    left: `${rubPosition.x}%`,
                    top: `${rubPosition.y}%`,
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  style={{ transform: 'translate(-50%, -50%)' }}
                >
                  <motion.div 
                    className="text-4xl"
                    animate={{ scale: isRubbing ? [1, 0.9, 1] : 1 }}
                    transition={{ repeat: isRubbing ? Infinity : 0, duration: 0.2 }}
                  >
                    🖐️
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 成品展示 */}
        <AnimatePresence>
          {isPrinted && (
            <motion.div
              initial={{ y: 0, rotateX: 0 }}
              animate={{ y: -50, rotateX: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 rounded-lg overflow-hidden"
              style={{
                backgroundColor: '#f5f0e6',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span 
                  className="text-[140px] font-serif"
                  style={{ 
                    color: '#1a1a1a',
                    opacity: quality / 100,
                  }}
                >
                  {writtenText}
                </span>
              </div>
              
              {/* 完成标记 */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium"
              >
                印刷完成
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4 mt-8">
        {!isPaperPlaced ? (
          <Button onClick={() => setIsPaperPlaced(true)} className="px-8">
            覆上宣纸
          </Button>
        ) : !isPrinted ? (
          <>
            <Button variant="outline" onClick={reset} className="gap-2 bg-transparent">
              <RotateCcw className="w-4 h-4" />
              重新开始
            </Button>
            <Button 
              onClick={finishPrinting}
              disabled={quality < 30}
              className="px-8"
            >
              揭起宣纸
            </Button>
          </>
        ) : (
          <Button onClick={() => onComplete(quality)} className="px-8">
            完成印刷
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground mt-4 text-center max-w-md">
        {!isPaperPlaced 
          ? "提示：点击「覆上宣纸」将纸张放置在刷好墨的木板上" 
          : !isPrinted 
            ? "提示：按住并移动手掌，均匀按压整个纸面，使墨迹转印到纸上"
            : "恭喜！您已完成雕版印刷的全部工序！"
        }
      </p>
    </motion.div>
  );
}
