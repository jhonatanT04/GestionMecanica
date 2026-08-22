export type RolEmpleado = 'DUENO_ADMIN' | 'MECANICO' | 'RECEPCIONISTA'

export interface Empleado {
  id: string
  nombre: string
  rol: RolEmpleado
  telefono: string
  email: string
  activo: boolean
}
