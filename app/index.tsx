import GameCanvas from "@/src/components/GameCanvas";
import { config } from "@/src/constants/config";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function GameScreen() {
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState(0);
  const [spawned, setSpawned] = useState(0);
  const [gameStatus, setGameStatus] = useState<"playing" | "lost" | "won">(
    "playing",
  );
  const [gameId, setGameId] = useState(0);

  const isGameOver = gameStatus !== "playing";

  const handleScore = useCallback((points: number) => {
    setScore((current) => current + points);
  }, []);

  const handleMiss = useCallback((misses: number) => {
    setMissed((current) => {
      const nextMissed = current + misses;
      if (nextMissed >= config.MAX_MISSED_BALLOONS) {
        setGameStatus("lost");
      }

      return nextMissed;
    });
  }, []);

  const handleLevelComplete = useCallback(() => {
    setGameStatus("won");
  }, []);

  const handleRestart = useCallback(() => {
    setScore(0);
    setMissed(0);
    setSpawned(0);
    setGameStatus("playing");
    setGameId((current) => current + 1);
  }, []);

  return (
    <View style={styles.screen}>
      <GameCanvas
        key={gameId}
        isGameOver={isGameOver}
        onLevelComplete={handleLevelComplete}
        onMiss={handleMiss}
        onScore={handleScore}
        onSpawnedChange={setSpawned}
      />
      <View pointerEvents="none" style={styles.scoreBar}>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>
      <View pointerEvents="none" style={styles.missBar}>
        <Text style={styles.scoreText}>
          Miss: {Math.min(missed, config.MAX_MISSED_BALLOONS)}/
          {config.MAX_MISSED_BALLOONS}
        </Text>
      </View>
      <View pointerEvents="none" style={styles.levelBar}>
        <Text style={styles.levelText}>
          Level 1: {spawned}/{config.LEVEL_ONE_BALLOONS}
        </Text>
      </View>
      {isGameOver ? (
        <View style={styles.gameOverOverlay}>
          <Text style={styles.gameOverTitle}>
            {gameStatus === "lost" ? "Game Over" : "Level Complete"}
          </Text>
          <Text style={styles.gameOverText}>
            Score {score} | Missed {Math.min(missed, config.MAX_MISSED_BALLOONS)}
          </Text>
          <Text onPress={handleRestart} style={styles.restartText}>
            Play Again
          </Text>
        </View>
      ) : null}
      <StatusBar style="light" translucent={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: config.BACKGROUND_COLOR,
  },
  scoreBar: {
    left: 0,
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    position: "absolute",
    right: 0,
    top: 0,
  },
  missBar: {
    paddingTop: 48,
    paddingHorizontal: 16,
    position: "absolute",
    right: 0,
    top: 0,
  },
  levelBar: {
    alignItems: "center",
    left: 0,
    paddingTop: 84,
    position: "absolute",
    right: 0,
    top: 0,
  },
  levelText: {
    color: "#082D54",
    fontSize: 16,
    fontWeight: "700",
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#082D54",
  },
  gameOverOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(8,45,84,0.72)",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    paddingHorizontal: 24,
    position: "absolute",
    right: 0,
    top: 0,
  },
  gameOverTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 10,
  },
  gameOverText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 24,
  },
  restartText: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    color: "#082D54",
    fontSize: 20,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});
