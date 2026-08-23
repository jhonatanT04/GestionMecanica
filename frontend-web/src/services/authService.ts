import type { Usuario } from '../types'
import { apiClient } from '../api/client'

export interface LoginResponse {
  token: string
  usuario: Usuario
}

export function login(email: string, password: string): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>('/auth/login', { email, password })
}
