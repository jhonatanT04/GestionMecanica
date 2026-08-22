import type { Cliente } from '../types'
import { clientesMock } from '../mocks/clientes'

// TODO(backend Fase 1): reemplazar por apiClient.get<Cliente[]>('/clientes')
export async function listarClientes(): Promise<Cliente[]> {
  return clientesMock
}
