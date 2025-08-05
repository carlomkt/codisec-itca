// Mock API function for user search
export const searchUsers = async (searchTerm: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const mockUsers = [
    { id: '1', name: 'Juan Pérez', email: 'juan@codisec.gob.pe', role: 'Administrador' },
    { id: '2', name: 'María González', email: 'maria@codisec.gob.pe', role: 'Operador' },
    { id: '3', name: 'Carlos Rodríguez', email: 'carlos@codisec.gob.pe', role: 'Supervisor' },
    { id: '4', name: 'Ana Martínez', email: 'ana@codisec.gob.pe', role: 'Técnico' }
  ]
  
  return mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )
}