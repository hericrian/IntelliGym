import { StatusBar } from "expo-status-bar";

import { AppStateProvider } from "./state/AppStateContext";
import { RootFlow } from "./state/RootFlow";

export function AppRoot() {
  return (
    <AppStateProvider>
      <StatusBar style="light" />
      <RootFlow />
    </AppStateProvider>
  );
}
