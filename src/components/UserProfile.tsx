import React, { useState, useMemo } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

interface UserProfileProps {
  user: User
}

// Fixed: Performance issue - memoized expensive computation
const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false)
  
  // Memoized expensive computation that only runs when user changes
  const expensiveCalculationResult = useMemo(() => {
    console.log('Running expensive calculation for user:', user.id)
    let result = 0
    // Seed the calculation with user.id for deterministic results per user
    const seed = parseInt(user.id) || 1
    for (let i = 0; i < 1000000; i++) {
      result += Math.random() * seed
    }
    return result.toFixed(2)
  }, [user.id]) // Recalculate when user changes

  const handleSave = () => {
    // Simulate save operation
    setIsEditing(false)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Perfil de Usuario</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-blue-600 hover:text-blue-800"
        >
          {isEditing ? 'Cancelar' : 'Editar'}
        </button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          {isEditing ? (
            <input 
              type="text" 
              defaultValue={user.name}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            />
          ) : (
            <p className="mt-1 text-gray-900">{user.name}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          {isEditing ? (
            <input 
              type="email" 
              defaultValue={user.email}
              className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
            />
          ) : (
            <p className="mt-1 text-gray-900">{user.email}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Rol</label>
          <p className="mt-1 text-gray-900">{user.role}</p>
        </div>
        
        {/* Memoized expensive calculation */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Score Calculado</label>
          <p className="mt-1 text-gray-900">{expensiveCalculationResult}</p>
        </div>
        
        {isEditing && (
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Guardar Cambios
          </button>
        )}
      </div>
    </div>
  )
}

export default UserProfile