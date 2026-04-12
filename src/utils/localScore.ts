const BEST_SCORE_KEY = "balloon-shooter-best-score";

let memoryBestScore = 0;

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
