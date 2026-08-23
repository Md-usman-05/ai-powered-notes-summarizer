import { Link, useNavigate } from "react-router-dom";
import { Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import emailjs from "@emailjs/browser";
import api from "../services/api";
import { AuthField } from "./Register";
import "../styles/auth.css";
import { showError, showSuccess, showLoading, closeAlert } from "../utils/alerts";

export function AuthLayout({ kicker, title, intro, children }) {
    return (
        <main className="auth-page">
            <section className="auth-shell auth-shell-single">
                <div className="auth-panel">

                    <Link
                        to="/"
                        className="brand brand-single"
                    >
                        <Sparkles size={19} />
                        NoteMind
                    </Link>

                    <span className="auth-kicker">
                        {kicker}
                    </span>

                    <h2>{title}</h2>

                    <p className="auth-intro">
                        {intro}
                    </p>

                    {children}

                </div>
            </section>
        </main>
    );
}

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (event) => {
        event.preventDefault();

        const cleanEmail = email.trim();

        if (!cleanEmail) {
            showError(
                "Email required",
                "Please enter the email address linked to your account."
            );
            return;
        }

        try {
            setLoading(true);

            showLoading("Sending verification code...");

            const { data } = await api.post(
                "api/password/forgot/",
                {
                    email: cleanEmail,
                }
            );

            await emailjs.send(
                import.meta.env.VITE_EMAILJS_SERVICE_ID,
                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
                {
                    email: cleanEmail,
                    otp: data.otp,
                    expiry: "10",
                },
                {
                    publicKey:
                        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
                }
            );

            closeAlert();

            await showSuccess(
                "Verification code sent!",
                "Check your email for the six-digit verification code."
            );

            navigate(
                `/verify-otp?email=${encodeURIComponent(
                    cleanEmail
                )}`
            );
        } catch (error) {
            console.error(error);

            closeAlert();

            showError(
                "Unable to send code",
                error.response?.data?.error ||
                    "We couldn't send the verification code. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            kicker="Password help"
            title="Reset your password"
            intro="Enter the email linked to your account. We'll send a six-digit verification code."
        >
            <form
                className="auth-form"
                onSubmit={submit}
            >
                <AuthField
                    icon={<Mail />}
                    label="Email address"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                        setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    autoComplete="email"
                />

                <button
                    className="auth-submit"
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Sending code..."
                        : "Send verification code"}
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