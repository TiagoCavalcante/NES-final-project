import React from "react"
import { useNavigate } from "react-router-dom"
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated"
import useSignOut from "react-auth-kit/hooks/useSignOut"

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const isAuthenticated = useIsAuthenticated()
  const signOut = useSignOut()

  const handleSignOut = () => {
    signOut() // Clears token from storage
    navigate("/login") // Redirect to login page, if desired
  }

  const handleSignIn = () => {
    navigate("/login") // Navigate user to your login page
  }

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h1>Home</h1>

      {isAuthenticated ? (
        <button onClick={handleSignOut}>Sign Out</button>
      ) : (
        <button onClick={handleSignIn}>Sign In</button>
      )}
    </div>
  )
}

export default HomePage
