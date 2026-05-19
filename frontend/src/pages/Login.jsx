import Navbar from "../components/Navbar"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { useState } from "react"
import api from "../services/api"

function Login() {

  const navigate = useNavigate()

  const [searchParams] = useSearchParams()

  const registeredEmail = searchParams.get("email") || ""

  const [formData, setFormData] = useState({
    email: registeredEmail,
    password: "",
  })

  const [loading, setLoading] = useState(false)

  const [message] = useState(
    searchParams.get("registered")
      ? "Account created successfully. Please login."
      : ""
  )

  const [errorMessage, setErrorMessage] = useState("")

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })

  }

  const handleSubmit = async (e) => {

    e.preventDefault()

    try {

      setLoading(true)
      setErrorMessage("")

      const response = await api.post(
        "api/login/",
        formData
      )

      localStorage.setItem(
    "access",
    response.data.access
)

localStorage.setItem(
    "refresh",
    response.data.refresh
)
      navigate("/dashboard")

    }

    catch (error) {

      console.log(error)

      if (error.response?.data) {

        const errorData = error.response.data

        setErrorMessage(
          typeof errorData === "string"
            ? errorData
            : errorData.detail ||
              errorData.non_field_errors?.[0] ||
              JSON.stringify(errorData)
        )

      }

      else {

        setErrorMessage("Login failed")

      }

    }

    finally {

      setLoading(false)

    }

  }

  return (

    <>

      <Navbar />

      <section className="auth-section">

        <div className="container">

          <div className="row justify-content-center">

            <div className="col-lg-5 col-md-6">

              <div className="auth-card">

                <h2>
                  Welcome Back
                </h2>

                <p>
                  Login to continue using NoteMind AI.
                </p>

                <form onSubmit={handleSubmit}>

                  <div className="mb-3">

                    <label className="form-label">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  <div className="mb-4">

                    <label className="form-label">
                      Password
                    </label>

                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >

                    {
                      loading
                      ? "Logging in..."
                      : "Login"
                    }

                  </button>

                  {
                    message &&
                    <div className="alert alert-success mt-3 mb-0">
                      {message}
                    </div>
                  }

                  {
                    errorMessage &&
                    <div className="alert alert-danger mt-3 mb-0">
                      {errorMessage}
                    </div>
                  }

                </form>

                <div className="auth-redirect">

                  <p>

                    Don't have an account?

                    <Link to="/register">
                      {" "}Create Account
                    </Link>

                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

    </>

  )
}

export default Login
