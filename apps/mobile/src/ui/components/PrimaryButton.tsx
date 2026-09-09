import { Pressable, StyleSheet, Text } from "react-native";

import { colors } from "../theme";

export function PrimaryButton({
  label,
  onPress,
  variant = "primary"
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" ? styles.secondaryButton : null,
        pressed ? styles.pressed : null
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === "secondary" ? styles.secondaryLabel : null
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accent
  },
  secondaryButton: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.96
  },
  label: {
    color: colors.background,
    fontSize: 15,
    fontWeight: "800"
  },
  secondaryLabel: {
    color: colors.text
  }
});
