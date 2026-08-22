import { useState } from "react";
import { Link } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import api from "../services/api";
import PrivateNavbar from "../components/PrivateNavbar";
import { AuthField } from "./Register";
import "../styles/auth.css";

export default function ChangePassword() {
  const [form, setForm] = useState({ current_password: "", password: "", confirm_password: "" }); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (e) => { e.preventDefault(); setLoading(true); setError(""); try { const { data } = await api.post("api/password/change/", form); setMessage(data.message); setForm({ current_password: "", password: "", confirm_password: "" }); } catch (err) { setError(err.response?.data?.error || "Could not update your password."); } finally { setLoading(false); } };
  return <div className="app-page"><PrivateNavbar /><main className="auth-page auth-page-in-app"><section className="auth-shell auth-shell-single"><div className="auth-panel"><Link to="/dashboard" className="back-link">Back to library</Link><span className="auth-kicker">Account security</span><h2>Change password</h2><p className="auth-intro">Keep your account secure with a new, unique password.</p><form className="auth-form" onSubmit={submit}><AuthField icon={<LockKeyhole />} label="Current password" type="password" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} /><AuthField icon={<LockKeyhole />} label="New password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><AuthField icon={<LockKeyhole />} label="Confirm new password" type="password" value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} />{error && <div className="auth-error">{error}</div>}{message && <div className="auth-notice">{message}</div>}<button className="auth-submit" disabled={loading}>{loading ? "Updating..." : "Update password"}</button></form></div></section></main></div>;
}
