import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useAppState } from "../../core/state/AppStateContext";
import { totalRestSeconds } from "../../domain/selectors";
import { Badge } from "../../ui/components/Badge";
import { PrimaryButton } from "../../ui/components/PrimaryButton";
import { SectionCard } from "../../ui/components/SectionCard";
import { colors } from "../../ui/theme";

export function WorkoutScreen() {
  const { selectedWorkout } = useAppState();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Execucao do treino</Text>
      <Text style={styles.subtitle}>
        Um exercicio por vez, com espaco para registrar dor, dificuldade e
        trocas.
      </Text>

      <SectionCard
        title="Resumo da sessao"
        subtitle={`${selectedWorkout.estimatedDurationMin} min · ${Math.round(totalRestSeconds(selectedWorkout) / 60)} min de descanso`}
      >
        <Text style={styles.warning}>{selectedWorkout.safetyAlert}</Text>
      </SectionCard>

      {selectedWorkout.exercises.map((exercise) => (
        <SectionCard
          key={exercise.id}
          title={exercise.name}
          subtitle={exercise.focus}
        >
          <View style={styles.row}>
            <View style={styles.badgeWrap}>
              <Badge label={`${exercise.sets} series`} />
            </View>
            <View style={styles.badgeWrap}>
              <Badge label={exercise.reps} />
            </View>
            <View style={styles.badgeWrap}>
              <Badge label={`${exercise.restSec}s descanso`} />
            </View>
          </View>
          <Text style={styles.body}>{exercise.instructions}</Text>
          <Text style={styles.caption}>
            Erros comuns: {exercise.commonMistakes.join(", ")}
          </Text>
          <Text style={styles.caption}>
            Alternativa pronta: {exercise.alternatives[0]}
          </Text>
          <Text style={styles.safety}>Seguranca: {exercise.safetyNote}</Text>
        </SectionCard>
      ))}

      <View style={styles.actions}>
        <View style={styles.actionSpacing}>
          <PrimaryButton label="Concluir treino" onPress={() => undefined} />
        </View>
        <PrimaryButton
          label="Senti dor"
          variant="secondary"
          onPress={() => undefined}
        />
      </View>
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
    marginBottom: 16
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12
  },
  badgeWrap: {
    marginRight: 8,
    marginBottom: 8
  },
  body: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22
  },
  caption: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8
  },
  warning: {
    color: colors.warning,
    fontSize: 14,
    lineHeight: 22
  },
  safety: {
    color: colors.accentSoft,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8
  },
  actions: {
    paddingBottom: 16
  },
  actionSpacing: {
    marginBottom: 12
  }
});
