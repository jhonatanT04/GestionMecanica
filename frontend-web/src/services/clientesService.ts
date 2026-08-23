import type { Cliente } from '../types'
import { apiClient } from '../api/client'

export function listarClientes(): Promise<Cliente[]> {
  return apiClient.get<Cliente[]>('/clientes')
}
