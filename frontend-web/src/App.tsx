import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { RequireRole } from './auth/RequireRole'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { LoginPage } from './pages/LoginPage'
import { InicioPage } from './pages/InicioPage'
import { OrdenesPage } from './pages/OrdenesPage'
import { ClientesPage } from './pages/ClientesPage'
import { InventarioPage } from './pages/InventarioPage'
import { EmpleadosPage } from './pages/EmpleadosPage'
import { ReportesPage } from './pages/ReportesPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<InicioPage />} />
          <Route path="/ordenes" element={<OrdenesPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/inventario" element={<InventarioPage />} />
          <Route element={<RequireRole roles={['DUENO']} />}>
            <Route path="/empleados" element={<EmpleadosPage />} />
            <Route path="/reportes" element={<ReportesPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}

export default App
