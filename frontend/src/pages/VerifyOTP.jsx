import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";
import { AuthLayout } from "./ForgotPassword";

export default function VerifyOTP() {
  const [params] = useSearchParams(); const navigate = useNavigate(); const email = params.get("email") || ""; const [otp, setOtp] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (e) => { e.preventDefault(); setLoading(true); setError(""); try { await api.post("api/password/verify-otp/", { email, otp }); navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`); } catch (err) { setError(err.response?.data?.error || "Please try again."); } finally { setLoading(false); } };
  if (!email) return <AuthLayout kicker="Verification" title="Start again" intro="We need your email address before we can verify a code."><p className="auth-footer"><Link to="/forgot-password">Request a code</Link></p></AuthLayout>;
  return <AuthLayout kicker="Verification" title="Check your email" intro={`Enter the six-digit code sent to ${email}.`}><form className="auth-form" onSubmit={submit}><label className="auth-field"><span>Verification code</span><input className="otp-code-input" required inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="000000" autoComplete="one-time-code" /></label>{error && <div className="auth-error">{error}</div>}<button className="auth-submit" disabled={loading}>{loading ? "Verifying..." : "Verify code"}</button></form><p className="auth-footer"><Link to="/forgot-password">Send a new code</Link></p></AuthLayout>;
}
