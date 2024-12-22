import React, { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import useSignIn from "react-auth-kit/hooks/useSignIn"
import Navbar from "../components/Navbar"

const LoginPage: React.FC = () => {
  const signIn = useSignIn()
  const navigate = useNavigate()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const response = await axios.post("http://127.0.0.1:5000/api/login", {
        username,
        password,
      })

      const token = response.data.access_token
      if (!token) {
        throw new Error("No token returned")
      }

      const success = signIn({
        auth: { token, type: "Bearer" },
        userState: { username },
      })

      if (success) {
        navigate("/")
      } else {
        setError("Sign-in failed. Please try again.")
      }
    } catch {
      setError("Invalid credentials or server error.")
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen w-full bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-gradient-to-br from-blue-500 to-green-400 p-1 rounded-lg">
          <div className="bg-gray-900 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Login</h2>
            {error && <p className="mb-4 p-3 rounded bg-red-500 bg-opacity-10 text-red-400">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="text-white">Username</label>
                <br />
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mb-3">
                <label className="text-white">Password</label>
                <br />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-br from-blue-500 to-green-400 text-white py-2 px-4 rounded hover:opacity-90 transition-opacity"
              >
                Log In
              </button>
            </form>

            <button
              onClick={() => navigate("/register")}
              className="w-full mt-4 text-white hover:text-blue-400 transition-colors text-sm"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginPage