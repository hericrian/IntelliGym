import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppErrorBoundary } from "./components/AppErrorBoundary";
import { BootScreen } from "./components/BootScreen";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { AppLayout } from "./layouts/AppLayout";

const DashboardPage = lazy(async () => {
  const module = await import("./pages/AppDashboardPage");
  return { default: module.AppDashboardPage };
});

const OnboardingPage = lazy(async () => ({ default: (await import("./pages/OnboardingPage")).OnboardingPage }));
const WorkoutsPage = lazy(async () => ({ default: (await import("./pages/WorkoutsPage")).WorkoutsPage }));
const WorkoutSessionPage = lazy(async () => ({ default: (await import("./pages/WorkoutSessionPage")).WorkoutSessionPage }));
const GenerateWorkoutPage = lazy(async () => ({ default: (await import("./pages/GenerateWorkoutPage")).GenerateWorkoutPage }));
const ProgressPage = lazy(async () => ({ default: (await import("./pages/ProgressPage")).ProgressPage }));
const RecoveryPage = lazy(async () => ({ default: (await import("./pages/RecoveryPage")).RecoveryPage }));
const EquipmentPage = lazy(async () => ({ default: (await import("./pages/EquipmentPage")).EquipmentPage }));
const AssistantPage = lazy(async () => ({ default: (await import("./pages/AssistantPage")).AssistantPage }));
const ExerciseLibraryPage = lazy(async () => ({ default: (await import("./pages/ExerciseLibraryPage")).ExerciseLibraryPage }));
const ProfilePage = lazy(async () => ({ default: (await import("./pages/ProfilePage")).ProfilePage }));
const SettingsPage = lazy(async () => ({ default: (await import("./pages/SettingsPage")).SettingsPage }));

const ForgotPasswordPage = lazy(async () => {
  const module = await import("./pages/ForgotPasswordPage");
  return { default: module.ForgotPasswordPage };
});

const LandingPage = lazy(async () => {
  const module = await import("./pages/LandingPage");
  return { default: module.LandingPage };
});

const LoginPage = lazy(async () => {
  const module = await import("./pages/LoginPage");
  return { default: module.LoginPage };
});

const SignupPage = lazy(async () => {
  const module = await import("./pages/SignupPage");
  return { default: module.SignupPage };
});

export function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<BootScreen />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/cadastro" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/app" element={<AppLayout />}>
                  <Route index element={<DashboardPage />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="onboarding" element={<OnboardingPage />} />
                  <Route path="treinos" element={<WorkoutsPage />} />
                  <Route path="treino/:id" element={<WorkoutSessionPage />} />
                  <Route path="gerar-treino" element={<GenerateWorkoutPage />} />
                  <Route path="progresso" element={<ProgressPage />} />
                  <Route path="dor-e-recuperacao" element={<RecoveryPage />} />
                  <Route path="equipamentos" element={<EquipmentPage />} />
                  <Route path="assistente" element={<AssistantPage />} />
                  <Route path="biblioteca" element={<ExerciseLibraryPage />} />
                  <Route path="perfil" element={<ProfilePage />} />
                  <Route path="configuracoes" element={<SettingsPage />} />
                </Route>
              </Route>
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}
