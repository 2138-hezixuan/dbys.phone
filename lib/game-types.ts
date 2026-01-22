export type GameStage = 'intro' | 'writing' | 'mounting' | 'carving' | 'inking' | 'printing' | 'complete';

export interface GameState {
  currentStage: GameStage;
  completedStages: GameStage[];
  score: number;
  writtenText: string;
  carvedPaths: { x: number; y: number; force: number }[][];
  inkLevel: number;
  printQuality: number;
}

export const STAGES: { id: GameStage; name: string; description: string; icon: string }[] = [
  { id: 'writing', name: '写样', description: '在宣纸上书写文字或图案', icon: '✍' },
  { id: 'mounting', name: '上板', description: '将写好的纸反贴在木板上', icon: '📋' },
  { id: 'carving', name: '刻版', description: '用刻刀雕刻木板', icon: '🔪' },
  { id: 'inking', name: '刷墨', description: '在雕好的木板上刷墨', icon: '🖌' },
  { id: 'printing', name: '印刷', description: '覆纸刷印，完成作品', icon: '📜' },
];

export const SAMPLE_CHARACTERS = ['福', '禄', '寿', '喜', '春', '龙', '凤', '和'];
