import Papa from "papaparse"
import { useEffect, useState } from "react"
import { College, CompleteCollegeSchema, IncompleteCollegeSchema } from "../schemas/college"

type UseCollegesProps = {
  csvFile: string
  filter?: boolean
}

type UseCollegesReturn = {
  data: College[]
  loading: boolean
  error: string | null
}

const useColleges = ({ csvFile, filter = true }: UseCollegesProps): UseCollegesReturn => {
  const [data, setData] = useState<College[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const schema = filter ? CompleteCollegeSchema : IncompleteCollegeSchema

    const fetchData = async () => {
      try {
        const response = await fetch(csvFile)
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV file: ${response.statusText}`)
        }
        const csvText = await response.text()

        Papa.parse<unknown>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const validatedData = results.data
              .map((row) => schema.safeParse(row))
              .filter(
                (parsed): parsed is { success: true; data: College } =>
                  parsed.success,
              )
              .map((parsed) => parsed.data)

            setData(validatedData)
            setLoading(false)
          },
          error: (err: unknown) => {
            if (err instanceof Error) {
              setError(err.message)
            } else {
              setError("An unknown error occurred.")
            }
            setLoading(false)
          },
        })
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("An unknown error occurred.")
        }
        setLoading(false)
      }
    }

    fetchData()
  }, [csvFile, filter])

  return { data, loading, error }
}

export default useColleges
