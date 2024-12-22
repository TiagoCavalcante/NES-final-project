import React, { useEffect, useState } from "react"
import {
  DragDropContext,
  DropResult,
  Droppable,
  Draggable,
  DraggableStateSnapshot,
  DraggableProvided,
  DroppableProvided,
  DroppableStateSnapshot,
} from "@hello-pangea/dnd"

import useColleges from "../hooks/useColleges"
import { csvFile } from "../schemas/college"
import useSuggestions from "../hooks/useSuggestions"
import SuggestionList from "../components/SuggestionsList"
import Navbar from "../components/Navbar"

type ColumnId = "dream" | "target" | "safety"
type ColumnsState = Record<ColumnId, string[]>

type AddCollegeFormProps = {
  allCollegeNames: string[]
  onAdd: (collegeName: string) => void
}

function reorderItem(list: string[], startIndex: number, endIndex: number): string[] {
  const result = [...list]
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

function moveItemBetweenLists(
  source: string[],
  destination: string[],
  sourceIndex: number,
  destIndex: number,
): { source: string[]; destination: string[] } {
  const sourceClone = [...source]
  const destClone = [...destination]
  const [removed] = sourceClone.splice(sourceIndex, 1)
  destClone.splice(destIndex, 0, removed)

  return {
    source: sourceClone,
    destination: destClone,
  }
}

function getItemStyle(
  isDragging: boolean,
  draggableStyle: React.CSSProperties | undefined,
): React.CSSProperties {
  return {
    userSelect: "none",
    padding: "8px",
    marginBottom: "8px",
    backgroundColor: isDragging ? "#f1f5f9" : "#e2e8f0",
    ...draggableStyle,
  }
}

function getListStyle(isDraggingOver: boolean): React.CSSProperties {
  return {
    backgroundColor: isDraggingOver ? "#f3f4f6" : "#fafafa",
    padding: "8px",
    minHeight: "100px",
  }
}

const AddCollegeForm: React.FC<AddCollegeFormProps> = ({ allCollegeNames, onAdd }) => {
  const [query, setQuery] = useState("")
  const suggestions = useSuggestions({
    items: allCollegeNames,
    query,
    threshold: 0.2,
    maxSuggestions: 5,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      onAdd(query.trim())
      setQuery("")
    }
  }

  function handleSuggestionClick(suggestion: string) {
    setQuery(suggestion)
  }

  return (
    <form onSubmit={handleSubmit} className="relative mb-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a college..."
        className="p-2 border border-gray-300 rounded w-full"
      />

      <SuggestionList
        suggestions={suggestions}
        onSuggestionClick={handleSuggestionClick}
      />

      <button
        type="submit"
        className="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
      >
        Add
      </button>
    </form>
  )
}

const CollegeListPage: React.FC = () => {
  const { data: colleges } = useColleges({ csvFile, filter: false })
  const allCollegeNames = colleges.map((col) => col.INSTNM)

  // Initialize column state from localStorage or default
  const [columns, setColumns] = useState<ColumnsState>(() => {
    const saved = localStorage.getItem("myCollegeLists")
    if (saved) {
      return JSON.parse(saved) as ColumnsState
    }
    return {
      dream: [],
      target: [],
      safety: [],
    }
  })

  useEffect(() => {
    localStorage.setItem("myCollegeLists", JSON.stringify(columns))
  }, [columns])

  function onDragEnd(result: DropResult) {
    const { source, destination } = result
    // If dropped outside a droppable or no change
    if (!destination) return

    const sourceId = source.droppableId as ColumnId
    const destId = destination.droppableId as ColumnId

    // If same column reordering
    if (sourceId === destId) {
      const reordered = reorderItem(columns[sourceId], source.index, destination.index)
      setColumns((prev) => ({
        ...prev,
        [sourceId]: reordered,
      }))
    } else {
      // Move item from one column to another
      const moved = moveItemBetweenLists(
        columns[sourceId],
        columns[destId],
        source.index,
        destination.index,
      )
      setColumns((prev) => ({
        ...prev,
        [sourceId]: moved.source,
        [destId]: moved.destination,
      }))
    }
  }

  function handleAdd(column: ColumnId, name: string) {
    setColumns((prev) => ({
      ...prev,
      [column]: [...prev[column], name],
    }))
  }

  function handleEdit(column: ColumnId, index: number) {
    const currentName = columns[column][index]
    const newName = window.prompt("Edit College Name:", currentName)
    if (newName && newName.trim() && newName !== currentName) {
      const updated = [...columns[column]]
      updated[index] = newName.trim()
      setColumns((prev) => ({
        ...prev,
        [column]: updated,
      }))
    }
  }

  function handleRemove(column: ColumnId, index: number) {
    const updated = [...columns[column]]
    updated.splice(index, 1)
    setColumns((prev) => ({
      ...prev,
      [column]: updated,
    }))
  }

  function renderColumn(columnId: ColumnId, title: string) {
    return (
      <div className="bg-gradient-to-br from-blue-500 to-green-400 border rounded-md p-3 w-64 mx-2 flex flex-col">
        <h2 className="text-xl font-semibold mb-2">
          {title} ({columns[columnId].length})
        </h2>

        <AddCollegeForm
          allCollegeNames={allCollegeNames}
          onAdd={(name) => handleAdd(columnId, name)}
        />

        <Droppable droppableId={columnId}>
          {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
            <div
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
              className="flex-1"
              {...provided.droppableProps}
            >
              {columns[columnId].map((collegeName, index) => (
                <Draggable
                  key={`${collegeName}-${index}`}
                  draggableId={`${collegeName}-${index}`}
                  index={index}
                >
                  {(
                    provided: DraggableProvided,
                    snapshot: DraggableStateSnapshot,
                  ) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style,
                      )}
                      className="flex justify-between items-center"
                    >
                      <span>{collegeName}</span>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleEdit(columnId, index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRemove(columnId, index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          X
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder /* needed for correct drop behavior */}
            </div>
          )}
        </Droppable>
      </div>
    )
  }

  return (
    <div>
      <Navbar/>
      <div className="min-h-screen bg-gray-900 p-6">
        <h1 className="mt-16 text-3xl text-white font-bold text-center mb-6">My College Lists</h1>

        {/* Wrap everything in DragDropContext for DnD */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex justify-center flex-wrap">
            {renderColumn("dream", "Dream")}
            {renderColumn("target", "Target")}
            {renderColumn("safety", "Safety")}
          </div>
        </DragDropContext>
      </div>
    </div>
  )
}

export default CollegeListPage
