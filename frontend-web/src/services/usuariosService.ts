import type { RolUsuario, Usuario } from '../types'
import { apiClient } from '../api/client'

export interface UsuarioInput {
  nombre: string
  email: string
  password: string
  rol: RolUsuario
}

export function listarUsuarios(): Promise<Usuario[]> {
  return apiClient.get<Usuario[]>('/usuarios')
}

export function crearUsuario(input: UsuarioInput): Promise<Usuario> {
  return apiClient.post<Usuario>('/usuarios', input)
}
