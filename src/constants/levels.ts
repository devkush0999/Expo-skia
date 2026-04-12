export type LevelConfig = {
  balloonSpeedMax: number;
  balloonSpeedMin: number;
  level: number;
  maxBalloons: number;
  maxMissed: number;
  spawnInterval: number;
  title: string;
  totalBalloons: number;
};

export const TOTAL_LEVELS = 100;

const clampLevel = (level: number) =>
  Math.min(Math.max(Math.trunc(level) || 1, 1), TOTAL_LEVELS);

export function getLevelConfig(level: number): LevelConfig {
  const safeLevel = clampLevel(level);
  const index = safeLevel - 1;

  return {
    balloonSpeedMax: Math.min(300, 70 + index * 3.4),
    balloonSpeedMin: Math.min(210, 55 + index * 2.3),
    level: safeLevel,
    maxBalloons: Math.min(22, 10 + Math.floor(index / 8)),
    maxMissed: Math.max(8, 30 - Math.floor(index / 5)),
    spawnInterval: Math.max(0.28, 0.7 - index * 0.004),
    title: getLevelTitle(safeLevel),
    totalBalloons: Math.min(170, 30 + Math.floor(index * 1.4)),
  };
}

export const levels = Array.from({ length: TOTAL_LEVELS }, (_, index) =>
  getLevelConfig(index + 1),
);

function getLevelTitle(level: number) {
  if (level <= 10) {
    return "Warm Aim";
  }

  if (level <= 25) {
    return "Fast Colors";
  }

  if (level <= 50) {
    return "Sharp Shooter";
  }

  if (level <= 75) {
    return "Sky Rush";
  }

  return "Master Pop";
}
