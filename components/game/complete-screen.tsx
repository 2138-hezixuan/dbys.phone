"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Star, Share2, RotateCcw, Download } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface CompleteScreenProps {
  writtenText: string;
  score: number;
  onRestart: () => void;
}

export function CompleteScreen({ writtenText, score, onRestart }: CompleteScreenProps) {
  useEffect(() => {
    // 放烟花庆祝
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: ReturnType<typeof setInterval> = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#c4463a', '#d4a574', '#8b7355', '#1a1a1a'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#c4463a', '#d4a574', '#8b7355', '#1a1a1a'],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const getStars = () => {
    if (score >= 90) return 5;
    if (score >= 70) return 4;
    if (score >= 50) return 3;
    if (score >= 30) return 2;
    return 1;
  };

  const getMessage = () => {
    if (score >= 90) return "精妙绝伦！堪比古代大师！";
    if (score >= 70) return "技艺精湛！已得雕版真传！";
    if (score >= 50) return "初窥门径！继续努力！";
    if (score >= 30) return "略有小成！再接再厉！";
    return "学徒之路！从头开始吧！";
  };

  const stars = getStars();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6"
    >
      {/* 标题 */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
          大功告成！
        </h1>
        <p className="text-xl text-muted-foreground">您已完成雕版印刷的全部工序</p>
      </motion.div>

      {/* 作品展示 */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
        className="relative mb-8"
      >
        {/* 卷轴效果 */}
        <div className="relative">
          {/* 上轴 */}
          <div 
            className="w-80 h-6 rounded-full shadow-lg mx-auto" 
            style={{ background: 'linear-gradient(180deg, #6d5943 0%, #a0826d 50%, #6d5943 100%)' }} 
          />
          
          {/* 纸张部分 */}
          <div 
            className="w-72 mx-auto py-12 px-8 flex flex-col items-center"
            style={{
              backgroundColor: '#f5f0e6',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.1)',
            }}
          >
            {/* 印刷的字 */}
            <span 
              className="text-[120px] leading-none"
              style={{ color: '#1a1a1a', fontFamily: 'Noto Serif SC, serif' }}
            >
              {writtenText}
            </span>
            
            {/* 落款 */}
            <div className="mt-4 text-right self-end">
              <p className="text-sm" style={{ color: '#6d5943' }}>雕版印刷</p>
              <p className="text-xs" style={{ color: '#8b7355' }}>制作于 v0 工坊</p>
            </div>
          </div>
          
          {/* 下轴 */}
          <div 
            className="w-80 h-6 rounded-full shadow-lg mx-auto"
            style={{ background: 'linear-gradient(180deg, #a0826d 0%, #6d5943 50%, #a0826d 100%)' }} 
          />
        </div>
      </motion.div>

      {/* 评分 */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center mb-8"
      >
        <div className="flex justify-center gap-2 mb-4">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
            >
              <Star 
                className={`w-10 h-10 ${i < stars ? 'text-amber-400 fill-amber-400' : 'text-muted'}`}
              />
            </motion.div>
          ))}
        </div>
        
        <p className="text-2xl font-bold text-foreground mb-2">{getMessage()}</p>
        <p className="text-lg text-muted-foreground">综合得分: {Math.round(score)}分</p>
      </motion.div>

      {/* 操作按钮 */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <Button variant="outline" className="gap-2 bg-transparent">
          <Share2 className="w-4 h-4" />
          分享作品
        </Button>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          保存图片
        </Button>
        <Button onClick={onRestart} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          再来一次
        </Button>
      </motion.div>

      {/* 文化小知识 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-12 max-w-lg text-center"
      >
        <div className="bg-card/80 backdrop-blur rounded-lg p-6 border border-border/50">
          <h3 className="text-lg font-semibold text-foreground mb-2">📜 文化小知识</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            雕版印刷术是中国古代四大发明之一，起源于唐朝，在宋代达到鼎盛。
            它的发明比欧洲的活字印刷术早了约400年，对世界文明的发展产生了深远影响。
            现存最早的雕版印刷品是公元868年的《金刚经》。
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
