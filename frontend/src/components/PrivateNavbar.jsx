import { Link, useNavigate } from "react-router-dom"

function PrivateNavbar() {

    const navigate = useNavigate()

    const handleLogout = () => {

        localStorage.removeItem("access")
        localStorage.removeItem("refresh")

        navigate("/")
    }

    return (

        <nav className="custom-navbar">

            <div className="container navbar-container">

                <Link
                    to="/dashboard"
                    className="logo"
                >
                    NoteMind AI
                </Link>

                <button
                    onClick={handleLogout}
                    className="logout-btn"
                >
                    Logout
                </button>

            </div>

        </nav>

    )
}

export default PrivateNavbar