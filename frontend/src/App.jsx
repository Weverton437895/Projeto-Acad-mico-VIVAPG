import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import PainelAcessibilidade from './components/ui/PainelAcessibilidade'
import Home from './pages/Home'
import Resultados from './pages/Resultados'
import Comparacao from './pages/Comparacao'
import Login from './pages/Login'
import Cadastro from './pages/Cadastro'
import MinhaConta from './pages/MinhaConta'

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/"             element={<Home />} />
        <Route path="/resultados"   element={<Resultados />} />
        <Route path="/comparar"     element={<Comparacao />} />
        <Route path="/login"        element={<Login />} />
        <Route path="/cadastro"     element={<Cadastro />} />
        <Route path="/minha-conta"  element={<MinhaConta />} />
      </Routes>
      <PainelAcessibilidade />
    </AuthProvider>
  )
}
