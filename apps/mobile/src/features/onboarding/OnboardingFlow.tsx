import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAppState } from "../../core/state/AppStateContext";
import { demoOnboarding } from "../../data/demo/demoData";
import { colors } from "../../ui/theme";
import { Badge } from "../../ui/components/Badge";
import { PrimaryButton } from "../../ui/components/PrimaryButton";
import { SectionCard } from "../../ui/components/SectionCard";

export function OnboardingFlow() {
  const { completeOnboarding } = useAppState();
  const { answers, profile } = demoOnboarding;
  const Container = Platform.OS === "web" ? ScrollView : View;
  const containerProps =
    Platform.OS === "web"
      ? {
          style: styles.screen,
          contentContainerStyle: styles.content
        }
      : {
          style: [styles.screen, styles.content]
        };

  return (
    <Container {...containerProps}>
      <Text style={styles.kicker}>IntelliGym</Text>
      <Text style={styles.title}>
        Base profissional para um produto de verdade
      </Text>
      <Text style={styles.description}>
        Comecamos com um onboarding guiado, dados simulados realistas e regras
        de seguranca claras. Isso acelera o MVP sem travar a arquitetura futura.
      </Text>

      <SectionCard
        title="Perfil de demonstracao"
        subtitle="Cenario inicial seguro para testes"
      >
        <Text style={styles.body}>
          {profile.firstName}, {profile.age} anos, treino em casa com foco em
          fortalecer o joelho direito e voltar ao futebol sem ignorar dor ou
          sinais de alerta.
        </Text>
        <View style={styles.badges}>
          {profile.equipments.map((equipment) => (
            <View key={equipment} style={styles.badgeWrap}>
              <Badge label={equipment} />
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard
        title="O que o app ja considera"
        subtitle="Fundacao alinhada ao produto final"
      >
        <View style={styles.list}>
          <Text style={styles.listItem}>
            Objetivo principal: {answers.goal}
          </Text>
          <Text style={styles.listItem}>
            Dias por semana: {answers.availableDays}
          </Text>
          <Text style={styles.listItem}>
            Duracao por treino: {answers.sessionDurationMin} min
          </Text>
          <Text style={styles.listItem}>Nivel: intermediario</Text>
          <Text style={styles.listItem}>
            Restricoes: evitar corrida, saltos e rotacao do joelho
          </Text>
        </View>
      </SectionCard>

      <SectionCard
        title="Aviso de seguranca"
        subtitle="Nao substitui medicos ou fisioterapeutas"
      >
        <Text style={styles.warning}>
          Dor aguda, travamento, inchaço, perda de forca ou piora dos sintomas
          exigem avaliacao profissional.
        </Text>
      </SectionCard>

      <PrimaryButton
        label="Entrar com perfil demonstracao"
        onPress={() => completeOnboarding(answers)}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    padding: 24
  },
  kicker: {
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    fontWeight: "800",
    fontSize: 12
  },
  title: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800"
  },
  description: {
    color: colors.mutedText,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 16,
    marginBottom: 20
  },
  body: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12
  },
  badgeWrap: {
    marginRight: 8,
    marginBottom: 8
  },
  list: {
    marginTop: 4
  },
  listItem: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10
  },
  warning: {
    color: colors.warning,
    fontSize: 14,
    lineHeight: 22
  }
});
