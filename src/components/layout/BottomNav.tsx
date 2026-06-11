import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingDown, BarChart2, TrendingUp, Settings } from 'lucide-react'
import { ROUTES } from '../../constants/routes'

const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD,          icon: LayoutDashboard, label: 'Início' },
  { to: ROUTES.EXPENSES,           icon: TrendingDown,    label: 'Saídas' },
  { to: ROUTES.FINANCIAL_SUMMARY,  icon: BarChart2,       label: 'Resumo' },
  { to: ROUTES.INCOMES,            icon: TrendingUp,      label: 'Entradas' },
  { to: ROUTES.SETTINGS,           icon: Settings,        label: 'Config.' },
]

export function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10 safe-area-bottom">
      <div className="flex">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === ROUTES.DASHBOARD}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-500'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
