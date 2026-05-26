import React, {useState, useEffect, useRef} from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { NavLink } from "react-router-dom";
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { estaLogado, usuario, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

// Estado para controlar a abertura do dropdown
const [menuAberto, setMenuAberto] = useState(false)
// Referência para detectar cliques fora do menu
const dropdownRef = useRef(null)

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
      <nav className="navbar-nav">
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
      </nav>
      
      <div className="navbar-auth">
        {estaLogado ? (
          /* ISSO AQUI SUBSTITUI O BLOCO ANTIGO */
          <div className="navbar-user-dropdown" ref={dropdownRef}>
            <button 
              type="button"
              className="user-avatar" 
              title="Minha Conta"
              onClick={() => setMenuAberto(!menuAberto)}
            >
              {iniciais}
            </button>

            {/* Menu flutuante que só aparece ao clicar na bolinha */}
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