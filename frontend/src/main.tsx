import { StrictMode } from "react"
import AuthProvider from "react-auth-kit"
import createStore from "react-auth-kit/createStore"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import "./index.css"
import Colleges from "./pages/Colleges"
import Home from "./pages/Home"
import MyCollegeList from "./pages/MyCollegeList"
import Simulator from "./pages/Simulator"
import LoginPage from "./pages/LoginPage"
import Register from "./pages/Register"

const store = createStore({
  authName: "_auth",
  authType: "localstorage",
  cookieDomain: window.location.hostname,
  cookieSecure: window.location.protocol === "https:",
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/my_college_list" element={<MyCollegeList />} />
          <Route path="/colleges" element={<Colleges />} />
          <Route path="/simulator" element={<Simulator />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
