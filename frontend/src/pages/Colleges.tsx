import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js"
import React, { useEffect, useState } from "react"
import { Pie } from "react-chartjs-2"
import InfiniteScroll from "react-infinite-scroll-component"
import { College, csvFile } from "../schemas/college"
import useColleges from "../hooks/useColleges"
import useSuggestions from "../hooks/useSuggestions"
import SuggestionList from "../components/SuggestionsList"
import Navbar from "../components/Navbar"

ChartJS.register(ArcElement, Tooltip, Legend)

const CollegeTable = () => {
  const [displayedData, setDisplayedData] = useState<College[]>([])
  const [filteredData, setFilteredData] = useState<College[]>([])
  const [hasMore, setHasMore] = useState(true)
  const chunkSize = 20
  const [search, setSearch] = useState("")
  const [cityFilter, setCityFilter] = useState("")
  const [sortKey, setSortKey] = useState<
    "ADM_RATE" | "SAT_AVG" | "TUITIONFEE_IN" | "TUITIONFEE_OUT" | null
  >(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")

  const { data } = useColleges({ csvFile })
  const institutionSuggestions = useSuggestions({
    items: data.map((college) => college.INSTNM),
    query: search,
  })

  const citySuggestions = useSuggestions({
    items: data.map((college) => college.CITY),
    query: cityFilter,
  })

  useEffect(() => {
    setFilteredData(data)
    setDisplayedData(data.slice(0, chunkSize))
    setHasMore(data.length > chunkSize)
  }, [data])

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

    const filtered = data.filter(
      (college) =>
        college.CITY.toLowerCase().includes(query) &&
        (!search || college.INSTNM.toLowerCase().includes(search)),
    )
    setFilteredData(filtered)
    setDisplayedData(filtered.slice(0, chunkSize))
    setHasMore(filtered.length > chunkSize)
  }

  const handleSuggestionClick = (
    type: "institution" | "city",
    suggestion: string,
  ) => {
    if (type === "institution") {
      setSearch(suggestion.toLowerCase())

      const filtered = data.filter(
        (college) =>
          college.INSTNM.toLowerCase() === suggestion.toLowerCase() &&
          (!cityFilter ||
            college.CITY.toLowerCase().includes(cityFilter.toLowerCase())),
      )
      setFilteredData(filtered)
      setDisplayedData(filtered.slice(0, chunkSize))
      setHasMore(filtered.length > chunkSize)
    } else if (type === "city") {
      setCityFilter(suggestion.toLowerCase())

      const filtered = data.filter(
        (college) =>
          college.CITY.toLowerCase() === suggestion.toLowerCase() &&
          (!search || college.INSTNM.toLowerCase().includes(search)),
      )
      setFilteredData(filtered)
      setDisplayedData(filtered.slice(0, chunkSize))
      setHasMore(filtered.length > chunkSize)
    }
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
        const valA = a[key]
        const valB = b[key]
        return nextOrder === "asc" ? valA - valB : valB - valA
      })

    setFilteredData(sorted)
    setDisplayedData(sorted.slice(0, chunkSize))
  }

  const renderPieChart = (female: number, firstGen: number) => {
    const femalePercentage = female * 100
    const firstGenPercentage = firstGen * 100

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
              labels: {
                color: "white",
              }
            },
          },
        }}
        
        className="w-40 h-40 mx-auto"
      />
    )
  }

  return (
    <div>
      <Navbar/>
      <div className="min-h-screen bg-gray-900 p-6">
        <h1 className="mt-16 text-2xl font-semibold text-gray-200 mb-4">
          College Table
        </h1>
        <div className="flex flex-col sm:flex-row justify-between mb-4">
          {/* Institution Name Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by institution name"
              value={search}
              onChange={handleSearch}
              className="mb-2 text-white sm:mb-0 sm:mr-2 p-2 border bg-gray-900 border-gray-300 rounded w-full"
            />
            <SuggestionList
              suggestions={institutionSuggestions}
              onSuggestionClick={(suggestion) =>
                handleSuggestionClick("institution", suggestion)
              }
            />
          </div>
          <div className="relative">
            {/* City Filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by city"
                value={cityFilter}
                onChange={handleCityFilter}
                className="text-gray-200 bg-gray-900 mb-2 sm:mb-0 sm:mr-2 p-2 border border-gray-300 rounded w-full"
              />
              <SuggestionList
                suggestions={citySuggestions}
                onSuggestionClick={(suggestion) =>
                  handleSuggestionClick("city", suggestion)
                }
              />
            </div>
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
              <tr className="bg-gray-900 text-left">
                <th className="border border-gray-300 px-4 py-2 font-medium text-gray-200">
                  Institute
                </th>
                <th className="border border-gray-300 px-4 py-2 font-medium text-gray-200">
                  City
                </th>
                <th className="border border-gray-300 px-4 py-2 font-medium text-gray-200">
                  Admission Rate
                </th>
                <th className="border border-gray-300 px-4 py-2 font-medium text-gray-200">
                  SAT Avg
                </th>
                <th className="border border-gray-300 px-4 py-2 font-medium text-gray-200">
                  Tuition (In/Out)
                </th>
                <th className="border border-gray-300 px-4 py-2 font-medium text-gray-200">
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
                  <td className="border bg-gray-900 border-gray-300 px-4 py-2 text-gray-200">
                    {row.INSTNM}
                  </td>
                  <td className="border bg-gray-900 border-gray-300 px-4 py-2 text-gray-200">
                    {row.CITY}
                  </td>
                  <td className="border bg-gray-900 border-gray-300 px-4 py-2 text-gray-200">
                    {(row.ADM_RATE * 100).toFixed(1)}%
                  </td>
                  <td className="border bg-gray-900 border-gray-300 px-4 py-2 text-gray-200">
                    {row.SAT_AVG}
                  </td>
                  <td className="border bg-gray-900 border-gray-300 px-4 py-2 text-gray-200">
                    {row.TUITIONFEE_IN && row.TUITIONFEE_OUT
                      ? `$${row.TUITIONFEE_IN} / $${row.TUITIONFEE_OUT}`
                      : "N/A"}
                  </td>
                  <td className="border bg-gray-900 border-gray-300 px-4 py-2">
                    {renderPieChart(row.FEMALE, row.FIRST_GEN)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </InfiniteScroll>
      </div>
    </div>
  )
}

export default CollegeTable
