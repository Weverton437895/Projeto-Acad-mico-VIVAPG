import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form,  setForm]  = useState({ email: '', senha: '' })
  const [erros, setErros] = useState({})
  const [erro,  setErro]  = useState('')

  function validar() {
    const e = {}
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Informe um e-mail válido.'
    if (!form.senha) e.senha = 'A senha é obrigatória.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errosVal = validar()
    if (Object.keys(errosVal).length > 0) { setErros(errosVal); return }
    try {
      const res = await authService.login(form.email, form.senha)
      login(res.data.token, res.data.usuario)
      navigate('/resultados')
    } catch (err) {
      setErro(err.response?.data?.erro || 'E-mail ou senha incorretos.')
    }
  }

  return (
    <main className="auth-wrap">
      <div className="auth-box">
        <div className="auth-logo">VivaPG</div>
        <p className="auth-sub">Entre para salvar seus bairros favoritos e comparações</p>

        {erro && <div className="form-erro-banner" role="alert">{erro}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" placeholder="seu@email.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            {erros.email && <span className="campo-erro">{erros.email}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="senha">Senha</label>
            <input id="senha" type="password" placeholder="••••••••"
              value={form.senha} onChange={e => setForm({...form, senha: e.target.value})} />
            {erros.senha && <span className="campo-erro">{erros.senha}</span>}
          </div>

          <button type="submit" className="btn-auth">🔒 Entrar na conta</button>
        </form>

        <div className="auth-link">
          Não tem conta? <Link to="/cadastro">Cadastre-se gratuitamente</Link>
        </div>
        <div className="auth-skip">
          <Link to="/">Continuar sem conta →</Link>
        </div>
      </div>
    </main>
  )
}
