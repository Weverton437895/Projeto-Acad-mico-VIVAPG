import React from 'react'

export default function Sobre() {
  const consideracoes = [
    { icone: '💰', titulo: 'Orçamento', desc: 'Faixa de renda mensal e compatibilidade real com a média de aluguel local.' },
    { icone: '💼', titulo: 'Ocupação', desc: 'Seu perfil no dia a dia: estudante, CLT, autônomo, aposentado, família ou home office.' },
    { icone: '🎯', titulo: 'Prioridades', desc: 'O que você mais valoriza: segurança, educação, saúde, transporte, lazer ou tranquilidade.' },
    { icone: '🏖️', titulo: 'Estilo do Bairro', desc: 'A vibe ideal para morar: perfil praiano, urbano, puramente residencial ou pacato.' }
  ]

  return (
    <div className="page-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      <main className="page-container" style={{ flex: '1 0 auto' }}>
        
        {/* Seção Hero - Título Principal */}
        <section className="sobre-hero">
          <h1>Conheça o VivaPG</h1>
          <p className="subtitulo">O seu guia inteligente para encontrar o lar perfeito em Praia Grande — SP</p>
        </section>

        {/* Bloco de Conteúdo: O que é e Por que existe */}
        <div className="sobre-grid-info">
          <article className="sobre-card-texto">
            <h2>✨ O que é o VivaPG?</h2>
            <p>
              O VivaPG é um sistema web de recomendação de bairros desenvolvido para ajudar pessoas 
              que desejam se mudar para Praia Grande — SP. O sistema analisa o perfil detalhado do 
              usuário e indica de forma instantânea os bairros mais compatíveis com seu estilo de vida, 
              faixa de renda e prioridades pessoais.
            </p>
          </article>

          <article className="sobre-card-texto">
            <h2>🚀 Por que o VivaPG existe?</h2>
            <p>
              Praia Grande recebe milhares de novos moradores a cada ano, vindos principalmente da 
              Grande São Paulo. A maioria dessas pessoas não conhece a geografia da cidade e enfrenta 
              dificuldades em escolher o local certo — precisando consultar múltiplos portais, grupos de 
              redes sociais e imobiliárias sem encontrar uma resposta objetiva.
            </p>
            <p>
              O VivaPG nasceu para centralizar as principais características de cada bairro e entregar 
              uma recomendação altamente personalizada, clara e intuitiva.
            </p>
          </article>
        </div>

        {/* Seção Central: O que o algoritmo analisa */}
        <section className="sobre-analise-section">
          <div className="sobre-header-interna">
            <h2>📊 O que o sistema considera na recomendação?</h2>
            <p>Cruzamos seus dados com nossa matriz estatística para ranquear a melhor opção:</p>
          </div>

          <div className="sobre-grid-cards">
            {consideracoes.map((item, index) => (
              <div key={index} className="sobre-card-item">
                <span className="sobre-card-icone">{item.icone}</span>
                <h3>{item.titulo}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer Geral 100% Esticado */}
      <footer className="viva-footer">
        <p>
          Os índices apresentados são de caráter estritamente demonstrativo para validação do algoritmo de recomendação do MVP, baseados na média proporcional do Plano Diretor Municipal. Não devem ser utilizados como estatística oficial de segurança pública.
        </p>
        <p>© 2026 VivaPG - Projeto Acadêmico Fatec Praia Grande</p>
      </footer>

    </div>
  )
}