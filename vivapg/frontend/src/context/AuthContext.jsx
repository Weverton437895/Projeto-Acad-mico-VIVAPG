import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem('vivapg_token')
    const u = localStorage.getItem('vivapg_usuario')
    if (t && u) {
      setToken(t)
      setUsuario(JSON.parse(u))
    }
    setLoading(false)
  }, [])

  function login(tokenRecebido, usuarioRecebido) {
    localStorage.setItem('vivapg_token', tokenRecebido)
    localStorage.setItem('vivapg_usuario', JSON.stringify(usuarioRecebido))
    setToken(tokenRecebido)
    setUsuario(usuarioRecebido)
  }

  function logout() {
    localStorage.removeItem('vivapg_token')
    localStorage.removeItem('vivapg_usuario')
    setToken(null)
    setUsuario(null)
  }

  const estaLogado = !!token

  return (
    <AuthContext.Provider value={{ usuario, token, estaLogado, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
