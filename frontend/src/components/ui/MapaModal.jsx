import React, { useEffect, useRef } from 'react'

export default function MapaModal({ bairro, onFechar }) {
  const mapRef    = useRef(null)
  const mapInstRef = useRef(null)

  useEffect(() => {
    // Carrega Leaflet dinamicamente (já vem pelo CDN no index.html)
    if (!window.L) return
    if (mapInstRef.current) return // evita duplicar

    const L   = window.L
    const lat  = bairro.latitude  || -24.0089
    const lon  = bairro.longitude || -46.4101

    // Inicializa o mapa centrado nas coordenadas do bairro
    const map = L.map(mapRef.current).setView([lat, lon], 15)
    mapInstRef.current = map

    // Tiles do OpenStreetMap — gratuito, sem API key
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    // Marcador no centro do bairro
    const icon = L.divIcon({
      className: '',
      html: `<div style="
        background:#0c447c;color:#fff;border-radius:50%;
        width:40px;height:40px;display:flex;align-items:center;
        justify-content:center;font-size:18px;
        border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.4)
      ">📍</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    })

    L.marker([lat, lon], { icon })
      .addTo(map)
      .bindPopup(`
        <strong>${bairro.nome}</strong><br/>
        ${bairro.regiao} · ${bairro.classificacao}<br/>
        Aluguel 1q: R$ ${bairro.aluguel1Quarto}
      `)
      .openPopup()

    // Força o mapa a recalcular o tamanho após render
    setTimeout(() => map.invalidateSize(), 100)

    return () => {
      map.remove()
      mapInstRef.current = null
    }
  }, [bairro])

  return (
    <div className="mapa-overlay" onClick={e => { if (e.target === e.currentTarget) onFechar() }}>
      <div className="mapa-modal">

        {/* Header */}
        <div className="mapa-header">
          <div>
            <div className="mapa-titulo">📍 {bairro.nome}</div>
            <div className="mapa-sub">{bairro.regiao} · {bairro.classificacao}</div>
          </div>
          <button className="mapa-fechar" onClick={onFechar}>✕</button>
        </div>

        {/* Mapa */}
        <div ref={mapRef} className="mapa-container" />

        {/* Rodapé com índices rápidos */}
        <div className="mapa-footer">
          <div className="mapa-ind"><span>Segurança</span><strong>{bairro.indSeguranca}</strong></div>
          <div className="mapa-ind"><span>Saúde</span><strong>{bairro.indSaude}</strong></div>
          <div className="mapa-ind"><span>Educação</span><strong>{bairro.indEducacao}</strong></div>
          <div className="mapa-ind"><span>Transporte</span><strong>{bairro.indTransporte}</strong></div>
          <div className="mapa-ind"><span>Lazer</span><strong>{bairro.indLazer}</strong></div>
          <div className="mapa-ind"><span>Aluguel 1q</span><strong>R$ {bairro.aluguel1Quarto}</strong></div>
        </div>

      </div>
    </div>
  )
}