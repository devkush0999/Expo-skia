import { config } from "@/src/constants/config";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function LevelsScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Level Wise</Text>
      <Text style={styles.subtitle}>More stages can land here later.</Text>

      <View style={styles.cards}>
        <Pressable onPress={() => router.push("/game")} style={styles.card}>
          <Text style={styles.levelNumber}>Level 1</Text>
          <Text style={styles.cardTitle}>Color Match</Text>
          <Text style={styles.cardText}>
            {config.LEVEL_ONE_BALLOONS} balloons. Match bullet color before they
            fall.
          </Text>
        </Pressable>

        <View style={[styles.card, styles.lockedCard]}>
          <Text style={styles.levelNumber}>Level 2</Text>
          <Text style={styles.cardTitle}>Coming Soon</Text>
          <Text style={styles.cardText}>Ready for the next mechanic.</Text>
        </View>
      </View>

      <Pressable onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>

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
    marginBottom: 26,
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
  lockedCard: {
    opacity: 0.62,
  },
  levelNumber: {
    color: "#2E7D55",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  cardTitle: {
    color: "#082D54",
    fontSize: 26,
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
    marginTop: 20,
    paddingVertical: 12,
  },
  backText: {
    color: "#082D54",
    fontSize: 18,
    fontWeight: "900",
  },
});
