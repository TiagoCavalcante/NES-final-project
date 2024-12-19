import { useMemo } from "react"
import { similarity } from "../utils/similarity"

type UseSuggestionsProps = {
  items: string[]
  query: string
  threshold?: number
  maxSuggestions?: number
  filter?: (item: string) => boolean
}

const useSuggestions = ({
  items,
  query,
  threshold = 0.2,
  maxSuggestions = 5,
  filter = () => true,
}: UseSuggestionsProps): string[] => {
  return useMemo(() => {
    if (!query) return []

    const lowerQuery = query.toLowerCase()

    return Array.from(
      new Set(
        items
          .filter(
            (item) => similarity(item.toLowerCase(), lowerQuery) > threshold,
          )
          .filter(filter)
          .sort(
            (a, b) =>
              similarity(b.toLowerCase(), lowerQuery) -
              similarity(a.toLowerCase(), lowerQuery),
          ),
      ),
    ).slice(0, maxSuggestions)
  }, [items, query, threshold, maxSuggestions, filter])
}

export default useSuggestions
