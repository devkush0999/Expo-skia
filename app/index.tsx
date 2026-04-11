import GameCanvas from "@/src/components/GameCanvas";
import { config } from "@/src/constants/config";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function GameScreen() {
  const [score, setScore] = useState(0);

  const handleScore = useCallback((points: number) => {
    setScore((current) => current + points);
  }, []);

  return (
    <View style={styles.screen}>
      <GameCanvas onScore={handleScore} />
      <View pointerEvents="none" style={styles.scoreBar}>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>
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
  scoreText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#082D54",
  },
});
