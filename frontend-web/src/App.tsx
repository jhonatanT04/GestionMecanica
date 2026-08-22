import { Route, Routes } from 'react-router-dom'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { InicioPage } from './pages/InicioPage'
import { OrdenesPage } from './pages/OrdenesPage'
import { ClientesPage } from './pages/ClientesPage'
import { InventarioPage } from './pages/InventarioPage'
import { EmpleadosPage } from './pages/EmpleadosPage'

function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<InicioPage />} />
        <Route path="/ordenes" element={<OrdenesPage />} />
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/inventario" element={<InventarioPage />} />
        <Route path="/empleados" element={<EmpleadosPage />} />
      </Route>
    </Routes>
  )
}

export default App
