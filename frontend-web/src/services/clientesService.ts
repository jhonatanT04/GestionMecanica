import type { Cliente, ClienteInput } from '../types'
import { apiClient } from '../api/client'

export function listarClientes(): Promise<Cliente[]> {
  return apiClient.get<Cliente[]>('/clientes')
}

export function actualizarCliente(id: number, input: ClienteInput): Promise<Cliente> {
  return apiClient.put<Cliente>(`/clientes/${id}`, input)
}
