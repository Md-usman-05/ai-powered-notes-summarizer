import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
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

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const submit = async (e) => {

        e.preventDefault();

        setError("");
        setMessage("");

        if (!email || !otp) {

            setError(
                "Reset session is invalid. Please request a new OTP."
            );

            return;

        }

        if (
            form.password !==
            form.confirm_password
        ) {

            setError(
                "Passwords do not match."
            );

            return;

        }

        try {

            setLoading(true);

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

            setMessage(
                data.message
            );

            setForm({
                password: "",
                confirm_password: "",
            });

            window.setTimeout(() => {

                navigate("/login");

            }, 1500);

        }

        catch (error) {

            console.error(error);

            setError(
                error.response?.data?.error ||
                "Could not reset your password."
            );

        }

        finally {

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

                {
                    error &&

                    <div className="auth-error">
                        {error}
                    </div>
                }

                {
                    message &&

                    <div className="auth-notice">
                        {message}
                    </div>
                }

                <button
                    className="auth-submit"
                    disabled={loading}
                >

                    {
                        loading
                            ? "Updating password..."
                            : "Reset password"
                    }

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