import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const PRIORIDADES = ['Segurança', 'Educação', 'Saúde', 'Transporte', 'Lazer', 'Tranquilidade']

const RENDA_MEDIA = {
  ate2000:     1500,
  '2000a4000': 3000,
  '4000a7000': 5500,
  acima7000:   10000,
}

const LABEL_RENDA = {
  ate2000:     'até R$ 2.000',
  '2000a4000': 'R$ 2k – R$ 4k',
  '4000a7000': 'R$ 4k – R$ 7k',
  acima7000:   'acima de R$ 7k',
}

const LABEL_TIPO = {
  praiano:     'Praiano',
  urbano:      'Urbano',
  residencial: 'Residencial',
  tranquilo:   'Tranquilo',
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
  const [erro, setErro]               = useState('')
  const [semResultado, setSemResultado] = useState(false)
  const [perfilTentado, setPerfilTentado] = useState(null)

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ form, prios }))
    } catch (e) {}
  }, [form, prios])

  // Sempre que o usuário alterar qualquer filtro, esconde o bloco de sem-resultado
  useEffect(() => {
    setSemResultado(false)
  }, [form, prios])

  function togglePrio(p) {
    setPrios(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  function handleBuscar() {
    if (!form.faixaRenda) {
      setErro('Selecione sua faixa de renda para continuar.')
      setSemResultado(false)
      return
    }
    if (prios.length === 0) {
      setErro('Selecione ao menos uma prioridade.')
      setSemResultado(false)
      return
    }
    setErro('')
    setSemResultado(false)

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

    // ─── Verificação de resultados ───────────────────────────────────────────
    // Substitua `calcularResultados` pela função/lógica real do seu projeto.
    // Ela deve receber o perfil e retornar um array de bairros com match.
    // Se ainda não tiver a função disponível aqui, importe-a no topo do arquivo.
    //
    // Exemplo:
    //   import { calcularResultados } from '../utils/ranking'
    //   const resultados = calcularResultados(perfil)
    //
    // Por enquanto, navegamos sempre e deixamos a tela de resultados
    // chamar de volta com `state.semResultados = true` se necessário.
    // Para ativar a interceptação inline, descomente as linhas abaixo:
    //
    // const resultados = calcularResultados(perfil)
    // if (resultados.length === 0) {
    //   setPerfilTentado({ ...perfil, prioLabels: prios })
    //   setSemResultado(true)
    //   return
    // }
    // ────────────────────────────────────────────────────────────────────────

    navigate('/resultados', { state: { perfil } })
  }

  // Versão usada quando a tela de resultados redireciona de volta com flag
  useEffect(() => {
    // Caso a tela de resultados navegue de volta assim:
    //   navigate('/', { state: { semResultados: true, perfil } })
    // podemos capturar aqui:
    try {
      const loc = window.history.state
      if (loc?.usr?.semResultados && loc?.usr?.perfil) {
        const p = loc.usr.perfil
        setPerfilTentado({ ...p, prioLabels: p.prioridades })
        setSemResultado(true)
        // Limpa o state para não reaparecer em F5
        window.history.replaceState({}, '')
      }
    } catch (e) {}
  }, [])

  function handleAplicarSugestao(novoForm, novosPrios) {
    setForm(novoForm)
    setPrios(novosPrios)
    setSemResultado(false)
  }

  function handleVerTodos() {
    const perfilAberto = {
      tipoBairro:  '',
      faixaRenda:  perfilTentado?.faixaRenda || form.faixaRenda,
      ocupacao:    perfilTentado?.ocupacao   || form.ocupacao || '',
      numQuartos:  1,
      rendaMensal: RENDA_MEDIA[perfilTentado?.faixaRenda || form.faixaRenda] || 0,
      prioridades: [],
    }
    navigate('/resultados', { state: { perfil: perfilAberto } })
  }

  return (
    <main>
      <section
        className="hero"
        style={{
          minHeight: 'calc(100vh - 62px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 32px',
        }}
      >
        <h1>Encontre seu bairro ideal em Praia Grande!</h1>
        <p style={{ marginBottom: '28px' }}>
          Preencha seu perfil e descubra os bairros mais compatíveis com o seu estilo de vida.
        </p>

        {/* ── Caixa de busca ────────────────────────────────────────────── */}
        <div className="search-box" role="search">
          {erro && <div className="busca-erro" role="alert">{erro}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '18px' }}>

            <div className="form-field">
              <label htmlFor="tipoBairro">Tipo de Bairro</label>
              <select
                id="tipoBairro"
                value={form.tipoBairro}
                onChange={e => setForm({ ...form, tipoBairro: e.target.value })}
              >
                <option value="">Todos os tipos</option>
                <option value="praiano">Praiano — bairro com praia</option>
                <option value="urbano">Urbano — área central e comercial</option>
                <option value="residencial">Residencial — bairro familiar</option>
                <option value="tranquilo">Tranquilo — bairro calmo e afastado</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="faixaRenda">Faixa de Renda *</label>
              <select
                id="faixaRenda"
                value={form.faixaRenda}
                onChange={e => setForm({ ...form, faixaRenda: e.target.value })}
              >
                <option value="">Selecione</option>
                <option value="ate2000">Até R$ 2.000</option>
                <option value="2000a4000">R$ 2k – R$ 4k</option>
                <option value="4000a7000">R$ 4k – R$ 7k</option>
                <option value="acima7000">Acima de R$ 7k</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="ocupacao">Ocupação</label>
              <select
                id="ocupacao"
                value={form.ocupacao}
                onChange={e => setForm({ ...form, ocupacao: e.target.value })}
              >
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
                <button
                  key={p}
                  type="button"
                  className={`prio-tag ${prios.includes(p) ? 'ativa' : ''}`}
                  aria-pressed={prios.includes(p)}
                  onClick={() => togglePrio(p)}
                >
                  {prios.includes(p) && '✓ '}{p}
                </button>
              ))}
            </div>
          </fieldset>

          <button className="btn-buscar" onClick={handleBuscar}>
            🔍 Buscar Bairros Recomendados
          </button>
        </div>

        {/* ── Feedback: sem resultados ───────────────────────────────────── */}
        {semResultado && (
          <div
            className="sem-match-box"
            role="alert"
            aria-live="polite"
            aria-atomic="true"
          >
            {/* Cabeçalho explicativo */}
            <div className="sem-match-header">
              <span className="sem-match-icone" aria-hidden="true">🔍</span>
              <div>
                <h2>Nenhum bairro encontrou correspondência exata</h2>
                <p>
                  A combinação de{' '}
                  <strong>
                    {perfilTentado?.tipoBairro
                      ? LABEL_TIPO[perfilTentado.tipoBairro]
                      : 'todos os tipos'}
                  </strong>
                  , renda{' '}
                  <strong>
                    {LABEL_RENDA[perfilTentado?.faixaRenda] || '—'}
                  </strong>{' '}
                  e prioridades{' '}
                  <strong>
                    {(perfilTentado?.prioLabels || prios).join(', ')}
                  </strong>{' '}
                  não gerou resultados. Tente ajustar os filtros abaixo.
                </p>
              </div>
            </div>

            {/* Sugestões de ajuste */}
            <div className="sem-match-sugestoes">
              <p className="sem-match-sugestoes-titulo">O que você pode fazer:</p>
              <div className="sem-match-acoes">

                {/* Sugestão 1: remover tipo de bairro */}
                {form.tipoBairro && (
                  <button
                    className="sem-match-acao"
                    onClick={() =>
                      handleAplicarSugestao({ ...form, tipoBairro: '' }, prios)
                    }
                  >
                    🏘️ Remover filtro de tipo de bairro
                    <span className="sem-match-acao-detalhe">
                      Buscar em todos os tipos de bairro
                    </span>
                  </button>
                )}

                {/* Sugestão 2: reduzir prioridades */}
                {prios.length > 1 && (
                  <button
                    className="sem-match-acao"
                    onClick={() =>
                      handleAplicarSugestao(form, [prios[0]])
                    }
                  >
                    📋 Reduzir para 1 prioridade — manter só "{prios[0]}"
                    <span className="sem-match-acao-detalhe">
                      Menos filtros = mais bairros encontrados
                    </span>
                  </button>
                )}

                {/* Sugestão 3: resetar tudo */}
                <button
                  className="sem-match-acao"
                  onClick={() =>
                    handleAplicarSugestao(
                      { tipoBairro: '', faixaRenda: form.faixaRenda, ocupacao: '' },
                      ['Segurança']
                    )
                  }
                >
                  🔄 Redefinir todos os filtros
                  <span className="sem-match-acao-detalhe">
                    Mantém apenas sua faixa de renda
                  </span>
                </button>

              </div>
            </div>

            {/* Saída de emergência: ver todos */}
            <button className="sem-match-ver-todos" onClick={handleVerTodos}>
              Ver todos os bairros disponíveis →
            </button>
          </div>
        )}

      </section>
    </main>
  )
}


// import React, { useState, useEffect } from 'react'
// import { useNavigate } from 'react-router-dom'

// const PRIORIDADES = ['Segurança', 'Educação', 'Saúde', 'Transporte', 'Lazer', 'Tranquilidade']

// const RENDA_MEDIA = {
//   ate2000:     1500,
//   '2000a4000': 3000,
//   '4000a7000': 5500,
//   acima7000:   10000,
// }

// const STORAGE_KEY = 'vivapg_busca'

// // Carrega dados do sessionStorage antes de inicializar o estado
// function carregarSalvo() {
//   try {
//     const salvo = sessionStorage.getItem(STORAGE_KEY)
//     if (salvo) return JSON.parse(salvo)
//   } catch (e) {}
//   return null
// }

// export default function Home() {
//   const navigate = useNavigate()
//   const salvo    = carregarSalvo()

//   // Inicializa estado já com dados salvos (sem piscar)
//   const [form, setForm] = useState(
//     salvo?.form || { tipoBairro: '', faixaRenda: '', ocupacao: '' }
//   )
//   const [prios, setPrios] = useState(
//     salvo?.prios || ['Segurança', 'Saúde']
//   )
//   const [erro, setErro] = useState('')

//   // Salva automaticamente no sessionStorage sempre que muda
//   useEffect(() => {
//     try {
//       sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ form, prios }))
//     } catch (e) {}
//   }, [form, prios])

//   function togglePrio(p) {
//     setPrios(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
//   }

//   function handleBuscar() {
//     if (!form.faixaRenda) {
//       setErro('Selecione sua faixa de renda para continuar.')
//       return
//     }
//     if (prios.length === 0) {
//       setErro('Selecione ao menos uma prioridade.')
//       return
//     }
//     setErro('')
//     const perfil = {
//       tipoBairro:  form.tipoBairro  || '',
//       faixaRenda:  form.faixaRenda,
//       ocupacao:    form.ocupacao    || '',
//       numQuartos:  1,
//       rendaMensal: RENDA_MEDIA[form.faixaRenda] || 0,
//       prioridades: prios.map(p =>
//         p.toLowerCase()
//          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
//          .replace(/\s+/g, '_')
//       ),
//     }
//     navigate('/resultados', { state: { perfil } })
//   }

//   return (
//     <main>
//       <section className="hero" style={{
//         minHeight: 'calc(100vh - 62px)',
//         display: 'flex', flexDirection: 'column',
//         alignItems: 'center', justifyContent: 'center',
//         padding: '40px 32px'
//       }}>
//         <h1>Encontre seu bairro ideal em Praia Grande!</h1>
//         <p style={{ marginBottom: '28px' }}>
//           Preencha seu perfil e descubra os bairros mais compatíveis com o seu estilo de vida.
//         </p>

//         <div className="search-box" role="search">
//           {erro && <div className="busca-erro" role="alert">{erro}</div>}

//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '18px' }}>

//             <div className="form-field">
//               <label htmlFor="tipoBairro">Tipo de Bairro</label>
//               <select id="tipoBairro" value={form.tipoBairro}
//                 onChange={e => setForm({ ...form, tipoBairro: e.target.value })}>
//                 <option value="">Todos os tipos</option>
//                 <option value="praiano">Praiano — bairro com praia</option>
//                 <option value="urbano">Urbano — área central e comercial</option>
//                 <option value="residencial">Residencial — bairro familiar</option>
//                 <option value="tranquilo">Tranquilo — bairro calmo e afastado</option>
//               </select>
//             </div>

//             <div className="form-field">
//               <label htmlFor="faixaRenda">Faixa de Renda *</label>
//               <select id="faixaRenda" value={form.faixaRenda}
//                 onChange={e => setForm({ ...form, faixaRenda: e.target.value })}>
//                 <option value="">Selecione</option>
//                 <option value="ate2000">Até R$ 2.000</option>
//                 <option value="2000a4000">R$ 2k – R$ 4k</option>
//                 <option value="4000a7000">R$ 4k – R$ 7k</option>
//                 <option value="acima7000">Acima de R$ 7k</option>
//               </select>
//             </div>

//             <div className="form-field">
//               <label htmlFor="ocupacao">Ocupação</label>
//               <select id="ocupacao" value={form.ocupacao}
//                 onChange={e => setForm({ ...form, ocupacao: e.target.value })}>
//                 <option value="">Selecione</option>
//                 <option value="estudante">Estudante</option>
//                 <option value="clt">CLT — empregado com carteira</option>
//                 <option value="autonomo">Autônomo</option>
//                 <option value="aposentado">Aposentado</option>
//                 <option value="trabalhador_remoto">Trabalhador Remoto — home office</option>
//                 <option value="familia">Família — casal com filhos</option>
//               </select>
//             </div>

//           </div>

//           <fieldset className="prioridades-fieldset">
//             <legend>Prioridades (selecione as que se aplicam):</legend>
//             <div className="prioridades-tags">
//               {PRIORIDADES.map(p => (
//                 <button key={p} type="button"
//                   className={`prio-tag ${prios.includes(p) ? 'ativa' : ''}`}
//                   aria-pressed={prios.includes(p)}
//                   onClick={() => togglePrio(p)}>
//                   {prios.includes(p) && '✓ '}{p}
//                 </button>
//               ))}
//             </div>
//           </fieldset>

//           <button className="btn-buscar" onClick={handleBuscar}>
//             🔍 Buscar Bairros Recomendados
//           </button>
//         </div>
//       </section>
//     </main>
//   )
// }