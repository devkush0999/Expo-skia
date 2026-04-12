import { config } from "@/src/constants/config";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <Pressable
        accessibilityLabel="Open settings"
        onPress={() => router.push("/settings")}
        style={styles.settingsButton}
      >
        <Text style={styles.settingsIcon}>⚙</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Balloon Shooter</Text>
        <Text style={styles.subtitle}>Choose your next round</Text>
      </View>

      <View style={styles.cards}>
        <Pressable
          onPress={() => router.push("/game")}
          style={[styles.card, styles.primaryCard]}
        >
          <Text style={styles.cardKicker}>Quick Start</Text>
          <Text style={styles.cardTitle}>New Game</Text>
          <Text style={styles.cardText}>Start Level 1 with fresh score.</Text>
        </Pressable>

        <Pressable onPress={() => router.push("/levels")} style={styles.card}>
          <Text style={styles.cardKicker}>Choose Path</Text>
          <Text style={styles.cardTitle}>Level Wise</Text>
          <Text style={styles.cardText}>Pick stages as they unlock.</Text>
        </Pressable>
      </View>

      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: config.BACKGROUND_COLOR,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 30,
  },
  settingsButton: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(8,45,84,0.16)",
    borderRadius: 8,
    borderWidth: 2,
    height: 48,
    justifyContent: "center",
    position: "absolute",
    right: 20,
    top: 54,
    width: 48,
  },
  settingsIcon: {
    color: "#082D54",
    fontSize: 26,
    fontWeight: "900",
  },
  title: {
    color: "#082D54",
    fontSize: 38,
    fontWeight: "900",
    lineHeight: 44,
  },
  subtitle: {
    color: "#245C83",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },
  cards: {
    gap: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(8,45,84,0.16)",
    borderRadius: 8,
    borderWidth: 2,
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  primaryCard: {
    backgroundColor: "#FFF8D7",
    borderColor: "#FFD60A",
  },
  cardKicker: {
    color: "#2E7D55",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  cardTitle: {
    color: "#082D54",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 8,
  },
  cardText: {
    color: "#245C83",
    fontSize: 16,
    fontWeight: "700",
  },
});
