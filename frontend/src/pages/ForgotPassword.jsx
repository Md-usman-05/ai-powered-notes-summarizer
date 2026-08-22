import { Link, useNavigate } from "react-router-dom";
import { Mail, Sparkles } from "lucide-react";
import emailjs from "@emailjs/browser";
import { useState } from "react";
import api from "../services/api";
import { AuthField } from "./Register";
import "../styles/auth.css";

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

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");

    const [loading, setLoading] = useState(false);

    const submit = async (event) => {

        event.preventDefault();

        setError("");
        setMessage("");

        if (!email.trim()) {

            setError("Please enter your email address.");

            return;

        }

        try {

            setLoading(true);

            /*
             * Step 1:
             * Ask Django to generate the OTP.
             */

            const { data } = await api.post(
                "api/password/forgot/",
                {
                    email: email.trim(),
                }
            );

            /*
             * Step 2:
             * Send the OTP using EmailJS.
             */

            await emailjs.send(

                import.meta.env.VITE_EMAILJS_SERVICE_ID,

                import.meta.env.VITE_EMAILJS_TEMPLATE_ID,

                {
                    email: email.trim(),

                    otp: data.otp,

                    expiry: "10",
                },

                {
                    publicKey:
                        import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
                }

            );

            setMessage(
                "Verification code sent successfully. Check your email."
            );

            /*
             * Give the user a moment to see the message.
             */

            window.setTimeout(() => {

                navigate(
                    `/verify-otp?email=${encodeURIComponent(
                        email.trim()
                    )}`
                );

            }, 1200);

        }

        catch (error) {

            console.error(error);

            setError(

                error.response?.data?.error ||

                "We couldn't send the verification code. Please try again."

            );

        }

        finally {

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
                            ? "Sending code..."
                            : "Send verification code"
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