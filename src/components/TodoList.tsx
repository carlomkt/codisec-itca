import React, { useState } from 'react'

interface Todo {
  id: string
  text: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([
    { id: '1', text: 'Revisar documentos', completed: false, priority: 'high' },
    { id: '2', text: 'Actualizar sistema', completed: true, priority: 'medium' },
    { id: '3', text: 'Capacitación personal', completed: false, priority: 'low' }
  ])
  const [newTodo, setNewTodo] = useState('')

  // Fixed: State mutation - properly creating new state object
  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id 
        ? { ...todo, completed: !todo.completed } // Create new object
        : todo // Keep existing object reference for unchanged todos
    ))
  }

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo: Todo = {
        id: Date.now().toString(),
        text: newTodo,
        completed: false,
        priority: 'medium'
      }
      setTodos([...todos, todo])
      setNewTodo('')
    }
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Lista de Tareas</h2>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Nueva tarea..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addTodo}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Agregar
        </button>
      </div>
      
      <ul className="space-y-2">
        {todos.map(todo => (
          <li key={todo.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className={`flex-1 ${todo.completed ? 'line-through text-gray-500' : ''}`}>
              {todo.text}
            </span>
            <span className={`text-sm font-medium ${getPriorityColor(todo.priority)}`}>
              {todo.priority}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TodoList