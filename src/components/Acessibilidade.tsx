import { useEffect, useRef, useState } from 'react'
import './Acessibilidade.css'

type VlibrasWindow = Window & {
  VLibrasWidget?: {
    initBtn?: HTMLElement
    open?: (automatic?: boolean) => void
  }
}

let vlibrasLoad: Promise<() => void> | undefined

function loadVlibras() {
  if (vlibrasLoad) return vlibrasLoad

  vlibrasLoad = new Promise((resolve, reject) => {
    const widgetWindow = window as VlibrasWindow
    const script = document.createElement('script')
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js'
    script.onload = () => {
      const deadline = Date.now() + 5_000
      const connect = () => {
        const widget = widgetWindow.VLibrasWidget
        if (typeof widget?.open === 'function') {
          resolve(() => widget.open?.(false))
        } else if (widget?.initBtn?.isConnected) {
          const button = widget.initBtn
          const root = button.getRootNode()
          const launcher = root instanceof ShadowRoot ? root.host : button
          launcher.setAttribute('hidden', '')
          if (launcher instanceof HTMLElement) {
            launcher.style.setProperty('display', 'none', 'important')
          }
          resolve(() => button.click())
        } else if (Date.now() < deadline) {
          window.setTimeout(connect, 50)
        } else {
          reject(new Error('VLibras indisponível'))
        }
      }
      connect()
    }
    script.onerror = () => {
      script.remove()
      vlibrasLoad = undefined
      reject(new Error('Falha ao carregar o VLibras'))
    }
    document.head.appendChild(script)
  })

  return vlibrasLoad
}

/**
 * Componente de Acessibilidade (a11y) para o FrioVale.
 *
 * Organização referência gov.br:
 * - Único contêiner fixo na lateral direita, display flex, flex-direction column, gap 8px.
 * - Ordem de cima para baixo: Acessibilidade → VLibras → Leitura em voz alta.
 * - Apenas UM botão de VLibras (nosso, padronizado), que ativa o widget do gov.br.
 * - Botão nativo do gov.br escondido para evitar sobreposição/duplicação.
 *
 * Funcionalidades preservadas:
 * - Aumentar / diminuir texto (zoom)
 * - Escala de cinza, alto contraste, contraste negativo, fundo claro
 * - Redefinir todos os ajustes
 * - Leitura em voz alta (Web Speech API, pt-BR)
 * - VLibras (único botão, ativa widget do gov.br)
 *
 * Imagens necessárias em public/acessibilidade/img/:
 *   icone-pessoa.png, icone-comando-voz.png, libras.png
 *   icone-aumentar-texto.png, icone-diminuir-texto.png, icone-escala-cinza.png
 *   icone-contraste-negativo.png, icone-fundo-claro.png, icone-redefinir.png
 */
export default function Acessibilidade() {
  const [panelOpen, setPanelOpen] = useState(false)
  const [fontScale, setFontScale] = useState(1)
  const [isReading, setIsReading] = useState(false)

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const [vlibrasStatus, setVlibrasStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  const handleOpenVlibras = async () => {
    if (vlibrasStatus === 'loading') return
    setVlibrasStatus('loading')
    try {
      const open = await loadVlibras()
      open()
      setVlibrasStatus('idle')
    } catch {
      setVlibrasStatus('error')
    }
  }

  // ===== Aplicar estilos de acessibilidade no body =====
  useEffect(() => {
    if (!document.getElementById('access-panel-styles')) {
      const style = document.createElement('style')
      style.id = 'access-panel-styles'
      style.innerHTML = `
        .access-high-contrast { background: #000 !important; color: #fff !important }
        .access-invert { filter: invert(100%) hue-rotate(180deg) !important }
        .access-grayscale { filter: grayscale(100%) !important }
        .access-readable-bg { background: #fff !important; color: #000 !important }
      `
      document.head.appendChild(style)
    }

    // Aplicar zoom/tamanho de fonte
    document.body.style.zoom = String(fontScale)

    // Aplicar/remover classes de contraste/cores
    document.body.classList.toggle('access-high-contrast', false)
    document.body.classList.toggle('access-invert', false)
    document.body.classList.toggle('access-grayscale', false)
    document.body.classList.toggle('access-readable-bg', false)
  }, [fontScale])

  // ===== Leitura em voz alta =====
  const startReading = () => {
    if (!('speechSynthesis' in window)) {
      alert('Leitura em voz alta não suportada neste navegador.')
      return
    }

    window.speechSynthesis.cancel()
    if (utteranceRef.current) {
      utteranceRef.current.onend = null
      utteranceRef.current.onerror = null
    }

    const prefer =
      document.getElementById('conteudo-detalhe') ||
      document.querySelector('main') ||
      document.body
    const text = prefer.innerText.trim() || document.body.innerText.trim()
    if (!text) {
      alert('Não há texto disponível para leitura nesta página.')
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pt-BR'
    utterance.rate = 1
    utterance.pitch = 1

    utterance.onend = () => {
      setIsReading(false)
      utteranceRef.current = null
    }
    utterance.onerror = (e) => {
      console.warn('Erro na síntese de voz', e)
      setIsReading(false)
      utteranceRef.current = null
    }

    utteranceRef.current = utterance
    setIsReading(true)

    try {
      window.speechSynthesis.speak(utterance)
    } catch (e) {
      console.warn('Falha ao iniciar síntese de voz', e)
      setIsReading(false)
      utteranceRef.current = null
    }
  }

  const stopReading = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel()
    if (utteranceRef.current) {
      utteranceRef.current.onend = null
      utteranceRef.current.onerror = null
      utteranceRef.current = null
    }
    setIsReading(false)
  }

  const toggleReading = () => {
    if (isReading) stopReading()
    else startReading()
  }

  const handleAudioClick = (e: React.MouseEvent) => {
    e.preventDefault()
    toggleReading()
  }

  const handleAudioKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggleReading()
    }
  }

  // ===== Ações do painel =====
  const increaseText = () => {
    setFontScale((prev) => {
      const next = +(prev * 1.1).toFixed(2)
      return next
    })
  }

  const decreaseText = () => {
    setFontScale((prev) => {
      const next = +(prev / 1.1).toFixed(2)
      return next < 0.5 ? 0.5 : next
    })
  }

  const toggleGrayscale = () => {
    document.body.classList.toggle('access-grayscale')
  }

  const toggleHighContrast = () => {
    document.body.classList.toggle('access-high-contrast')
  }

  const toggleInvert = () => {
    document.body.classList.toggle('access-invert')
  }

  const toggleFundoClaro = () => {
    document.body.classList.toggle('access-readable-bg')
  }

  const resetAccess = () => {
    setFontScale(1)
    document.body.classList.remove(
      'access-high-contrast',
      'access-invert',
      'access-grayscale',
      'access-readable-bg'
    )
  }

  // ===== Render =====
  return (
    <>
      {/* Único contêiner fixo na lateral direita - coluna com 3 atalhos */}
      <div id="botoes-acessibilidade-extra" aria-label="Acessibilidade">
        {/* 1º item: Ferramentas de acessibilidade (abre painel) */}
        <button
          onClick={(e) => {
            e.preventDefault()
            setPanelOpen((prev) => !prev)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setPanelOpen((prev) => !prev)
            }
          }}
          role="button"
          tabIndex={0}
          aria-expanded={panelOpen}
          aria-label="Ferramentas de acessibilidade"
          title="Ferramentas de acessibilidade"
          className={`btn-acess ${panelOpen ? 'ativo' : ''}`}
        >
          <img src="/acessibilidade/img/icone-pessoa.png" alt="Acessibilidade" />
        </button>

        {/* 2º item: VLibras (único botão de Libras, ativa widget do gov.br) */}
        <button
          type="button"
          onClick={handleOpenVlibras}
          aria-busy={vlibrasStatus === 'loading'}
          aria-label="Abrir VLibras"
          title="Traduzir para Libras"
          className="btn-vlibras"
        >
          <img src="/acessibilidade/img/libras.png" alt="" />
        </button>

        {vlibrasStatus === 'error' && (
          <span role="status" className="vlibras-error">
            VLibras indisponível. Tente novamente.
          </span>
        )}

        {/* 3º item: Leitura em voz alta */}
        <button
          onClick={handleAudioClick}
          onKeyDown={handleAudioKeyDown}
          role="button"
          tabIndex={0}
          aria-pressed={isReading}
          aria-label={isReading ? 'Parar leitura em voz alta' : 'Ler em voz alta'}
          title={isReading ? 'Parar leitura' : 'Ler em voz alta'}
          className={`btn-audio ${isReading ? 'ativo' : ''}`}
        >
          <img src="/acessibilidade/img/icone-comando-voz.png" alt="Comando de voz" />
        </button>
      </div>

      {/* Painel de ferramentas (renderizado via React quando aberto) */}
      {panelOpen && (
        <div
          id="access-panel-wrapper"
          role="dialog"
          aria-label="Ferramentas de acessibilidade"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPanelOpen(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setPanelOpen(false)
          }}
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            paddingTop: 100,
            paddingRight: 20,
          }}
        >
          <div
            id="access-panel"
            style={{
              position: 'relative',
              width: 324,
              height: 620,
              background: 'white',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.25)',
              borderTopLeftRadius: 30,
              borderBottomLeftRadius: 30,
              overflow: 'hidden',
              fontFamily: 'Inter, Arial, sans-serif',
              color: 'black',
              transform: 'translateX(0)',
              transition: 'transform 160ms ease-out',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
              }}
            >
              <div
                style={{
                  left: 88,
                  top: 27,
                  position: 'absolute',
                  fontSize: 24,
                  fontWeight: 600,
                }}
              >
                Ferramentas de <br /> Acessibilidade
              </div>

              <div
                style={{
                  position: 'absolute',
                  left: 36,
                  top: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                  width: 252,
                }}
              >
                <button
                  data-action="increase"
                  onClick={increaseText}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      increaseText()
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: 8,
                    border: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 20,
                    textAlign: 'left',
                    width: '100%',
                    borderRadius: 8,
                  }}
                >
                  <img
                    className="access-icon"
                    src="/acessibilidade/img/icone-aumentar-texto.png"
                    alt="aumentar texto"
                    style={{ width: 30, height: 30, display: 'block', borderRadius: 6 }}
                  />
                  <span>Aumentar texto</span>
                </button>
                <button
                  data-action="decrease"
                  onClick={decreaseText}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      decreaseText()
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: 8,
                    border: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 20,
                    textAlign: 'left',
                    width: '100%',
                    borderRadius: 8,
                  }}
                >
                  <img
                    className="access-icon"
                    src="/acessibilidade/img/icone-diminuir-texto.png"
                    alt="diminuir texto"
                    style={{ width: 30, height: 30, display: 'block', borderRadius: 6 }}
                  />
                  <span>Diminuir texto</span>
                </button>
                <button
                  onClick={toggleGrayscale}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleGrayscale()
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: 8,
                    border: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 20,
                    textAlign: 'left',
                    width: '100%',
                    borderRadius: 8,
                  }}
                >
                  <img
                    className="access-icon"
                    src="/acessibilidade/img/icone-escala-cinza.png"
                    alt="escala de cinza"
                    style={{ width: 30, height: 30, display: 'block', borderRadius: 6 }}
                  />
                  <span>Escala de cinza</span>
                </button>
                <button
                  onClick={toggleHighContrast}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleHighContrast()
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: 8,
                    border: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 20,
                    textAlign: 'left',
                    width: '100%',
                    borderRadius: 8,
                  }}
                >
                  <img
                    className="access-icon"
                    src="/acessibilidade/img/icone-contraste-negativo.png"
                    alt="alto contraste"
                    style={{ width: 30, height: 30, display: 'block', borderRadius: 6 }}
                  />
                  <span>Alto contraste</span>
                </button>
                <button
                  onClick={toggleInvert}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleInvert()
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: 8,
                    border: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 20,
                    textAlign: 'left',
                    width: '100%',
                    borderRadius: 8,
                  }}
                >
                  <img
                    className="access-icon"
                    src="/acessibilidade/img/icone-contraste-negativo.png"
                    alt="contraste negativo"
                    style={{ width: 30, height: 30, display: 'block', borderRadius: 6 }}
                  />
                  <span>Contraste negativo</span>
                </button>
                <button
                  onClick={toggleFundoClaro}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleFundoClaro()
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: 8,
                    border: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 20,
                    textAlign: 'left',
                    width: '100%',
                    borderRadius: 8,
                  }}
                >
                  <img
                    className="access-icon"
                    src="/acessibilidade/img/icone-fundo-claro.png"
                    alt="fundo claro"
                    style={{ width: 30, height: 30, display: 'block', borderRadius: 6 }}
                  />
                  <span>Fundo claro</span>
                </button>
                <button
                  onClick={resetAccess}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      resetAccess()
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: 8,
                    border: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: 20,
                    textAlign: 'left',
                    width: '100%',
                    borderRadius: 8,
                  }}
                >
                  <img
                    className="access-icon"
                    src="/acessibilidade/img/icone-redefinir.png"
                    alt="redefinir"
                    style={{ width: 30, height: 30, display: 'block', borderRadius: 6 }}
                  />
                  <span>Redefinir</span>
                </button>
              </div>

              <button
                onClick={() => setPanelOpen(false)}
                aria-label="Fechar painel"
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 12,
                  border: 0,
                  background: 'transparent',
                  cursor: 'pointer',
                  fontSize: 22,
                  lineHeight: 1,
                  padding: 4,
                  borderRadius: 6,
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
