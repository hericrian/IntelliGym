import type { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme";

export function SectionCard({
  children,
  title,
  subtitle
}: PropsWithChildren<{ title: string; subtitle?: string }>) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 13,
    marginTop: 4
  },
  content: {
    marginTop: 14
  }
});
