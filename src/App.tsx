import React, { useState, useEffect } from 'react'
import UserProfile from './components/UserProfile'
import TodoList from './components/TodoList'
import { searchUsers } from './utils/api'

interface User {
  id: string
  name: string
  email: string
  role: string
}

function App() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Fixed: Memory leak - added cleanup for event listener
  useEffect(() => {
    const handleResize = () => {
      console.log('Window resized:', window.innerWidth)
    }
    
    window.addEventListener('resize', handleResize)
    
    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Fixed: Infinite re-render - added proper dependency array
  useEffect(() => {
    if (searchTerm) {
      searchUsers(searchTerm).then(setUsers)
    } else {
      setUsers([]) // Clear users when search term is empty
    }
  }, [searchTerm]) // Added dependency array

  // Fixed: Security vulnerability - safe rendering without HTML injection
  const renderWelcomeMessage = (userName: string) => {
    return (
      <h2 className="text-xl font-medium text-gray-700">
        Bienvenido, {userName || 'Usuario'}
      </h2>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Sistema de Gestión CODISEC Chorrillos
        </h1>
        {/* Fixed: Safe rendering without HTML injection */}
        {renderWelcomeMessage(searchTerm)}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Usuarios</h2>
            {users.length > 0 ? (
              <ul className="space-y-2">
                {users.map((user: User) => (
                  <li 
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="p-2 hover:bg-gray-50 cursor-pointer rounded"
                  >
                    {user.name} - {user.email}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No se encontraron usuarios</p>
            )}
          </div>
        </div>

        <div>
          {selectedUser && <UserProfile user={selectedUser} />}
          <TodoList />
        </div>
      </div>
    </div>
  )
}

export default App