import { levels } from "@/src/constants/levels";
import { loadUnlockedLevel } from "@/src/utils/localScore";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const levelColors = ["#FF7A59", "#47422f", "#4DABF7", "#7BD88F", "#FF8CC6"];

const stars = [
  { left: 34, size: 6, top: 28 },
  { left: 292, size: 8, top: 54 },
  { left: 210, size: 4, top: 92 },
  { left: 92, size: 5, top: 140 },
  { left: 322, size: 5, top: 190 },
];

export default function LevelsScreen() {
  const router = useRouter();
  const [unlockedLevel, setUnlockedLevel] = useState(1);

  useFocusEffect(
    useCallback(() => {
      setUnlockedLevel(loadUnlockedLevel());
    }, []),
  );

  const decoratedLevels = useMemo(
    () =>
      levels.map((level, index) => ({
        ...level,
        color: levelColors[index % levelColors.length],
        side: index % 2 === 0 ? "left" : "right",
      })),
    [],
  );

  return (
    <View style={styles.screen}>
      {stars.map((star, index) => (
        <View
          key={index}
          style={[
            styles.star,
            {
              height: star.size,
              left: star.left,
              top: star.top,
              width: star.size,
            },
          ]}
        />
      ))}

      <View style={styles.header}>
        <Text style={styles.title}>Space Levels</Text>
        <Text style={styles.subtitle}>
          Fly across the stars and unlock the way.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.levelList}
        showsVerticalScrollIndicator={false}
      >
        {decoratedLevels.map((level, index) => {
          const isUnlocked = level.level <= unlockedLevel;
          const isLeft = level.side === "left";

          return (
            <View key={level.level} style={styles.pathRow}>
              {index > 0 ? (
                <View
                  style={[
                    styles.connector,
                    isLeft ? styles.connectorLeft : styles.connectorRight,
                  ]}
                />
              ) : null}

              <Pressable
                disabled={!isUnlocked}
                onPress={() =>
                  router.push({
                    pathname: "/game",
                    params: { level: String(level.level) },
                  })
                }
                style={[
                  styles.levelCard,
                  isLeft ? styles.levelCardLeft : styles.levelCardRight,
                  { borderColor: level.color, backgroundColor: level.color },
                  !isUnlocked ? styles.lockedCard : null,
                ]}
              >
                <View style={styles.planetRow}>
                  <View
                    style={[
                      styles.planet,
                      { backgroundColor: isUnlocked ? "#FFFFFF" : "#D7E0F0" },
                    ]}
                  >
                    <Text style={styles.planetText}>
                      {isUnlocked ? level.level : "?"}
                    </Text>
                  </View>
                  <View style={styles.levelMeta}>
                    <Text style={styles.levelBadge}>Level {level.level}</Text>
                    <Text style={styles.levelName}>
                      {isUnlocked ? level.title : "Locked Orbit"}
                    </Text>
                    <Text style={styles.levelInfo}>
                      {isUnlocked
                        ? `${level.totalBalloons} balloons | ${level.maxMissed} misses`
                        : "Pass the last level to unlock"}
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>
          );
        })}

        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Back To Home</Text>
        </Pressable>
      </ScrollView>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#08162D",
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  star: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    opacity: 0.85,
    position: "absolute",
  },
  header: {
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "900",
    marginBottom: 8,
  },
  subtitle: {
    color: "#B8D9FF",
    fontSize: 17,
    fontWeight: "700",
  },
  levelList: {
    paddingBottom: 32,
  },
  pathRow: {
    minHeight: 146,
    position: "relative",
  },
  connector: {
    backgroundColor: "#9ED0FF",
    borderRadius: 8,
    height: 72,
    opacity: 0.7,
    position: "absolute",
    top: -8,
    width: 6,
  },
  connectorLeft: {
    left: "28%",
  },
  connectorRight: {
    right: "28%",
  },
  levelCard: {
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#fff",
    minHeight: 110,
    paddingHorizontal: 14,
    paddingVertical: 14,
    width: "76%",
  },
  levelCardLeft: {
    alignSelf: "flex-start",
  },
  levelCardRight: {
    alignSelf: "flex-end",
  },
  lockedCard: {
    backgroundColor: "#5A6785",
    borderColor: "#97A5C4",
  },
  planetRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  planet: {
    alignItems: "center",
    borderRadius: 999,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  planetText: {
    color: "#082D54",
    fontSize: 26,
    fontWeight: "900",
  },
  levelMeta: {
    flex: 1,
    marginLeft: 12,
  },
  levelBadge: {
    color: "#FFF8D7",
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  levelName: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 6,
  },
  levelInfo: {
    color: "#F5FBFF",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginTop: 14,
    paddingVertical: 14,
  },
  backText: {
    color: "#082D54",
    fontSize: 18,
    fontWeight: "900",
  },
});
