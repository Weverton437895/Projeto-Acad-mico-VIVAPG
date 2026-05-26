import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { recomendacaoService } from '../services/api' // IMPORT NECESSÁRIO para validar na Home

const PRIORIDADES = ['Segurança', 'Educação', 'Saúde', 'Transporte', 'Lazer', 'Tranquilidade']

const RENDA_MEDIA = {
  ate2000:     1500,
  '2000a4000': 3000,
  '4000a7000': 5500,
  acima7000:   10000,
}

const STORAGE_KEY = 'vivapg_busca'

function carregarSalvo() {
  try {
    const salvo = sessionStorage.getItem(STORAGE_KEY)
    if (salvo) return JSON.parse(salvo)
  } catch (e) {}
  return null
}

export default function Home() {
  const navigate = useNavigate()
  const salvo    = carregarSalvo()

  const [form, setForm] = useState(
    salvo?.form || { tipoBairro: '', faixaRenda: '', ocupacao: '' }
  )
  const [prios, setPrios] = useState(
    salvo?.prios || ['Segurança', 'Saúde']
  )
  const [erro, setErro] = useState('')

  // ESTADOS CRIADOS para gerenciar o aviso localmente na Home sem quebrar o componente
  const [loading, setLoading] = useState(false)
  const [mostrarAvisoRenda, setMostrarAvisoRenda] = useState(false)
  const [mostrarAvisoFiltros, setMostrarAvisoFiltros] = useState(false)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ form, prios }))
    } catch (e) {}
  }, [form, prios])

  function togglePrio(p) {
    setPrios(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  async function handleBuscar() {
    if (!form.faixaRenda) {
      setErro('Selecione sua faixa de renda para continuar.')
      return
    }
    if (prios.length === 0) {
      setErro('Selecione ao menos uma prioridade.')
      return
    }
    
    setErro('')
    setMostrarAvisoRenda(false)
    setMostrarAvisoFiltros(false)
    setLoading(true)

    const perfil = {
      tipoBairro:  form.tipoBairro  || '',
      faixaRenda:  form.faixaRenda,
      ocupacao:    form.ocupacao    || '',
      numQuartos:  1,
      rendaMensal: RENDA_MEDIA[form.faixaRenda] || 0,
      prioridades: prios.map(p =>
        p.toLowerCase()
         .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
         .replace(/\s+/g, '_')
      ),
    }

    try {
      // Faz a busca na API antes de redirecionar o usuário
      const res = await recomendacaoService.buscar(perfil)
      
      if (res.data && res.data.length === 0) {
        // Se a API retornar vazio e ele informou renda, decide qual bloco de aviso exibir
        if (perfil.rendaMensal > 0) {
          setMostrarAvisoRenda(true)
        } else {
          setMostrarAvisoFiltros(true)
        }
      } else {
        // Se encontrou bairros compatíveis, navega para a página de resultados
        navigate('/resultados', { state: { perfil } })
      }
    } catch (e) {
      console.error(e)
      setErro('Erro ao consultar os bairros. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main>
      <section className="hero" style={{
        minHeight: 'calc(100vh - 62px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 32px'
      }}>
        <h1>Encontre seu bairro ideal em Praia Grande!</h1>
        <p style={{ marginBottom: '28px' }}>
          Preencha seu perfil e descubra os bairros mais compatíveis com o seu estilo de vida.
        </p>

        <div className="search-box" role="search">
          {erro && <div className="busca-erro" role="alert">{erro}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '18px' }}>

            <div className="form-field">
              <label htmlFor="tipoBairro">Tipo de Bairro</label>
              <select id="tipoBairro" value={form.tipoBairro}
                onChange={e => setForm({ ...form, tipoBairro: e.target.value })}>
                <option value="">Todos os tipos</option>
                <option value="praiano">Praiano — bairro com praia</option>
                <option value="urbano">Urbano — área central e comercial</option>
                <option value="residencial">Residencial — bairro familiar</option>
                <option value="tranquilo">Tranquilo — bairro calmo e afastado</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="faixaRenda">Faixa de Renda *</label>
              <select id="faixaRenda" value={form.faixaRenda}
                onChange={e => setForm({ ...form, faixaRenda: e.target.value })}>
                <option value="">Selecione</option>
                <option value="ate2000">Até R$ 2.000</option>
                <option value="2000a4000">R$ 2k – R$ 4k</option>
                <option value="4000a7000">R$ 4k – R$ 7k</option>
                <option value="acima7000">Acima de R$ 7k</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="ocupacao">Ocupação</label>
              <select id="ocupacao" value={form.ocupacao}
                onChange={e => setForm({ ...form, ocupacao: e.target.value })}>
                <option value="">Selecione</option>
                <option value="estudante">Estudante</option>
                <option value="clt">CLT — empregado com carteira</option>
                <option value="autonomo">Autônomo</option>
                <option value="aposentado">Aposentado</option>
                <option value="trabalhador_remoto">Trabalhador Remoto — home office</option>
                <option value="familia">Família — casal com filhos</option>
              </select>
            </div>

          </div>

          <fieldset className="prioridades-fieldset">
            <legend>Prioridades (selecione as que se aplicam):</legend>
            <div className="prioridades-tags">
              {PRIORIDADES.map(p => (
                <button key={p} type="button"
                  className={`prio-tag ${prios.includes(p) ? 'ativa' : ''}`}
                  aria-pressed={prios.includes(p)}
                  onClick={() => togglePrio(p)}>
                  {prios.includes(p) && '✓ '}{p}
                </button>
              ))}
            </div>
          </fieldset>

          <button className="btn-buscar" onClick={handleBuscar} disabled={loading}>
            {loading ? 'Buscando...' : ' Buscar Bairros Recomendados'}
          </button>
        </div>

        {/* MUDANÇA EXECUTADA: Uso dos estados locais para evitar erros na renderização */}
        {mostrarAvisoRenda && (
          <div className="sem-resultados-renda" style={{ marginTop: '20px' }}>
            <div className="sem-renda-icone"></div>
            <h3>Nenhum bairro compatível com sua renda</h3>
            <p>
              Não encontramos bairros com aluguel compatível com a faixa selecionada
              {form.tipoBairro ? ` no tipo "${form.tipoBairro}"` : ''}.
              Tente uma faixa de renda maior ou mude o tipo de bairro.
            </p>
            <button onClick={() => setMostrarAvisoRenda(false)} className="btn-voltar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit', textDecoration: 'underline' }}>
              ← Ajustar preferências
            </button>
          </div>
        )}

        {mostrarAvisoFiltros && (
          <div className="sem-resultados" style={{ marginTop: '20px' }}>
            ⚠️ Nenhum bairro encontrado com esses filtros.
            <button onClick={() => setMostrarAvisoFiltros(false)} className="btn-voltar" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit', textDecoration: 'underline', marginLeft: '10px' }}>
              ← Voltar e ajustar
            </button>
          </div>
        )}

      </section>
    </main>
  )
}