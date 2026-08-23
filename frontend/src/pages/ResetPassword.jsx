import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useState } from "react";
import Swal from "sweetalert2";
import { LockKeyhole } from "lucide-react";
import api from "../services/api";
import { AuthLayout } from "./ForgotPassword";
import { AuthField } from "./Register";
import "../styles/auth.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const email = params.get("email") || "";
  const otp = params.get("otp") || "";

  const [form, setForm] = useState({
    password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!email || !otp) {
      await Swal.fire({
        icon: "error",
        title: "Reset session expired",
        text: "Please request a new OTP to continue.",
        confirmButtonText: "Request OTP",
        confirmButtonColor: "#2563eb",
        background: "#ffffff",
      });

      return;
    }

    if (
      form.password !==
      form.confirm_password
    ) {
      await Swal.fire({
        icon: "warning",
        title: "Passwords do not match",
        text: "Please make sure both password fields are identical.",
        confirmButtonText: "Okay",
        confirmButtonColor: "#2563eb",
        background: "#ffffff",
      });

      return;
    }

    if (form.password.length < 8) {
      await Swal.fire({
        icon: "warning",
        title: "Password too short",
        text: "Your password should contain at least 8 characters.",
        confirmButtonText: "Okay",
        confirmButtonColor: "#2563eb",
        background: "#ffffff",
      });

      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post(
        "api/password/reset/",
        {
          email,
          otp,
          password: form.password,
          confirm_password:
            form.confirm_password,
        }
      );

      setForm({
        password: "",
        confirm_password: "",
      });

      await Swal.fire({
        icon: "success",
        title: "Password updated!",
        text:
          data.message ||
          "Your password has been reset successfully.",
        confirmButtonText: "Sign in",
        confirmButtonColor: "#2563eb",
        background: "#ffffff",
      });

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error(error);

      const message =
        error.response?.data?.error ||
        "Could not reset your password. Please try again.";

      await Swal.fire({
        icon: "error",
        title: "Password reset failed",
        text: message,
        confirmButtonText: "Try again",
        confirmButtonColor: "#2563eb",
        background: "#ffffff",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!email || !otp) {
    return (
      <AuthLayout
        kicker="Password reset"
        title="Start again"
        intro="Your password reset session is missing or has expired."
      >
        <p className="auth-footer">
          <Link to="/forgot-password">
            Request a new OTP
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      kicker="Password reset"
      title="Create a new password"
      intro="Choose a new password for your NoteMind AI account."
    >
      <form
        className="auth-form"
        onSubmit={submit}
      >
        <AuthField
          icon={<LockKeyhole />}
          label="New password"
          name="password"
          type="password"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password:
                e.target.value,
            })
          }
          placeholder="Create new password"
          autoComplete="new-password"
        />

        <AuthField
          icon={<LockKeyhole />}
          label="Confirm password"
          name="confirm_password"
          type="password"
          value={form.confirm_password}
          onChange={(e) =>
            setForm({
              ...form,
              confirm_password:
                e.target.value,
            })
          }
          placeholder="Confirm new password"
          autoComplete="new-password"
        />

        <button
          className="auth-submit"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Updating password..."
            : "Reset password"}
        </button>
      </form>

      <p className="auth-footer">
        <Link to="/login">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}