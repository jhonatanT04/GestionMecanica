export interface Producto {
  id: number
  sku: string
  nombre: string
  categoria: string | null
  stockActual: number
  stockMinimo: number
  precioCompra: number | null
  precioVenta: number
}

export interface ProductoInput {
  sku: string
  nombre: string
  categoria?: string | null
  stockMinimo: number
  precioCompra?: number | null
  precioVenta: number
}
