import React from "react"
import CollegeTable from "../components/Table"

const App: React.FC = () => {
  return (
    <div>
      <CollegeTable csvFile="/public/filtered_data.csv" />
    </div>
  )
}

export default App
