export type Status = 'Atenção' | 'Normal'
export interface Trip { id: string; route: string; cargo: string; temp: number; status: Status; series: number[] }
export interface Alert { id: number; title: string; detail: string; ago: string; color: 'red' | 'orange' | 'green' }
export interface Member { name: string; email: string; role: 'Administrador' | 'Motorista' }
export interface Driver { name: string; trips: number; inRange: number }

// séries de 13 pontos: 06h, 07h, ..., 18h
export const trips: Trip[] = [
  { id: 'FV-024', route: 'Petrolina → Recife', cargo: 'Uva Vitória', temp: 13.8, status: 'Atenção',
    series: [8.6, 9.0, 9.4, 9.2, 10.6, 11.6, 10.4, 9.6, 10.2, 12.6, 11.6, 12.8, 13.8] },
  { id: 'FV-018', route: 'Juazeiro → Salvador', cargo: 'Manga Palmer', temp: 11.4, status: 'Normal',
    series: [10.0, 10.4, 9.6, 9.2, 9.8, 10.6, 11.4, 12.3, 11.6, 10.8, 11.9, 11.2, 11.4] },
  { id: 'FV-011', route: 'Petrolina → Fortaleza', cargo: 'Uva Itália', temp: 10.2, status: 'Normal',
    series: [9.0, 9.4, 9.8, 10.4, 10.9, 10.5, 10.0, 9.6, 9.9, 10.4, 10.8, 10.5, 10.2] },
]
export const alerts: Alert[] = [
  { id: 1, title: 'Temperatura acima da faixa', detail: 'FV-024 • 13,8 °C', ago: 'Há 4 min', color: 'red' },
  { id: 2, title: 'Oscilação detectada', detail: 'FV-018 • variação de 3,1 °C', ago: 'Há 18 min', color: 'orange' },
  { id: 3, title: 'Temperatura normalizada', detail: 'FV-011 • 10,2 °C', ago: 'Há 42 min', color: 'green' },
]
export const drivers: Driver[] = [
  { name: 'Carlos Almeida', trips: 8, inRange: 96 },
  { name: 'Marina Santos', trips: 6, inRange: 93 },
  { name: 'João Ferreira', trips: 5, inRange: 89 },
]
export const user = { name: 'Kallyne Victoria Gomes de Melo', email: 'kallyne@gmail.com', phone: '81999999999', role: 'Administrador' as const }
export const fmt = (n: number) => n.toFixed(1).replace('.', ',')