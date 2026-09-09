import type { FormEventHandler, ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle: string;
  footer?: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, footer, onSubmit, children }: AuthCardProps) {
  return (
    <section className="auth-shell">
      <form className="auth-card" onSubmit={onSubmit}>
        <div className="auth-header">
          <span className="section-kicker">IntelliGym</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {children}
        {footer ? <div className="auth-footer">{footer}</div> : null}
      </form>
    </section>
  );
}
