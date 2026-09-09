import { Platform } from "react-native";

import { NativeCompatibilityScreen } from "../../features/native/NativeCompatibilityScreen";
import { OnboardingFlow } from "../../features/onboarding/OnboardingFlow";
import { MainTabs } from "../tabs/MainTabs";
import { useAppState } from "./AppStateContext";

export function RootFlow() {
  const { isOnboardingComplete } = useAppState();

  if (Platform.OS !== "web") {
    return <NativeCompatibilityScreen />;
  }

  if (!isOnboardingComplete) {
    return <OnboardingFlow />;
  }

  return <MainTabs />;
}
