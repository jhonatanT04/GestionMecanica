export interface TarifaIva {
  id: number
  /** En puntos porcentuales: 15 significa 15%. */
  porcentaje: number
  vigenteDesde: string
  registradaEn: string
}

export interface TarifaIvaInput {
  porcentaje: number
  vigenteDesde: string
}
