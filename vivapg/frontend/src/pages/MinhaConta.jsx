import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { favoritoService, comparacaoService, historicoService, usuarioService } from '../services/api'
import { useAuth } from '../context/AuthContext'

const ABAS = ['👤 Perfil', '♡ Favoritos', '📊 Comparações', '🕐 Histórico']

export default function MinhaConta() {
  const { usuario, logout, estaLogado } = useAuth()
  const navigate = useNavigate()
  const [aba,         setAba]        = useState(0)
  const [favoritos,   setFavoritos]  = useState([])
  const [comparacoes, setComparacoes]= useState([])
  const [historico,   setHistorico]  = useState([])
  const [novaSenha,   setNovaSenha]  = useState('')
  const [msgSenha,    setMsgSenha]   = useState('')

  useEffect(() => {
    if (!estaLogado) { navigate('/login'); return }
    favoritoService.listar().then(r  => setFavoritos(r.data))
    comparacaoService.listar().then(r => setComparacoes(r.data))
    historicoService.listar().then(r => setHistorico(r.data))
  }, [])

  async function handleRemoverFav(bairroId) {
    await favoritoService.remover(bairroId)
    setFavoritos(prev => prev.filter(f => f.bairro.id !== bairroId))
  }

  async function handleExcluirComp(id) {
    await comparacaoService.excluir(id)
    setComparacoes(prev => prev.filter(c => c.comparacao.id !== id))
  }

  async function handleAlterarSenha() {
    if (novaSenha.length < 8) { setMsgSenha('Mínimo 8 caracteres.'); return }
    try {
      await usuarioService.alterarSenha(novaSenha)
      setMsgSenha('✓ Senha alterada com sucesso!')
      setNovaSenha('')
    } catch { setMsgSenha('Erro ao alterar senha.') }
  }

  async function handleExcluirConta() {
    if (!window.confirm('Tem certeza que deseja excluir sua conta?')) return
    await usuarioService.excluirConta()
    logout()
    navigate('/')
  }

  const iniciais = usuario?.nome
    ? usuario.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : ''

  return (
    <main>
      <div className="page-header">
        <h1>Minha Conta</h1>
        <p>Gerencie seus favoritos, comparações salvas e histórico de pesquisas</p>
      </div>

      <div className="abas-nav" role="tablist">
        {ABAS.map((a, i) => (
          <button
            key={a} role="tab"
            className={`aba-btn ${aba === i ? 'active' : ''}`}
            aria-selected={aba === i}
            onClick={() => setAba(i)}
          >
            {a}{i === 1 ? ` (${favoritos.length})` : i === 2 ? ` (${comparacoes.length})` : i === 3 ? ` (${historico.length})` : ''}
          </button>
        ))}
      </div>

      <div className="conta-body">

        {/* ── PERFIL ── */}
        {aba === 0 && (
          <div className="tab-content">
            <div className="perfil-card">
              <div className="perfil-avatar">{iniciais}</div>
              <div className="perfil-info">
                <h2>{usuario?.nome}</h2>
                <p>{usuario?.email}</p>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card"><div className="stat-num">{favoritos.length}</div><div className="stat-label">Favoritos</div></div>
              <div className="stat-card"><div className="stat-num">{comparacoes.length}</div><div className="stat-label">Comparações</div></div>
              <div className="stat-card"><div className="stat-num">{historico.length}</div><div className="stat-label">Pesquisas</div></div>
            </div>

            <div className="config-section">
              <h3>Alterar senha</h3>
              <div className="senha-row">
                <input
                  type="password" placeholder="Nova senha (mín. 8 caracteres)"
                  value={novaSenha} onChange={e => setNovaSenha(e.target.value)}
                />
                <button className="btn-salvar" onClick={handleAlterarSenha}>Salvar</button>
              </div>
              {msgSenha && <p className="msg-senha">{msgSenha}</p>}
            </div>

            <div className="config-section danger">
              <button className="btn-excluir-conta" onClick={handleExcluirConta}>
                Excluir minha conta
              </button>
              <button className="btn-sair" onClick={() => { logout(); navigate('/') }}>
                Sair da conta
              </button>
            </div>
          </div>
        )}

        {/* ── FAVORITOS ── */}
        {aba === 1 && (
          <div className="tab-content">
            <h2>Seus bairros favoritos</h2>
            {favoritos.length === 0 && <p className="vazio">Você ainda não tem favoritos salvos.</p>}
            <div className="fav-grid">
              {favoritos.map(({ favorito, bairro }) => (
                <div key={favorito.id} className="fav-card">
                  <div className="fav-header">
                    <span className="fav-nome">{bairro.nome}</span>
                  </div>
                  <div className="indices-grid mini">
                    <div className="indice-item"><span>Segurança</span><strong>{bairro.indSeguranca}</strong></div>
                    <div className="indice-item"><span>Saúde</span><strong>{bairro.indSaude}</strong></div>
                    <div className="indice-item"><span>Educação</span><strong>{bairro.indEducacao}</strong></div>
                    <div className="indice-item"><span>Lazer</span><strong>{bairro.indLazer}</strong></div>
                  </div>
                  <div className="fav-actions">
                    <button className="btn-comp" onClick={() => navigate('/comparar', { state: { bairro } })}>
                      + Comparar
                    </button>
                    <button className="btn-remover" onClick={() => handleRemoverFav(bairro.id)}>
                      ✕ Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── COMPARAÇÕES ── */}
        {aba === 2 && (
          <div className="tab-content">
            <h2>Suas comparações salvas</h2>
            {comparacoes.length === 0 && <p className="vazio">Nenhuma comparação salva ainda.</p>}
            <div className="comp-list">
              {comparacoes.map(({ comparacao, bairros }) => (
                <div key={comparacao.id} className="comp-saved-card">
                  <div className="comp-saved-header">
                    <span className="comp-saved-title">
                      {bairros.map(b => b.nome).join(' vs ')}
                    </span>
                    <span className="comp-saved-date">
                      {new Date(comparacao.salvoEm).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="comp-mini-grid">
                    {bairros.map((b, i) => (
                      <div key={b.id} className={`comp-mini-card ${i === 0 ? 'destaque' : ''}`}>
                        <div className="comp-mini-nome">{b.nome}</div>
                        <div className="comp-mini-score">{b.indSeguranca}</div>
                      </div>
                    ))}
                  </div>
                  <div className="comp-saved-actions">
                    <button className="btn-reabrir" onClick={() => navigate('/comparar', { state: { bairro: bairros[0] } })}>
                      ↗ Reabrir
                    </button>
                    <button className="btn-excluir" onClick={() => handleExcluirComp(comparacao.id)}>
                      ✕ Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HISTÓRICO ── */}
        {aba === 3 && (
          <div className="tab-content">
            <h2>Histórico de pesquisas</h2>
            {historico.length === 0 && <p className="vazio">Nenhuma pesquisa realizada ainda.</p>}
            <div className="historico-grid">
              {historico.map(h => (
                <div key={h.id} className="historico-card">
                  <div className="historico-data">
                    {new Date(h.realizadoEm).toLocaleDateString('pt-BR')} às {new Date(h.realizadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="historico-tags">
                    {h.filtros?.tipoBairro && <span className="historico-tag">{h.filtros.tipoBairro}</span>}
                    {h.filtros?.faixaRenda && <span className="historico-tag">{h.filtros.faixaRenda}</span>}
                    {h.filtros?.prioridades?.map(p => (
                      <span key={p} className="historico-tag prio">{p}</span>
                    ))}
                  </div>
                  <button className="btn-refazer" onClick={() => navigate('/resultados', { state: { perfil: h.filtros } })}>
                    ↺ Refazer esta busca
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}
