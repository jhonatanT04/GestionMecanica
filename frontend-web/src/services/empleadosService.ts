import type { Empleado } from '../types'
import { empleadosMock } from '../mocks/empleados'

// TODO(backend Fase 3): reemplazar por apiClient.get<Empleado[]>('/empleados').
// El backend real modela esto como `Usuario` (solo id + nombre, sin rol hasta que
// exista auth) — este service deberá tolerar que `rol` no venga y typear contra
// Usuario, no Empleado, hasta esa fase.

export async function listarEmpleados(): Promise<Empleado[]> {
  return empleadosMock
}
