import type { Marca, MarcaInput } from '../types'
import { apiClient } from '../api/client'

export function listarMarcas(soloActivas = false): Promise<Marca[]> {
  return apiClient.get<Marca[]>(soloActivas ? '/marcas?activas=true' : '/marcas')
}

export function crearMarca(input: MarcaInput): Promise<Marca> {
  return apiClient.post<Marca>('/marcas', input)
}

export function actualizarMarca(id: number, input: MarcaInput): Promise<Marca> {
  return apiClient.put<Marca>(`/marcas/${id}`, input)
}

export function eliminarMarca(id: number): Promise<void> {
  return apiClient.delete<void>(`/marcas/${id}`)
}
