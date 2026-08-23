export type RolUsuario = 'DUENO' | 'MECANICO' | 'RECEPCIONISTA'

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: RolUsuario
}
