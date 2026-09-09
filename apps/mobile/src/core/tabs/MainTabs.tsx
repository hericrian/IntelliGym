import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { CoachScreen } from "../../features/coach/CoachScreen";
import { HomeScreen } from "../../features/home/HomeScreen";
import { ProfileScreen } from "../../features/profile/ProfileScreen";
import { ProgressScreen } from "../../features/progress/ProgressScreen";
import { WorkoutScreen } from "../../features/workout/WorkoutScreen";
import type { BottomTabId } from "../../domain/models";
import { colors } from "../../ui/theme";
import { useAppState } from "../state/AppStateContext";

const tabs: Array<{ id: BottomTabId; label: string }> = [
  { id: "home", label: "Inicio" },
  { id: "workout", label: "Treino" },
  { id: "progress", label: "Progresso" },
  { id: "coach", label: "IA" },
  { id: "profile", label: "Perfil" }
];

function renderTabContent(tab: BottomTabId) {
  switch (tab) {
    case "home":
      return <HomeScreen />;
    case "workout":
      return <WorkoutScreen />;
    case "progress":
      return <ProgressScreen />;
    case "coach":
      return <CoachScreen />;
    case "profile":
      return <ProfileScreen />;
  }
}

export function MainTabs() {
  const { activeTab, setActiveTab } = useAppState();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>{renderTabContent(activeTab)}</View>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;

          return (
            <Pressable
              accessibilityRole="button"
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tabButton,
                selected ? styles.tabButtonSelected : null,
                tab.id !== "profile" ? styles.tabButtonSpacing : null
              ]}
            >
              <Text style={[styles.tabLabel, selected ? styles.tabLabelSelected : null]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flex: 1
  },
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 8,
    borderRadius: 24,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center"
  },
  tabButtonSpacing: {
    marginRight: 8
  },
  tabButtonSelected: {
    backgroundColor: colors.accent
  },
  tabLabel: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: "700"
  },
  tabLabelSelected: {
    color: colors.background
  }
});
