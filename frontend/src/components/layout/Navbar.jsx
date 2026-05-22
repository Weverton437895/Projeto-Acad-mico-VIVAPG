import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { estaLogado, usuario, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  const iniciais = usuario?.nome
    ? usuario.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : ''

  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">VivaPG</Link>
      <nav className="navbar-nav">
        <Link to="/"        className="nav-link">Início</Link>
        <Link to="/resultados" className="nav-link">Bairros Recomendados</Link>
        <Link to="/comparar"   className="nav-link">Comparar Bairros</Link>
      </nav>
      <div className="navbar-auth">
        {estaLogado ? (
          <div className="navbar-user">
            <Link to="/minha-conta" className="user-avatar" title="Minha Conta">
              {iniciais}
            </Link>
            <Link to="/minha-conta" className="nav-link">Minha Conta</Link>
            <button onClick={handleLogout} className="btn-logout">Sair</button>
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
