import React, { useState } from "react" 
import axios from "axios" 
import { useNavigate } from "react-router-dom" 
import Navbar from "../components/Navbar"
 
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
      setMessage(response.data.message)
    } catch (err: unknown) { 
      if (axios.isAxiosError(err)) { 
        if (err.response?.data?.error) { 
          console.error("Registration error:", err.response.data.error) 
        } else { 
          console.error("Axios error:", err.message) 
        } 
      } else { 
        setMessage("An unknown error occurred.") 
      } 
    } 
  } 
 
  return ( 
    <>
      <Navbar />
      <div className="min-h-screen w-full bg-gray-900 flex flex-col items-center justify-center p-4"> 
        <div className="w-full max-w-md bg-gradient-to-br from-blue-500 to-green-400 p-1 rounded-lg">
          <div className="bg-gray-900 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Create User</h2>
            {message && <p className="mb-4 p-3 rounded bg-opacity-10 bg-white text-white">{message}</p>} 

            <form onSubmit={handleSubmit}> 
              <div className="mb-3"> 
                <label className="text-white">Username</label> 
                <br /> 
                <input 
                  type="text" 
                  autoComplete="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                /> 
              </div> 

              <div style={{ marginBottom: "8px" }}> 
                <label className="text-white">Password</label> 
                <br /> 
                <input 
                  type="password" 
                  autoComplete="new-password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
                /> 
              </div> 

              <button type="submit" className="w-full bg-gradient-to-br from-blue-500 to-green-400 text-white py-2 px-4 rounded hover:opacity-90 transition-opacity">
                Create User
              </button>
            </form> 

            <button 
              onClick={() => navigate("/login")}
              className="w-full mt-4 text-white hover:text-blue-400 transition-colors text-sm"
            > 
              Already have an account? Log in 
            </button> 
          </div>
        </div>
      </div> 
    </>
  ) 
} 
 
export default Register