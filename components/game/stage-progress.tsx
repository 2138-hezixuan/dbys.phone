"use client";

import { motion } from "framer-motion";
import { STAGES, type GameStage } from "@/lib/game-types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StageProgressProps {
  currentStage: GameStage;
  completedStages: GameStage[];
}

export function StageProgress({ currentStage, completedStages }: StageProgressProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {STAGES.map((stage, index) => {
            const isCompleted = completedStages.includes(stage.id);
            const isCurrent = currentStage === stage.id;
            
            return (
              <div key={stage.id} className="flex items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    backgroundColor: isCompleted 
                      ? "var(--primary)" 
                      : isCurrent 
                        ? "var(--accent)" 
                        : "var(--muted)",
                  }}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    isCompleted && "text-primary-foreground",
                    isCurrent && "text-accent-foreground ring-2 ring-accent ring-offset-2 ring-offset-background",
                    !isCompleted && !isCurrent && "text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{stage.icon}</span>
                  )}
                </motion.div>
                
                <div className="ml-2 hidden md:block">
                  <p className={cn(
                    "text-sm font-medium",
                    isCurrent ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {stage.name}
                  </p>
                </div>
                
                {index < STAGES.length - 1 && (
                  <div className={cn(
                    "w-8 md:w-16 h-0.5 mx-2",
                    isCompleted ? "bg-primary" : "bg-border"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
