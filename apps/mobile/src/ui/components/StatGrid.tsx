import { StyleSheet, Text, View } from "react-native";

import type { MetricCardData } from "../../domain/models";
import { colors } from "../theme";

export function StatGrid({ metrics }: { metrics: MetricCardData[] }) {
  return (
    <View style={styles.grid}>
      {metrics.map((metric, index) => (
        <View
          key={metric.label}
          style={[
            styles.card,
            index % 2 === 0 ? styles.cardRightSpacing : null,
            index < metrics.length - 2 ? styles.cardBottomSpacing : null
          ]}
        >
          <Text style={styles.label}>{metric.label}</Text>
          <Text style={styles.value}>{metric.value}</Text>
          <Text style={styles.highlight}>{metric.highlight}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  card: {
    minWidth: "30%",
    flexGrow: 1,
    padding: 16,
    borderRadius: 22,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border
  },
  cardRightSpacing: {
    marginRight: 12
  },
  cardBottomSpacing: {
    marginBottom: 12
  },
  label: {
    color: colors.mutedText,
    fontSize: 12
  },
  value: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 8
  },
  highlight: {
    color: colors.accentSoft,
    fontSize: 12,
    marginTop: 8
  }
});
