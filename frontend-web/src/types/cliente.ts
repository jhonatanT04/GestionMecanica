export interface Cliente {
  id: number
  nombres: string
  apellidos: string
  /** Null en clientes registrados antes de que se pidiera la cédula. */
  cedula: string | null
  /** "Nombres Apellidos", calculado por el backend. */
  nombreCompleto: string
  telefono: string | null
  email: string | null
  direccion: string | null
}

export interface ClienteInput {
  nombres: string
  apellidos: string
  cedula: string
  telefono?: string | null
  email?: string | null
  direccion?: string | null
}
