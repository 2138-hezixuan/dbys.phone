"use client";

import { useState, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import type { GameStage, GameState } from "@/lib/game-types";
import { IntroScreen } from "./intro-screen";
import { StageProgress } from "./stage-progress";
import { WritingStage } from "./stages/writing-stage";
import { MountingStage } from "./stages/mounting-stage";
import { CarvingStage } from "./stages/carving-stage";
import { InkingStage } from "./stages/inking-stage";
import { PrintingStage } from "./stages/printing-stage";
import { CompleteScreen } from "./complete-screen";

const initialState: GameState = {
  currentStage: 'intro',
  completedStages: [],
  score: 0,
  writtenText: '福',
  carvedPaths: [],
  inkLevel: 0,
  printQuality: 0,
};

export function WoodblockGame() {
  const [gameState, setGameState] = useState<GameState>(initialState);

  const goToStage = useCallback((stage: GameStage) => {
    setGameState(prev => ({
      ...prev,
      currentStage: stage,
      completedStages: stage !== 'intro' && stage !== 'complete' 
        ? [...prev.completedStages]
        : prev.completedStages,
    }));
  }, []);

  const completeStage = useCallback((stage: GameStage, data?: Partial<GameState>) => {
    const stageOrder: GameStage[] = ['writing', 'mounting', 'carving', 'inking', 'printing'];
    const currentIndex = stageOrder.indexOf(stage);
    const nextStage = currentIndex < stageOrder.length - 1 
      ? stageOrder[currentIndex + 1] 
      : 'complete';

    setGameState(prev => ({
      ...prev,
      ...data,
      currentStage: nextStage,
      completedStages: [...prev.completedStages, stage],
    }));
  }, []);

  const handleWritingComplete = useCallback((text: string) => {
    completeStage('writing', { writtenText: text, score: gameState.score + 20 });
  }, [completeStage, gameState.score]);

  const handleMountingComplete = useCallback(() => {
    completeStage('mounting', { score: gameState.score + 20 });
  }, [completeStage, gameState.score]);

  const handleCarvingComplete = useCallback((paths: { x: number; y: number; force: number }[][]) => {
    // 根据力度计算额外分数
    const avgForce = paths.length > 0 
      ? paths.flat().reduce((sum, p) => sum + p.force, 0) / paths.flat().length 
      : 0;
    const bonusScore = Math.round(avgForce * 10);
    completeStage('carving', { carvedPaths: paths, score: gameState.score + 20 + bonusScore });
  }, [completeStage, gameState.score]);

  const handleInkingComplete = useCallback((inkLevel: number) => {
    completeStage('inking', { inkLevel, score: gameState.score + Math.round(inkLevel * 0.2) });
  }, [completeStage, gameState.score]);

  const handlePrintingComplete = useCallback((quality: number) => {
    completeStage('printing', { printQuality: quality, score: gameState.score + Math.round(quality * 0.2) });
  }, [completeStage, gameState.score]);

  const handleRestart = useCallback(() => {
    setGameState(initialState);
  }, []);

  const renderStage = () => {
    switch (gameState.currentStage) {
      case 'intro':
        return <IntroScreen onStart={() => goToStage('writing')} />;
      
      case 'writing':
        return <WritingStage onComplete={handleWritingComplete} />;
      
      case 'mounting':
        return (
          <MountingStage 
            writtenText={gameState.writtenText} 
            onComplete={handleMountingComplete} 
          />
        );
      
      case 'carving':
        return (
          <CarvingStage 
            writtenText={gameState.writtenText}
            onComplete={handleCarvingComplete}
          />
        );
      
      case 'inking':
        return (
          <InkingStage 
            writtenText={gameState.writtenText}
            onComplete={handleInkingComplete}
          />
        );
      
      case 'printing':
        return (
          <PrintingStage 
            writtenText={gameState.writtenText}
            inkLevel={gameState.inkLevel}
            onComplete={handlePrintingComplete}
          />
        );
      
      case 'complete':
        return (
          <CompleteScreen 
            writtenText={gameState.writtenText}
            score={gameState.score}
            onRestart={handleRestart}
          />
        );
      
      default:
        return null;
    }
  };

  const showProgress = gameState.currentStage !== 'intro' && gameState.currentStage !== 'complete';

  return (
    <div className="min-h-screen bg-background">
      {showProgress && (
        <StageProgress 
          currentStage={gameState.currentStage}
          completedStages={gameState.completedStages}
        />
      )}
      
      <AnimatePresence mode="wait">
        {renderStage()}
      </AnimatePresence>
    </div>
  );
}
