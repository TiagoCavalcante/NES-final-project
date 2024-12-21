import {
  DragDropContext,
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  DropResult,
  Droppable,
  DroppableProvided,
  DroppableStateSnapshot,
} from "@hello-pangea/dnd"
import axios from "axios"
import React, { useEffect, useState } from "react"
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader"
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated"
import SuggestionList from "../components/SuggestionsList"
import useColleges from "../hooks/useColleges"
import useSuggestions from "../hooks/useSuggestions"
import { csvFile } from "../schemas/college"

type ColumnId = "dream" | "target" | "safety"
type ColumnsState = Record<ColumnId, string[]>

type CollegeListData = {
  school_list: ColumnsState
  last_modified: string | null
}

type AddCollegeFormProps = {
  allCollegeNames: string[]
  onAdd: (collegeName: string) => void
}

const reorderItem = (list: string[], startIndex: number, endIndex: number) => {
  const result = [...list]
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

const moveItemBetweenLists = (
  source: string[],
  destination: string[],
  sourceIndex: number,
  destIndex: number,
): { source: string[]; destination: string[] } => {
  const sourceClone = [...source]
  const destClone = [...destination]
  const [removed] = sourceClone.splice(sourceIndex, 1)
  destClone.splice(destIndex, 0, removed)

  return {
    source: sourceClone,
    destination: destClone,
  }
}

const getItemStyle = (
  isDragging: boolean,
  draggableStyle: React.CSSProperties | undefined,
): React.CSSProperties => ({
  userSelect: "none",
  padding: "8px",
  marginBottom: "8px",
  backgroundColor: isDragging ? "#f1f5f9" : "#e2e8f0",
  ...draggableStyle,
})

const getListStyle = (isDraggingOver: boolean): React.CSSProperties => ({
  backgroundColor: isDraggingOver ? "#f3f4f6" : "#fafafa",
  padding: "8px",
  minHeight: "100px",
})

const AddCollegeForm: React.FC<AddCollegeFormProps> = ({
  allCollegeNames,
  onAdd,
}) => {
  const [query, setQuery] = useState("")
  const suggestions = useSuggestions({
    items: allCollegeNames,
    query,
    threshold: 0.2,
    maxSuggestions: 5,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onAdd(query.trim())
      setQuery("")
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
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

  const isAuthenticated = useIsAuthenticated()
  const authHeader = useAuthHeader()

  const [columns, setColumns] = useState<ColumnsState>({
    dream: [],
    target: [],
    safety: [],
  })

  const [lastModified, setLastModified] = useState<string | null>(null)

  // Load from localStorage
  useEffect(() => {
    const savedStr = localStorage.getItem("myCollegeLists")
    if (savedStr) {
      try {
        const parsed = JSON.parse(savedStr) as CollegeListData | ColumnsState

        if ("school_list" in parsed && "last_modified" in parsed) {
          // It's the new shape
          setColumns(parsed.school_list)
          setLastModified(parsed.last_modified)
        } else {
          throw new Error("Wrong data format")
        }
      } catch {
        alert("Could not load data from local storage")
      }
    }
  }, [])

  // On first mount (and if user is logged in), fetch from backend & compare
  useEffect(() => {
    if (!isAuthenticated) return

    axios
      .get<CollegeListData>("http://127.0.0.1:5000/api/schools", {
        headers: {
          Authorization: authHeader,
        },
      })
      .then((res) => {
        const serverData = res.data // { school_list, last_modified } or empty

        // If server has no data yet: { school_list: [], last_modified: null } => skip comparison
        if (!serverData.last_modified && !lastModified) {
          // Both are empty => do nothing
          return
        }
        if (!serverData.last_modified && lastModified) {
          // We only have local => push local to server
          updateBackend(columns, lastModified)
          return
        }
        if (serverData.last_modified && !lastModified) {
          // Only server => use server data
          setColumns(serverData.school_list)
          setLastModified(serverData.last_modified)
          saveLocal(serverData.school_list, serverData.last_modified)
          return
        }

        // Both present => pick the newer
        if (lastModified && serverData.last_modified) {
          const localDate = new Date(lastModified)
          const serverDate = new Date(serverData.last_modified)
          if (localDate > serverDate) {
            // Local is newer => push local to server
            updateBackend(columns, lastModified)
          } else {
            // Server is newer => store in local
            setColumns(serverData.school_list)
            setLastModified(serverData.last_modified)
            saveLocal(serverData.school_list, serverData.last_modified)
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching from server:", err)
        // fallback: just keep local
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // run once on mount

  const saveLocal = (newColumns: ColumnsState, newModified: string | null) => {
    const toSave: CollegeListData = {
      school_list: newColumns,
      last_modified: newModified,
    }
    localStorage.setItem("myCollegeLists", JSON.stringify(toSave))
  }

  const updateBackend = async (
    newColumns: ColumnsState,
    newModified: string | null,
  ) => {
    if (!isAuthenticated) return

    try {
      await axios.put(
        "http://127.0.0.1:5000/api/schools",
        {
          school_list: newColumns,
          last_modified: newModified,
        },
        {
          headers: {
            Authorization: authHeader,
          },
        },
      )
    } catch (err) {
      console.error("Failed to update backend:", err)
    }
  }

  // Anytime columns change, we update local + possibly server
  const updateColumns = async (newColumns: ColumnsState) => {
    // First, update React state & local storage right away
    setColumns(newColumns)
    const newLastModified = new Date().toISOString()
    setLastModified(newLastModified)

    // Save to local storage
    const toSave: CollegeListData = {
      school_list: newColumns,
      last_modified: newLastModified,
    }
    localStorage.setItem("myCollegeLists", JSON.stringify(toSave))

    // Then, if logged in, put to the backend in a try/catch
    if (isAuthenticated) {
      try {
        await axios.put(
          "http://127.0.0.1:5000/api/schools",
          {
            school_list: newColumns,
            last_modified: newLastModified,
          },
          {
            headers: { Authorization: authHeader },
          },
        )
      } catch (error) {
        console.error("Failed to update backend:", error)
      }
    }
  }

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result
    // If dropped outside a droppable or no change
    if (!destination) return

    const sourceId = source.droppableId as ColumnId
    const destId = destination.droppableId as ColumnId

    if (sourceId === destId) {
      // reorder
      const reordered = reorderItem(
        columns[sourceId],
        source.index,
        destination.index,
      )
      updateColumns({
        ...columns,
        [sourceId]: reordered,
      })
    } else {
      // move between lists
      const moved = moveItemBetweenLists(
        columns[sourceId],
        columns[destId],
        source.index,
        destination.index,
      )
      updateColumns({
        ...columns,
        [sourceId]: moved.source,
        [destId]: moved.destination,
      })
    }
  }

  const handleAdd = (column: ColumnId, name: string) => {
    const updated = {
      ...columns,
      [column]: [...columns[column], name],
    }
    updateColumns(updated)
  }

  const handleEdit = (column: ColumnId, index: number) => {
    const currentName = columns[column][index]
    const newName = window.prompt("Edit College Name:", currentName)
    if (newName && newName.trim() && newName !== currentName) {
      const updatedList = [...columns[column]]
      updatedList[index] = newName.trim()
      updateColumns({
        ...columns,
        [column]: updatedList,
      })
    }
  }

  const handleRemove = (column: ColumnId, index: number) => {
    const updatedList = [...columns[column]]
    updatedList.splice(index, 1)
    const updatedColumns = {
      ...columns,
      [column]: updatedList,
    }
    updateColumns(updatedColumns)
  }

  const renderColumn = (columnId: ColumnId, title: string) => (
    <div className="bg-white border rounded-md p-3 w-64 mx-2 flex flex-col">
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

  return (
    <div>
      <Navbar/>
      <div className="min-h-screen bg-gray-900 p-6">
        <h1 className="mt-16 text-3xl text-white font-bold text-center mb-6">My College Lists</h1>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex justify-center flex-wrap">
          {renderColumn("dream", "Dream")}
          {renderColumn("target", "Target")}
          {renderColumn("safety", "Safety")}
        </div>
      </DragDropContext>
    </div>
  )
}

export default CollegeListPage
