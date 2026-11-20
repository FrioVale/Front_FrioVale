import { formatDateTime } from '../data'
import type { ImpactResponse } from '../api'

/**
 * Linha do tempo verde-azulada de impactos.
 * Cada ponto exibe horário e pico ao receber foco (tabIndex=0) ou clique.
 */
export default function ImpactTimeline({ impacts }: { impacts: ImpactResponse[] }) {
  if (impacts.length === 0) {
    return <p className="muted">Nenhum impacto registrado.</p>
  }

  return (
    <div className="impact-timeline" role="list" aria-label="Linha do tempo de impactos">
      {impacts.map((impact) => (
        <button
          key={impact.id}
          className="impact-point"
          role="listitem"
          tabIndex={0}
          aria-label={`Impacto de ${impact.peakG.toFixed(1)} g em ${formatDateTime(impact.originalTimestamp)}`}
          title={`${formatDateTime(impact.originalTimestamp)} • ${impact.peakG.toFixed(1)} g`}
        >
          <span className="impact-dot" />
          <span className="impact-info">
            <strong>{impact.peakG.toFixed(1).replace('.', ',')} g</strong>
            <small>{formatDateTime(impact.originalTimestamp)}</small>
          </span>
        </button>
      ))}
    </div>
  )
}
