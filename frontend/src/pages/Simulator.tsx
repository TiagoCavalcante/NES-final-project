import React, { useState } from "react"
import { Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js"
import useColleges from "../hooks/useColleges"
import { College, csvFile } from "../schemas/college"
import {
  predictAdmissionProbability,
  PredictionResult,
  UserInput,
} from "../utils/admission"

ChartJS.register(ArcElement, Tooltip, Legend)

const AdmissionSimulator = () => {
  const { data, loading, error } = useColleges({ csvFile })
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null)
  const [satCriticalReading, setSatCriticalReading] = useState<number | "">("")
  const [satMath, setSatMath] = useState<number | "">("")
  const [satWriting, setSatWriting] = useState<number | "">("")
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!selectedCollege) {
      alert("Please select a university.")
      return
    }

    if (satCriticalReading === "" || satMath === "" || satWriting === "") {
      alert("Please enter all SAT scores.")
      return
    }

    const cr = satCriticalReading as number
    const mt = satMath as number
    const wr = satWriting as number

    if (cr < 200 || cr > 800 || mt < 200 || mt > 800 || wr < 200 || wr > 800) {
      alert(
        "Please enter valid SAT scores between 200 and 800 for each section.",
      )
      return
    }

    const input: UserInput = {
      satCriticalReading: cr,
      satMath: mt,
      satWriting: wr,
    }

    const result = predictAdmissionProbability(selectedCollege, input)
    setPrediction(result)
  }

  const dataChart = {
    labels: ["Probability of Admission", "Probability of Not Admission"],
    datasets: [
      {
        label: "Admission Probability (%)",
        data: prediction
          ? [prediction.probability, 100 - prediction.probability]
          : [0, 0],
        backgroundColor: ["#4ADE80", "#F87171"],
        borderColor: ["#34D399", "#F87171"],
        borderWidth: 1,
      },
    ],
  }

  const options: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom", // TypeScript can infer this without 'as const'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || ""
            const value = context.parsed || 0
            return `${label}: ${value.toFixed(2)}%`
          },
        },
      },
    },
  }

  if (loading) {
    return <div className="text-center mt-10">Loading college data...</div>
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">Error: {error}</div>
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">
          University Admission Simulator
        </h1>
        <form onSubmit={handleSubmit} className="mb-6">
          {/* University Selection */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Select University:
            </label>
            <select
              value={selectedCollege?.INSTNM || ""}
              onChange={(e) => {
                const college =
                  data.find((col) => col.INSTNM === e.target.value) || null
                setSelectedCollege(college)
                setPrediction(null) // Reset prediction when changing college
              }}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="" disabled>
                -- Select a University --
              </option>
              {data.map((college) => (
                <option key={college.INSTNM} value={college.INSTNM}>
                  {college.INSTNM} ({college.CITY})
                </option>
              ))}
            </select>
          </div>

          {/* SAT Critical Reading */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              SAT Critical Reading Score:
            </label>
            <input
              type="number"
              value={satCriticalReading}
              onChange={(e) =>
                setSatCriticalReading(
                  e.target.value === "" ? "" : parseInt(e.target.value),
                )
              }
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="200 - 800"
              required
              min={200}
              max={800}
            />
          </div>

          {/* SAT Math */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              SAT Math Score:
            </label>
            <input
              type="number"
              value={satMath}
              onChange={(e) =>
                setSatMath(
                  e.target.value === "" ? "" : parseInt(e.target.value),
                )
              }
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="200 - 800"
              required
              min={200}
              max={800}
            />
          </div>

          {/* SAT Writing */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              SAT Writing Score:
            </label>
            <input
              type="number"
              value={satWriting}
              onChange={(e) =>
                setSatWriting(
                  e.target.value === "" ? "" : parseInt(e.target.value),
                )
              }
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="200 - 800"
              required
              min={200}
              max={800}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
          >
            Predict Admission Probability
          </button>
        </form>

        {/* Prediction Result */}
        {prediction && selectedCollege && (
          <div>
            <h2 className="text-xl font-semibold mb-2 text-center">
              Prediction Result for {selectedCollege.INSTNM}
            </h2>
            <div className="flex justify-center">
              <Pie data={dataChart} options={options} />
            </div>
            <div className="text-center mt-4">
              <p>
                <span className="font-semibold">Probability of Admission:</span>{" "}
                {prediction.probability.toFixed(2)}%
              </p>
              <p>
                <span className="font-semibold">
                  Probability of Not Admission:
                </span>{" "}
                {(100 - prediction.probability).toFixed(2)}%
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdmissionSimulator
