import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { recomendacaoService, historicoService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import BairroCard from '../components/ui/BairroCard'

export default function Resultados() {
  const { state }      = useLocation()
  const navigate       = useNavigate()
  const { estaLogado } = useAuth()

  const [resultados, setResultados] = useState([])
  const [historico,  setHistorico]  = useState([])
  const [loading,    setLoading]    = useState(false)
  const [perfil,     setPerfil]     = useState(null)

  useEffect(() => {
    if (state?.perfil) {
      setPerfil(state.perfil)
      buscar(state.perfil)
    }
    if (estaLogado) carregarHistorico()
  }, [])

  async function buscar(p) {
    setLoading(true)
    try {
      const res = await recomendacaoService.buscar(p)// Chamada HTTP (GET ou POST) para o seu backend
      setResultados(res.data) // Aqui ele pega os dados retornados do banco pelo backend e salva no estado
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function carregarHistorico() {
    try {
      const res = await historicoService.listar()
      setHistorico(res.data.slice(0, 3))
    } catch (e) {}
  }

  const temRenda = perfil?.rendaMensal > 0

  return (
    <main className="page-container">
      <div className="page-header">
        <h1>Bairros Recomendados</h1>
        <p>Com base no seu perfil, encontramos os bairros mais compatíveis para você</p>
      </div>


      {!estaLogado && (
        <div className="aviso-login">
          🔒 Faça login para salvar favoritos, comparações e histórico.
          <Link to="/login" className="btn-aviso">Entrar</Link>
        </div>
      )}

      {estaLogado && historico.length > 0 && (
        <section className="historico-section">
          <h2>🕐 Minhas Pesquisas Anteriores</h2>
          <div className="historico-grid">
            {historico.map(h => (
              <div key={h.id} className="historico-card">
                <div className="historico-data">
                  {new Date(h.realizadoEm).toLocaleDateString('pt-BR')}
                </div>
                <div className="historico-tags">
                  {h.filtros?.prioridades?.map(p => (
                    <span key={p} className="historico-tag prio">{p}</span>
                  ))}
                </div>
                <button className="btn-refazer" onClick={() => buscar(h.filtros)}>
                  ↺ Refazer esta busca
                </button>
              </div>
            ))}
          </div>
          <hr className="divider" />
        </section>
      )}

      {loading && <div className="loading">🔍 Buscando bairros compatíveis com seu perfil...</div>}

     

      {/* Resultados */}
      {!loading && resultados.length > 0 && (
        <section>
          <h2 style={{marginBottom:'14px'}}>
            {resultados.length} {resultados.length === 1 ? 'bairro encontrado' : 'bairros encontrados'} para o seu perfil
          </h2>
          <div className="bairros-grid">
            {resultados.map((r, i) => (
              <BairroCard
                key={r.bairro.id}
                bairro={r.bairro}
                pontuacao={r.pontuacao}
                posicao={i + 1}
                label={r.label}
                labelCor={r.labelCor}
                prioridadesUsadas={r.prioridadesUsadas}
                nivelFinanceiro={r.nivelFinanceiro}
                aluguelIndicado={r.aluguelIndicado}
                onComparar={b => navigate('/comparar', { state: { bairro: b } })}
                onFavoritado={carregarHistorico}
              />
            ))}

          </div>
               <footer className="viva-footer">
              <p>
                Os índices apresentados são de caráter estritamente demonstrativo para validação do algoritmo de recomendação do MVP, baseados na média proporcional do Plano Diretor Municipal. Não devem ser utilizados como estatística oficial de segurança pública.
              </p>
              <p>© 2026 VivaPG - Projeto Acadêmico Fatec Praia Grande</p>
          </footer>
        </section>
        
      )}
    </main>
  )
}