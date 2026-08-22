import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, Sparkles, TriangleAlert, UserRound } from "lucide-react";
import { useState } from "react";
import api from "../services/api";
import "../styles/auth.css";
import "../styles/overrides.css";

const initialForm = { name: "", email: "", password: "", confirm_password: "" };

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setFormData((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("api/register/", formData);
      navigate(`/login?registered=1&email=${encodeURIComponent(formData.email)}`, { replace: true });
    } catch (requestError) {
      const data = requestError.response?.data;
      const field = data && typeof data === "object" ? Object.values(data).flat()[0] : null;
      setError(field || "We could not create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />
      <section className="auth-shell" aria-labelledby="register-title">
        <aside className="auth-aside">
          <Link to="/" className="brand"><Sparkles size={19} /> NoteMind</Link>
          <div>
            <span className="auth-kicker">Study with clarity</span>
            <h1>Turn every long note into focused learning.</h1>
            <p>Save your summaries in one private workspace and return to them whenever you revise.</p>
          </div>
          <div className="auth-aside-note">Free to get started · Your notes stay connected to your account</div>
        </aside>

        <div className="auth-panel">
          <Link to="/" className="brand brand-mobile"><Sparkles size={19} /> NoteMind</Link>
          <span className="auth-kicker">Get started</span>
          <h2 id="register-title">Create an account</h2>
          <p className="auth-intro">Create an account to save and revisit your summaries.</p>
          {error && <div className="auth-alert auth-alert-error" role="alert"><span className="auth-alert-icon"><TriangleAlert size={18} /></span><span>{error}</span></div>}
          <form className="auth-form" onSubmit={handleSubmit}>
            <AuthField icon={<UserRound />} label="Full name" name="name" value={formData.name} onChange={handleChange} placeholder="Alex Morgan" autoComplete="name" />
            <AuthField icon={<Mail />} label="Email address" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" />
            <AuthField icon={<LockKeyhole />} label="Password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} placeholder="At least 8 characters" autoComplete="new-password" action={<PasswordToggle visible={showPassword} toggle={() => setShowPassword(!showPassword)} />} />
            <AuthField label="Confirm password" name="confirm_password" type={showPassword ? "text" : "password"} value={formData.confirm_password} onChange={handleChange} placeholder="Repeat your password" autoComplete="new-password" />
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Creating account…" : "Create account"}</button>
          </form>
          <p className="terms-copy">By creating an account, you agree to our <Link to="/terms">Terms of use</Link>.</p>
          <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </section>
    </main>
  );
}

function PasswordToggle({ visible, toggle }) {
  return (
    <button className="password-toggle" type="button" onClick={toggle} aria-label={visible ? "Hide password" : "Show password"}>
      {visible ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );
}

function AuthField({ icon, label, action, ...props }) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <div className="auth-input">
        <span className="auth-input-icon">{icon}</span>
        <input required {...props} />
        {action ? <span className="auth-input-action">{action}</span> : null}
      </div>
    </label>
  );
}

export { AuthField, PasswordToggle };
export default Register;
