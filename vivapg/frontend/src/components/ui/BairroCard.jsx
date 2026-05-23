import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { favoritoService } from '../../services/api'
import MapaModal from './MapaModal'

const NIVEL_FIN = {
  confortavel: { cor:'#166534', bg:'#dcfce7', borda:'#86efac', label:'✓ Dentro do orçamento' },
  aceitavel:   { cor:'#854d0e', bg:'#fef9c3', borda:'#fde68a', label:'~ Aceitável para o orçamento' },
  apertado:    { cor:'#92400e', bg:'#ffedd5', borda:'#fdba74', label:'⚡ Limite do orçamento' },
}

const LABEL_CONFIG = {
  ideal:    { bg:'#0b2545', cor:'#ffffff' },
  otimo:    { bg:'#166534', cor:'#ffffff' },
  bom:      { bg:'#1e40af', cor:'#ffffff' },
  razoavel: { bg:'#6b7280', cor:'#ffffff' },
}

export default function BairroCard({
  bairro, pontuacao, posicao, label, labelCor,
  prioridadesUsadas, nivelFinanceiro, aluguelIndicado,
  onComparar, onFavoritado
}) {
  const { estaLogado } = useAuth()
  const navigate = useNavigate()
  const [mostrarMapa, setMostrarMapa] = useState(false)

  const pillClass = posicao === 1 ? 'pill-ouro' : posicao === 2 ? 'pill-prata' : 'pill-bronze'
  const nivelFin  = nivelFinanceiro && NIVEL_FIN[nivelFinanceiro]
  const lblConfig = labelCor && LABEL_CONFIG[labelCor]

  async function handleFavoritar() {
    if (!estaLogado) { navigate('/login'); return }
    try {
      await favoritoService.salvar(bairro.id)
      onFavoritado?.()
      alert('✓ ' + bairro.nome + ' salvo nos favoritos!')
    } catch (e) {
      alert(e.response?.data?.erro || 'Erro ao salvar favorito')
    }
  }

  return (
    <>
      <article className={`bairro-card ${labelCor === 'ideal' ? 'card-ideal' : ''}`}>

        {/* Label de recomendação */}
        {label && lblConfig && (
          <div style={{
            background: lblConfig.bg, color: lblConfig.cor,
            borderRadius: '7px', padding: '5px 12px',
            fontSize: '12px', fontWeight: '700',
            marginBottom: '10px', display: 'inline-block'
          }}>{label}</div>
        )}

        {/* Cabeçalho */}
        <div className="bairro-card-header">
          <div className="bairro-card-title">
            <span className={`posicao-pill ${pillClass}`}>{posicao}</span>
            <span className="bairro-nome">{bairro.nome}</span>
          </div>
          <span className="pontuacao-badge">{pontuacao} pts</span>
        </div>

        {/* Região e tipo */}
        <div className="bairro-meta">
          <span className="bairro-regiao">📍 {bairro.regiao}</span>
          {bairro.temPraia && <span className="tag-bairro praia">🏖️ Praiano</span>}
          {bairro.classificacao === 'tranquilo' && <span className="tag-bairro tranq">🌳 Tranquilo</span>}
          {bairro.classificacao === 'urbano'    && <span className="tag-bairro urb">🏙️ Urbano</span>}
        </div>

        {/* Indicador financeiro */}
        {nivelFin && (
          <div style={{
            background: nivelFin.bg, border: `1px solid ${nivelFin.borda}`,
            color: nivelFin.cor, borderRadius: '7px',
            padding: '5px 10px', fontSize: '12px', fontWeight: '600',
            marginBottom: '10px', display:'flex', justifyContent:'space-between'
          }}>
            <span>{nivelFin.label}</span>
            {aluguelIndicado > 0 && <span>R$ {aluguelIndicado?.toFixed(0)}/mês</span>}
          </div>
        )}

        {/* Índices */}
        <div className="card-section-title">Índices do Bairro</div>
        <div className="indices-grid">
          <div className="indice-item"><span>Segurança</span><strong>{bairro.indSeguranca}</strong></div>
          <div className="indice-item"><span>Educação</span><strong>{bairro.indEducacao}</strong></div>
          <div className="indice-item"><span>Saúde</span><strong>{bairro.indSaude}</strong></div>
          <div className="indice-item"><span>Transporte</span><strong>{bairro.indTransporte}</strong></div>
          <div className="indice-item"><span>Lazer</span><strong>{bairro.indLazer}</strong></div>
          <div className="indice-item"><span>Tranquilidade</span><strong>{bairro.indTranquilidade}</strong></div>
        </div>

        {/* Aluguel */}
        <div className="card-section-title" style={{marginTop:'10px'}}>Aluguel Médio</div>
        <div className="indices-grid">
          <div className="indice-item"><span>1 Quarto</span><strong>R$ {bairro.aluguel1Quarto?.toFixed(0)}</strong></div>
          <div className="indice-item"><span>2 Quartos</span><strong>R$ {bairro.aluguel2Quartos?.toFixed(0)}</strong></div>
          <div className="indice-item"><span>3 Quartos</span><strong>R$ {bairro.aluguel3Quartos?.toFixed(0)}</strong></div>
          <div className="indice-item"><span>Custo de vida</span><strong>R$ {bairro.custoVidaMedia?.toFixed(0)}</strong></div>
        </div>

        {/* Prioridades */}
        {prioridadesUsadas?.length > 0 && (
          <div className="prios-aplicadas">
            {prioridadesUsadas.map(p => (
              <span key={p} className={`prio-chip ${p.includes('★') ? 'prio-chip-auto' : ''}`}>{p}</span>
            ))}
          </div>
        )}

        {/* Ações */}
        <button className="btn-mapa" onClick={() => setMostrarMapa(true)}>
          🗺️ Ver no Mapa
        </button>
        <button className="btn-comparar" onClick={() => onComparar?.(bairro)}>
          + Comparar este bairro
        </button>
        {estaLogado && (
          <button className="btn-favoritar" onClick={handleFavoritar}>
            ♡ Salvar nos favoritos
          </button>
        )}

      </article>

      {/* Modal do mapa */}
      {mostrarMapa && (
        <MapaModal bairro={bairro} onFechar={() => setMostrarMapa(false)} />
      )}
    </>
  )
}