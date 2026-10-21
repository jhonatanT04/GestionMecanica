export type RolUsuario = 'ADMIN' | 'MECANICO' | 'CAJA'

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: RolUsuario
}
