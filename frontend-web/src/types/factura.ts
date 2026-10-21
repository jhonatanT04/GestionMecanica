import type { OrdenDeTrabajo } from './ordenDeTrabajo'
import type { Producto } from './producto'

export type TipoItem = 'REPUESTO' | 'REPUESTO_EXTERNO' | 'MANO_DE_OBRA'

export interface ItemOrden {
  id: number
  tipo: TipoItem
  /** Solo REPUESTO (del inventario). */
  producto: Producto | null
  /** REPUESTO y REPUESTO_EXTERNO (en MANO_DE_OBRA el backend la fija en 1). */
  cantidad: number | null
  precioUnitario: number | null
  /** REPUESTO_EXTERNO y MANO_DE_OBRA. */
  descripcion: string | null
  /** Solo REPUESTO_EXTERNO: dónde se compró. */
  proveedor: string | null
  /** Solo MANO_DE_OBRA: subtotal calculado por el backend. */
  costo: number | null
}

export type ItemOrdenInput =
  | { tipo: 'REPUESTO'; producto: { id: number }; cantidad: number }
  | { tipo: 'REPUESTO_EXTERNO'; descripcion: string; proveedor: string | null; cantidad: number; precioUnitario: number }
  | { tipo: 'MANO_DE_OBRA'; descripcion: string; precioUnitario: number }

export type EstadoFactura = 'PENDIENTE' | 'PAGADA'

export interface Factura {
  id: number
  numero: string
  fecha: string
  fechaPago: string | null
  subtotalRepuestos: number
  subtotalManoObra: number
  iva: number
  /** Tarifa con la que se emitió (15 = 15%). */
  porcentajeIva: number
  total: number
  estado: EstadoFactura
  orden: OrdenDeTrabajo
}
