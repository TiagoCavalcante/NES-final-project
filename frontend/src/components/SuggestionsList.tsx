import React, { useEffect, useRef, useState } from "react"

type SuggestionListProps = {
  suggestions: string[]
  onSuggestionClick: (suggestion: string) => void
}

const SuggestionList: React.FC<SuggestionListProps> = ({
  suggestions,
  onSuggestionClick,
}) => {
  const [visible, setVisible] = useState<boolean>(true)
  const wrapperRef = useRef<HTMLUListElement>(null)

  // Reset visibility when suggestions change
  useEffect(() => {
    if (suggestions.length > 0) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }, [suggestions])

  // Handle clicks outside the suggestion list
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setVisible(false)
      }
    }

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }

    // Cleanup the event listener on unmount or when visibility changes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [visible])

  // Hide suggestions when a suggestion is clicked
  const handleClick = (suggestion: string) => {
    onSuggestionClick(suggestion)
    setVisible(false)
  }

  if (!visible || suggestions.length === 0) return null

  return (
    <ul
      ref={wrapperRef}
      className="absolute z-10 bg-white border border-gray-300 rounded w-full mt-1 max-h-40 overflow-y-auto"
    >
      {suggestions.map((suggestion, idx) => (
        <li
          key={idx}
          onClick={() => handleClick(suggestion)}
          className="p-2 hover:bg-gray-100 cursor-pointer"
        >
          {suggestion}
        </li>
      ))}
    </ul>
  )
}

export default SuggestionList
