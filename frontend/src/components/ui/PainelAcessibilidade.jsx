import React, { useState } from 'react'

const OPCOES = [
  { id: 'fonte-grande',    label: '🔤 Fonte grande',       grupo: 'Visão' },
  { id: 'alto-contraste',  label: '🌗 Alto contraste',     grupo: 'Visão' },
  { id: 'daltonico',       label: '🎨 Modo daltônico',     grupo: 'Visão' },
  { id: 'espacamento',     label: '↕ Espaçamento de texto', grupo: 'Texto' },
  { id: 'sublinhar',       label: '🔗 Sublinhar links',    grupo: 'Texto' },
  { id: 'cursor-grande',   label: '🖱️ Cursor maior',       grupo: 'Navegação' },
  { id: 'sem-animacoes',   label: '⚡ Reduzir animações',  grupo: 'Navegação' },
]

export default function PainelAcessibilidade() {
  const [aberto, setAberto] = useState(false)
  const [ativos, setAtivos] = useState({})

  function toggle(id) {
    const novoValor = !ativos[id]
    setAtivos(prev => ({ ...prev, [id]: novoValor }))
    document.body.classList.toggle(id, novoValor)
  }

  function resetar() {
    OPCOES.forEach(o => document.body.classList.remove(o.id))
    setAtivos({})
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
                  <span>{opcao.label}</span>
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
