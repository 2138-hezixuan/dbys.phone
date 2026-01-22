"use client";

import React from "react"

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SAMPLE_CHARACTERS } from "@/lib/game-types";
import { Eraser, RotateCcw } from "lucide-react";

interface WritingStageProps {
  onComplete: (text: string) => void;
}

export function WritingStage({ onComplete }: WritingStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedChar, setSelectedChar] = useState(SAMPLE_CHARACTERS[0]);
  const [brushSize, setBrushSize] = useState(8);
  const [hasDrawn, setHasDrawn] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // 设置宣纸纹理背景
    ctx.fillStyle = "#f5f0e6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 添加纸张纹理
    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle = `rgba(200, 180, 150, ${Math.random() * 0.1})`;
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 3,
        Math.random() * 3
      );
    }
    
    // 绘制参考字
    ctx.font = "180px serif";
    ctx.fillStyle = "rgba(200, 180, 150, 0.3)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(selectedChar, canvas.width / 2, canvas.height / 2);
  }, [selectedChar]);

  const getCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    setHasDrawn(true);
    const coords = getCoordinates(e);
    if (coords) {
      lastPoint.current = coords;
    }
  }, [getCoordinates]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    
    const coords = getCoordinates(e);
    if (!coords || !lastPoint.current) return;
    
    // 墨水效果
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 0.85;
    
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    
    // 添加墨水晕染效果
    if (Math.random() > 0.7) {
      ctx.globalAlpha = 0.1;
      ctx.beginPath();
      ctx.arc(coords.x, coords.y, brushSize * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
    lastPoint.current = coords;
  }, [isDrawing, brushSize, getCoordinates]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    lastPoint.current = null;
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    
    ctx.fillStyle = "#f5f0e6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle = `rgba(200, 180, 150, ${Math.random() * 0.1})`;
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 3,
        Math.random() * 3
      );
    }
    
    ctx.font = "180px serif";
    ctx.fillStyle = "rgba(200, 180, 150, 0.3)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(selectedChar, canvas.width / 2, canvas.height / 2);
    
    setHasDrawn(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-20 pb-8 px-4 flex flex-col items-center"
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">第一步：写样</h2>
        <p className="text-muted-foreground">在宣纸上书写文字，跟随参考字临摹</p>
      </div>

      {/* 字符选择 */}
      <div className="flex gap-2 mb-4 flex-wrap justify-center">
        {SAMPLE_CHARACTERS.map((char) => (
          <Button
            key={char}
            variant={selectedChar === char ? "default" : "outline"}
            onClick={() => {
              setSelectedChar(char);
              clearCanvas();
            }}
            className="w-12 h-12 text-2xl"
          >
            {char}
          </Button>
        ))}
      </div>

      {/* 画笔大小 */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm text-muted-foreground">笔触:</span>
        <input
          type="range"
          min="4"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-32"
        />
        <div 
          className="rounded-full bg-foreground" 
          style={{ width: brushSize, height: brushSize }}
        />
      </div>

      {/* 画布 */}
      <div className="relative bg-card rounded-lg shadow-xl p-2" style={{ border: '8px solid #8b7355' }}>
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="cursor-crosshair touch-none rounded"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        
        {/* 装饰边框 */}
        <div className="absolute inset-0 pointer-events-none border border-border/30 rounded" />
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4 mt-6">
        <Button variant="outline" onClick={clearCanvas} className="gap-2 bg-transparent">
          <RotateCcw className="w-4 h-4" />
          重写
        </Button>
        <Button variant="outline" onClick={clearCanvas} className="gap-2 bg-transparent">
          <Eraser className="w-4 h-4" />
          清除
        </Button>
        <Button 
          onClick={() => onComplete(selectedChar)}
          disabled={!hasDrawn}
          className="px-8"
        >
          完成写样
        </Button>
      </div>

      {/* 提示 */}
      <p className="text-sm text-muted-foreground mt-4 text-center max-w-md">
        提示：用鼠标或手指在画布上书写，尽量按照参考字的轮廓进行临摹
      </p>
    </motion.div>
  );
}
