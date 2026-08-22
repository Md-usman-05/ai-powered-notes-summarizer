import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import SummaryDetails from "./pages/SummaryDetails";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import Terms from "./pages/Terms";

function NotFound() {

    return (

        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                gap: "20px",
            }}
        >

            <h1
                style={{
                    fontSize: "90px",
                    color: "#2563eb",
                    margin: 0,
                }}
            >
                404
            </h1>

            <h2>Page Not Found</h2>

            <p style={{ color: "#64748b" }}>
                The page you are looking for doesn't exist.
            </p>

            <a
                href="/"
                className="btn btn-primary"
            >
                Go Home
            </a>

        </div>

    );

}

function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* Public */}

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<VerifyOTP />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/terms" element={<Terms />} />

                {/* Protected */}

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/upload"
                    element={
                        <ProtectedRoute>
                            <Upload />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/summaries/:id"
                    element={
                        <ProtectedRoute>
                            <SummaryDetails />
                        </ProtectedRoute>
                    }
                />
                <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

                {/* 404 */}

                <Route
                    path="*"
                    element={<NotFound />}
                />

            </Routes>

        </BrowserRouter>

    );

}

export default App;
