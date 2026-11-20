export type Role = 'ROLE_DRIVER' | 'ROLE_COMPANY'
export type TripStatus = 'PLANNED' | 'IN_TRANSIT' | 'COMPLETED'

export interface UserResponse {
  id: number
  name: string
  email: string
  phone: string | null
  role: Role
}

export interface FruitResponse {
  id: number
  name: string
  minTemp: number
  maxTemp: number
  minHumidity: number
  maxHumidity: number
}

export interface ContainerResponse {
  id: number
  code: string
  thingSpeakChannelId: string
  available: boolean
}

export interface ContainerRequest {
  code: string
  thingSpeakChannelId: string
}

export interface TripResponse {
  id: number
  containerId: number
  containerCode: string
  driverId: number
  driverName: string
  fruitId: number
  fruitName: string
  origin: string | null
  destination: string | null
  status: TripStatus
  startDate: string | null
  endDate: string | null
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
  // IA (Monitoramento Inteligente)
  iaAnomalia: boolean | null
  iaResultado: string | null
  iaMensagem: string | null
  iaPerfil: string | null
  regrasAnomalia: boolean | null
  iaDivergencia: boolean | null
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

/** Evento individual de impacto do acelerômetro (field1=800). */
export interface ImpactResponse {
  id: number
  tripId: number | null
  containerId: number
  containerCode: string
  plate: string | null
  peakG: number
  originalTimestamp: string
  receivedAt: string
  createdAt: string
}

/** Alerta gerado por impacto acima do limiar. */
export interface ImpactAlertResponse {
  alertId: number
  impactId: number
  tripId: number | null
  containerCode: string
  plate: string | null
  peakG: number
  message: string
  timestamp: string
}

/** Resumo dos impactos de uma viagem + status do sensor. */
export interface ImpactSummaryResponse {
  total: number
  maxPeakG: number | null
  lastImpact: ImpactResponse | null
  /** ACTIVE_WITH_IMPACTS | ACTIVE_NO_IMPACTS | NO_RECENT_DATA | CALIBRATING */
  sensorStatus: string
  /** Mensagem amigável em pt-BR (null quando há impactos). */
  message: string | null
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
    let errors: Record<string, string> | undefined
    try {
      const body = await response.json() as { detail?: string; message?: string; errors?: Record<string, string> }
      detail = body.detail ?? body.message ?? Object.values(body.errors ?? {})[0] ?? detail
      errors = body.errors
    } catch {
      // resposta sem JSON: mantém a mensagem padrão
    }
    const error = new Error(detail)
    ;(error as Error & { errors?: Record<string, string> }).errors = errors
    throw error
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
  createTrip: (body: {
    containerId: number
    driverId: number
    fruitId: number
    origin?: string
    destination?: string
    startNow: boolean
  }) => request<TripResponse>('/api/trips', { method: 'POST', body: JSON.stringify(body) }),
  updateTripStatus: (id: number, status: TripStatus) =>
    request<TripResponse>(`/api/trips/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  updateTrip: (id: number, body: {
    status: TripStatus
    containerId?: number
    driverId?: number
    fruitId?: number
    origin?: string
    destination?: string
    startNow?: boolean
  }) => request<TripResponse>(`/api/trips/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  fruits: () => request<FruitResponse[]>('/api/fruits'),
  containers: () => request<ContainerResponse[]>('/api/containers'),
  container: (id: number) => request<ContainerResponse>(`/api/containers/${id}`),
  createContainer: (body: ContainerRequest) =>
    request<ContainerResponse>('/api/containers', { method: 'POST', body: JSON.stringify(body) }),
  updateContainer: (id: number, body: ContainerRequest) =>
    request<ContainerResponse>(`/api/containers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteContainer: (id: number) =>
    request<void>(`/api/containers/${id}`, { method: 'DELETE' }),
  telemetry: (tripId: number) => request<TelemetryResponse[]>(`/api/trips/${tripId}/telemetry`),

  // Impactos do acelerômetro
  impactsByTrip: (tripId: number) => request<ImpactResponse[]>(`/api/impacts/trips/${tripId}`),
  impactSummary: (tripId: number) => request<ImpactSummaryResponse>(`/api/impacts/trips/${tripId}/summary`),
  impactsByContainer: (containerId: number) => request<ImpactResponse[]>(`/api/impacts/containers/${containerId}`),
  recentImpacts: () => request<ImpactResponse[]>(`/api/impacts`),
  impactAlerts: () => request<ImpactAlertResponse[]>(`/api/impacts/alerts`),
  syncImpacts: (containerId?: number, results = 100) =>
    request<{ saved: number }>(`/api/impacts/sync?results=${results}${containerId ? `&containerId=${containerId}` : ''}`, { method: 'POST' }),

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
