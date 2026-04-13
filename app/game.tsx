import GameCanvas from "@/src/components/GameCanvas";
import { config } from "@/src/constants/config";
import { getLevelConfig, TOTAL_LEVELS } from "@/src/constants/levels";
import {
  loadBestScore,
  loadUnlockedLevel,
  saveBestScore,
  saveUnlockedLevel,
} from "@/src/utils/localScore";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

// ─── Audio ─────────────────────────────────────────────────────
type AudioWindow = typeof globalThis & {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};

function playPopSound() {
  const ag = globalThis as AudioWindow;
  const Ctx = ag.AudioContext ?? ag.webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(620, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

// ─── HUD Stat Badge ────────────────────────────────────────────
function StatBadge({
  emoji,
  label,
  value,
  accent,
}: {
  emoji: string;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <View style={[styles.badge, { borderColor: accent + "55" }]}>
      <Text style={styles.badgeEmoji}>{emoji}</Text>
      <View>
        <Text style={styles.badgeLabel}>{label}</Text>
        <Text style={[styles.badgeValue, { color: accent }]}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────
export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ level?: string | string[] }>();

  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [spawned, setSpawned] = useState(0);
  const [gameStatus, setGameStatus] = useState<"playing" | "lost" | "won">(
    "playing",
  );
  const [isPaused, setIsPaused] = useState(false);
  const [gameId, setGameId] = useState(0);

  const isGameOver = gameStatus !== "playing";
  const canPause = !isGameOver;

  // Animated values for overlays
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const overlayScale = useRef(new Animated.Value(0.85)).current;
  const pauseOpacity = useRef(new Animated.Value(0)).current;

  const levelConfig = useMemo(() => {
    const levelParam = Array.isArray(params.level)
      ? params.level[0]
      : params.level;
    return getLevelConfig(Number(levelParam ?? 1));
  }, [params.level]);

  useEffect(() => {
    setBestScore(loadBestScore());
  }, []);

  useEffect(() => {
    const unlocked = loadUnlockedLevel();
    if (levelConfig.level > unlocked) {
      router.replace({
        pathname: "/game",
        params: { level: String(unlocked) },
      });
    }
  }, [levelConfig.level, router]);

  // Animate game-over panel in
  useEffect(() => {
    if (isGameOver) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(overlayScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      overlayOpacity.setValue(0);
      overlayScale.setValue(0.85);
    }
  }, [isGameOver]);

  // Animate pause overlay
  useEffect(() => {
    Animated.timing(pauseOpacity, {
      toValue: isPaused && !isGameOver ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isPaused, isGameOver]);

  // ── Callbacks ─────────────────────────────────────────────
  const handleScore = useCallback((points: number) => {
    setScore((cur) => {
      const next = cur + points;
      setBestScore(saveBestScore(next));
      return next;
    });
  }, []);

  const handlePop = useCallback(() => {
    playPopSound();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, []);

  const handleMiss = useCallback(
    (misses: number) => {
      setMissed((cur) => {
        const next = cur + misses;
        if (next >= levelConfig.maxMissed) setGameStatus("lost");
        return next;
      });
    },
    [levelConfig.maxMissed],
  );

  const handleLevelComplete = useCallback(() => {
    saveUnlockedLevel(Math.min(levelConfig.level + 1, TOTAL_LEVELS));
    setGameStatus("won");
    setIsPaused(false);
  }, [levelConfig.level]);

  const resetGame = useCallback(() => {
    setScore(0);
    setMissed(0);
    setSpawned(0);
    setGameStatus("playing");
    setIsPaused(false);
    setGameId((c) => c + 1);
  }, []);

  const togglePause = useCallback(() => {
    if (canPause) setIsPaused((c) => !c);
  }, [canPause]);

  const handleNextLevel = useCallback(() => {
    const next = Math.min(levelConfig.level + 1, TOTAL_LEVELS);
    router.replace({ pathname: "/game", params: { level: String(next) } });
    resetGame();
  }, [levelConfig.level, router, resetGame]);

  const missedCapped = Math.min(missed, levelConfig.maxMissed);
  const isLastLevel = levelConfig.level >= TOTAL_LEVELS;

  return (
    <View style={styles.screen}>
      {/* ── Game canvas ── */}
      <GameCanvas
        key={`${levelConfig.level}-${gameId}`}
        isGameOver={isGameOver}
        isPaused={isPaused}
        levelConfig={levelConfig}
        onLevelComplete={handleLevelComplete}
        onMiss={handleMiss}
        onPop={handlePop}
        onScore={handleScore}
        onSpawnedChange={setSpawned}
      />

      {/* ── HUD: top row badges ── */}
      <View pointerEvents="none" style={styles.hud}>
        <StatBadge
          emoji="⭐"
          label="SCORE"
          value={String(score)}
          accent="#FFD60A"
        />
        <StatBadge
          emoji="🏆"
          label="BEST"
          value={String(bestScore)}
          accent="#FF9F45"
        />
        <StatBadge
          emoji="💨"
          label="MISSED"
          value={`${missedCapped}/${levelConfig.maxMissed}`}
          accent="#FF6B6B"
        />
      </View>

      {/* ── HUD: progress bar ── */}
      <View pointerEvents="none" style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          <LinearGradient
            colors={["#6BCB77", "#0AAFFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.progressFill,
              {
                width: `${Math.min((spawned / levelConfig.totalBalloons) * 100, 100)}%`,
              },
            ]}
          />
        </View>
        <Text style={styles.progressLabel}>
          Level {levelConfig.level} · {spawned}/{levelConfig.totalBalloons} 🎈
        </Text>
      </View>

      {/* ── Pause button ── */}
      {canPause && (
        <Pressable
          onPress={togglePause}
          style={({ pressed }) => [
            styles.pauseBtn,
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={styles.pauseBtnText}>{isPaused ? "▶" : "⏸"}</Text>
        </Pressable>
      )}

      {/* ── Pause overlay ── */}
      <Animated.View
        pointerEvents={isPaused && !isGameOver ? "none" : "none"}
        style={[styles.pauseOverlay, { opacity: pauseOpacity }]}
      >
        <Text style={styles.pauseEmoji}>☁️</Text>
        <Text style={styles.pauseTitle}>Paused</Text>
        <Text style={styles.pauseSub}>Tap ▶ to continue</Text>
      </Animated.View>

      {/* ── Game-over overlay ── */}
      {isGameOver && (
        <Animated.View style={[styles.gameOverBg, { opacity: overlayOpacity }]}>
          <Animated.View
            style={[
              styles.gameOverCard,
              { transform: [{ scale: overlayScale }] },
            ]}
          >
            <Text style={styles.gameOverEmoji}>
              {gameStatus === "won" ? "🎉" : "💥"}
            </Text>
            <Text style={styles.gameOverTitle}>
              {gameStatus === "won" ? "Level Complete!" : "Game Over"}
            </Text>

            {/* Score summary */}
            <View style={styles.resultRow}>
              <View style={styles.resultPill}>
                <Text style={styles.resultPillLabel}>Score</Text>
                <Text style={styles.resultPillValue}>{score}</Text>
              </View>
              <View style={styles.resultPill}>
                <Text style={styles.resultPillLabel}>Missed</Text>
                <Text style={[styles.resultPillValue, { color: "#FF6B6B" }]}>
                  {missedCapped}
                </Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.btnStack}>
              {gameStatus === "won" && !isLastLevel && (
                <Pressable
                  onPress={handleNextLevel}
                  style={({ pressed }) => [
                    styles.btnPrimary,
                    pressed && styles.btnPressed,
                  ]}
                >
                  <LinearGradient
                    colors={["#FFD60A", "#FF8C00"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.btnGradient}
                  >
                    <Text style={styles.btnPrimaryText}>Next Level 🚀</Text>
                  </LinearGradient>
                </Pressable>
              )}
              <Pressable
                onPress={resetGame}
                style={({ pressed }) => [
                  styles.btnSecondary,
                  pressed && styles.btnPressed,
                ]}
              >
                <Text style={styles.btnSecondaryText}>Play Again 🔄</Text>
              </Pressable>
              <Pressable
                onPress={() => router.replace("/")}
                style={({ pressed }) => [
                  styles.btnGhost,
                  pressed && styles.btnPressed,
                ]}
              >
                <Text style={styles.btnGhostText}>🏠 Home</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Animated.View>
      )}

      <StatusBar style="light" translucent={false} />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: config.BACKGROUND_COLOR },

  // ── HUD badges ──
  hud: {
    flexDirection: "row",
    justifyContent: "space-between",
    left: 12,
    paddingTop: 48,
    position: "absolute",
    right: 12,
    top: 0,
    gap: 8,
  },
  badge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(8,45,84,0.55)",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  badgeEmoji: { fontSize: 18 },
  badgeLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  badgeValue: {
    fontSize: 16,
    fontWeight: "900",
  },

  // ── Progress ──
  progressWrap: {
    position: "absolute",
    top: 116,
    left: 12,
    right: 12,
    alignItems: "center",
    gap: 5,
  },
  progressTrack: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "700",
  },

  // ── Pause button ──
  pauseBtn: {
    position: "absolute",
    top: 148,
    left: 12,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  pauseBtnText: { fontSize: 18, color: "#FFFFFF" },

  // ── Pause overlay ──
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(8,45,84,0.55)",
  },
  pauseEmoji: { fontSize: 60, marginBottom: 8 },
  pauseTitle: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  pauseSub: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },

  // ── Game-over ──
  gameOverBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6,20,50,0.75)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  gameOverCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
  },
  gameOverEmoji: { fontSize: 64, marginBottom: 8 },
  gameOverTitle: {
    color: "#082D54",
    fontSize: 30,
    fontWeight: "900",
    marginBottom: 20,
  },

  // Result pills
  resultRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
    width: "100%",
  },
  resultPill: {
    flex: 1,
    backgroundColor: "#F0F6FF",
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  resultPillLabel: {
    color: "#245C83",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  resultPillValue: {
    color: "#082D54",
    fontSize: 28,
    fontWeight: "900",
  },

  // Buttons
  btnStack: { width: "100%", gap: 10 },
  btnPressed: { opacity: 0.82, transform: [{ scale: 0.97 }] },
  btnPrimary: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#FF8C00",
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  btnGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  btnPrimaryText: {
    color: "#3D1A00",
    fontSize: 18,
    fontWeight: "900",
  },
  btnSecondary: {
    backgroundColor: "#0AAFFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#0AAFFF",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  btnSecondaryText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  btnGhost: {
    borderWidth: 2,
    borderColor: "rgba(8,45,84,0.2)",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnGhostText: {
    color: "#245C83",
    fontSize: 16,
    fontWeight: "800",
  },
});
