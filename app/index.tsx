import { loadBestScore } from "@/src/utils/localScore";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

// ─── Bubble colours ───────────────────────────────────────────
const BUBBLE_COLORS = [
  "#FF6B6B",
  "#FFD93D",
  "#6BCB77",
  "#4D96FF",
  "#FF6BCD",
  "#FF9F45",
  "#C77DFF",
];

// ─── Single floating bubble ───────────────────────────────────
function FloatingBubble({
  color,
  size,
  startX,
  delay,
}: {
  color: string;
  size: number;
  startX: number;
  delay: number;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const run = () => {
      translateY.setValue(0);
      opacity.setValue(0);
      scale.setValue(1);

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.9,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -SCREEN_H * 0.75,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.6,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
      ]).start(run); // loop forever
    };
    run();
  }, [delay, opacity, scale, translateY]);

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          left: startX,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    />
  );
}

// ─── Home Screen ──────────────────────────────────────────────
const BUBBLE_COUNT = 10;

export default function HomeScreen() {
  const router = useRouter();
  const [bestScore, setBestScore] = useState(0);

  // Generate stable bubble configs once
  const bubbles = useRef(
    Array.from({ length: BUBBLE_COUNT }, (_, i) => ({
      id: i,
      color: BUBBLE_COLORS[i % BUBBLE_COLORS.length],
      size: 22 + (i % 4) * 12, // 22 / 34 / 46 / 58
      startX: (SCREEN_W / BUBBLE_COUNT) * i + Math.random() * 20,
      delay: i * 600,
    })),
  ).current;

  // Subtle bounce for cards on mount
  const cardScale = useRef(new Animated.Value(0.92)).current;
  useEffect(() => {
    Animated.spring(cardScale, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [cardScale]);

  useFocusEffect(
    useCallback(() => {
      setBestScore(loadBestScore());
    }, []),
  );

  return (
    <View style={styles.screen}>
      {/* ── Sky gradient background ── */}
      <LinearGradient
        colors={["#0AAFFF", "#0062CC", "#6A0DAD"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Cloud blobs ── */}
      <View style={[styles.cloud, styles.cloud1]} />
      <View style={[styles.cloud, styles.cloud2]} />

      {/* ── Floating bubbles ── */}
      <View style={styles.bubblesContainer} pointerEvents="none">
        {bubbles.map((b) => (
          <FloatingBubble key={b.id} {...b} />
        ))}
      </View>

      {/* ── Score badge (top-left) ── */}
      <View style={styles.scoreBadge}>
        <Text style={styles.scoreTrophy}>🏆</Text>
        <View>
          <Text style={styles.scoreLabel}>BEST SCORE</Text>
          <Text style={styles.scoreValue}>{bestScore.toLocaleString()}</Text>
        </View>
      </View>

      {/* ── Settings button (top-right) ── */}
      <Pressable
        accessibilityLabel="Open settings"
        onPress={() => router.push("/settings")}
        style={styles.settingsButton}
      >
        <Text style={styles.settingsIcon}>⚙️</Text>
      </Pressable>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.titleEmoji}>🎈</Text>
        <Text style={styles.title}>Balloon{"\n"}Shooter</Text>
        <Text style={styles.subtitle}>Choose your next round</Text>
      </View>

      {/* ── Decorative stars ── */}
      <View style={styles.starsWrap} pointerEvents="none">
        <Text style={styles.starA}>⭐</Text>
        <Text style={styles.starB}>✨</Text>
        <Text style={styles.starC}>⭐</Text>
      </View>

      {/* ── Cards ── */}
      <Animated.View
        style={[styles.cards, { transform: [{ scale: cardScale }] }]}
      >
        {/* New Game card */}
        <Pressable
          onPress={() =>
            router.push({ pathname: "/game", params: { level: "1" } })
          }
          style={({ pressed }) => [
            styles.card,
            styles.primaryCard,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.cardInner}>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardKicker, styles.kickerPrimary]}>
                Quick Start
              </Text>
              <Text style={[styles.cardTitle, styles.titleDark]}>New Game</Text>
              <Text style={[styles.cardText, styles.textDark]}>
                Start Level 1 with fresh score.
              </Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardEmoji}>🚀</Text>
              <View style={styles.arrowBtnDark}>
                <Text style={styles.arrowTextDark}>→</Text>
              </View>
            </View>
          </View>
        </Pressable>

        {/* Level Wise card */}
        <Pressable
          onPress={() => router.push("/levels")}
          style={({ pressed }) => [
            styles.card,
            styles.secondaryCard,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.cardInner}>
            <View style={styles.cardInfo}>
              <Text style={[styles.cardKicker, styles.kickerSecondary]}>
                Choose Path
              </Text>
              <Text style={[styles.cardTitle, styles.titleNavy]}>
                Level Wise
              </Text>
              <Text style={[styles.cardText, styles.textNavy]}>
                Pick stages as they unlock.
              </Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={styles.cardEmoji}>🗺️</Text>
              <View style={styles.arrowBtnBlue}>
                <Text style={styles.arrowTextBlue}>→</Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Animated.View>

      <StatusBar style="light" />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 36,
  },

  // ── Clouds ──
  cloud: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 50,
  },
  cloud1: { width: 120, height: 30, top: 80, left: -14 },
  cloud2: { width: 80, height: 22, top: 130, right: 14 },

  // ── Bubbles ──
  bubblesContainer: {
    ...StyleSheet.absoluteFillObject,
    bottom: 220, // keep bubbles out of card area
  },
  bubble: {
    position: "absolute",
    bottom: 0,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  // ── Score badge ──
  scoreBadge: {
    position: "absolute",
    top: 54,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  scoreTrophy: { fontSize: 18 },
  scoreLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  scoreValue: {
    color: "#FFD60A",
    fontSize: 18,
    fontWeight: "900",
  },

  // ── Settings ──
  settingsButton: {
    position: "absolute",
    top: 54,
    right: 20,
    width: 48,
    height: 48,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  settingsIcon: { fontSize: 22 },

  // ── Header ──
  header: {
    position: "absolute",
    top: SCREEN_H * 0.16,
    left: 24,
    right: 80,
  },
  titleEmoji: {
    fontSize: 44,
    marginBottom: 4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900",
    lineHeight: 44,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 8,
  },

  // ── Deco stars ──
  starsWrap: {
    position: "absolute",
    top: SCREEN_H * 0.32,
    right: 22,
    gap: 4,
  },
  starA: { fontSize: 22 },
  starB: { fontSize: 16, marginLeft: 8 },
  starC: { fontSize: 26, marginLeft: -4 },

  // ── Cards ──
  cards: {
    paddingHorizontal: 16,
    gap: 14,
  },
  card: {
    borderRadius: 22,
    paddingHorizontal: 20,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  primaryCard: {
    backgroundColor: "#FFD60A",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  secondaryCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardInfo: { flex: 1 },
  cardRight: { alignItems: "center", gap: 8, marginLeft: 12 },
  cardEmoji: { fontSize: 36 },
  arrowBtnDark: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowTextDark: { color: "#3D1A00", fontSize: 18, fontWeight: "900" },
  arrowBtnBlue: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#0AAFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0AAFFF",
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  arrowTextBlue: { color: "#FFF", fontSize: 18, fontWeight: "900" },
  cardKicker: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  kickerPrimary: { color: "rgba(100,40,0,0.65)" },
  kickerSecondary: { color: "#2E7D55" },
  cardTitle: { fontSize: 28, fontWeight: "900", marginBottom: 4 },
  titleDark: { color: "#3D1A00" },
  titleNavy: { color: "#082D54" },
  cardText: { fontSize: 13, fontWeight: "700" },
  textDark: { color: "rgba(80,30,0,0.75)" },
  textNavy: { color: "#245C83" },
});
