import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { resetAllData } from '../services/settingsService'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { ROUTES } from '../constants/routes'

export function SettingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Exige que o usuário confirme digitando "ZERAR"
  const [typed, setTyped] = useState('')
  const canConfirm = typed.trim().toUpperCase() === 'ZERAR'

  async function handleReset() {
    if (!user || !canConfirm) return
    setLoading(true)
    setError(null)
    try {
      await resetAllData(user.id)
      setConfirmOpen(false)
      navigate(ROUTES.DASHBOARD, { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao zerar dados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        <div className="px-5 py-4">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Dados</p>
        </div>

        <div className="px-5 py-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Zerar todos os dados</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Apaga todas as saídas, entradas, contas fixas e saldos mensais.
              As categorias são mantidas. Esta ação não pode ser desfeita.
            </p>
          </div>
          <button
            onClick={() => { setTyped(''); setConfirmOpen(true) }}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium px-3 py-2 rounded-lg transition-colors shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            Zerar dados
          </button>
        </div>
      </div>

      {/* Dialog customizado com campo de confirmação */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Zerar todos os dados</p>
                <p className="text-xs text-gray-500">Esta ação não pode ser desfeita.</p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Serão apagados: todas as saídas, entradas, contas fixas e saldos mensais.
              Você começará do zero a partir deste mês.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500">
                Digite <span className="font-bold text-red-600">ZERAR</span> para confirmar
              </label>
              <input
                type="text"
                value={typed}
                onChange={e => setTyped(e.target.value)}
                placeholder="ZERAR"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={loading}
                className="flex-1 border border-gray-200 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReset}
                disabled={!canConfirm || loading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                {loading ? 'Zerando…' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
