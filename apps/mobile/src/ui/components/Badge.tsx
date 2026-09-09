import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme";

export function Badge({
  label,
  tone = "default"
}: {
  label: string;
  tone?: "default" | "warning";
}) {
  return (
    <View
      style={[styles.badge, tone === "warning" ? styles.warningBadge : null]}
    >
      <Text
        style={[styles.label, tone === "warning" ? styles.warningLabel : null]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border
  },
  warningBadge: {
    backgroundColor: colors.warningSurface,
    borderColor: colors.warningBorder
  },
  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700"
  },
  warningLabel: {
    color: colors.warning
  }
});
