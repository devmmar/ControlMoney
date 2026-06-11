import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
}

const icons = {
  success: <CheckCircle className="w-4 h-4 text-success" />,
  error:   <XCircle    className="w-4 h-4 text-danger"  />,
  warning: <AlertTriangle className="w-4 h-4 text-warning" />,
}

const styles = {
  success: 'border-success/20 bg-success-light',
  error:   'border-danger/20  bg-danger-light',
  warning: 'border-warning/20 bg-warning-light',
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm max-w-sm ${styles[type]}`}>
      {icons[type]}
      <span className="flex-1 text-gray-800">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600 mt-0.5">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ── Hook de toast ──────────────────────────────────────────────
interface ToastItem {
  id: number
  message: string
  type: ToastType
}

let counter = 0

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  function show(message: string, type: ToastType = 'success') {
    const id = ++counter
    setToasts(prev => [...prev, { id, message, type }])
  }

  function remove(id: number) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return { toasts, show, remove }
}

// ── Container de toasts ────────────────────────────────────────
interface ToastContainerProps {
  toasts: ToastItem[]
  onRemove: (id: number) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-20 lg:bottom-5 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => onRemove(t.id)} />
      ))}
    </div>
  )
}
