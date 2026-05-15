import { Link } from "react-router-dom"

function Navbar() {

    return (

        <nav className="navbar">

            <div className="container navbar-wrapper">

                <Link
                    to="/"
                    className="logo"
                >
                    NoteMind AI
                </Link>

                <div className="nav-links">

                    <a href="#home">
                        Home
                    </a>

                    <a href="#features">
                        Features
                    </a>

                    <a href="#about">
                        About
                    </a>

                </div>

                <div className="nav-buttons">

                    <Link
                        to="/login"
                        className="login-btn"
                    >
                        Login
                    </Link>

                    <Link
                        to="/register"
                        className="start-btn"
                    >
                        Get Started
                    </Link>

                </div>

            </div>

        </nav>

    )
}

export default Navbar