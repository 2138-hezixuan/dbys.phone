"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { STAGES } from "@/lib/game-types";

interface IntroScreenProps {
  onStart: () => void;
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-[200px] text-foreground/20" style={{ fontFamily: 'Ma Shan Zheng, cursive' }}>印</div>
        <div className="absolute bottom-10 right-10 text-[200px] text-foreground/20" style={{ fontFamily: 'Ma Shan Zheng, cursive' }}>刷</div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10"
      >
        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-4 tracking-wider">
          雕版印刷
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-2">
          传承千年的技艺
        </p>
        <p className="text-sm text-muted-foreground/70 mb-12">
          Woodblock Printing - A Timeless Art
        </p>
      </motion.div>

      {/* 工序步骤展示 */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="flex flex-wrap justify-center gap-4 mb-12 max-w-4xl z-10"
      >
        {STAGES.map((stage, index) => (
          <motion.div
            key={stage.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="flex flex-col items-center p-4 bg-card/80 backdrop-blur rounded-lg border border-border/50 w-28"
          >
            <span className="text-3xl mb-2">{stage.icon}</span>
            <span className="text-lg font-semibold text-foreground">{stage.name}</span>
            <span className="text-xs text-muted-foreground text-center mt-1">{stage.description}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="z-10"
      >
        <Button 
          onClick={onStart}
          size="lg"
          className="px-12 py-6 text-xl bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          开始体验
        </Button>
      </motion.div>

      {/* 底部装饰线 */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-border to-transparent"
      />
    </div>
  );
}
