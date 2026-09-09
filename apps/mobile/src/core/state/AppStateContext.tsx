import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState
} from "react";

import {
  coachPreviewMessages,
  demoInjuryJourney,
  demoOnboarding,
  demoWeeklyProgress,
  exerciseLibrary,
  todayWorkout
} from "../../data/demo/demoData";
import type {
  BottomTabId,
  InjuryRecoveryPlan,
  OnboardingAnswers,
  UserProfile,
  WeeklyProgressSummary,
  WorkoutPlan
} from "../../domain/models";

interface AppStateValue {
  activeTab: BottomTabId;
  coachPreview: string[];
  injuryJourney: InjuryRecoveryPlan;
  isOnboardingComplete: boolean;
  profile: UserProfile;
  progress: WeeklyProgressSummary;
  selectedWorkout: WorkoutPlan;
  setActiveTab: (tab: BottomTabId) => void;
  completeOnboarding: (answers: OnboardingAnswers) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

function buildProfileFromAnswers(answers: OnboardingAnswers): UserProfile {
  return {
    ...demoOnboarding.profile,
    goal: answers.goal,
    trainingLocation: answers.trainingLocation,
    availableDays: answers.availableDays,
    sessionDurationMin: answers.sessionDurationMin,
    experienceLevel: answers.experienceLevel,
    equipments: answers.equipments,
    limitations:
      answers.limitations.length > 0 ? answers.limitations : demoOnboarding.profile.limitations
  };
}

export function AppStateProvider({ children }: PropsWithChildren) {
  const [activeTab, setActiveTab] = useState<BottomTabId>("home");
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(demoOnboarding.profile);

  const value = useMemo<AppStateValue>(
    () => ({
      activeTab,
      coachPreview: coachPreviewMessages,
      injuryJourney: demoInjuryJourney,
      isOnboardingComplete,
      profile,
      progress: demoWeeklyProgress,
      selectedWorkout: todayWorkout,
      setActiveTab,
      completeOnboarding: (answers) => {
        setProfile(buildProfileFromAnswers(answers));
        setIsOnboardingComplete(true);
      }
    }),
    [activeTab, isOnboardingComplete, profile]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }

  return context;
}

export { exerciseLibrary };
