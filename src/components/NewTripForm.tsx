import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { api, type ContainerResponse, type TripResponse, type TripMonitor, type UserResponse } from '../api'
import { tripCode } from '../data'
import { tripEvents } from '../lib/tripEvents'

type Mode = 'create' | 'edit'

interface Props {
  open: boolean
  onClose: () => void
  mode: Mode
  /** Viagem existente para edição (somente no modo 'edit'). */
  trip?: TripMonitor | null
  /** Contêineres com viagem IN_TRANSIT no momento (não podem ser reutilizados por outra viagem). */
  unavailableContainerIds: number[]
  onCreated: () => void
}

export function NewTripForm({ open, onClose, mode, trip, unavailableContainerIds, onCreated }: Props) {
  const [containers, setContainers] = useState<ContainerResponse[]>([])
  const [drivers, setDrivers] = useState<UserResponse[]>([])
  const [fruitList, setFruitList] = useState<{ id: number; name: string }[]>([])

  const [loadingOptions, setLoadingOptions] = useState(false)
  const [optionsError, setOptionsError] = useState<string>()

  const [containerId, setContainerId] = useState<number | null>(null)
  const [driverId, setDriverId] = useState<number | null>(null)
  const [fruitId, setFruitId] = useState<number | null>(null)
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [startNow, setStartNow] = useState(true)
  const [status, setStatus] = useState<'PLANNED' | 'IN_TRANSIT' | 'COMPLETED'>('PLANNED')

  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string>()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState<string>()

  const modalRef = useRef<HTMLDivElement>(null)

  // No modo edição, o contêiner da própria viagem deve estar disponível mesmo que esteja IN_TRANSIT.
  const editingContainerId = trip?.containerId ?? null
  const unavailableSet = new Set(unavailableContainerIds)
  const availableContainers = containers.filter(
    c => c.available && (!unavailableSet.has(c.id) || c.id === editingContainerId),
  )

  useEffect(() => {
    if (!open) return
    resetForm()
    loadOptions()
  }, [open, mode, trip])

  useEffect(() => {
    if (!open || !modalRef.current) return
    const focusable = modalRef.current.querySelector<HTMLElement>('select, input, button')
    focusable?.focus()

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeydown)
    return () => document.removeEventListener('keydown', handleKeydown)
  }, [open, onClose])

  const resetForm = useCallback(() => {
    setContainerId(null)
    setDriverId(null)
    setFruitId(null)
    setOrigin('')
    setDestination('')
    setStartNow(true)
    setStatus('PLANNED')
    setSubmitError(undefined)
    setFieldErrors({})
    setSuccess(undefined)
  }, [])

  const loadOptions = async () => {
    setLoadingOptions(true)
    setOptionsError(undefined)
    try {
      const [containersList, driversList, fruitsList] = await Promise.all([
        api.containers(),
        api.users('ROLE_DRIVER'),
        api.fruits(),
      ])
      setContainers(containersList)
      setDrivers(driversList.filter(d => d.role === 'ROLE_DRIVER'))
      setFruitList(fruitsList.map(f => ({ id: f.id, name: f.name })))

      if (mode === 'edit' && trip) {
        setContainerId(trip.containerId)
        setDriverId(trip.driverId)
        setFruitId(trip.fruitId)
        setOrigin(trip.origin ?? '')
        setDestination(trip.destination ?? '')
        setStatus(trip.status as 'PLANNED' | 'IN_TRANSIT' | 'COMPLETED')
        setStartNow(trip.status === 'IN_TRANSIT')
      }
    } catch (err) {
      setOptionsError(err instanceof Error ? err.message : 'Não foi possível carregar as opções do formulário.')
    } finally {
      setLoadingOptions(false)
    }
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitError(undefined)
    setFieldErrors({})

    const next: Record<string, string> = {}
    if (!containerId) next.containerId = 'Selecione um contêiner.'
    if (!driverId) next.driverId = 'Selecione um motorista.'
    if (!fruitId) next.fruitId = 'Selecione uma fruta.'
    if (Object.keys(next).length > 0) {
      setFieldErrors(next)
      setSubmitError('Preencha os campos obrigatórios.')
      return
    }

    setSaving(true)
    try {
      if (mode === 'create') {
        const created: TripResponse = await api.createTrip({
          containerId: containerId!,
          driverId: driverId!,
          fruitId: fruitId!,
          origin: origin.trim() || undefined,
          destination: destination.trim() || undefined,
          startNow,
        })
        setSuccess(
          `Viagem ${tripCode(created.id)} cadastrada com sucesso${created.status === 'IN_TRANSIT' ? ' e iniciada.' : '.'}`,
        )
        onCreated()
        setTimeout(() => onClose(), 800)
      } else if (trip) {
        const updated: TripResponse = await api.updateTrip(trip.id, {
          status,
          containerId: containerId!,
          driverId: driverId!,
          fruitId: fruitId!,
          origin: origin.trim() || undefined,
          destination: destination.trim() || undefined,
          startNow: status === 'IN_TRANSIT' ? startNow : undefined,
        })
        setSuccess(`Viagem ${tripCode(updated.id)} atualizada com sucesso.`)
        onCreated()
        setTimeout(() => onClose(), 800)
      }
    } catch (err) {
      const error = err as Error & { errors?: Record<string, string> }
      if (error.errors) {
        setFieldErrors(error.errors)
        setSubmitError('Corrija os campos destacados abaixo.')
      } else {
        setSubmitError(error instanceof Error ? error.message : 'Não foi possível salvar a viagem.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  const isEdit = mode === 'edit'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="trip-form-title" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar">
          <X size={18} />
        </button>
        <form onSubmit={handleSubmit}>
          <div>
            <h3 id="trip-form-title">{isEdit ? 'Editar viagem' : 'Nova viagem'}</h3>
            <p className="muted">
              {isEdit
                ? 'Altere os dados da viagem. O status respeita as regras de transição do sistema.'
                : ''}
            </p>
          </div>

          {optionsError && <p className="msg-error">{optionsError}</p>}

          {/* Orientação quando não há dados básicos cadastrados (ex.: banco novo) */}
          {!loadingOptions && !optionsError && (containers.length === 0 || drivers.length === 0 || fruitList.length === 0) && (
            <div className="hint-box">
              <strong>Cadastre os dados básicos antes de criar uma viagem:</strong>
              {containers.length === 0 && <p>Nenhum contêiner cadastrado — vá em <b>Contêineres</b> e adicione um com o ID do canal ThingSpeak.</p>}
              {drivers.length === 0 && <p>Nenhum motorista cadastrado — vá em <b>Equipe</b> e cadastre um (a senha provisória será enviada por e-mail).</p>}
              {fruitList.length === 0 && <p>Nenhuma fruta disponível — verifique o cadastro de frutas no banco.</p>}
            </div>
          )}

          <div className="grid2">
            <div>
              <label htmlFor="trip-container">Contêiner <span className="req">*</span></label>
              <select
                id="trip-container"
                value={containerId ?? ''}
                onChange={e => setContainerId(e.target.value ? Number(e.target.value) : null)}
                disabled={loadingOptions || availableContainers.length === 0}
                aria-invalid={Boolean(fieldErrors.containerId)}
                aria-describedby={fieldErrors.containerId ? 'err-container' : undefined}
              >
                <option value="">Escolha um contêiner</option>
                {availableContainers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.code} <small>IoT: {c.thingSpeakChannelId}</small>
                  </option>
                ))}
              </select>
              {fieldErrors.containerId && <p className="field-error" id="err-container">{fieldErrors.containerId}</p>}
            </div>
            <div>
              <label htmlFor="trip-driver">Motorista <span className="req">*</span></label>
              <select
                id="trip-driver"
                value={driverId ?? ''}
                onChange={e => setDriverId(e.target.value ? Number(e.target.value) : null)}
                disabled={loadingOptions || drivers.length === 0}
                aria-invalid={Boolean(fieldErrors.driverId)}
                aria-describedby={fieldErrors.driverId ? 'err-driver' : undefined}
              >
                <option value="">Escolha um motorista</option>
                {drivers.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} <small>{d.email}</small>
                  </option>
                ))}
              </select>
              {fieldErrors.driverId && <p className="field-error" id="err-driver">{fieldErrors.driverId}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="trip-fruit">Fruta <span className="req">*</span></label>
            <select
              id="trip-fruit"
              value={fruitId ?? ''}
              onChange={e => setFruitId(e.target.value ? Number(e.target.value) : null)}
              disabled={loadingOptions || fruitList.length === 0}
              aria-invalid={Boolean(fieldErrors.fruitId)}
              aria-describedby={fieldErrors.fruitId ? 'err-fruit' : undefined}
            >
              <option value="">Escolha uma fruta</option>
              {fruitList.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            {fieldErrors.fruitId && <p className="field-error" id="err-fruit">{fieldErrors.fruitId}</p>}
          </div>

          <div className="grid2">
            <div>
              <label htmlFor="trip-origin">Origem</label>
              <input
                id="trip-origin"
                placeholder="Ex.: São Paulo, SP"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
                disabled={saving}
              />
            </div>
            <div>
              <label htmlFor="trip-destination">Destino</label>
              <input
                id="trip-destination"
                placeholder="Ex.: Rio de Janeiro, RJ"
                value={destination}
                onChange={e => setDestination(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          <label className="pick">
            <input
              type="checkbox"
              checked={startNow}
              onChange={e => setStartNow(e.target.checked)}
              readOnly={saving || status !== 'IN_TRANSIT'}
            />
            <strong>Iniciar viagem imediatamente</strong>
            <small>
              A viagem já nasce em trânsito (IN_TRANSIT). Se desmarcado e status for Planejada, pode ser iniciada posteriormente.
            </small>
          </label>

          <div>
            <label htmlFor="trip-status">Status <span className="req">*</span></label>
            <select
              id="trip-status"
              value={status}
              onChange={e => setStatus(e.target.value as 'PLANNED' | 'IN_TRANSIT' | 'COMPLETED')}
              disabled={saving}
            >
              <option value="PLANNED">Planejada</option>
              <option value="IN_TRANSIT">Em andamento</option>
              <option value="COMPLETED">Encerrada</option>
            </select>
            <p className="muted" style={{ fontSize: 11, marginTop: 4 }}>
              
            </p>
          </div>

          {submitError && <p className="msg-error">{submitError}</p>}
          {success && <p className="msg-ok">{success}</p>}

          <button
            className="btn primary block"
            type="submit"
            disabled={
              saving ||
              !containerId ||
              availableContainers.length === 0 ||
              loadingOptions ||
              !driverId ||
              !fruitId
            }
          >
            {saving
              ? isEdit
                ? 'Atualizando...'
                : 'Cadastrando...'
              : isEdit
                ? 'Atualizar viagem'
                : 'Cadastrar viagem'}
          </button>
        </form>
      </div>
    </div>
  )
}
