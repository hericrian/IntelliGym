import type { FormEventHandler, ReactNode } from "react";
import { Link } from "react-router-dom";

import { Logo } from "./Logo";

type AuthCardProps = {
  title: string;
  subtitle: string;
  footer?: ReactNode;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
};

export function AuthCard({
  title,
  subtitle,
  footer,
  onSubmit,
  children
}: AuthCardProps) {
  return (
    <main className="auth-shell">
      <form className="auth-card" onSubmit={onSubmit}>
        <div className="auth-header">
          <Link className="brand-mark" to="/" aria-label="IntelliGym — início">
            <Logo height={26} priority />
          </Link>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {children}
        {footer ? <div className="auth-footer">{footer}</div> : null}
      </form>
    </main>
  );
}
