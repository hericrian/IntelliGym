import { ScrollView, StyleSheet, Text } from "react-native";

import { useAppState } from "../../core/state/AppStateContext";
import { SectionCard } from "../../ui/components/SectionCard";
import { colors } from "../../ui/theme";

export function CoachScreen() {
  const { coachPreview } = useAppState();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Assistente IA</Text>
      <Text style={styles.subtitle}>
        Arquitetura preparada para chat, voz e ajustes de treino com validacoes de seguranca.
      </Text>

      {coachPreview.map((message, index) => (
        <SectionCard key={message} title="Resposta simulada" subtitle="provider mock">
          <Text style={[styles.body, index !== coachPreview.length - 1 ? styles.cardSpacing : null]}>
            {message}
          </Text>
        </SectionCard>
      ))}
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
    lineHeight: 22
  },
  body: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 22
  },
  cardSpacing: {
    marginBottom: 16
  }
});
