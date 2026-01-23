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
  const isMobileRef = useRef(false);

  // 检查是否为移动设备
  useEffect(() => {
    if (typeof window !== 'undefined') {
      isMobileRef.current = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    }
  }, []);

  // 初始化画布
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

  // 标记画布为游戏交互元素
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // 延迟标记，确保画布已渲染
    setTimeout(() => {
      if (canvas) {
        canvas.setAttribute('data-game-interactive', 'true');
        canvas.setAttribute('data-game-tool', 'true');
        canvas.classList.add('game-tool');
        canvas.classList.add('game-interactive');
        
        // 确保触摸行为设置为 none
        canvas.style.touchAction = 'none';
        canvas.style.userSelect = 'none';
        canvas.style.webkitUserSelect = 'none';
      }
    }, 100);
  }, []);

  const getCoordinates = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ("touches" in e) {
      // 触摸事件
      if (e.touches.length === 0) return null;
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    // 鼠标事件
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // 阻止所有默认行为，防止页面滚动
    e.preventDefault();
    e.stopPropagation();
    
    setIsDrawing(true);
    setHasDrawn(true);
    const coords = getCoordinates(e);
    if (coords) {
      lastPoint.current = coords;
    }
    
    // 移动端额外处理
    if ("touches" in e && isMobileRef.current) {
      // 在移动端，确保画布获取焦点
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.focus();
      }
    }
  }, [getCoordinates]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    // 阻止所有默认行为，防止页面滚动
    e.preventDefault();
    e.stopPropagation();
    
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

  const stopDrawing = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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

  // 处理容器触摸事件，防止画布外滑动
  const handleContainerTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="writing-stage min-h-screen pt-20 pb-8 px-4 flex flex-col items-center"
      style={{
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      onTouchStart={handleContainerTouch}
      onTouchMove={handleContainerTouch}
      onTouchEnd={handleContainerTouch}
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">第一步：写样</h2>
        <p className="text-muted-foreground">在宣纸上书写文字，跟随参考字临摹</p>
      </div>

      {/* 字符选择 */}
      <div 
        className="flex gap-2 mb-4 flex-wrap justify-center"
        style={{ touchAction: 'none' }}
      >
        {SAMPLE_CHARACTERS.map((char) => (
          <Button
            key={char}
            variant={selectedChar === char ? "default" : "outline"}
            onClick={() => {
              setSelectedChar(char);
              clearCanvas();
            }}
            className="w-12 h-12 text-2xl game-interactive"
            style={{ touchAction: 'none' }}
          >
            {char}
          </Button>
        ))}
      </div>

      {/* 画笔大小 */}
      <div className="flex items-center gap-4 mb-4" style={{ touchAction: 'none' }}>
        <span className="text-sm text-muted-foreground">笔触:</span>
        <input
          type="range"
          min="4"
          max="20"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-32"
          style={{ touchAction: 'none' }}
        />
        <div 
          className="rounded-full bg-foreground" 
          style={{ 
            width: brushSize, 
            height: brushSize,
            touchAction: 'none'
          }}
        />
      </div>

      {/* 画布 */}
      <div 
        className="relative bg-card rounded-lg shadow-xl p-2" 
        style={{ 
          border: '8px solid #8b7355',
          touchAction: 'none',
        }}
      >
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="cursor-crosshair touch-none rounded game-tool game-interactive"
          // 鼠标事件
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          // 触摸事件 - 关键修改
          onTouchStart={(e) => {
            startDrawing(e);
            // 移动端额外处理：立即阻止所有默认行为
            if (isMobileRef.current) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          onTouchMove={(e) => {
            draw(e);
            // 移动端额外处理：立即阻止所有默认行为
            if (isMobileRef.current) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          onTouchEnd={(e) => {
            stopDrawing(e);
            // 移动端额外处理：立即阻止所有默认行为
            if (isMobileRef.current) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          onTouchCancel={(e) => {
            stopDrawing(e);
            if (isMobileRef.current) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          // 添加游戏交互属性
          data-game-interactive="true"
          data-game-tool="true"
          tabIndex={0} // 允许画布获取焦点
          style={{
            touchAction: 'none',
            WebkitTapHighlightColor: 'transparent',
            WebkitTouchCallout: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            outline: 'none',
          }}
        />
        
        {/* 装饰边框 */}
        <div className="absolute inset-0 pointer-events-none border border-border/30 rounded" />
      </div>

      {/* 操作按钮 */}
      <div 
        className="flex gap-4 mt-6"
        style={{ touchAction: 'none' }}
      >
        <Button 
          variant="outline" 
          onClick={clearCanvas} 
          className="gap-2 bg-transparent game-interactive"
          style={{ touchAction: 'none' }}
        >
          <RotateCcw className="w-4 h-4" />
          重写
        </Button>
        <Button 
          variant="outline" 
          onClick={clearCanvas} 
          className="gap-2 bg-transparent game-interactive"
          style={{ touchAction: 'none' }}
        >
          <Eraser className="w-4 h-4" />
          清除
        </Button>
        <Button 
          onClick={() => onComplete(selectedChar)}
          disabled={!hasDrawn}
          className="px-8 game-interactive"
          style={{ touchAction: 'none' }}
        >
          完成写样
        </Button>
      </div>

      {/* 提示 */}
      <p className="text-sm text-muted-foreground mt-4 text-center max-w-md">
        提示：用鼠标或手指在画布上书写，尽量按照参考字的轮廓进行临摹
      </p>

      {/* 移动端专用提示 */}
      {isMobileRef.current && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
          移动端提示：直接在画布上书写，不会滑动页面
        </div>
      )}

      {/* 内联样式确保防滑 */}
      <style jsx>{`
        .writing-stage {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }
        
        canvas {
          /* 防止iOS Safari的长按菜单 */
          -webkit-touch-callout: none;
          -webkit-user-select: none;
        }
        
        /* 确保所有交互元素不响应滚动 */
        .game-interactive {
          touch-action: none !important;
        }
        
        /* 防止按钮被长按选中 */
        button {
          -webkit-user-select: none;
          user-select: none;
        }
        
        /* 针对移动端优化 */
        @media (hover: none) and (pointer: coarse) {
          canvas {
            /* 增加移动端触摸区域 */
            min-height: 300px;
            min-width: 300px;
          }
          
          button {
            /* 增加按钮触摸区域 */
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
    </motion.div>
  );
}