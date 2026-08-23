// Backend no expone todavía un listado de usuarios (llega en la fase de auth/roles).
// Por ahora solo conocemos los Usuario que aparecen anidados en OrdenDeTrabajo.mecanicoAsignado.
export interface Usuario {
  id: number
  nombre: string
}
