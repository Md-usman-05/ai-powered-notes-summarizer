import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import { AuthField, PasswordToggle } from "./Register";
import "../styles/auth.css";
import "../styles/overrides.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const [formData, setFormData] = useState({
    email: params.get("email") || "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      await Swal.fire({
        icon: "warning",
        title: "Missing details",
        text: "Please enter your email and password.",
        confirmButtonText: "Okay",
        confirmButtonColor: "#2563eb",
      });

      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post(
        "api/login/",
        formData
      );

      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);

      await Swal.fire({
        icon: "success",
        title: "Welcome back!",
        text: "You have signed in successfully.",
        timer: 1200,
        showConfirmButton: false,
        background: "#ffffff",
      });

      navigate(
        location.state?.from?.pathname || "/dashboard",
        { replace: true }
      );
    } catch (requestError) {
      const data = requestError.response?.data;

      const message =
        typeof data === "string"
          ? data
          : data?.non_field_errors?.[0] ||
            data?.detail ||
            "Check your email and password, then try again.";

      await Swal.fire({
        icon: "error",
        title: "Sign in failed",
        text: message,
        confirmButtonText: "Try again",
        confirmButtonColor: "#2563eb",
        background: "#ffffff",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-orb auth-orb-one" />
      <div className="auth-orb auth-orb-two" />

      <section
        className="auth-shell"
        aria-labelledby="login-title"
      >
        <aside className="auth-aside">
          <Link to="/" className="brand">
            <Sparkles size={19} />
            NoteMind
          </Link>

          <div>
            <span className="auth-kicker">
              Welcome back
            </span>

            <h1>
              Make your next revision session more
              productive.
            </h1>

            <p>
              Everything you summarize is ready and
              waiting in your personal notes workspace.
            </p>
          </div>

          <div className="auth-aside-note">
            Secure sign-in · Your summaries are private
            to you
          </div>
        </aside>

        <div className="auth-panel">
          <Link
            to="/"
            className="brand brand-mobile"
          >
            <Sparkles size={19} />
            NoteMind
          </Link>

          <span className="auth-kicker">
            Sign in
          </span>

          <h2 id="login-title">
            Welcome back
          </h2>

          <p className="auth-intro">
            Enter your email and password to continue.
          </p>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <AuthField
              icon={<Mail />}
              label="Email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />

            <AuthField
              icon={<LockKeyhole />}
              label="Password"
              name="password"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              action={
                <PasswordToggle
                  visible={showPassword}
                  toggle={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                />
              }
            />

            <Link
              className="forgot-link"
              to="/forgot-password"
            >
              Forgot your password?
            </Link>

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Signing in…"
                : "Sign in"}
            </button>
          </form>

          <p className="auth-footer">
            New to NoteMind?{" "}
            <Link to="/register">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;