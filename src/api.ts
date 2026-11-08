export type Role = 'ROLE_DRIVER' | 'ROLE_COMPANY'
export type TripStatus = 'PLANNED' | 'IN_TRANSIT' | 'COMPLETED'

export interface UserResponse {
  id: number
  name: string
  email: string
  phone: string | null
  role: Role
}

export interface TripMonitor {
  id: number
  containerId: number
  containerCode: string
  driverId: number
  driverName: string
  fruitId: number
  fruitName: string
  minTemp: number
  maxTemp: number
  minHumidity: number
  maxHumidity: number
  origin: string | null
  destination: string | null
  status: TripStatus
  startDate: string | null
  endDate: string | null
  temperature: number | null
  humidity: number | null
  latitude: number | null
  longitude: number | null
  lastReadingAt: string | null
  inRange: boolean | null
  readings: number
  readingsInRange: number
  inRangePercent: number | null
}

export interface AlertResponse {
  id: number
  tripId: number
  containerCode: string
  fruitName: string
  telemetryId: number
  temperature: number | null
  minTemp: number
  maxTemp: number
  telemetryTimestamp: string
  message: string
  resolved: boolean
  createdAt: string
}

export interface TelemetryResponse {
  id: number
  temperature: number
  humidity: number | null
  latitude: number | null
  longitude: number | null
  timestamp: string
  isAlert: boolean
}

export interface DashboardSummary {
  activeTrips: number
  tripsInRange: number
  idealMinTemp: number | null
  idealMaxTemp: number | null
  activeAlerts: number
  activeDrivers: number
  trips: TripMonitor[]
  recentAlerts: AlertResponse[]
}

export interface IoTLog {
  id: number
  containerId: number | null
  containerCode: string | null
  channelId: string
  entryId: number | null
  temperature: number | null
  humidity: number | null
  latitude: number | null
  longitude: number | null
  recordedAt: string
  fetchedAt: string
}

export interface DriverStats {
  id: number
  name: string
  trips: number
  inRangePercent: number | null
}

export interface AuthResponse {
  token: string
  tokenType: string
  expiresInMinutes: number
  user: UserResponse
}

export interface RegisterPayload {
  name: string
  email: string
  phone?: string
  password: string
}

const API_URL = ((import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8080')
  .replace(/\/+$/, '')

const TOKEN_KEY = 'friovale.token'

export const session = {
  token: () => localStorage.getItem(TOKEN_KEY),
  hasToken: () => Boolean(localStorage.getItem(TOKEN_KEY)),
  save: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = session.token()
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  })

  if (!response.ok) {
    let detail = `Não foi possível concluir a requisição (HTTP ${response.status}).`
    try {
      const body = await response.json() as { detail?: string; message?: string; errors?: Record<string, string> }
      detail = body.detail ?? body.message ?? Object.values(body.errors ?? {})[0] ?? detail
    } catch {
      // resposta sem JSON: mantém a mensagem padrão
    }
    throw new Error(detail)
  }

  if (response.status === 204) {
    return undefined as T
  }
  return response.json() as Promise<T>
}

export const api = {
  login: (body: { email: string; password: string }) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body: RegisterPayload) =>
    request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  dashboard: () => request<DashboardSummary>('/api/dashboard/summary'),

  trips: () => request<TripMonitor[]>('/api/trips'),
  activeTrips: () => request<TripMonitor[]>('/api/trips/active/monitor'),
  telemetry: (tripId: number) => request<TelemetryResponse[]>(`/api/trips/${tripId}/telemetry`),

  alerts: () => request<AlertResponse[]>('/api/alerts'),

  users: (role?: Role) => request<UserResponse[]>(`/api/users${role ? `?role=${role}` : ''}`),
  currentUser: () => request<UserResponse>('/api/users/current'),
  createUser: (body: { name: string; email: string; role: Role; password?: string }) =>
    request<UserResponse>('/api/users', { method: 'POST', body: JSON.stringify(body) }),

  iotLogs: (containerId?: number) =>
    request<IoTLog[]>(`/api/thingspeak/logs${containerId ? `?containerId=${containerId}` : ''}`),
  syncIoTLogs: () =>
    request<{ saved: number }>('/api/thingspeak/logs/sync?results=100', { method: 'POST' }),

  driverStats: () => request<DriverStats[]>('/api/reports/drivers'),

  reportPdf: (mode: string, month?: number, year?: number, ids?: number[]) => {
    const params = new URLSearchParams({ mode });
    if (month != null) params.set('month', String(month));
    if (year != null) params.set('year', String(year));
    (ids ?? []).forEach(id => params.append('ids', String(id)));
    return fetch(`${API_URL}/api/reports/pdf?${params}`, {
      headers: { Authorization: `Bearer ${session.token() ?? ''}` },
    }).then(r => {
      if (!r.ok) throw new Error('Não foi possível gerar o relatório.');
      return r.blob();
    });
  },
  tripPdf: (tripId: number) =>
    fetch(`${API_URL}/api/reports/trips/${tripId}/pdf`, {
      headers: { Authorization: `Bearer ${session.token() ?? ''}` },
    }).then(r => {
      if (!r.ok) throw new Error('Não foi possível gerar o PDF da viagem.');
      return r.blob();
    }),
}
