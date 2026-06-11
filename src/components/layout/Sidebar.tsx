import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  CalendarDays,
  Tag,
  BarChart2,
  CalendarRange,
  LogOut,
  DollarSign,
  Settings,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { ROUTES } from '../../constants/routes'

const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD,         icon: LayoutDashboard, label: 'Dashboard' },
  { to: ROUTES.FINANCIAL_SUMMARY, icon: BarChart2,        label: 'Resumo Financeiro' },
  { to: ROUTES.EXPENSES,          icon: TrendingDown,     label: 'Saídas' },
  { to: ROUTES.INCOMES,           icon: TrendingUp,       label: 'Entradas' },
  { to: ROUTES.FIXED_BILLS,       icon: CalendarDays,     label: 'Contas Fixas' },
  { to: ROUTES.DAILY_SUMMARY,     icon: CalendarRange,    label: 'Resumo Diário' },
  { to: ROUTES.CATEGORIES,        icon: Tag,              label: 'Categorias' },
  { to: ROUTES.SETTINGS,          icon: Settings,         label: 'Configurações' },
]

export function Sidebar() {
  const { signOut } = useAuth()

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-white border-r border-gray-200 fixed left-0 top-0 bottom-0 z-10">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-gray-900 text-lg tracking-tight">ControlMoney</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === ROUTES.DASHBOARD}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 w-full transition-colors"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sair
        </button>
      </div>
    </aside>
  )
}
