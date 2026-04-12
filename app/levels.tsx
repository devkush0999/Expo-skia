import { config } from "@/src/constants/config";
import { levels } from "@/src/constants/levels";
import { loadUnlockedLevel } from "@/src/utils/localScore";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function LevelsScreen() {
  const router = useRouter();
  const [unlockedLevel, setUnlockedLevel] = useState(1);

  useFocusEffect(
    useCallback(() => {
      setUnlockedLevel(loadUnlockedLevel());
    }, []),
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Level Wise</Text>
        <Text style={styles.subtitle}>100 stages. Each one gets sharper.</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.levelList}
        showsVerticalScrollIndicator={false}
      >
        {levels.map((level) => {
          const isUnlocked = level.level <= unlockedLevel;

          return (
            <Pressable
              disabled={!isUnlocked}
              key={level.level}
              onPress={() =>
                router.push({
                  pathname: "/game",
                  params: { level: String(level.level) },
                })
              }
              style={[styles.card, !isUnlocked ? styles.lockedCard : null]}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.levelNumber}>Level {level.level}</Text>
                <Text style={styles.difficulty}>
                  {isUnlocked
                    ? `${level.balloonSpeedMin}-${level.balloonSpeedMax} speed`
                    : "Locked"}
                </Text>
              </View>
              <Text style={styles.cardTitle}>
                {isUnlocked ? level.title : "Pass previous level"}
              </Text>
              <Text style={styles.cardText}>
                {level.totalBalloons} balloons | {level.maxMissed} misses
              </Text>
            </Pressable>
          );
        })}

        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </ScrollView>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: config.BACKGROUND_COLOR,
    paddingHorizontal: 20,
    paddingTop: 58,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    color: "#082D54",
    fontSize: 36,
    fontWeight: "900",
    marginBottom: 8,
  },
  subtitle: {
    color: "#245C83",
    fontSize: 17,
    fontWeight: "700",
  },
  levelList: {
    gap: 12,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(8,45,84,0.16)",
    borderRadius: 8,
    borderWidth: 2,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  lockedCard: {
    opacity: 0.48,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  levelNumber: {
    color: "#2E7D55",
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  difficulty: {
    color: "#245C83",
    fontSize: 12,
    fontWeight: "800",
  },
  cardTitle: {
    color: "#082D54",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
  },
  cardText: {
    color: "#245C83",
    fontSize: 16,
    fontWeight: "700",
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginTop: 8,
    paddingVertical: 12,
  },
  backText: {
    color: "#082D54",
    fontSize: 18,
    fontWeight: "900",
  },
});
