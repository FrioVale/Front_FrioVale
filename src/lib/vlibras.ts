/**
 * Integração com o widget oficial VLibras (gov.br).
 *
 * Como o widget funciona (contrato do plugin):
 *  - Ele procura no DOM a marcação `[vw] > [vw-access-button] + [vw-plugin-wrapper]`.
 *  - O clique no `[vw-access-button]` é o único acionador do painel. A API do plugin
 *    (`new VLibras.Widget(...)`) não aceita um acionador personalizado.
 *
 * Por isso NÃO criamos um segundo botão que "clica" no do widget (isso gerava dois
 * botões e dependia de o widget já existir). Em vez disso, o próprio `[vw-access-button]`
 * é o botão da interface: ele é estilizado pelo CSS (Acessibilidade.css) e recebe
 * semântica de botão + acionamento por teclado aqui.
 *
 * A marcação é criada uma única vez e fica fora do React (o plugin altera esses nós
 * por conta própria). Ao montar/desmontar o componente, o mesmo nó é apenas movido,
 * preservando os listeners e o estado do widget.
 */

const ROOT_ID = 'friovale-vlibras'
const SCRIPT_ID = 'vlibras-plugin-script'
const SCRIPT_SRC = 'https://vlibras.gov.br/app/vlibras-plugin.js'
const WIDGET_PATH = 'https://vlibras.gov.br/app'

export const VLIBRAS_LABEL = 'Abrir VLibras'

interface VLibrasWindow extends Window {
  VLibras?: { Widget: new (rootPath: string) => unknown }
  __friovaleVLibrasInit?: boolean
}

/** Sinaliza (sem trocar o nome acessível) quando o plugin do gov.br não carregou. */
function setUnavailable(unavailable: boolean) {
  const btn = rootEl?.querySelector<HTMLElement>('[vw-access-button]')
  if (!btn) return
  btn.setAttribute('title', unavailable ? 'VLibras indisponível' : VLIBRAS_LABEL)
  if (unavailable) btn.setAttribute('aria-disabled', 'true')
  else btn.removeAttribute('aria-disabled')
}

function setupAccessButton(btn: HTMLElement) {
  btn.setAttribute('role', 'button')
  btn.setAttribute('tabindex', '0')
  btn.setAttribute('aria-label', VLIBRAS_LABEL)
  btn.setAttribute('title', VLIBRAS_LABEL)
}

/** Dispara a sequência completa de mouse para qualquer listener que o plugin use. */
function activate(btn: HTMLElement) {
  const opts = { bubbles: true, cancelable: true, view: window }
  btn.dispatchEvent(new MouseEvent('mousedown', opts))
  btn.dispatchEvent(new MouseEvent('mouseup', opts))
  btn.dispatchEvent(new MouseEvent('click', opts))
}

// Referência guardada no módulo: quando o React desmonta o slot, o nó do widget sai do
// document junto com ele e getElementById deixaria de encontrá-lo.
let rootEl: HTMLElement | null = null

function getRoot(): HTMLElement {
  if (rootEl) return rootEl
  const existing = document.getElementById(ROOT_ID)
  if (existing) return (rootEl = existing)

  const root = document.createElement('div')
  root.id = ROOT_ID
  root.setAttribute('vw', '')
  root.className = 'enabled'

  const btn = document.createElement('div')
  btn.setAttribute('vw-access-button', '')
  btn.className = 'active'
  setupAccessButton(btn)

  // Enter e Espaço (div com role="button" não os converte em clique sozinha).
  btn.addEventListener('keydown', (e) => {
    if (e.target !== btn) return
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault() // evita rolar a página com Espaço
      if (!e.repeat) activate(btn)
    }
  })

  const wrapper = document.createElement('div')
  wrapper.setAttribute('vw-plugin-wrapper', '')
  const top = document.createElement('div')
  top.className = 'vw-plugin-top-wrapper'
  wrapper.appendChild(top)

  root.appendChild(btn)
  root.appendChild(wrapper)
  document.body.appendChild(root)
  rootEl = root
  return root
}

function initWidget() {
  const w = window as VLibrasWindow
  if (w.__friovaleVLibrasInit) return
  w.__friovaleVLibrasInit = true

  const build = () => {
    if (!w.VLibras?.Widget) {
      console.warn('[VLibras] script carregado, mas window.VLibras.Widget não está disponível')
      w.__friovaleVLibrasInit = false
      return
    }
    new w.VLibras.Widget(WIDGET_PATH)
    setUnavailable(false)

    // Reaplica a semântica caso o plugin tenha mexido nos atributos do botão.
    const btn = rootEl?.querySelector<HTMLElement>('[vw-access-button]')
    if (btn) setupAccessButton(btn)

    // Como o script entra depois do carregamento da página (SPA), o plugin pode
    // depender do window.onload para montar a interface. Mesmo workaround dos
    // wrappers React oficiais da comunidade ("forceOnload").
    if (document.readyState === 'complete' && typeof window.onload === 'function') {
      window.onload.call(window, new Event('load'))
    }
  }

  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null
  if (existing) {
    if (w.VLibras?.Widget) build()
    else existing.addEventListener('load', build, { once: true })
    return
  }

  const script = document.createElement('script')
  script.id = SCRIPT_ID
  script.src = SCRIPT_SRC
  script.async = true
  script.onload = build
  script.onerror = () => {
    w.__friovaleVLibrasInit = false
    script.remove()
    setUnavailable(true)
    console.warn('[VLibras] não foi possível carregar o plugin (verifique a conexão com vlibras.gov.br)')
  }
  document.head.appendChild(script)
}

/** Coloca o widget dentro do slot da coluna de atalhos e garante a inicialização. */
export function mountVLibras(slot: HTMLElement) {
  const root = getRoot()
  root.style.display = ''
  if (root.parentElement !== slot) slot.appendChild(root)
  initWidget()
}

/** Tira o widget da tela sem destruí-lo (o plugin continua ligado aos mesmos nós). */
export function parkVLibras() {
  const root = rootEl
  if (!root) return
  root.style.display = 'none'
  if (root.parentElement !== document.body) document.body.appendChild(root)
}
