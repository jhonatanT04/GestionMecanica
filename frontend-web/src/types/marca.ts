export interface Marca {
  id: number
  nombre: string
  activa: boolean
}

export interface MarcaInput {
  nombre: string
  activa?: boolean
}
