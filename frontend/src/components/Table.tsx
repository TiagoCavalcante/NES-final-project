import React, { useState, useEffect } from "react"
import Papa from "papaparse"
import { z } from "zod"
import { Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import InfiniteScroll from "react-infinite-scroll-component"

ChartJS.register(ArcElement, Tooltip, Legend)

// See https://en.wikipedia.org/wiki/Levenshtein_distance
// Code from https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely
const editDistance = (s1: string, s2: string) => {
  const costs = []

  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i
    for (let j = 0; j <= s2.length; j++) {
      if (i == 0) {
        costs[j] = j
      } else {
        if (j > 0) {
          let newValue = costs[j - 1]

          if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1
          }

          costs[j - 1] = lastValue
          lastValue = newValue
        }
      }
    }
    if (i > 0) {
      costs[s2.length] = lastValue
    }
  }

  return costs[s2.length]
}

const similarity = (s1: string, s2: string) => {
  let longer = s1
  let shorter = s2

  if (s1.length < s2.length) {
    longer = s2
    shorter = s1
  }

  const longerLength = longer.length

  return (longerLength - editDistance(longer, shorter)) / longerLength
}

const nullToUndefined = (value: string | null) =>
  value === null ? undefined : value

// Define Zod schema for a single row in the CSV
const CollegeSchema = z.object({
  INSTNM: z.string(),
  CITY: z.string(),
  ADM_RATE: z.string().nullable().transform(nullToUndefined),
  SAT_AVG: z.string().nullable().transform(nullToUndefined),
  FEMALE: z.string().nullable().transform(nullToUndefined),
  FIRST_GEN: z.string().nullable().transform(nullToUndefined),
  TUITIONFEE_IN: z.string().nullable().transform(nullToUndefined),
  TUITIONFEE_OUT: z.string().nullable().transform(nullToUndefined),
})

type College = z.infer<typeof CollegeSchema>

const CollegeTable: React.FC<{ csvFile: string }> = ({ csvFile }) => {
  const [data, setData] = useState<College[]>([])
  const [displayedData, setDisplayedData] = useState<College[]>([])
  const [filteredData, setFilteredData] = useState<College[]>([])
  const [hasMore, setHasMore] = useState(true)
  const chunkSize = 20
  const [search, setSearch] = useState("")
  const [cityFilter, setCityFilter] = useState("")
  const [institutionSuggestions, setInstitutionSuggestions] = useState<
    string[]
  >([])
  const [citySuggestions, setCitySuggestions] = useState<string[]>([])
  const [sortKey, setSortKey] = useState<
    "ADM_RATE" | "SAT_AVG" | "TUITIONFEE_IN" | "TUITIONFEE_OUT" | null
  >(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    fetch(csvFile)
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse<unknown>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const validatedData = results.data
              .map((row) => CollegeSchema.safeParse(row))
              .filter(
                (parsed): parsed is { success: true; data: College } =>
                  parsed.success,
              )
              .map((parsed) => parsed.data)
              .filter((college) => {
                return (
                  college.ADM_RATE !== null ||
                  college.SAT_AVG !== null ||
                  college.TUITIONFEE_IN !== null ||
                  college.TUITIONFEE_OUT !== null
                )
              })

            setData(validatedData)
            setFilteredData(validatedData)
            setDisplayedData(validatedData.slice(0, chunkSize))
          },
        })
      })
  }, [csvFile])

  const loadMoreData = () => {
    if (displayedData.length >= filteredData.length) {
      setHasMore(false)
      return
    }
    const newData = filteredData.slice(
      displayedData.length,
      displayedData.length + chunkSize,
    )
    setDisplayedData((prevData) => [...prevData, ...newData])
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase()
    setSearch(query)

    const suggestions = Array.from(
      new Set(
        data
          .map((college) => college.INSTNM)
          .filter((name) => similarity(name.toLowerCase(), query) > 0.3)
          .sort(
            (a, b) =>
              similarity(b.toLowerCase(), query) -
              similarity(a.toLowerCase(), query),
          ),
      ),
    ).slice(0, 5)
    setInstitutionSuggestions(suggestions)

    const filtered = data.filter(
      (college) =>
        college.INSTNM.toLowerCase().includes(query) &&
        (!cityFilter ||
          college.CITY.toLowerCase().includes(cityFilter.toLowerCase())),
    )
    setFilteredData(filtered)
    setDisplayedData(filtered.slice(0, chunkSize))
    setHasMore(filtered.length > chunkSize)
  }

  const handleCityFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase()
    setCityFilter(query)

    const suggestions = Array.from(
      new Set(
        data
          .map((college) => college.CITY)
          .filter((city) => similarity(city.toLowerCase(), query) > 0.3)
          .sort(
            (a, b) =>
              similarity(b.toLowerCase(), query) -
              similarity(a.toLowerCase(), query),
          ),
      ),
    ).slice(0, 5)
    setCitySuggestions(suggestions)

    const filtered = data.filter(
      (college) =>
        college.CITY.toLowerCase().includes(query) &&
        (!search || college.INSTNM.toLowerCase().includes(search)),
    )
    setFilteredData(filtered)
    setDisplayedData(filtered.slice(0, chunkSize))
    setHasMore(filtered.length > chunkSize)
  }

  const handleSort = (
    key: "ADM_RATE" | "SAT_AVG" | "TUITIONFEE_IN" | "TUITIONFEE_OUT",
  ) => {
    let nextOrder: "asc" | "desc" | null

    if (sortKey === key) {
      // Cycle through states: asc -> desc -> null
      nextOrder =
        sortOrder === "asc" ? "desc" : sortOrder === "desc" ? null : "asc"
    } else {
      // Start with ascending when changing sort key
      nextOrder = "asc"
    }

    setSortKey(nextOrder === null ? null : key)

    if (nextOrder === null) {
      // Reset to original filtered data if no sorting
      setFilteredData([...data])
      setDisplayedData([...data].slice(0, chunkSize))
      return
    }

    setSortOrder(nextOrder)

    const sorted = [...filteredData]
      .filter((college) => college[key]) // Exclude rows with "N/A" for this column
      .sort((a, b) => {
        const valA = parseFloat(a[key] || "0")
        const valB = parseFloat(b[key] || "0")
        return nextOrder === "asc" ? valA - valB : valB - valA
      })

    setFilteredData(sorted)
    setDisplayedData(sorted.slice(0, chunkSize))
  }

  const renderPieChart = (female?: string, firstGen?: string) => {
    const femalePercentage = parseFloat(female || "0") * 100
    const firstGenPercentage = parseFloat(firstGen || "0") * 100

    const data = {
      labels: ["Female", "First Generation", "Other"],
      datasets: [
        {
          data: [
            femalePercentage,
            firstGenPercentage,
            100 - femalePercentage - firstGenPercentage,
          ],
          backgroundColor: ["#f87171", "#60a5fa", "#a3a3a3"],
          hoverBackgroundColor: ["#ef4444", "#3b82f6", "#737373"],
        },
      ],
    }

    return (
      <Pie
        data={data}
        options={{
          plugins: {
            legend: {
              position: "bottom",
            },
          },
        }}
        className="w-40 h-40 mx-auto"
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        College Table
      </h1>
      <div className="flex flex-col sm:flex-row justify-between mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by institution name"
            value={search}
            onChange={handleSearch}
            className="mb-2 sm:mb-0 sm:mr-2 p-2 border border-gray-300 rounded w-full"
          />
          {institutionSuggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-300 rounded w-full">
              {institutionSuggestions.map((suggestion, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setSearch(suggestion)
                    setInstitutionSuggestions([])
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Filter by city"
            value={cityFilter}
            onChange={handleCityFilter}
            className="mb-2 sm:mb-0 sm:mr-2 p-2 border border-gray-300 rounded w-full"
          />
          {citySuggestions.length > 0 && (
            <ul className="absolute z-10 bg-white border border-gray-300 rounded w-full">
              {citySuggestions.map((suggestion, idx) => (
                <li
                  key={idx}
                  onClick={() => {
                    setCityFilter(suggestion)
                    setCitySuggestions([])
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleSort("ADM_RATE")}
            className={`px-4 py-2 rounded ${
              sortKey === "ADM_RATE"
                ? sortOrder === "asc"
                  ? "bg-green-600 text-white"
                  : sortOrder === "desc"
                    ? "bg-red-600 text-white"
                    : "bg-gray-400 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            Admission Rate{" "}
            {sortKey === "ADM_RATE" &&
              (sortOrder === "asc" ? "↑" : sortOrder === "desc" ? "↓" : "")}
          </button>
          <button
            onClick={() => handleSort("SAT_AVG")}
            className={`px-4 py-2 rounded ${
              sortKey === "SAT_AVG"
                ? sortOrder === "asc"
                  ? "bg-green-600 text-white"
                  : sortOrder === "desc"
                    ? "bg-red-600 text-white"
                    : "bg-gray-400 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            SAT Avg{" "}
            {sortKey === "SAT_AVG" &&
              (sortOrder === "asc" ? "↑" : sortOrder === "desc" ? "↓" : "")}
          </button>
          <button
            onClick={() => handleSort("TUITIONFEE_IN")}
            className={`px-4 py-2 rounded ${
              sortKey === "TUITIONFEE_IN"
                ? sortOrder === "asc"
                  ? "bg-green-600 text-white"
                  : sortOrder === "desc"
                    ? "bg-red-600 text-white"
                    : "bg-gray-400 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            Tuition{" "}
            {sortKey === "TUITIONFEE_IN" &&
              (sortOrder === "asc" ? "↑" : sortOrder === "desc" ? "↓" : "")}
          </button>
        </div>
      </div>

      <InfiniteScroll
        dataLength={displayedData.length}
        next={loadMoreData}
        hasMore={hasMore}
        loader={<h4 className="text-center text-gray-500">Loading...</h4>}
        endMessage={
          <p className="text-center text-gray-500 mt-4">No more data to show</p>
        }
      >
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border border-gray-300 px-4 py-2 font-medium text-gray-700">
                Institute
              </th>
              <th className="border border-gray-300 px-4 py-2 font-medium text-gray-700">
                City
              </th>
              <th className="border border-gray-300 px-4 py-2 font-medium text-gray-700">
                Admission Rate
              </th>
              <th className="border border-gray-300 px-4 py-2 font-medium text-gray-700">
                SAT Avg
              </th>
              <th className="border border-gray-300 px-4 py-2 font-medium text-gray-700">
                Tuition (In/Out)
              </th>
              <th className="border border-gray-300 px-4 py-2 font-medium text-gray-700">
                Demographics
              </th>
            </tr>
          </thead>
          <tbody>
            {displayedData.map((row, index) => (
              <tr
                key={index}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100 transition`}
              >
                <td className="border border-gray-300 px-4 py-2 text-gray-800">
                  {row.INSTNM}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-gray-800">
                  {row.CITY}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-gray-800">
                  {row.ADM_RATE
                    ? `${(parseFloat(row.ADM_RATE) * 100).toFixed(1)}%`
                    : "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-gray-800">
                  {row.SAT_AVG ? `${row.SAT_AVG}` : "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-gray-800">
                  {row.TUITIONFEE_IN && row.TUITIONFEE_OUT
                    ? `$${row.TUITIONFEE_IN} / $${row.TUITIONFEE_OUT}`
                    : "N/A"}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {renderPieChart(row.FEMALE, row.FIRST_GEN)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </InfiniteScroll>
    </div>
  )
}

export default CollegeTable
