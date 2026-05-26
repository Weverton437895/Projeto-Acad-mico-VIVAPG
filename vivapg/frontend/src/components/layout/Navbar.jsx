import React, {useState, useEffect, useRef} from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { estaLogado, usuario, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [menuAberto, setMenuAberto] = useState(false)
  const dropdownRef = useRef(null)
  
  // Referência para controlar o estado de minimizar da barra
  const navRef = useRef(null)

  function handleLogout() {
    setMenuAberto(false)
    logout()
    navigate('/')
  }

  useEffect(() => {
    function clicarFora(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuAberto(false)
      }
    }
    document.addEventListener('mousedown', clicarFora)
    return () => document.removeEventListener('mousedown', clicarFora)
  }, [])

  const iniciais = usuario?.nome
    ? usuario.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : ''

  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">VivaPG</Link>
      
      {/* Mantida a estrutura exata do seu nav original */}
      <nav className="navbar-nav" ref={navRef}>
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          Início
        </Link>
        <Link to="/comparar" className={`nav-link ${location.pathname === '/comparar' ? 'active' : ''}`}>
          Comparar Bairros
        </Link>
        <Link to="/conheca-pg" className={`nav-link ${location.pathname === '/conheca-pg' ? 'active' : ''}`}>
          Conheça Praia Grande
        </Link>
        <Link to="/sobre" className={`nav-link ${location.pathname === '/sobre' ? 'active' : ''}`}>
          Sobre VivaPG
        </Link>

        {/* Adicionado apenas a função de clique no botão que já existia no CSS */}
        <button 
          type="button" 
          className="btn-minimizar-barra"
          onClick={() => navRef.current?.classList.toggle('minimizado')}
        >
          ▼
        </button>
      </nav>
      
      <div className="navbar-auth">
        {estaLogado ? (
          <div className="navbar-user-dropdown" ref={dropdownRef}>
            <button 
              type="button"
              className="user-avatar" 
              title="Minha Conta"
              onClick={() => setMenuAberto(!menuAberto)}
            >
              {iniciais}
            </button>

            {menuAberto && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="dropdown-avatar-grande">{iniciais}</div>
                  <div className="dropdown-user-info">
                    <span className="dropdown-nome">{usuario?.nome || 'Usuário'}</span>
                    <span className="dropdown-email">{usuario?.email || ''}</span>
                  </div>
                </div>
                
                <hr className="dropdown-divider" />
                
                <Link 
                  to="/minha-conta" 
                  className="dropdown-item" 
                  onClick={() => setMenuAberto(false)}
                >
                   Minha Conta
                </Link>
                
                <button type="button" onClick={handleLogout} className="dropdown-item btn-sair-dropdown">
                   Sair
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login"   className="btn-entrar">Entrar</Link>
            <Link to="/cadastro" className="btn-cadastrar">Cadastrar</Link>
          </>
        )}
      </div>
    </header>
  )
}