import { Component, type ReactNode } from "react";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  message: string | null;
};

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    message: null
  };

  static getDerivedStateFromError(error: unknown): AppErrorBoundaryState {
    return {
      message:
        error instanceof Error
          ? error.message
          : "Erro inesperado ao carregar o IntelliGym."
    };
  }

  render() {
    if (this.state.message) {
      return (
        <main className="boot-shell">
          <div className="boot-panel">
            <span className="section-kicker">IntelliGym</span>
            <h1>Nao foi possivel carregar a interface.</h1>
            <p>{this.state.message}</p>
            <button
              className="hero-button"
              onClick={() => window.location.reload()}
            >
              Recarregar
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
