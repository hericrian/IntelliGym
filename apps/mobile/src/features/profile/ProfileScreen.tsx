import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useAppState } from "../../core/state/AppStateContext";
import { exerciseLibrary } from "../../core/state/AppStateContext";
import { Badge } from "../../ui/components/Badge";
import { SectionCard } from "../../ui/components/SectionCard";
import { colors } from "../../ui/theme";

export function ProfileScreen() {
  const { profile } = useAppState();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Perfil e configuracoes</Text>

      <SectionCard
        title={`${profile.firstName} · ${profile.age} anos`}
        subtitle={profile.goal}
      >
        <Text style={styles.body}>
          {profile.heightCm} cm · {profile.weightKg} kg ·{" "}
          {profile.availableDays} dias por semana · {profile.sessionDurationMin}{" "}
          min por treino
        </Text>
        <View style={styles.badges}>
          {profile.equipments.map((item) => (
            <View key={item} style={styles.badgeWrap}>
              <Badge label={item} />
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard
        title="Limitacoes registradas"
        subtitle="Visiveis para regras de seguranca"
      >
        {profile.limitations.map((limitation) => (
          <View
            key={`${limitation.bodyRegion}-${limitation.side}`}
            style={styles.limitBox}
          >
            <Text style={styles.limitTitle}>
              {limitation.bodyRegion}{" "}
              {limitation.side === "right" ? "direito" : limitation.side}
            </Text>
            <Text style={styles.body}>{limitation.professionalGuidance}</Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard
        title="Biblioteca inicial"
        subtitle="Exercicios simulados para o MVP"
      >
        {exerciseLibrary.map((exercise) => (
          <View key={exercise.id} style={styles.libraryRow}>
            <Text style={styles.libraryTitle}>{exercise.name}</Text>
            <Text style={styles.libraryMeta}>
              {exercise.category} · {exercise.equipment} · {exercise.location}
            </Text>
          </View>
        ))}
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
  body: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 22
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14
  },
  badgeWrap: {
    marginRight: 8,
    marginBottom: 8
  },
  limitBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted
  },
  limitTitle: {
    color: colors.warning,
    fontWeight: "700",
    marginBottom: 6
  },
  libraryRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  libraryTitle: {
    color: colors.text,
    fontWeight: "700"
  },
  libraryMeta: {
    color: colors.mutedText,
    marginTop: 4
  }
});
