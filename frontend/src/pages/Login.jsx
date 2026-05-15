import Navbar from "../components/Navbar"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import api from "../services/api"

function Login() {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [loading, setLoading] = useState(false)

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
      alert("Login successful")

      navigate("/dashboard")

    }

    catch (error) {

      console.log(error)

      if (error.response?.data) {

        alert(
          JSON.stringify(error.response.data)
        )

      }

      else {

        alert("Login failed")

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