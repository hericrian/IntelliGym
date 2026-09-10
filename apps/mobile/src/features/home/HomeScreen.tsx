import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAppState } from "../../core/state/AppStateContext";
import { painBadge, totalSets } from "../../domain/selectors";
import { Badge } from "../../ui/components/Badge";
import { PrimaryButton } from "../../ui/components/PrimaryButton";
import { SectionCard } from "../../ui/components/SectionCard";
import { StatGrid } from "../../ui/components/StatGrid";
import { colors } from "../../ui/theme";
import logoImage from "../../../assets/logo.png";

export function HomeScreen() {
  const { profile, progress, selectedWorkout, setActiveTab } = useAppState();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Plano do dia</Text>
          <Text style={styles.title}>Ola, {profile.firstName}</Text>
          <Text style={styles.subtitle}>{selectedWorkout.objective}</Text>
        </View>
        <Image source={logoImage} style={styles.logo} />
      </View>

      <SectionCard
        title={selectedWorkout.title}
        subtitle="Treino recomendado para hoje"
      >
        <View style={styles.badges}>
          <Badge label={`${selectedWorkout.estimatedDurationMin} min`} />
          <Badge label={`${totalSets(selectedWorkout)} series`} />
          <Badge
            label={`Dor ${painBadge(selectedWorkout.weeklyPainAverage)}`}
            tone="warning"
          />
        </View>
        <Text style={styles.alert}>{selectedWorkout.safetyAlert}</Text>
        <PrimaryButton
          label="Iniciar treino"
          onPress={() => setActiveTab("workout")}
        />
      </SectionCard>

      <StatGrid metrics={progress.metrics} />

      <SectionCard
        title="Foco semanal"
        subtitle="Construido para progressao segura"
      >
        <View style={styles.badges}>
          {selectedWorkout.weeklyFocus.map((focus) => (
            <View key={focus} style={styles.badgeWrap}>
              <Badge label={focus} />
            </View>
          ))}
        </View>
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 20
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18
  },
  headerText: {
    flex: 1
  },
  eyebrow: {
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1.3,
    fontWeight: "800",
    fontSize: 12
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "800"
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  badgeWrap: {
    marginRight: 8,
    marginBottom: 8
  },
  alert: {
    color: colors.warning,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
    marginBottom: 16
  }
});
