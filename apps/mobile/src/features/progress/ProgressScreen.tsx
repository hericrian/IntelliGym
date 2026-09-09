import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useAppState } from "../../core/state/AppStateContext";
import { SectionCard } from "../../ui/components/SectionCard";
import { StatGrid } from "../../ui/components/StatGrid";
import { colors } from "../../ui/theme";

export function ProgressScreen() {
  const { injuryJourney, progress } = useAppState();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Progresso</Text>
      <Text style={styles.subtitle}>
        Evolucao acompanhada por dor, aderencia e fase funcional do retorno ao
        esporte.
      </Text>

      <StatGrid metrics={progress.metrics} />

      <SectionCard
        title={progress.currentPhase}
        subtitle="Fase atual da jornada"
      >
        <Text style={styles.body}>
          A progressao abaixo orienta o treinamento. Nao representa liberacao
          medica.
        </Text>
        <View style={styles.timeline}>
          {injuryJourney.phases.map((phase) => (
            <View key={phase.id} style={styles.phaseRow}>
              <View
                style={[
                  styles.phaseDot,
                  phase.status === "completed"
                    ? styles.phaseCompleted
                    : phase.status === "current"
                      ? styles.phaseCurrent
                      : styles.phaseUpcoming
                ]}
              />
              <Text style={styles.phaseText}>{phase.title}</Text>
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
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800"
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 18
  },
  body: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 22
  },
  timeline: {
    marginTop: 16
  },
  phaseRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  phaseDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginRight: 12
  },
  phaseCompleted: {
    backgroundColor: colors.accent
  },
  phaseCurrent: {
    backgroundColor: colors.warning
  },
  phaseUpcoming: {
    backgroundColor: colors.border
  },
  phaseText: {
    color: colors.text,
    fontSize: 14
  }
});
