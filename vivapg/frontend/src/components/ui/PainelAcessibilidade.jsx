import React, { useState, useEffect } from 'react'

const IDS_DALTONISMO = [
  'daltonico-protanopia',
  'daltonico-deuteranopia',
  'daltonico-tritanopia',
  'daltonico-greyscale',
]

const OPCOES = [
  { id: 'fonte-grande',           label: '🔤 Fonte grande',           grupo: 'VISÃO' },
  { id: 'alto-contraste',         label: '🌗 Alto contraste',         grupo: 'VISÃO' },
  { id: 'daltonico-protanopia',   label: '🎨 Protanopia',             grupo: 'VISÃO', desc: 'vermelho/verde' },
  { id: 'daltonico-deuteranopia', label: '🎨 Deuteranopia',           grupo: 'VISÃO', desc: 'vermelho/verde' },
  { id: 'daltonico-tritanopia',   label: '🎨 Tritanopia',             grupo: 'VISÃO', desc: 'azul/amarelo'   },
  { id: 'daltonico-greyscale',    label: '🎨 Greyscale',              grupo: 'VISÃO', desc: 'acromatopsia'   },
  { id: 'espacamento',            label: '↕ Espaçamento de texto',    grupo: 'TEXTO' },
  { id: 'sublinhar',              label: '🔗 Sublinhar links',        grupo: 'TEXTO' },
  { id: 'cursor-grande',          label: '🖱️ Cursor maior',           grupo: 'NAVEGAÇÃO' },
  // { id: 'sem-animacoes',          label: '⚡ Reduzir animações',      grupo: 'NAVEGAÇÃO' },
]

export default function PainelAcessibilidade() {
  const [aberto, setAberto] = useState(false)
  const [ativos, setAtivos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('acc') || '{}') } catch { return {} }
  })

  useEffect(() => {
    Object.entries(ativos).forEach(([id, ativo]) => {
      document.body.classList.toggle(id, ativo)
    })
  }, [])

  function toggle(id) {
    const novoValor = !ativos[id]
    let novo = { ...ativos }

    // Se for daltonismo, desativa os outros antes
    if (IDS_DALTONISMO.includes(id)) {
      IDS_DALTONISMO.forEach(d => {
        document.body.classList.remove(d)
        novo[d] = false
      })
    }

    novo[id] = novoValor
    document.body.classList.toggle(id, novoValor)
    setAtivos(novo)
    localStorage.setItem('acc', JSON.stringify(novo))
  }

  function resetar() {
    OPCOES.forEach(o => document.body.classList.remove(o.id))
    setAtivos({})
    localStorage.removeItem('acc')
  }

  const grupos = [...new Set(OPCOES.map(o => o.grupo))]

  return (
    <>
      <button
        className="acc-btn"
        onClick={() => setAberto(!aberto)}
        aria-label="Abrir painel de acessibilidade"
        title="Acessibilidade"
      >
        ♿
      </button>

      {aberto && (
        <div className="acc-panel" role="dialog" aria-label="Opções de acessibilidade">
          <h3 className="acc-titulo">♿ Acessibilidade</h3>
          <p className="acc-sub">Personalize sua experiência</p>

          {grupos.map(grupo => (
            <div key={grupo}>
              <div className="acc-grupo">{grupo}</div>
              {OPCOES.filter(o => o.grupo === grupo).map(opcao => (
                <div key={opcao.id} className="acc-opcao">
                  <span>
                    {opcao.label}
                    {opcao.desc && (
                      <small style={{ display: 'block', fontSize: '11px', color: '#6b7280', marginTop: '1px' }}>
                        {opcao.desc}
                      </small>
                    )}
                  </span>
                  <button
                    className={`acc-toggle ${ativos[opcao.id] ? 'on' : ''}`}
                    onClick={() => toggle(opcao.id)}
                    aria-pressed={!!ativos[opcao.id]}
                    aria-label={opcao.label}
                  />
                </div>
              ))}
            </div>
          ))}

          <button className="acc-reset" onClick={resetar}>↺ Redefinir tudo</button>
        </div>
      )}
    </>
  )
}