import type { Cliente } from '../types'

export const clientesMock: Cliente[] = [
  {
    id: 'cli-1',
    nombre: 'Andrea Salazar',
    telefono: '0991234567',
    email: 'andrea.salazar@example.com',
    direccion: 'Av. Amazonas N34-56, Quito',
  },
  {
    id: 'cli-2',
    nombre: 'Carlos Mendoza',
    telefono: '0987654321',
    email: 'carlos.mendoza@example.com',
    direccion: 'Calle Bolívar 123, Cuenca',
  },
  {
    id: 'cli-3',
    nombre: 'Lucía Paredes',
    telefono: '0993456789',
    email: 'lucia.paredes@example.com',
    direccion: 'Av. 9 de Octubre 456, Guayaquil',
  },
  {
    id: 'cli-4',
    nombre: 'Javier Torres',
    telefono: '0976543210',
    email: 'javier.torres@example.com',
    direccion: 'Av. Eloy Alfaro 789, Quito',
  },
]
