import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Conteúdo principal — deslocado pela sidebar no desktop */}
      <main className="lg:ml-60 pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
