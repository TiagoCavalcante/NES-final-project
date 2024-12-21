import React, { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const Register: React.FC = () => {
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    try {
      const response = await axios.post("http://127.0.0.1:5000/api/register", {
        username,
        password,
      })
      // If successful, the Flask route returns 201 with JSON { "message": "User registered successfully" }
      setMessage(response.data.message) // e.g., "User registered successfully"
      // Optionally redirect to login:
      // navigate('/login')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.error) {
          // Display the specific error from the backend
          console.error("Registration error:", err.response.data.error)
        } else {
          // Handle other Axios errors
          console.error("Axios error:", err.message)
        }
      } else {
        setMessage("An unknown error occurred.")
      }
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Create User</h2>
      {message && <p>{message}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "8px" }}>
          <label>Username</label>
          <br />
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: "8px" }}>
          <label>Password</label>
          <br />
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Create User</button>
      </form>

      <button onClick={() => navigate("/login")}>
        Already have an account? Log in
      </button>
    </div>
  )
}

export default Register
