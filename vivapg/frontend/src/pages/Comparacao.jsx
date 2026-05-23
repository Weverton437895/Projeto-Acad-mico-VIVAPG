import React, { useEffect, useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { bairroService, comparacaoService, analiseService } from '../services/api'
import { useAuth } from '../context/AuthContext'

const STORAGE_KEY = 'vivapg_busca'
const RENDA_MEDIA = { ate2000:1500,'2000a4000':3000,'4000a7000':5500,acima7000:10000 }

function carregarPerfil() {
  try {
    const s = sessionStorage.getItem(STORAGE_KEY)
    if (s) return JSON.parse(s)
  } catch(e) {}
  return null
}

const INDICES = [
  { key:'indSeguranca',     label:'Segurança' },
  { key:'indEducacao',      label:'Educação' },
  { key:'indSaude',         label:'Saúde' },
  { key:'indTransporte',    label:'Transporte' },
  { key:'indLazer',         label:'Lazer' },
  { key:'indTranquilidade', label:'Tranquilidade' },
]

const NIVEL_FIN = {
  confortavel:{ cor:'#166534', bg:'#dcfce7', borda:'#86efac', label:'✓ Dentro do orçamento' },
  aceitavel:  { cor:'#854d0e', bg:'#fef9c3', borda:'#fde68a', label:'~ Aceitável' },
  apertado:   { cor:'#92400e', bg:'#ffedd5', borda:'#fdba74', label:'⚡ Limite do orçamento' },
  fora:       { cor:'#991b1b', bg:'#fee2e2', borda:'#fca5a5', label:'✕ Fora do orçamento' },
}

export default function Comparacao() {
  const { state }      = useLocation()
  const { estaLogado } = useAuth()
  const navigate       = useNavigate()

  const [todosOsBairros, setTodosOsBairros] = useState([])
  const [bairro1Id,  setBairro1Id] = useState(state?.bairro?.id || '')
  const [bairro2Id,  setBairro2Id] = useState('')
  const [analise,    setAnalise]   = useState(null)
  const [loading,    setLoading]   = useState(false)
  const [salvo,      setSalvo]     = useState(false)
  const [perfil,     setPerfil]    = useState(null)

  useEffect(() => {
    bairroService.listarTodos().then(r => setTodosOsBairros(r.data))
    const dados = carregarPerfil()
    if (dados?.form) {
      const f = dados.form
      setPerfil({
        tipoBairro:  f.tipoBairro  || '',
        faixaRenda:  f.faixaRenda  || '',
        ocupacao:    f.ocupacao    || '',
        numQuartos:  1,
        rendaMensal: RENDA_MEDIA[f.faixaRenda] || 0,
        prioridades: (dados.prios || []).map(p =>
          p.toLowerCase().normalize('NFD')
           .replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_')
        ),
      })
    }
  }, [])

  // Dispara análise sempre que os dois bairros estiverem selecionados
  useEffect(() => {
    if (bairro1Id && bairro2Id && bairro1Id !== bairro2Id) {
      analisar()
    } else {
      setAnalise(null)
    }
  }, [bairro1Id, bairro2Id, perfil])

  async function analisar() {
    setLoading(true)
    setSalvo(false)
    try {
      const res = await analiseService.analisar(bairro1Id, bairro2Id, perfil || {})
      setAnalise(res.data)
    } catch(e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleSalvar() {
    try {
      await comparacaoService.salvar({ bairrosIds: [bairro1Id, bairro2Id] })
      setSalvo(true)
    } catch(e) {
      alert('Erro ao salvar comparação')
    }
  }

  const r1 = analise?.resultado1
  const r2 = analise?.resultado2
  const b1 = r1?.bairro
  const b2 = r2?.bairro

  function renderCard(resultado, isVencedor) {
    if (!resultado) return null
    const b   = resultado.bairro
    const nf  = NIVEL_FIN[resultado.nivelFinanceiro]

    return (
      <div className={`comp-full-card ${isVencedor ? 'comp-card-vencedor' : ''}`}>

        {/* Header */}
        <div className="comp-card-header">
          <div>
            <div className="comp-card-nome">{b.nome}</div>
            <div className="comp-card-regiao">📍 {b.regiao}</div>
          </div>
          <div style={{textAlign:'right'}}>
            {isVencedor && <div className="comp-badge-venc">⭐ Melhor para você</div>}
            <div className="comp-score">{resultado.pontuacao} pts</div>
            <div className="comp-label">{resultado.label}</div>
          </div>
        </div>

        {/* Compatibilidade financeira */}
        {nf && (
          <div style={{
            background:nf.bg, border:`1px solid ${nf.borda}`,
            color:nf.cor, borderRadius:'7px', padding:'5px 10px',
            fontSize:'12px', fontWeight:'600', marginBottom:'10px',
            display:'flex', justifyContent:'space-between'
          }}>
            <span>{nf.label}</span>
            <span>R$ {resultado.aluguelIndicado?.toFixed(0)}/mês</span>
          </div>
        )}

        {/* Índices com destaque visual */}
        <div className="comp-indices-titulo">Índices</div>
        {INDICES.map(({ key, label }) => {
          if (!b1 || !b2) return null
          const val1 = b1[key], val2 = b2[key]
          const minhVal = resultado === r1 ? val1 : val2
          const outraVal = resultado === r1 ? val2 : val1
          const isMelhor = minhVal > outraVal
          const isPior   = minhVal < outraVal
          return (
            <div key={key} className={`comp-indice-row ${isMelhor?'melhor':isPior?'pior':''}`}>
              <span className="comp-ind-label">{label}</span>
              <span className="comp-ind-valor">
                {isMelhor && '▲ '}{isPior && '▼ '}{minhVal}
              </span>
            </div>
          )
        })}

        {/* Aluguel */}
        <div className="comp-indices-titulo" style={{marginTop:'12px'}}>Aluguel Médio</div>
        {[
          { l:'1 Quarto',    k:'aluguel1Quarto' },
          { l:'2 Quartos',   k:'aluguel2Quartos' },
          { l:'3 Quartos',   k:'aluguel3Quartos' },
          { l:'Custo de vida', k:'custoVidaMedia' },
        ].map(({ l, k }) => {
          const meuVal   = b[k]
          const outroVal = resultado === r1 ? b2?.[k] : b1?.[k]
          const isMelhor = meuVal < outroVal // menor aluguel é melhor
          return (
            <div key={k} className={`comp-indice-row ${isMelhor?'melhor':''}`}>
              <span className="comp-ind-label">{l}</span>
              <span className="comp-ind-valor">R$ {meuVal?.toFixed(0)}</span>
            </div>
          )
        })}

        {/* Tags */}
        <div style={{marginTop:'10px', display:'flex', gap:'6px', flexWrap:'wrap'}}>
          {b.temPraia && <span className="tag-bairro praia">Praiano</span>}
          {b.classificacao === 'tranquilo' && <span className="tag-bairro tranq">Tranquilo</span>}
          {b.classificacao === 'urbano'    && <span className="tag-bairro urb">Urbano</span>}
        </div>

        {/* Prioridades que influenciaram */}
        {resultado.prioridadesUsadas?.length > 0 && (
          <div className="prios-aplicadas" style={{marginTop:'10px'}}>
            {resultado.prioridadesUsadas.map(p => (
              <span key={p} className={`prio-chip ${p.includes('★')?'prio-chip-auto':''}`}>{p}</span>
            ))}
          </div>
        )}
      </div>
    )
  }

  const vencedorId = analise?.vencedorId
  const isEmpate   = vencedorId === 'empate'

  return (
    <main className="page-container">
      <div className="page-header">
        <h1>Comparar Bairros</h1>
        <p>Comparação imparcial baseada no seu perfil</p>
      </div>

      {!estaLogado && (
        <div className="aviso-login">
          🔒 Entre na sua conta para salvar esta comparação.
          <Link to="/login" className="btn-aviso">Entrar</Link>
        </div>
      )}

      {perfil && (
        <div className="comp-perfil-info">
          🔍 Comparando com base no seu perfil:
          {perfil.ocupacao && <strong> {perfil.ocupacao.replace('_',' ')}</strong>}
          {perfil.faixaRenda && <span> · Renda: {perfil.faixaRenda}</span>}
          {perfil.prioridades?.length > 0 && <span> · Prioridades: {perfil.prioridades.join(', ')}</span>}
        </div>
      )}

      {/* Seletores */}
      <div className="comparacao-selects" style={{marginBottom:'20px'}}>
        <div className="form-field">
          <label>Bairro 1</label>
          <select value={bairro1Id} onChange={e => setBairro1Id(e.target.value)}>
            <option value="">Selecione</option>
            {todosOsBairros.map(b => (
              <option key={b.id} value={b.id}>{b.nome}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>Bairro 2</label>
          <select value={bairro2Id} onChange={e => setBairro2Id(e.target.value)}>
            <option value="">Selecione</option>
            {todosOsBairros.filter(b => b.id !== bairro1Id).map(b => (
              <option key={b.id} value={b.id}>{b.nome}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="loading">⚖️ Analisando bairros...</div>}

      {!loading && analise && (
        <>
          {/* Banner do vencedor */}
          <div className={`comp-vencedor-banner ${isEmpate ? 'empate' : ''}`}>
            {isEmpate
              ? '🤝 Empate técnico — ambos são ótimas opções para você'
              : `⭐ ${vencedorId === b1?.id ? b1?.nome : b2?.nome} é o melhor para o seu perfil`}
            {analise.diferencaPontos > 0 && !isEmpate && (
              <span className="comp-motivo"> ({analise.diferencaPontos} pts de diferença)</span>
            )}
          </div>

          {/* Motivo */}
          <div className="comp-resumo" style={{marginBottom:'16px'}}>
            <strong>Por quê?</strong> {analise.motivo}
          </div>

          {/* Cards lado a lado */}
          <div className="comp-full-grid">
            {renderCard(r1, !isEmpate && vencedorId === b1?.id)}
            {renderCard(r2, !isEmpate && vencedorId === b2?.id)}
          </div>

          {/* Salvar */}
          {estaLogado && (
            <button className="btnsalv" onClick={handleSalvar} disabled={salvo}>
              {salvo ? '✓ Comparação salva!' : '💾 Salvar esta comparação'}
            </button>
          )}
        </>
      )}
    </main>
  )
}