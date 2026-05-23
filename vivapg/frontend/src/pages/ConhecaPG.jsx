import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios'

export default function ConhecaPG() {
  const mapRef = useRef(null)
  const mapInstRef = useRef(null)
  const [bairros, setBairros] = useState([])
  const markersGroupRef = useRef(null)

  // Definição exata de cores por região imobiliária comercial
  const mapaCoresRegioes = {
    "Orla Nobre":       "#1e3a8a", // Azul Escuro
    "Orla Central":     "#0ea5e9", // Azul Claro
    "Orla Sul":         "#10b981", // Verde Marítimo
    "Lado Serra Norte": "#f59e0b", // Laranja
    "Lado Serra Sul":   "#ef4444"  // Vermelho
  }

  // 1. INICIALIZA O MAPA IMEDIATAMENTE (Garante que o mapa não fique em branco)
  useEffect(() => {
    if (!window.L) return
    if (mapInstRef.current) return

    const L = window.L
    
    // Cria a instância do mapa centralizado em PG
    const map = L.map(mapRef.current).setView([-24.0250, -46.4700], 12)
    mapInstRef.current = map

    // Adiciona os quadrantes visuais (Tiles) do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map)

    // Cria um grupo limpo para guardar os marcadores dos bairros
    markersGroupRef.current = L.layerGroup().addTo(map)

    // Força o recálculo de tamanho para renderizar sem falhas
    setTimeout(() => map.invalidateSize(), 100)

    // Busca os bairros no backend assim que o mapa estiver pronto na tela
    axios.get('http://localhost:8080/api/bairros')
      .then(res => setBairros(res.data))
      .catch(err => console.error("Erro ao buscar bairros:", err))

    return () => {
      if (mapInstRef.current) {
        mapInstRef.current.remove()
        mapInstRef.current = null
      }
    }
  }, [])

  // 2. ADICIONA AS BOLHAS DOS BAIRROS ASSINK QUE OS DADOS CHEGADO DO BACKEND
  useEffect(() => {
    if (!window.L) return
    if (!mapInstRef.current || !markersGroupRef.current) return
    if (bairros.length === 0) return

    const L = window.L
    
    // Limpa marcadores antigos antes de desenhar os novos (evita duplicados)
    markersGroupRef.current.clearLayers()

    bairros.forEach(bairro => {
      const lat = bairro.latitude
      const lon = bairro.longitude

      if (!lat || !lon || lat === 0 || lon === 0) return 

      const corRegiao = mapaCoresRegioes[bairro.regiao] || "#64748b"

      // Desenha o círculo do bairro dentro do grupo de camadas
      L.circle([lat, lon], {
        color: corRegiao,
        fillColor: corRegiao,
        fillOpacity: 0.5,
        radius: 350
      })
      .addTo(markersGroupRef.current)
      .bindPopup(`
        <div style="font-family: Arial, sans-serif; padding: 5px; min-width: 180px;">
          <strong style="color: ${corRegiao}; font-size: 16px;">📍 ${bairro.nome}</strong><br/>
          <span style="color: #666; font-size: 12px;"><b>Região:</b> ${bairro.regiao}</span><br/>
          <span style="color: #666; font-size: 12px;"><b>Classificação:</b> ${bairro.classificacao}</span>
          <hr style="border: 0; border-top: 1px solid #ddd; margin: 8px 0;"/>
          <table style="width: 100%; font-size: 12px; color: #444;">
            <tr><td>🛡️ Segurança:</td><td style="text-align:right"><b>${bairro.indSeguranca}</b></td></tr>
            <tr><td>🌳 Lazer:</td><td style="text-align:right"><b>${bairro.indLazer}</b></td></tr>
            <tr><td>🚌 Transporte:</td><td style="text-align:right"><b>${bairro.indTransporte}</b></td></tr>
            <tr><td>💰 Aluguel 1q:</td><td style="text-align:right"><b>R$ ${bairro.aluguel1Quarto}</b></td></tr>
          </table>
        </div>
      `)
    })
  }, [bairros])

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#0c447c', marginBottom: '5px' }}>🗺️ Conheça as Regiões de Praia Grande</h1>
      <p style={{ color: '#666', marginBottom: '25px' }}>
        Analise a distribuição imobiliária oficial e clique nos círculos para inspecionar os indicadores urbanos de cada bairro.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '20px' }}>
        
        {/* Container do Mapa (Carrega na hora) */}
        <div 
          ref={mapRef} 
          style={{ 
            height: '550px', 
            borderRadius: '12px', 
            border: '2px solid #ccc',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1
          }} 
        />

        {/* Painel de Legenda Lateral */}
        <div style={{ 
          backgroundColor: '#f8fafc', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          height: 'fit-content'
        }}>
          <h3 style={{ margin: '0 0 5px 0', color: '#334155', fontSize: '16px' }}>🏷️ Legenda de Regiões</h3>
          
          {Object.entries(mapaCoresRegioes).map(([nomeRegiao, color]) => (
            <div key={nomeRegiao} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '18px', 
                height: '18px', 
                borderRadius: '50%', 
                backgroundColor: color,
                border: '2px solid #fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#475569' }}>{nomeRegiao}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
