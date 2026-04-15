import { config } from "@/src/constants/config";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type SettingRowProps = {
  label: string;
  value: boolean;
  onToggle: () => void;
};

function SettingRow({ label, value, onToggle }: SettingRowProps) {
  return (
    <Pressable onPress={onToggle} style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={[styles.toggle, value ? styles.toggleOn : null]}>
        <View
          style={[
            styles.toggleKnob,
            value ? styles.toggleKnobOn : null,
          ]}
        />
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Tune the feel of your game.</Text>

      <View style={styles.card}>
        <SettingRow
          label="Sound"
          value={soundEnabled}
          onToggle={() => setSoundEnabled((current) => !current)}
        />
        <View style={styles.divider} />
        <SettingRow
          label="Vibration"
          value={vibrationEnabled}
          onToggle={() => setVibrationEnabled((current) => !current)}
        />
        <View style={styles.divider} />
        <View style={styles.futureRow}>
          <Text style={styles.settingLabel}>More Options</Text>
          <Text style={styles.futureText}>Soon</Text>
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
    fontSize: 38,
    fontWeight: "900",
    marginBottom: 8,
  },
  subtitle: {
    color: "#245C83",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 26,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(8,45,84,0.16)",
    borderRadius: 8,
    borderWidth: 2,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  settingRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 62,
  },
  settingLabel: {
    color: "#082D54",
    fontSize: 20,
    fontWeight: "800",
  },
  toggle: {
    backgroundColor: "#BFD7E8",
    borderRadius: 8,
    height: 34,
    justifyContent: "center",
    paddingHorizontal: 4,
    width: 62,
  },
  toggleOn: {
    backgroundColor: "#34C759",
  },
  toggleKnob: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    height: 26,
    width: 26,
  },
  toggleKnobOn: {
    alignSelf: "flex-end",
  },
  divider: {
    backgroundColor: "rgba(8,45,84,0.14)",
    height: 1,
  },
  futureRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 62,
  },
  futureText: {
    color: "#245C83",
    fontSize: 16,
    fontWeight: "800",
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
