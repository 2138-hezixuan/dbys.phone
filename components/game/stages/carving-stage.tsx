"use client";

import React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Undo2, Hammer } from "lucide-react";

interface CarvingStageProps {
  writtenText: string;
  onComplete: (paths: { x: number; y: number; force: number }[][]) => void;
}

interface CarvePoint {
  x: number;
  y: number;
  force: number; // 0-1 之间，表示力度
}

export function CarvingStage({ writtenText, onComplete }: CarvingStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCarving, setIsCarving] = useState(false);
  const [carvedPaths, setCarvedPaths] = useState<CarvePoint[][]>([]);
  const [currentPath, setCurrentPath] = useState<CarvePoint[]>([]);
  const [tool, setTool] = useState<'chisel' | 'knife'>('chisel');
  const [progress, setProgress] = useState(0);
  
  // 按压力度相关
  const [currentForce, setCurrentForce] = useState(0);
  const pressStartTime = useRef<number>(0);
  const forceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [showForceIndicator, setShowForceIndicator] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // 初始化画布 - 木板效果
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    drawWoodBoard(ctx, canvas.width, canvas.height, writtenText, []);
  }, [writtenText]);

  const drawWoodBoard = useCallback((
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    text: string,
    paths: CarvePoint[][]
  ) => {
    // 木板底色
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#a0826d");
    gradient.addColorStop(0.5, "#8b7355");
    gradient.addColorStop(1, "#6d5943");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // 木纹
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.moveTo(0, (i + 0.5) * (height / 30) + Math.random() * 5);
      for (let x = 0; x < width; x += 20) {
        ctx.lineTo(x, (i + 0.5) * (height / 30) + Math.sin(x / 50) * 3 + Math.random() * 2);
      }
      ctx.stroke();
    }
    
    // 绘制反转的参考字（轮廓）
    ctx.font = "160px serif";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 2;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.scale(-1, 1);
    ctx.strokeText(text, 0, 0);
    ctx.restore();
    
    // 绘制已雕刻的路径
    if (paths.length > 0) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      
      for (const path of paths) {
        if (path.length < 2) continue;
        
        // 根据力度绘制不同粗细和深度的凹槽
        for (let i = 1; i < path.length; i++) {
          const prevPoint = path[i - 1];
          const point = path[i];
          const avgForce = (prevPoint.force + point.force) / 2;
          
          // 基础宽度 4-16，根据力度变化
          const baseWidth = 4 + avgForce * 12;
          const innerWidth = 2 + avgForce * 8;
          
          // 颜色深度根据力度变化
          const darkness = Math.floor(58 - avgForce * 20); // 58-38
          const innerDarkness = Math.floor(73 - avgForce * 15); // 73-58
          
          // 雕刻凹槽效果 - 外层深色
          ctx.strokeStyle = `rgb(${darkness + 16}, ${darkness}, ${darkness - 12})`;
          ctx.lineWidth = baseWidth;
          ctx.beginPath();
          ctx.moveTo(prevPoint.x, prevPoint.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
          
          // 内部浅色
          ctx.strokeStyle = `rgb(${innerDarkness + 20}, ${innerDarkness + 5}, ${innerDarkness - 8})`;
          ctx.lineWidth = innerWidth;
          ctx.beginPath();
          ctx.moveTo(prevPoint.x, prevPoint.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
          
          // 高光 - 力度大时高光更明显
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 + avgForce * 0.15})`;
          ctx.lineWidth = 1 + avgForce;
          ctx.beginPath();
          ctx.moveTo(prevPoint.x - 1 - avgForce, prevPoint.y - 1 - avgForce);
          ctx.lineTo(point.x - 1 - avgForce, point.y - 1 - avgForce);
          ctx.stroke();
        }
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    drawWoodBoard(ctx, canvas.width, canvas.height, writtenText, carvedPaths);
    
    // 计算进度 - 考虑力度
    const totalArea = carvedPaths.reduce((acc, path) => {
      return acc + path.reduce((pathAcc, point) => pathAcc + (0.5 + point.force * 0.5), 0);
    }, 0);
    setProgress(Math.min(100, totalArea / 5));
  }, [carvedPaths, writtenText, drawWoodBoard]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
        screenX: e.touches[0].clientX,
        screenY: e.touches[0].clientY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      screenX: e.clientX,
      screenY: e.clientY,
    };
  };

  const startCarving = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsCarving(true);
    setShowForceIndicator(true);
    pressStartTime.current = Date.now();
    setCurrentForce(0);
    
    const coords = getCoordinates(e);
    if (coords) {
      setCursorPosition({ x: coords.screenX, y: coords.screenY });
      setCurrentPath([{ x: coords.x, y: coords.y, force: 0 }]);
    }
    
    // 开始计时增加力度
    forceIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - pressStartTime.current;
      // 力度从0增长到1，最长2秒达到最大
      const newForce = Math.min(1, elapsed / 2000);
      setCurrentForce(newForce);
    }, 50);
  };

  const carve = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isCarving) return;
    e.preventDefault();
    
    const coords = getCoordinates(e);
    if (coords) {
      setCursorPosition({ x: coords.screenX, y: coords.screenY });
      
      const newPoint: CarvePoint = {
        x: coords.x,
        y: coords.y,
        force: currentForce,
      };
      
      setCurrentPath(prev => [...prev, newPoint]);
      
      // 实时更新画布
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (ctx && canvas) {
        drawWoodBoard(ctx, canvas.width, canvas.height, writtenText, [...carvedPaths, [...currentPath, newPoint]]);
      }
    }
  };

  const stopCarving = () => {
    if (forceIntervalRef.current) {
      clearInterval(forceIntervalRef.current);
      forceIntervalRef.current = null;
    }
    
    if (currentPath.length > 1) {
      setCarvedPaths(prev => [...prev, currentPath]);
    }
    setIsCarving(false);
    setCurrentPath([]);
    setCurrentForce(0);
    setShowForceIndicator(false);
  };

  const undo = () => {
    setCarvedPaths(prev => prev.slice(0, -1));
  };

  const clearAll = () => {
    setCarvedPaths([]);
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (forceIntervalRef.current) {
        clearInterval(forceIntervalRef.current);
      }
    };
  }, []);

  // 获取力度等级文字
  const getForceText = () => {
    if (currentForce < 0.3) return "轻凿";
    if (currentForce < 0.6) return "中力";
    if (currentForce < 0.85) return "重凿";
    return "全力";
  };

  const getForceColor = () => {
    if (currentForce < 0.3) return "bg-green-500";
    if (currentForce < 0.6) return "bg-yellow-500";
    if (currentForce < 0.85) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-20 pb-8 px-4 flex flex-col items-center"
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">第三步：刻版</h2>
        <p className="text-muted-foreground">用刻刀沿着文字轮廓雕刻木板</p>
      </div>

      {/* 工具选择 */}
      <div className="flex gap-4 mb-4">
        <Button
          variant={tool === 'chisel' ? 'default' : 'outline'}
          onClick={() => setTool('chisel')}
          className="gap-2"
        >
          <Hammer className="w-4 h-4" />
          平口刀
        </Button>
        <Button
          variant={tool === 'knife' ? 'default' : 'outline'}
          onClick={() => setTool('knife')}
          className="gap-2"
        >
          斜口刀
        </Button>
      </div>

      {/* 力度说明 */}
      <div className="flex items-center gap-2 mb-4 px-4 py-2 bg-card rounded-lg border border-border">
        <span className="text-sm text-muted-foreground">按住时间越长，凿得越深</span>
        <div className="flex gap-1 ml-2">
          <span className="w-2 h-2 rounded-full bg-green-500" title="轻凿" />
          <span className="w-2 h-2 rounded-full bg-yellow-500" title="中力" />
          <span className="w-2 h-2 rounded-full bg-orange-500" title="重凿" />
          <span className="w-2 h-2 rounded-full bg-red-500" title="全力" />
        </div>
      </div>

      {/* 进度条 */}
      <div className="w-64 h-2 bg-muted rounded-full mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring" }}
        />
      </div>
      <p className="text-sm text-muted-foreground mb-4">雕刻进度: {Math.round(progress)}%</p>

      {/* 画布 */}
      <div className="relative rounded-lg shadow-2xl overflow-hidden">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          className="cursor-crosshair touch-none"
          onMouseDown={startCarving}
          onMouseMove={carve}
          onMouseUp={stopCarving}
          onMouseLeave={stopCarving}
          onTouchStart={startCarving}
          onTouchMove={carve}
          onTouchEnd={stopCarving}
        />
        
        {/* 刻刀光标效果 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 right-2 text-2xl opacity-50">
            {tool === 'chisel' ? '🔨' : '🔪'}
          </div>
        </div>

        {/* 力度指示器 - 在画布内显示 */}
        <AnimatePresence>
          {isCarving && showForceIndicator && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 bg-black/70 px-3 py-2 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-600 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${getForceColor()}`}
                    animate={{ width: `${currentForce * 100}%` }}
                    transition={{ type: "tween", duration: 0.05 }}
                  />
                </div>
              </div>
              <span className="text-xs text-white font-medium">{getForceText()}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 实时力度显示 */}
      {isCarving && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center"
        >
          <p className="text-sm font-medium" style={{ color: currentForce < 0.3 ? '#22c55e' : currentForce < 0.6 ? '#eab308' : currentForce < 0.85 ? '#f97316' : '#ef4444' }}>
            当前力度: {getForceText()} ({Math.round(currentForce * 100)}%)
          </p>
        </motion.div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-4 mt-6">
        <Button variant="outline" onClick={undo} disabled={carvedPaths.length === 0} className="gap-2 bg-transparent">
          <Undo2 className="w-4 h-4" />
          撤销
        </Button>
        <Button variant="outline" onClick={clearAll} disabled={carvedPaths.length === 0}>
          重新开始
        </Button>
        <Button 
          onClick={() => onComplete(carvedPaths)}
          disabled={progress < 20}
          className="px-8"
        >
          完成刻版
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mt-4 text-center max-w-md">
        提示：短按轻轻凿出浅痕，长按用力凿出深槽。沿着白色轮廓线雕刻，使文字凸起
      </p>
    </motion.div>
  );
}
