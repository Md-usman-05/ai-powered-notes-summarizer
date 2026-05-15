import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import api from "../services/api"

function Register() {

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
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

    if (formData.password !== formData.confirm_password) {
      alert("Passwords do not match")
      return
    }

    try {

      setLoading(true)

      await api.post("api/register/", formData)

      alert("Account created successfully")

      navigate("/login")

    }

   catch (error) {

  console.log(error)

  if (error.response?.data) {

    if (typeof error.response.data === "string") {

      alert(error.response.data)

    }

    else {

      const errors = error.response.data

      const firstKey = Object.keys(errors)[0]

      const firstError = errors[firstKey]

      alert(
        Array.isArray(firstError)
          ? firstError[0]
          : firstError
      )

    }

  }

  else {

    alert("Registration failed")

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
                  Create Account
                </h2>

                <p>
                  Join NoteMind AI and start summarizing smarter.
                </p>

                <form onSubmit={handleSubmit}>

                  <div className="mb-3">

                    <label className="form-label">
                      Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />

                  </div>

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

                  <div className="mb-3">

                    <label className="form-label">
                      Password
                    </label>

                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />

                  </div>

                  <div className="mb-4">

                    <label className="form-label">
                      Confirm Password
                    </label>

                    <input
                      type="password"
                      name="confirm_password"
                      className="form-control"
                      placeholder="Confirm password"
                      value={formData.confirm_password}
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
                      ? "Creating..."
                      : "Create Account"

                    }

                  </button>

                </form>

                <div className="auth-redirect">

                  <p>

                    Already have an account?

                    <Link to="/login">
                      {" "}Login
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

export default Register