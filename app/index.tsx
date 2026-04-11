import GameCanvas from "@/src/components/GameCanvas";
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
      <View style={styles.scoreBar}>
        <Text style={styles.scoreText}>Score: {score}</Text>
      </View>
      <GameCanvas onScore={handleScore} />
      <StatusBar style="light" translucent={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#87CEEB",
  },
  scoreBar: {
    paddingTop: 48,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderBottomColor: "rgba(255,255,255,0.35)",
    borderBottomWidth: 1,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#082D54",
  },
});
