import { Component, type ReactNode } from "react";

type HeroSceneBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type HeroSceneBoundaryState = {
  hasError: boolean;
};

export class HeroSceneBoundary extends Component<
  HeroSceneBoundaryProps,
  HeroSceneBoundaryState
> {
  state: HeroSceneBoundaryState = {
    hasError: false
  };

  static getDerivedStateFromError(): HeroSceneBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
