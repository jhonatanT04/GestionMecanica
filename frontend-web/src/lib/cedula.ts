/**
 * Misma validación que CedulaEcuador en el backend: 10 dígitos, provincia
 * 01-24 o 30, tercer dígito < 6 y dígito verificador módulo 10.
 */
export function esCedulaValida(cedula: string): boolean {
  if (!/^\d{10}$/.test(cedula)) return false
  const provincia = Number(cedula.slice(0, 2))
  if (!((provincia >= 1 && provincia <= 24) || provincia === 30)) return false
  if (Number(cedula[2]) >= 6) return false
  let suma = 0
  for (let i = 0; i < 9; i++) {
    const producto = Number(cedula[i]) * (i % 2 === 0 ? 2 : 1)
    suma += producto >= 10 ? producto - 9 : producto
  }
  return (10 - (suma % 10)) % 10 === Number(cedula[9])
}
