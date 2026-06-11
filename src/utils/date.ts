export function getCurrentMonthRange(): { start: string; end: string; year: number; month: number } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${lastDay}`
  return { start, end, year, month }
}

export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${lastDay}`
  return { start, end }
}

export function getDaysInMonth(year: number, month: number): string[] {
  const lastDay = new Date(year, month, 0).getDate()
  return Array.from({ length: lastDay }, (_, i) => {
    const day = i + 1
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  })
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export function formatMonthYear(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
}

export function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return dateStr === today
}

export function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function currentMonthISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function monthYearFromDate(dateStr: string): string {
  const [y, m] = dateStr.split('-').map(Number)
  return formatMonthYear(y, m)
}
