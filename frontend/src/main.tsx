import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Simulator from "./pages/Simulator"
import Colleges from "./pages/Colleges"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/colleges" element={<Colleges />} />
        <Route path="/simulator" element={<Simulator />} />
      </Routes>
    </Router>
  </StrictMode>,
)
