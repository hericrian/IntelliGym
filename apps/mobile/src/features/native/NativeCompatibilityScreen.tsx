import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { useAppState } from "../../core/state/AppStateContext";
import { colors } from "../../ui/theme";

export function NativeCompatibilityScreen() {
  const { completeOnboarding, progress, selectedWorkout } = useAppState();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.kicker}>IntelliGym</Text>
        <Text style={styles.title}>Modo de compatibilidade nativo</Text>
        <Text style={styles.body}>
          Estamos isolando um bug do Expo Go no iPhone relacionado ao runtime
          nativo do SDK 54. A versao web premium continua preservada, e esta
          tela garante que o app abra corretamente enquanto finalizamos o ajuste
          fino para iOS.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{selectedWorkout.title}</Text>
          <Text style={styles.cardText}>
            {selectedWorkout.estimatedDurationMin} min · dor media{" "}
            {selectedWorkout.weeklyPainAverage}
            /10
          </Text>
          <Text style={styles.cardText}>
            Fase atual: {progress.currentPhase}
          </Text>
        </View>

        <Pressable
          onPress={() =>
            completeOnboarding({
              goal: "Recuperacao e fortalecimento",
              trainingLocation: "home",
              equipments: [
                "bicicleta ergometrica",
                "halteres",
                "faixas elasticas"
              ],
              availableDays: 4,
              sessionDurationMin: 45,
              experienceLevel: "intermediate",
              limitations: []
            })
          }
          style={styles.button}
        >
          <Text style={styles.buttonLabel}>Abrir demonstracao segura</Text>
        </Pressable>

        <Text style={styles.footnote}>
          Proximo passo: recolocar progressivamente as telas completas no native
          ate achar o componente exato que dispara o erro `onModeChange`.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center"
  },
  kicker: {
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    fontWeight: "800",
    fontSize: 12,
    marginBottom: 12
  },
  title: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    marginBottom: 14
  },
  body: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 22
  },
  card: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 22
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8
  },
  cardText: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 6
  },
  button: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent,
    marginBottom: 18
  },
  buttonLabel: {
    color: colors.background,
    fontSize: 15,
    fontWeight: "800"
  },
  footnote: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 20
  }
});
