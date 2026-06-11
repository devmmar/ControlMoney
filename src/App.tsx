import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PrivateRoute } from './components/auth/PrivateRoute'
import { AppLayout } from './components/layout/AppLayout'
import { ROUTES } from './constants/routes'

import { LoginPage }           from './pages/Login'
import { RegisterPage }        from './pages/Register'
import { DashboardPage }       from './pages/Dashboard'
import { ExpensesPage }        from './pages/Expenses'
import { IncomesPage }         from './pages/Incomes'
import { FixedBillsPage }      from './pages/FixedBills'
import { CategoriesPage }      from './pages/Categories'
import { FinancialSummaryPage } from './pages/FinancialSummary'
import { DailySummaryPage }    from './pages/DailySummary'
import { SettingsPage }        from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path={ROUTES.LOGIN}    element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

          {/* Rotas privadas — dentro do AppLayout (sidebar + conteúdo) */}
          <Route
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            <Route path={ROUTES.DASHBOARD}         element={<DashboardPage />} />
            <Route path={ROUTES.FINANCIAL_SUMMARY} element={<FinancialSummaryPage />} />
            <Route path={ROUTES.EXPENSES}          element={<ExpensesPage />} />
            <Route path={ROUTES.INCOMES}           element={<IncomesPage />} />
            <Route path={ROUTES.FIXED_BILLS}       element={<FixedBillsPage />} />
            <Route path={ROUTES.CATEGORIES}        element={<CategoriesPage />} />
            <Route path={ROUTES.DAILY_SUMMARY}     element={<DailySummaryPage />} />
            <Route path={ROUTES.SETTINGS}          element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
