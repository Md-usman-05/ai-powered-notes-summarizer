import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useState } from "react";
import Swal from "sweetalert2";
import api from "../services/api";
import { AuthLayout } from "./ForgotPassword";
import "../styles/auth.css";

export default function VerifyOTP() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const email = params.get("email") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      await Swal.fire({
        icon: "warning",
        title: "Invalid code",
        text: "Please enter the complete six-digit verification code.",
        confirmButtonText: "Okay",
        confirmButtonColor: "#2563eb",
        background: "#ffffff",
      });

      return;
    }

    setLoading(true);

    try {
      await api.post(
        "api/password/verify-otp/",
        {
          email,
          otp,
        }
      );

      await Swal.fire({
        icon: "success",
        title: "Code verified!",
        text: "Your verification code is correct.",
        timer: 1200,
        showConfirmButton: false,
        background: "#ffffff",
      });

      navigate(
        `/reset-password?email=${encodeURIComponent(
          email
        )}&otp=${encodeURIComponent(otp)}`
      );
    } catch (err) {
      const message =
        err.response?.data?.error ||
        "The verification code is incorrect or has expired.";

      await Swal.fire({
        icon: "error",
        title: "Verification failed",
        text: message,
        confirmButtonText: "Try again",
        confirmButtonColor: "#2563eb",
        background: "#ffffff",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <AuthLayout
        kicker="Verification"
        title="Start again"
        intro="We need your email address before we can verify a code."
      >
        <p className="auth-footer">
          <Link to="/forgot-password">
            Request a code
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      kicker="Verification"
      title="Check your email"
      intro={`Enter the six-digit code sent to ${email}.`}
    >
      <form
        className="auth-form"
        onSubmit={submit}
      >
        <label className="auth-field">
          <span>Verification code</span>

          <input
            className="otp-code-input"
            required
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength="6"
            value={otp}
            onChange={(e) =>
              setOtp(
                e.target.value.replace(
                  /\D/g,
                  ""
                )
              )
            }
            placeholder="000000"
            autoComplete="one-time-code"
          />
        </label>

        <button
          className="auth-submit"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Verifying..."
            : "Verify code"}
        </button>
      </form>

      <p className="auth-footer">
        <Link to="/forgot-password">
          Send a new code
        </Link>
      </p>
    </AuthLayout>
  );
}