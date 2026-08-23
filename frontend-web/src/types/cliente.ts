export interface Cliente {
  id: number
  nombre: string
  telefono: string | null
  email: string | null
  direccion: string | null
}

export interface ClienteInput {
  nombre: string
  telefono?: string | null
  email?: string | null
  direccion?: string | null
}
