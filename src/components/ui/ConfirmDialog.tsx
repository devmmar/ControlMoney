import { Modal } from './Modal'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
}

export function ConfirmDialog({
  isOpen, onClose, onConfirm, title, message,
  confirmLabel = 'Excluir', loading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <p className="text-sm text-gray-600 mb-5">{message}</p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-lg transition-colors flex items-center gap-2"
        >
          {loading && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
