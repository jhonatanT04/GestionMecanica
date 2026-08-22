import type { Empleado } from '../types'

export const empleadosMock: Empleado[] = [
  {
    id: 'emp-1',
    nombre: 'Roberto Chávez',
    rol: 'DUENO_ADMIN',
    telefono: '0991112233',
    email: 'roberto.chavez@mecanica.ec',
    activo: true,
  },
  {
    id: 'emp-2',
    nombre: 'Diego Ramírez',
    rol: 'MECANICO',
    telefono: '0992223344',
    email: 'diego.ramirez@mecanica.ec',
    activo: true,
  },
  {
    id: 'emp-3',
    nombre: 'Mónica Vega',
    rol: 'MECANICO',
    telefono: '0993334455',
    email: 'monica.vega@mecanica.ec',
    activo: true,
  },
  {
    id: 'emp-4',
    nombre: 'Sofía Herrera',
    rol: 'RECEPCIONISTA',
    telefono: '0994445566',
    email: 'sofia.herrera@mecanica.ec',
    activo: true,
  },
]
