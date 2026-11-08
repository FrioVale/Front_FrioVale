import type { AlertResponse, Role, TripMonitor } from './api'

export const fmt = (n: number) => n.toFixed(1).replace('.', ',')

export const fmtTemp = (n: number | null | undefined) =>
  n == null || Number.isNaN(n) ? '—' : `${fmt(n)} °C`

export const tripCode = (id: number) => `FV-${String(id).padStart(3, '0')}`

export const tripRoute = (trip: TripMonitor) =>
  trip.origin && trip.destination ? `${trip.origin} → ${trip.destination}` : `${trip.containerCode} • ${trip.fruitName}`

export function tripStatus(trip: TripMonitor): { label: string; tone: 'red' | 'green' | 'soft' } {
  if (trip.inRange === true) return { label: 'Normal', tone: 'green' }
  if (trip.inRange === false) return { label: 'Atenção', tone: 'red' }
  return { label: 'Sem leitura', tone: 'soft' }
}

export function alertTitle(alert: AlertResponse) {
  if (alert.temperature == null) return 'Alerta de temperatura'
  if (alert.temperature > alert.maxTemp) return 'Temperatura acima da faixa'
  if (alert.temperature < alert.minTemp) return 'Temperatura abaixo da faixa'
  return 'Temperatura fora da faixa'
}

export const alertDetail = (alert: AlertResponse) =>
  `${alert.containerCode} • ${fmtTemp(alert.temperature)}`

export const alertColor = (alert: AlertResponse): 'red' | 'green' => (alert.resolved ? 'green' : 'red')

export function timeAgo(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  const diff = Date.now() - date.getTime()
  if (Number.isNaN(diff)) return '—'
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Agora'
  if (minutes < 60) return `Há ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Há ${hours} h`
  return `Há ${Math.floor(hours / 24)} d`
}

export function formatDateTime(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export const roleLabel = (role: Role) => (role === 'ROLE_DRIVER' ? 'Motorista' : 'Administrador')

export const roleValue = (label: string): Role => (label === 'Motorista' ? 'ROLE_DRIVER' : 'ROLE_COMPANY')

export const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export const currentMonthName = () => monthNames[new Date().getMonth()]

export const yearOptions = () =>
  Array.from({ length: 6 }, (_, index) => String(new Date().getFullYear() - index))
