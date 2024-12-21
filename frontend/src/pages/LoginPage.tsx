import React, { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import useSignIn from "react-auth-kit/hooks/useSignIn"

const LoginPage: React.FC = () => {
  const signIn = useSignIn()
  const navigate = useNavigate()

  // Local state for username/password
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      // Call your Flask /api/login
      const response = await axios.post("http://127.0.0.1:5000/api/login", {
        username,
        password,
      })

      // The backend should return: { access_token: "...", ... }
      const token = response.data.access_token
      if (!token) {
        throw new Error("No token returned")
      }

      // Attempt to sign in with react-auth-kit
      // Expires in 3600 = 1 hour. Adjust as needed.
      const success = signIn({
        auth: { token, type: "Bearer" },
        // expiresIn: 3600,
        // refreshToken: null, // or 'string' if your backend uses refresh tokens
        // refreshTokenExpireIn: null,
        // Optional user state (available via useAuthUser):
        userState: { username },
      })

      if (success) {
        // Redirect or do something upon success
        navigate("/")
      } else {
        setError("Sign-in failed. Please try again.")
      }
    } catch {
      setError("Invalid credentials or server error.")
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "8px" }}>
          <label>Username</label>
          <br />
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: "8px" }}>
          <label>Password</label>
          <br />
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit">Log In</button>
      </form>
    </div>
  )
}

export default LoginPage
