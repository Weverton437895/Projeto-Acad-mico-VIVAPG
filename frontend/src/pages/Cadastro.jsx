import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Cadastro() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form,  setForm]  = useState({ nome: '', email: '', senha: '', confirmar: '' })
  const [erros, setErros] = useState({})
  const [erro,  setErro]  = useState('')

  function validar() {
    const e = {}
    if (!form.nome.trim())                              e.nome     = 'O nome é obrigatório.'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email  = 'Informe um e-mail válido.'
    if (!form.senha || form.senha.length < 8)           e.senha    = 'Mínimo 8 caracteres.'
    if (form.confirmar !== form.senha)                  e.confirmar = 'As senhas não coincidem.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errosVal = validar()
    if (Object.keys(errosVal).length > 0) { setErros(errosVal); return }
    try {
      const res = await authService.registrar(form.nome, form.email, form.senha)
      login(res.data.token, res.data.usuario)
      navigate('/resultados')
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao criar conta. Tente novamente.')
    }
  }

  const campo = (id, label, tipo, placeholder) => (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id} type={tipo} placeholder={placeholder}
        value={form[id]}
        onChange={e => setForm({ ...form, [id]: e.target.value })}
        autoComplete={tipo === 'password' ? 'new-password' : id}
      />
      {erros[id] && <span className="campo-erro">{erros[id]}</span>}
    </div>
  )

  return (
    <main className="auth-wrap">
      <div className="auth-box">
        <div className="auth-logo">VivaPG</div>
        <p className="auth-sub">Crie sua conta para salvar bairros e comparações</p>

        {erro && <div className="form-erro-banner" role="alert">{erro}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {campo('nome',      'Nome completo',   'text',     'Seu nome')}
          {campo('email',     'E-mail',          'email',    'seu@email.com')}
          {campo('senha',     'Senha',           'password', 'Mínimo 8 caracteres')}
          {campo('confirmar', 'Confirmar senha', 'password', 'Repita a senha')}
          <button type="submit" className="btn-auth">✓ Criar minha conta</button>
        </form>

        <div className="auth-link">
          Já tem conta? <Link to="/login">Entrar</Link>
        </div>
        <div className="auth-skip">
          <Link to="/">Continuar sem conta →</Link>
        </div>
      </div>
    </main>
  )
}
