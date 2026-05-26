import React from 'react'

export default function Sobre() {
  return (
    <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'Arial, sans-serif', color: '#111827' }}>
      <h1 style={{ color: '#0b2545', marginBottom: '10px' }}>Sobre o VivaPG</h1>
      <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '20px', fontStyle: 'italic' }}>Projeto Integrador — FATEC Praia Grande</p>
      <hr style={{ border: '0', borderTop: '1px solid #d1d5db', marginBottom: '20px' }} />
      
      <section style={{ marginBottom: '25px' }}>
        <h2 style={{ color: '#1a3a6b', fontSize: '20px', marginBottom: '10px' }}>O Motivo de Existirmos</h2>
        <p style={{ lineHeight: '1.6', color: '#374151' }}>
          O crescimento habitacional e imobiliário de Praia Grande traz desafios para quem quer morar ou investir na cidade. 
          O <strong>VivaPG</strong> nasceu com o propósito de facilitar a tomada de decisão através de tecnologia e dados consolidados.
        </p>
      </section>

      <section style={{ marginBottom: '25px' }}>
        <h2 style={{ color: '#1a3a6b', fontSize: '20px', marginBottom: '10px' }}>Nossa Missão</h2>
        <p style={{ lineHeight: '1.6', color: '#374151' }}>
          Ajudar famílias, estudantes e profissionais a encontrarem a localização perfeita baseando-se no estilo de vida, 
          orçamento disponível e necessidades individuais de infraestrutura urbana, gerando bem-estar e assertividade na escolha do seu novo lar.
        </p>
      </section>
    </main>
  )
}