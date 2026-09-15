import { Eye, EyeOff, LockKeyhole, ShieldUser } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useOwnerAuth } from "../auth/OwnerAuthContext";
import { PropertyMark } from "../components/PropertyMark";
import { siteConfig } from "../config/site";

export function OwnerLoginPage() {
  const { status, login } = useOwnerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  if (status === "authenticated") return <Navigate to="/owner" replace />;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await login(String(data.get("username") ?? ""), String(data.get("password") ?? ""));
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from === "/owner" ? from : "/owner", { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
    } finally { setSubmitting(false); }
  };
  return <main className="login-page"><Link className="owner-admin-link" to="/admin/login"><ShieldUser size={17} aria-hidden="true" />Admin</Link><section className="login-panel">
    <div className="login-brand"><PropertyMark /><span>{siteConfig.propertyName}</span></div>
    <span className="admin-icon"><LockKeyhole size={27} /></span>
    <p className="eyebrow">Owner document portal</p><h1>Owner sign in</h1>
    <p className="login-intro">Sign in to view published association documents.</p>
    <form onSubmit={submit} className="login-form">
      <label>Username<input name="username" type="text" autoComplete="username" required disabled={submitting} /></label>
      <label>Password<span className="password-field"><input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required disabled={submitting} /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></span></label>
      {error && <p className="login-error" role="alert">{error}</p>}
      <button className="primary-button" type="submit" disabled={submitting || status === "checking"}>{submitting ? "Signing in…" : "Sign In"}</button>
    </form>
  </section><aside className="login-accent"><img className="login-accent-photo" src="/images/hamilton-court.jpg" alt="Hamilton Court Condominiums" /><div><span>Owner document access</span><strong>Community records.<br />Ready when needed.</strong></div></aside></main>;
}
