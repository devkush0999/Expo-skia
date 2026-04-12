const BEST_SCORE_KEY = "balloon-shooter-best-score";
const UNLOCKED_LEVEL_KEY = "balloon-shooter-unlocked-level";

let memoryBestScore = 0;
let memoryUnlockedLevel = 1;

function getStorage() {
  try {
    if (
      typeof globalThis !== "undefined" &&
      "localStorage" in globalThis &&
      globalThis.localStorage
    ) {
      return globalThis.localStorage;
    }
  } catch {
    return null;
  }

  return null;
}

export function loadBestScore() {
  const storedScore = getStorage()?.getItem(BEST_SCORE_KEY);
  const parsedScore = storedScore ? Number(storedScore) : memoryBestScore;

  if (Number.isFinite(parsedScore)) {
    memoryBestScore = parsedScore;
  }

  return memoryBestScore;
}

export function saveBestScore(score: number) {
  memoryBestScore = Math.max(memoryBestScore, score);
  try {
    getStorage()?.setItem(BEST_SCORE_KEY, String(memoryBestScore));
  } catch {
    return memoryBestScore;
  }

  return memoryBestScore;
}

export function loadUnlockedLevel() {
  const storedLevel = getStorage()?.getItem(UNLOCKED_LEVEL_KEY);
  const parsedLevel = storedLevel ? Number(storedLevel) : memoryUnlockedLevel;

  if (Number.isFinite(parsedLevel)) {
    memoryUnlockedLevel = Math.max(1, Math.trunc(parsedLevel));
  }

  return memoryUnlockedLevel;
}

export function saveUnlockedLevel(level: number) {
  memoryUnlockedLevel = Math.max(memoryUnlockedLevel, Math.trunc(level) || 1);
  try {
    getStorage()?.setItem(UNLOCKED_LEVEL_KEY, String(memoryUnlockedLevel));
  } catch {
    return memoryUnlockedLevel;
  }

  return memoryUnlockedLevel;
}
